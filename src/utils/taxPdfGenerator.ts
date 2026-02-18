import jsPDF from 'jspdf';
import { TaxReturn } from '@/types/taxReturn';
import { calculateTax, formatEuro } from './taxCalculator';

export const generateTaxPDF = (taxReturn: TaxReturn) => {
    const doc = new jsPDF();
    const result = calculateTax(taxReturn);
    const margin = 20;
    const pageWidth = doc.internal.pageSize.width;

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("Steuerübersicht", margin, 25);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Einkommensteuer ${taxReturn.year} — Erstellt am ${new Date().toLocaleDateString('de-DE')}`, margin, 32);

    // Disclaimer
    doc.setFontSize(8);
    doc.setTextColor(200, 100, 0);
    doc.text("Dieses Dokument dient nur zur Übersicht. Für die offizielle Abgabe nutzen Sie ELSTER oder einen Steuerberater.", margin, 38);

    doc.setTextColor(0);
    let y = 48;

    // Section helper
    const section = (title: string) => {
        y += 4;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text(title, margin, y);
        doc.setDrawColor(200);
        doc.line(margin, y + 2, pageWidth - margin, y + 2);
        y += 8;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
    };

    const row = (label: string, value: string, bold = false) => {
        if (bold) doc.setFont("helvetica", "bold");
        doc.text(label, margin, y);
        doc.text(value, pageWidth - margin, y, { align: 'right' });
        if (bold) doc.setFont("helvetica", "normal");
        y += 5;
    };

    // Personal Info
    section("Persönliche Daten");
    const p = taxReturn.personal;
    row("Name", `${p.first_name} ${p.last_name}`);
    if (p.tax_id) row("Steuer-ID", p.tax_id);
    row("Adresse", `${p.street}, ${p.zip} ${p.city}`);
    row("Familienstand", p.marital_status === 'married' ? 'Verheiratet (Splittingtarif)' :
        p.marital_status === 'single' ? 'Ledig' : p.marital_status === 'divorced' ? 'Geschieden' : 'Verwitwet');
    if (p.children.length > 0) row("Kinder", `${p.children.length}`);
    row("Kirchenmitglied", p.church_member ? `Ja (${p.church_tax_rate}%)` : 'Nein');

    // Income
    section("Einkünfte");
    const inc = taxReturn.income;
    row("Bruttogehalt", formatEuro(inc.gross_salary));
    if (inc.rental_income > 0) row("Mieteinnahmen", formatEuro(inc.rental_income));
    if (inc.capital_gains > 0) row("Kapitalerträge", formatEuro(inc.capital_gains));
    if (inc.other_income > 0) row(`Sonstige (${inc.other_income_description || '-'})`, formatEuro(inc.other_income));

    // Already paid
    section("Bereits bezahlte Steuern");
    row("Lohnsteuer", formatEuro(inc.income_tax_paid));
    row("Solidaritätszuschlag", formatEuro(inc.soli_paid));
    if (inc.church_tax_paid > 0) row("Kirchensteuer", formatEuro(inc.church_tax_paid));
    row("Gesamt bezahlt", formatEuro(result.total_already_paid), true);

    // Deductions summary
    section("Abzüge");
    row("Zu versteuerndes Einkommen", formatEuro(result.taxable_income), true);

    // Tax calculation
    section("Steuerberechnung");
    row("Einkommensteuer", formatEuro(result.income_tax));
    row("Solidaritätszuschlag", formatEuro(result.solidarity_surcharge));
    if (result.church_tax > 0) row("Kirchensteuer", formatEuro(result.church_tax));
    if (result.craftsman_credit > 0) row("− Handwerkerermäßigung", `− ${formatEuro(result.craftsman_credit)}`);
    if (result.household_credit > 0) row("− Haushaltsermäßigung", `− ${formatEuro(result.household_credit)}`);

    y += 2;
    doc.setDrawColor(100);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;

    row("Gesamte Steuerlast", formatEuro(result.total_tax), true);
    row("Bereits bezahlt", formatEuro(result.total_already_paid), true);

    y += 4;
    const isRefund = result.estimated_refund > 0;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(isRefund ? 22 : 239, isRefund ? 163 : 68, isRefund ? 74 : 68);
    doc.text(
        isRefund ? "Geschätzte Erstattung:" : "Geschätzte Nachzahlung:",
        margin, y
    );
    doc.text(
        `${isRefund ? '+' : ''}${formatEuro(result.estimated_refund)}`,
        pageWidth - margin, y, { align: 'right' }
    );

    // Footer
    doc.setTextColor(150);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    const pageHeight = doc.internal.pageSize.height;
    doc.text("Erstellt mit Bürokratie Killer — keine Steuererklärung, nur zur Übersicht", margin, pageHeight - 10);

    doc.save(`Steueruebersicht_${taxReturn.year}.pdf`);
};
