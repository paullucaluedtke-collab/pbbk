import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice } from '@/types/invoice';

export const generateInvoicePDF = (invoice: Invoice) => {
    const doc = new jsPDF();

    // Config
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20; // 20mm left margin (DIN 5008 standard usually 25, but 20 is safe)

    // --- Sender Line (Small, above address) ---
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100);
    // Placeholder - This should come from user settings / DB
    const senderLine = "Ihre Firma GmbH • Musterstraße 123 • 12345 Musterstadt";
    doc.text(senderLine, margin, 45);

    // --- Recipient Address ---
    doc.setFontSize(11);
    doc.setTextColor(0);
    const startY = 50;

    if (invoice.customer) {
        doc.text(invoice.customer.name, margin, startY);
        // Assuming address field supports newlines, split it
        if (invoice.customer.address) {
            const addressLines = doc.splitTextToSize(invoice.customer.address, 80);
            doc.text(addressLines, margin, startY + 5);
        }
    } else {
        doc.text("Empfänger Unbekannt", margin, startY);
    }

    // --- Info Block (Right side) ---
    // In DIN 5008, this is typically between 125mm and right margin
    const rightColX = 120;
    const valueColX = rightColX + 50; // Increased spacing to prevent overlap
    const infoY = 50;

    doc.setFontSize(10);

    // Labels
    doc.setTextColor(100);
    doc.text("Rechnungsnummer:", rightColX, infoY);
    doc.text("Rechnungsdatum:", rightColX, infoY + 5);
    if (invoice.due_date) doc.text("Fällig bis:", rightColX, infoY + 10);
    doc.text("Kundennummer:", rightColX, infoY + 15); // Placeholder

    // Values
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text(invoice.invoice_number, valueColX, infoY);
    doc.setFont("helvetica", "normal");
    doc.text(new Date(invoice.date).toLocaleDateString('de-DE'), valueColX, infoY + 5);
    if (invoice.due_date) doc.text(new Date(invoice.due_date).toLocaleDateString('de-DE'), valueColX, infoY + 10);
    doc.text(invoice.customer_id?.substring(0, 8).toUpperCase() || '-', valueColX, infoY + 15);

    // --- Title ---
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Rechnung", margin, 100);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Vielen Dank für Ihren Auftrag. Wir stellen Ihnen wie folgt in Rechnung:`, margin, 110);

    // --- Items Table ---
    const tableColumn = ["Pos.", "Beschreibung", "Menge", "Einzelpreis", "Gesamt"];
    const tableRows: any[] = [];

    if (invoice.items) {
        invoice.items.forEach((item, index) => {
            const itemData = [
                index + 1,
                item.description,
                `${item.quantity}`,
                `${item.unit_price.toFixed(2)} €`,
                `${(item.quantity * item.unit_price).toFixed(2)} €`
            ];
            tableRows.push(itemData);
        });
    }

    autoTable(doc, {
        startY: 120,
        head: [tableColumn],
        body: tableRows,
        theme: 'plain', // Cleaner look, we add custom styles
        headStyles: {
            fillColor: [248, 250, 252], // Very light slight gray
            textColor: [15, 23, 42],
            fontStyle: 'bold',
            lineWidth: { bottom: 0.1 },
            lineColor: [200, 200, 200]
        },
        styles: {
            fontSize: 10,
            cellPadding: 3,
            textColor: [30, 41, 59]
        },
        columnStyles: {
            0: { cellWidth: 15, halign: 'center' },
            1: { cellWidth: 'auto' }, // Description gets remaining space
            2: { cellWidth: 20, halign: 'right' },
            3: { cellWidth: 30, halign: 'right' },
            4: { cellWidth: 30, halign: 'right' },
        }
    });

    // --- Totals ---
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    const totalsX = 130;
    const totalsValX = 190;

    doc.setFontSize(10);

    // Subtotal
    doc.text("Netto:", totalsX, finalY);
    doc.text(`${invoice.subtotal.toFixed(2)} €`, totalsValX, finalY, { align: 'right' });

    // Tax
    doc.text(`USt. 19%:`, totalsX, finalY + 5);
    doc.text(`${invoice.tax_amount.toFixed(2)} €`, totalsValX, finalY + 5, { align: 'right' });

    // Divider Line
    doc.setDrawColor(200);
    doc.line(totalsX, finalY + 8, totalsValX, finalY + 8);

    // Total
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Gesamtbetrag:", totalsX, finalY + 15);
    doc.text(`${invoice.total_amount.toFixed(2)} €`, totalsValX, finalY + 15, { align: 'right' });

    // --- Footer Text ---
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const footerY = finalY + 30;

    if (invoice.footer_text) {
        doc.text(invoice.footer_text, margin, footerY);
    } else {
        doc.text("Bitte überweisen Sie den Betrag innerhalb von 14 Tagen auf das unten genannte Konto.", margin, footerY);
    }

    // --- Page Footer (Company Details) ---
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(150);

    const footerLine1Y = pageHeight - 20;
    const col1 = margin;
    const col2 = margin + 60;
    const col3 = margin + 120;

    // Column 1: Company
    doc.text("Ihre Firma GmbH", col1, footerLine1Y);
    doc.text("Musterstraße 123", col1, footerLine1Y + 4);
    doc.text("12345 Musterstadt", col1, footerLine1Y + 8);

    // Column 2: Contact
    doc.text("Telefon: 0123 / 456 789 0", col2, footerLine1Y);
    doc.text("E-Mail: info@ihrefirma.de", col2, footerLine1Y + 4);
    doc.text("Web: www.ihrefirma.de", col2, footerLine1Y + 8);

    // Column 3: Bank / Tax
    doc.text("Bank: Musterbank", col3, footerLine1Y);
    doc.text("IBAN: DE00 1234 5678 9012 3456 78", col3, footerLine1Y + 4);
    doc.text("USt-IdNr.: DE 123 456 789", col3, footerLine1Y + 8);

    doc.save(`Rechnung_${invoice.invoice_number}.pdf`);
};
