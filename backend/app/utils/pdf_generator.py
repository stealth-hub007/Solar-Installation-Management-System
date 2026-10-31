import os
from decimal import Decimal
from typing import List, Dict, Any
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle


class PDFGenerator:
    @staticmethod
    def generate_quotation_pdf(
        output_path: str,
        quotation_number: str,
        customer_name: str,
        customer_phone: str,
        date_str: str,
        valid_until_str: str,
        items: List[Dict[str, Any]],
        subtotal: Decimal,
        discount: Decimal,
        tax_amount: Decimal,
        final_amount: Decimal,
    ) -> str:
        """Generates a branded customer quotation PDF using ReportLab."""
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        doc = SimpleDocTemplate(
            output_path,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36,
        )
        elements = []
        styles = getSampleStyleSheet()

        # Custom Styles
        title_style = ParagraphStyle(
            "DocTitle",
            parent=styles["Heading1"],
            fontSize=22,
            leading=26,
            textColor=colors.HexColor("#D97706"),  # Solar Amber
            spaceAfter=6,
        )
        subtitle_style = ParagraphStyle(
            "DocSubtitle",
            parent=styles["Normal"],
            fontSize=10,
            textColor=colors.HexColor("#4B5563"),
            spaceAfter=15,
        )
        heading_style = ParagraphStyle(
            "SectionHeading",
            parent=styles["Heading2"],
            fontSize=12,
            textColor=colors.HexColor("#1F2937"),
            spaceBefore=10,
            spaceAfter=6,
        )

        # Header
        elements.append(Paragraph("SunPower Solutions", title_style))
        elements.append(Paragraph("Rooftop Solar EPC & Clean Energy Systems | Phone: +91-9876543210 | info@sunpower.com", subtitle_style))
        elements.append(Spacer(1, 10))

        # Meta Table
        meta_data = [
            [
                Paragraph(f"<b>Quotation #:</b> {quotation_number}", styles["Normal"]),
                Paragraph(f"<b>Customer:</b> {customer_name}", styles["Normal"]),
            ],
            [
                Paragraph(f"<b>Date:</b> {date_str}", styles["Normal"]),
                Paragraph(f"<b>Phone:</b> {customer_phone}", styles["Normal"]),
            ],
            [
                Paragraph(f"<b>Valid Until:</b> {valid_until_str}", styles["Normal"]),
                Paragraph("<b>System:</b> Rooftop Solar PV", styles["Normal"]),
            ],
        ]
        meta_table = Table(meta_data, colWidths=[270, 270])
        meta_table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F9FAFB")),
                ("PADDING", (0, 0), (-1, -1), 6),
                ("LINEBELOW", (0, -1), (-1, -1), 1, colors.HexColor("#E5E7EB")),
            ])
        )
        elements.append(meta_table)
        elements.append(Spacer(1, 15))

        # Equipment Items Table
        elements.append(Paragraph("Quotation Component Specification", heading_style))
        table_rows = [["#", "Equipment Description", "Qty", "Unit Price", "Total (INR)"]]
        for i, item in enumerate(items, 1):
            table_rows.append([
                str(i),
                item.get("name", "Item"),
                str(item.get("quantity", 1)),
                f"₹{item.get('unit_price', Decimal('0.00')):.2f}",
                f"₹{item.get('total_price', Decimal('0.00')):.2f}",
            ])

        table_rows.append(["", "", "", "Subtotal:", f"₹{subtotal:.2f}"])
        if discount > 0:
            table_rows.append(["", "", "", "Discount:", f"-₹{discount:.2f}"])
        table_rows.append(["", "", "", "GST / Tax (18%):", f"₹{tax_amount:.2f}"])
        table_rows.append(["", "", "", "Final Payable Amount:", f"₹{final_amount:.2f}"])

        items_table = Table(table_rows, colWidths=[30, 250, 50, 100, 110])
        items_table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#D97706")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("ALIGN", (0, 0), (0, -1), "CENTER"),
                ("ALIGN", (2, 0), (-1, -1), "RIGHT"),
                ("GRID", (0, 0), (-1, len(items)), 0.5, colors.HexColor("#D1D5DB")),
                ("FONTNAME", (2, len(items) + 1), (-1, -1), "Helvetica-Bold"),
                ("BACKGROUND", (2, -1), (-1, -1), colors.HexColor("#FEF3C7")),
                ("PADDING", (0, 0), (-1, -1), 5),
            ])
        )
        elements.append(items_table)
        elements.append(Spacer(1, 20))

        # Terms & Conditions
        elements.append(Paragraph("Terms & Conditions:", heading_style))
        terms = [
            "1. 50% advance payment required upon order confirmation before equipment dispatch.",
            "2. Delivery will be executed within 7-10 business days of advance confirmation.",
            "3. Standard warranty applies: Inverter (2 Yrs), Battery (2 Yrs), Solar Panels (20 Yrs).",
            "4. Grid connection and net-metering approvals subject to local electricity board policies.",
        ]
        for term in terms:
            elements.append(Paragraph(term, styles["Normal"]))

        doc.build(elements)
        return output_path

    @staticmethod
    def generate_receipt_pdf(
        output_path: str,
        receipt_number: str,
        order_number: str,
        customer_name: str,
        payment_date: str,
        amount: Decimal,
        payment_method: str,
        reference_no: str,
    ) -> str:
        """Generates a payment receipt PDF."""
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        doc = SimpleDocTemplate(output_path, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
        elements = []
        styles = getSampleStyleSheet()

        title_style = ParagraphStyle("RTitle", parent=styles["Heading1"], fontSize=20, textColor=colors.HexColor("#059669"))
        elements.append(Paragraph("SunPower Solutions — Payment Receipt", title_style))
        elements.append(Spacer(1, 15))

        data = [
            ["Receipt #:", receipt_number, "Order #:", order_number],
            ["Customer:", customer_name, "Date:", payment_date],
            ["Payment Method:", payment_method, "Transaction Ref:", reference_no or "N/A"],
            ["Amount Paid:", f"₹{amount:.2f}", "Status:", "VERIFIED & CREDITED"],
        ]
        t = Table(data, colWidths=[120, 150, 120, 150])
        t.setStyle(TableStyle([
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#D1D5DB")),
            ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#F3F4F6")),
            ("BACKGROUND", (2, 0), (2, -1), colors.HexColor("#F3F4F6")),
            ("PADDING", (0, 0), (-1, -1), 8),
            ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
        ]))
        elements.append(t)
        doc.build(elements)
        return output_path

