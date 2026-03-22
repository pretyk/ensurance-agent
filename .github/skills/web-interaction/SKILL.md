---
name: web-interaction
description: >
  Use this skill when the agent needs to interact with a website — navigate pages,
  click buttons, fill forms, upload files, take screenshots, or read page content.
  Powered by the Playwright MCP server in headed (visible) mode for browser
  automation the user can watch in real time.
---

# Web Interaction Skill (Playwright — Visible Mode)

You have access to the **Playwright MCP server** (`playwright/*`) which lets you
control a real browser. **The browser always runs in headed (visible) mode** — the
user can see the browser window on their screen and watch every action you perform.

## Visible-Mode Principles

1. **The user is watching.** Every click, every keystroke, every navigation happens
   in a browser window the user can see. Act deliberately and clearly.
2. **One action at a time.** Do not batch multiple interactions. Perform each click,
   type, or select individually so the user can follow along.
3. **Narrate before acting.** Always tell the user what you are about to do in chat
   before performing the browser action (e.g., "Now clicking the submit button…").
4. **Screenshot after milestones.** After completing a logical group of actions
   (e.g., filling a form section, selecting a category), take a screenshot and share
   it with the user as confirmation of the current state.
5. **Pause if asked.** If the user asks you to stop, slow down, or redo something,
   comply immediately.

## Available Capabilities

| Action | Playwright Tool | When to Use |
|---|---|---|
| Open a URL | `playwright/browser_navigate` | Start a new page or go to a different URL |
| Click an element | `playwright/browser_click` | Press buttons, links, checkboxes, radio buttons |
| Type text | `playwright/browser_type` | Fill input fields, text areas, search boxes |
| Select dropdown | `playwright/browser_select_option` | Choose from `<select>` dropdowns |
| Upload a file | `playwright/browser_file_upload` | Attach files to file-input elements |
| Take a screenshot | `playwright/browser_take_screenshot` | Capture the current page state for verification |
| Read page content | `playwright/browser_snapshot` | Get the accessibility tree / structured text of the page |
| Hover | `playwright/browser_hover` | Trigger hover menus or tooltips |
| Go back / forward | `playwright/browser_navigate_back`, `browser_navigate_forward` | Browser history navigation |
| Press a key | `playwright/browser_press_key` | Press Enter, Tab, Escape, or other keys |
| Wait for content | `playwright/browser_wait_for_text` | Wait until specific text appears on the page |

## Workflow Pattern (Visible to User)

1. **Narrate** — tell the user what you're about to do.
2. **Navigate** to the target URL with `browser_navigate`.
3. **Snapshot** the page with `browser_snapshot` to understand the current layout.
4. **Interact** — click, type, select, or upload **one action at a time**.
5. **Snapshot again** after each action to verify the page updated correctly.
6. **Screenshot** after completing each logical section and share with the user.
7. **Repeat** steps 4–6 until the workflow is complete.

## Best Practices

- Always take a **snapshot** before interacting so you know the exact element references.
- Use element references from the accessibility snapshot (e.g., `ref="e42"`) for reliable targeting.
- **Never use headless mode.** The browser must always be visible to the user.
- Perform actions **one at a time** — do not silently chain multiple clicks or keystrokes.
- **Narrate each action** in chat before performing it so the user knows what to expect.
- After filling a form section, **screenshot** and share before moving to the next section.
- Before any final submission, take a **full screenshot** and ask for explicit user confirmation.
- When uploading files, use the **full absolute path** to the file on disk.
- If a page has Hebrew content, extract and present it accurately.
- Handle loading states — if an action triggers a page load, wait and re-snapshot.
- If an element is not found, re-snapshot the page; the DOM may have changed.
