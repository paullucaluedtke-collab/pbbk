import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReceiptData } from '@/types/receipt';

export const generatePDF = (receipts: ReceiptData[]) => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(22);
    doc.setTextColor(40);
    doc.text("Beleg-Report", 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, 14, 30);
    doc.text(`Anzahl Belege: ${receipts.length}`, 14, 35);

    const totalSum = receipts.reduce((sum, r) => sum + r.totalAmount, 0);
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Gesamtsumme: ${totalSum.toFixed(2)} €`, 14, 45);

    // Summary Table
    const tableData = receipts.map(r => [
        new Date(r.date).toLocaleDateString('de-DE'),
        r.vendor,
        r.type,
        r.category,
        r.property || '-',
        r.taxAmount.toFixed(2) + ' €',
        r.totalAmount.toFixed(2) + ' €'
    ]);

    autoTable(doc, {
        head: [['Datum', 'Händler', 'Typ', 'Kategorie', 'Objekt', 'Steuer', 'Gesamt']],
        body: tableData,
        startY: 50,
        theme: 'grid',
        headStyles: {
            fillColor: [59, 130, 246],
            textColor: 255,
            fontSize: 10
        },
        styles: {
            fontSize: 9,
            cellPadding: 3
        },
        columnStyles: {
            0: { cellWidth: 25 }, // Date
            1: { cellWidth: 'auto' }, // Vendor
            5: { halign: 'right' },
            6: { halign: 'right', fontStyle: 'bold' }
        },
        foot: [['', '', '', '', 'Summe:',
            receipts.reduce((s, r) => s + r.taxAmount, 0).toFixed(2) + ' €',
            totalSum.toFixed(2) + ' €'
        ]],
        footStyles: {
            fillColor: [241, 245, 249],
            textColor: 0,
            fontStyle: 'bold'
        }
    });

    doc.save(`belege_export_${new Date().toISOString().slice(0, 10)}.pdf`);
};
