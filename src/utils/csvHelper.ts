import { ReceiptData } from '@/types/receipt';

export const generateCSV = (data: ReceiptData[]): string => {
    // Define explicit German headers
    const headers = [
        'Datum',
        'Händler',
        'Typ',
        'Kategorie',
        'Objekt/Info',
        'Steuer (€)',
        'Netto (€)', // Calculate Netto for convenience
        'Brutto (€)',
        'ID'
    ];

    // Helper to escape CSV fields
    const escape = (field: string | number | undefined) => {
        if (field === undefined || field === null) return '';
        const stringField = String(field);
        if (stringField.includes(';') || stringField.includes('"') || stringField.includes('\n')) {
            return `"${stringField.replace(/"/g, '""')}"`;
        }
        return stringField;
    };

    // Build rows
    const rows = data.map(r => {
        const netto = (r.totalAmount - r.taxAmount).toFixed(2);
        const tax = r.taxAmount.toFixed(2).replace('.', ','); // German decimal comma
        const total = r.totalAmount.toFixed(2).replace('.', ',');
        const net = netto.replace('.', ',');

        return [
            r.date,
            escape(r.vendor),
            escape(r.type),
            escape(r.category),
            escape(r.property),
            tax,
            net,
            total,
            r.id
        ].join(';');
    });

    // Combine headers and rows
    const csvContent = [headers.join(';'), ...rows].join('\n');

    // Add BOM for Excel UTF-8 recognition
    return '\uFEFF' + csvContent;
};

export const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
