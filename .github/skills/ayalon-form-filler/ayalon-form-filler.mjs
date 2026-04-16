/**
 * Ayalon Insurance Claim Form Filler
 *
 * Reusable Playwright script for automating the Ayalon Insurance portal.
 * Handles: login → OTP → navigate to claim form → fill treatment rows.
 *
 * Usage:
 *   node .github/skills/ayalon-form-filler/ayalon-form-filler.mjs
 *
 * The script reads user-info.md for credentials and provides an interactive
 * REPL after reaching the treatment form, allowing the agent to send
 * additional commands without restarting.
 *
 * Environment:
 *   - Requires `playwright` npm package
 *   - Runs in headed (visible) mode
 */

import { chromium } from 'playwright';
import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const prompt = (q) => new Promise((res) => rl.question(q, res));

function readUserInfo() {
  const raw = fs.readFileSync(path.resolve('user-info.md'), 'utf-8');
  const lines = raw.split('\n').map(l => l.trim());
  const get = (prefix) => {
    const line = lines.find(l => l.toLowerCase().startsWith(prefix.toLowerCase()));
    return line ? line.split(':').slice(1).join(':').trim() : '';
  };
  return {
    id: get('User ID'),
    phone: get('Phone'),
    bank: get('Bank'),
    branch: get('Branch'),
    account: get('Account'),
  };
}

/**
 * Fill an ng-select autocomplete field.
 * @param {import('playwright').Page} page
 * @param {string} wrapperId  - the id of the .rc-autocomplete-wrapper div
 * @param {string} search     - text to type to trigger options
 * @param {string} optionText - exact text of the option to select
 */
async function fillNgSelect(page, wrapperId, search, optionText) {
  await page.click(`#${wrapperId} input`);
  await page.type(`#${wrapperId} input`, search, { delay: 100 });
  await page.waitForTimeout(2000);
  await page.click(`.ng-option:has-text("${optionText}")`);
  await page.waitForTimeout(500);
}

/**
 * Get all autocomplete wrapper IDs currently on the page.
 * @param {import('playwright').Page} page
 * @returns {Promise<string[]>}
 */
async function getAutocompleteIds(page) {
  return page.$$eval('.rc-autocomplete-wrapper', els => els.map(el => el.id));
}

// ---------------------------------------------------------------------------
// Main flow
// ---------------------------------------------------------------------------

const user = readUserInfo();

const browser = await chromium.launch({
  headless: false,
  args: ['--start-maximized'],
});
const context = await browser.newContext({ viewport: null });
const page = await context.newPage();

// ===== STEP 1: LOGIN =====
console.log('>> Step 1: Login');
await page.goto('https://clientportfolio.ayalon-ins.co.il/cpLogin/mainLogin/login');
await page.waitForLoadState('networkidle');

console.log(`>> Filling ID: ${user.id}`);
await page.fill('#personIdComponent', user.id);

console.log(`>> Filling phone: ${user.phone}`);
await page.fill('#phone_phoneNumberComponent', user.phone);

console.log('>> Clicking כניסה...');
await page.click('button.btnPrim');
await page.waitForTimeout(3000);

console.log('WAITING_FOR_OTP');
const otp = await prompt('Enter OTP: ');

await page.click('#num_numInputComponent');
await page.type('#num_numInputComponent', otp.trim(), { delay: 100 });
await page.waitForTimeout(1000);
await page.click('#otpSubmit');

console.log('>> Waiting for login redirect...');
await page.waitForURL('**/user-panel/**', { timeout: 30000 });
await page.waitForLoadState('networkidle');
console.log('LOGIN_COMPLETE - URL:', page.url());

// ===== STEP 2: NAVIGATE TO CLAIMS =====
console.log('>> Step 2: Navigate to claims');
await page.goto('https://clientportfolio.ayalon-ins.co.il/cp/user-panel/claims-by-product');
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2000);
console.log('>> Claims page loaded');

// ===== STEP 3: SELECT ביטוח בריאות =====
console.log('>> Step 3: Selecting ביטוח בריאות...');
await page.click('.claims_grid li:first-child');
await page.waitForTimeout(3000);
await page.waitForLoadState('networkidle');
console.log('>> Health insurance page URL:', page.url());

// Print insured persons
const persons = await page.$$eval('button.round-btn', els =>
  els.map(el => el.textContent.trim())
);
console.log('INSURED_PERSONS:', JSON.stringify(persons));

console.log('STEP_3_COMPLETE');
await prompt('Press Enter to continue (select person next)...');

// ===== INTERACTIVE REPL =====
console.log('REPL_READY');
console.log('Helpers available: fillNgSelect(page, wrapperId, search, optionText)');
console.log('                   getAutocompleteIds(page)');
while (true) {
  const cmd = await prompt('CMD> ');
  if (cmd.trim() === 'exit') break;
  try {
    const result = await eval(`(async () => { ${cmd} })()`);
    if (result !== undefined) {
      console.log('RESULT:', typeof result === 'object' ? JSON.stringify(result, null, 2) : result);
    }
  } catch (e) {
    console.log('ERROR:', e.message);
  }
}

await browser.close();
process.exit(0);
