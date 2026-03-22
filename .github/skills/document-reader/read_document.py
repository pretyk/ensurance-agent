"""
Document Reader Script
Extracts text from PDFs and reads image files.

Usage:
  python read_document.py <file_path>              # Extract text from a single file
  python read_document.py <file1> <file2> ...      # Extract text from multiple files
  python read_document.py --folder <folder_path>   # Extract text from all supported files in a folder
"""

import sys
import os
import json
import base64

SUPPORTED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".tif", ".gif"}


def read_pdf(file_path: str) -> dict:
    """Extract text and metadata from a PDF file."""
    import fitz  # pymupdf

    doc = fitz.open(file_path)
    pages = []
    for i, page in enumerate(doc):
        text = page.get_text("text").strip()
        pages.append({"page": i + 1, "text": text})

    metadata = doc.metadata or {}
    doc.close()

    full_text = "\n\n".join(p["text"] for p in pages if p["text"])
    return {
        "file": os.path.basename(file_path),
        "path": os.path.abspath(file_path),
        "type": "pdf",
        "page_count": len(pages),
        "metadata": {k: v for k, v in metadata.items() if v},
        "text": full_text if full_text else "(No extractable text found — this PDF may contain scanned images)",
        "pages": pages,
    }


def read_image(file_path: str) -> dict:
    """Return image metadata. The agent can view the image directly via its tools."""
    file_size = os.path.getsize(file_path)
    ext = os.path.splitext(file_path)[1].lower()
    return {
        "file": os.path.basename(file_path),
        "path": os.path.abspath(file_path),
        "type": "image",
        "format": ext.lstrip("."),
        "size_bytes": file_size,
        "note": "Use the view tool to see this image directly. The agent can interpret image content visually.",
    }


def read_document(file_path: str) -> dict:
    """Read a document and return its content."""
    if not os.path.exists(file_path):
        return {"file": file_path, "error": f"File not found: {file_path}"}

    ext = os.path.splitext(file_path)[1].lower()

    if ext == ".pdf":
        try:
            return read_pdf(file_path)
        except Exception as e:
            return {"file": file_path, "error": f"Failed to read PDF: {e}"}
    elif ext in {".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".tif", ".gif"}:
        return read_image(file_path)
    else:
        return {"file": file_path, "error": f"Unsupported file type: {ext}"}


def read_folder(folder_path: str) -> list:
    """Read all supported documents in a folder."""
    if not os.path.isdir(folder_path):
        return [{"error": f"Folder not found: {folder_path}"}]

    results = []
    for entry in sorted(os.listdir(folder_path)):
        ext = os.path.splitext(entry)[1].lower()
        if ext in SUPPORTED_EXTENSIONS:
            full_path = os.path.join(folder_path, entry)
            results.append(read_document(full_path))

    if not results:
        return [{"error": f"No supported documents found in {folder_path}"}]

    return results


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    if sys.argv[1] == "--folder":
        if len(sys.argv) < 3:
            print("Error: --folder requires a folder path")
            sys.exit(1)
        results = read_folder(sys.argv[2])
    else:
        results = [read_document(f) for f in sys.argv[1:]]

    print(json.dumps(results, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
