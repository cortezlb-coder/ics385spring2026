from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import Preformatted, Paragraph, SimpleDocTemplate, Spacer

source = Path(__file__).with_name("term-project-study-guide.md")
target = Path(__file__).with_name("term-project-study-guide.pdf")
styles = getSampleStyleSheet()
styles.add(
    ParagraphStyle(
        name="SmallCode",
        parent=styles["Code"],
        fontName="Courier",
        fontSize=7.5,
        leading=9,
        backColor="#f1f5f6",
        leftIndent=8,
        rightIndent=8,
        spaceBefore=5,
        spaceAfter=8,
    )
)

story = []
in_code = False
code_lines = []

for line in source.read_text(encoding="utf-8").splitlines():
    if line.startswith("```"):
        if in_code:
            story.append(Preformatted("\n".join(code_lines), styles["SmallCode"]))
            code_lines = []
        in_code = not in_code
        continue

    if in_code:
        code_lines.append(line)
    elif line.startswith("# "):
        story.extend([Paragraph(escape(line[2:]), styles["Title"]), Spacer(1, 10)])
    elif line.startswith("## "):
        story.extend([Paragraph(escape(line[3:]), styles["Heading1"]), Spacer(1, 5)])
    elif line.startswith("### "):
        story.extend([Paragraph(escape(line[4:]), styles["Heading2"]), Spacer(1, 4)])
    elif line.startswith("- "):
        story.append(Paragraph("&bull; " + escape(line[2:]), styles["BodyText"]))
    elif line:
        story.extend([Paragraph(escape(line), styles["BodyText"]), Spacer(1, 4)])
    else:
        story.append(Spacer(1, 4))

SimpleDocTemplate(
    str(target),
    pagesize=letter,
    rightMargin=0.65 * inch,
    leftMargin=0.65 * inch,
    topMargin=0.6 * inch,
    bottomMargin=0.6 * inch,
    title="Maui Surf House Term Project Study Guide",
).build(story)

print(target)
