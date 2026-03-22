---
name: document-reader
description: >
  Use this skill when you need to read, parse, or extract text from documents
  such as PDFs, receipts, referrals, or certificates. Also handles images
  (JPEG, PNG, etc.) by identifying them for visual inspection. Use this before
  filling forms that require information from user-provided documents.
---

# Document Reader Skill

This skill provides the ability to extract text and metadata from documents,
including **PDF files** which cannot be read with standard file tools.

## How to Use

Run the bundled Python script to extract document content:

```bash
# Read a single PDF
python .github/skills/document-reader/read_document.py "path/to/file.pdf"

# Read multiple files at once
python .github/skills/document-reader/read_document.py "file1.pdf" "file2.pdf"

# Read all supported documents in a folder
python .github/skills/document-reader/read_document.py --folder "path/to/folder"
```

## Supported File Types

| Type | Extensions | What You Get |
|------|-----------|--------------|
| PDF | `.pdf` | Extracted text, page count, metadata |
| Image | `.jpg`, `.jpeg`, `.png`, `.bmp`, `.tiff`, `.gif` | File info — use the `view` tool to see the image visually |

## Output Format

The script outputs JSON with the following structure:

**For PDFs:**
```json
{
  "file": "receipt.pdf",
  "path": "C:/full/path/to/receipt.pdf",
  "type": "pdf",
  "page_count": 1,
  "metadata": { "creationDate": "..." },
  "text": "Extracted text content here...",
  "pages": [{ "page": 1, "text": "..." }]
}
```

**For images:**
```json
{
  "file": "certificate.jpeg",
  "path": "C:/full/path/to/certificate.jpeg",
  "type": "image",
  "format": "jpeg",
  "size_bytes": 12345,
  "note": "Use the view tool to see this image directly."
}
```

## Workflow

1. **Identify the document folder** — confirm with the user which folder contains their documents.
2. **Run the script with `--folder`** to read all documents at once.
3. **For images**, follow up by using the `view` tool to visually inspect them.
4. **Parse the JSON output** to extract key information (dates, amounts, names, etc.).
5. **Present a summary** to the user for confirmation before proceeding.

## Dependencies

- Python 3 (available in the environment)
- `pymupdf` package (install with `pip install pymupdf` if not already installed)

## Tips

- If a PDF returns "(No extractable text found)", it likely contains scanned images.
  In that case, use the `view` tool to visually inspect the PDF pages.
- Always read **all documents** in the folder before starting form filling.
- For Hebrew text extraction, the script handles RTL text correctly.
- Run the `--folder` variant to process receipts, referrals, and certificates in one go.
