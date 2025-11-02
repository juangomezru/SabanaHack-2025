from io import BytesIO
from datetime import datetime
from typing import List, Dict, Any

from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.lib import colors


def generate_invoice_pdf(
    *,
    invoice_id: str,
    issue_date: datetime,
    client_name: str,
    client_document: str,
    client_email: str | None,
    items: List[Dict[str, Any]],
    subtotal: float,
    tax_rate: float,
    total: float,
    currency: str,
    cufe: str | None,
    qrcode_url: str | None,
) -> bytes:
    """Generate a simple PDF with invoice details and return bytes."""
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    y = height - 30 * mm

    # Header
    c.setFont("Helvetica-Bold", 16)
    c.drawString(20 * mm, y, f"Factura {invoice_id}")
    y -= 10 * mm

    c.setFont("Helvetica", 10)
    c.drawString(20 * mm, y, f"Fecha: {issue_date.strftime('%Y-%m-%d %H:%M:%S')}")
    y -= 6 * mm

    c.drawString(20 * mm, y, f"Cliente: {client_name}")
    y -= 6 * mm
    c.drawString(20 * mm, y, f"Documento: {client_document}")
    y -= 6 * mm
    if client_email:
        c.drawString(20 * mm, y, f"Email: {client_email}")
        y -= 6 * mm

    # Items header
    y -= 4 * mm
    c.setFont("Helvetica-Bold", 11)
    c.drawString(20 * mm, y, "Items")
    y -= 6 * mm
    c.setFont("Helvetica", 10)
    c.setStrokeColor(colors.black)

    # Table columns: Description, Qty, Price, Line Total
    c.drawString(20 * mm, y, "Descripción")
    c.drawString(110 * mm, y, "Cant")
    c.drawString(130 * mm, y, "Precio")
    c.drawString(160 * mm, y, "Total")
    y -= 5 * mm
    c.line(20 * mm, y, 190 * mm, y)
    y -= 4 * mm

    for item in items:
        if y < 30 * mm:
            c.showPage()
            y = height - 30 * mm
        qty = float(item.get("quantity", 1))
        price = float(item.get("price", 0))
        line_total = qty * price
        desc = str(item.get("description", ""))
        c.drawString(20 * mm, y, desc[:60])
        c.drawRightString(125 * mm, y, f"{qty:g}")
        c.drawRightString(155 * mm, y, f"{price:,.2f} {currency}")
        c.drawRightString(190 * mm, y, f"{line_total:,.2f} {currency}")
        y -= 6 * mm

    # Totals
    y -= 6 * mm
    c.setFont("Helvetica-Bold", 10)
    c.drawRightString(155 * mm, y, "Subtotal:")
    c.setFont("Helvetica", 10)
    c.drawRightString(190 * mm, y, f"{subtotal:,.2f} {currency}")
    y -= 6 * mm

    tax_amount = subtotal * tax_rate
    c.setFont("Helvetica-Bold", 10)
    c.drawRightString(155 * mm, y, f"IVA ({tax_rate*100:.0f}%):")
    c.setFont("Helvetica", 10)
    c.drawRightString(190 * mm, y, f"{tax_amount:,.2f} {currency}")
    y -= 6 * mm

    c.setFont("Helvetica-Bold", 12)
    c.drawRightString(155 * mm, y, "Total a pagar:")
    c.drawRightString(190 * mm, y, f"{total:,.2f} {currency}")
    y -= 10 * mm

    # CUFE and QR URL
    c.setFont("Helvetica", 9)
    if cufe:
        c.drawString(20 * mm, y, f"CUFE: {cufe}")
        y -= 5 * mm
    if qrcode_url:
        c.drawString(20 * mm, y, f"Verificación: {qrcode_url}")
        y -= 5 * mm

    c.showPage()
    c.save()
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes


