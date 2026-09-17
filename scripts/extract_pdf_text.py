"""Extract text from a PDF using the workspace Python environment."""

from argparse import ArgumentParser
from pathlib import Path
import sys

from pypdf import PdfReader


def extract_pdf_text(pdf_path: Path) -> str:
    """Return text from all readable pages in a PDF."""
    reader = PdfReader(str(pdf_path))
    pages = []

    for page_number, page in enumerate(reader.pages, start=1):
        text = page.extract_text() or ""
        pages.append(f"--- Page {page_number} ---\n{text.strip()}")

    return "\n\n".join(pages)


def main() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    parser = ArgumentParser(description="Extract text from a PDF file.")
    parser.add_argument("pdf", type=Path, help="Path to the PDF file")
    parser.add_argument("-o", "--output", type=Path, help="Optional text output path")
    args = parser.parse_args()

    if not args.pdf.is_file():
        parser.error(f"PDF file not found: {args.pdf}")

    text = extract_pdf_text(args.pdf)

    if args.output:
        args.output.write_text(text, encoding="utf-8")
    else:
        print(text)


if __name__ == "__main__":
    main()
