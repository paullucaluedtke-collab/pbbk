"use server";

import { createClient } from '@/lib/supabaseServer';
import { getAccount, getExportHeaders, AccountFrame } from '@/utils/accountMapping';
import { ReceiptData } from '@/types/receipt';

export interface FinancialStats {
    incomeNet: number;
    incomeGross: number;
    expenseNet: number;
    expenseGross: number;
    taxPayable: number; // Umsatzsteuer (to pay)
    taxReceivable: number; // Vorsteuer (to get back)
    taxTraffic: number; // Zahllast (Payable - Receivable)
}

export async function getFinancialStats(year: number, month: number): Promise<FinancialStats> {
    const supabase = createClient();

    // Date Range
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    // Calculate last day of month
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const { data: receipts } = await supabase
        .from('receipts')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate);

    // Also fetch invoices (Income) if not strictly relying on receipts
    // For now, let's assume all income is also recorded in receipts or we check invoices table
    // Simplification: We look at 'receipts' which contains both Income/Expenses based on 'type'

    const stats: FinancialStats = {
        incomeNet: 0,
        incomeGross: 0,
        expenseNet: 0,
        expenseGross: 0,
        taxPayable: 0,
        taxReceivable: 0,
        taxTraffic: 0
    };

    if (!receipts) return stats;

    receipts.forEach((r: any) => {
        const amount = parseFloat(r.total_amount || 0);
        const tax = parseFloat(r.tax_amount || 0);
        const net = amount - tax;

        if (r.type === 'Einnahme') {
            stats.incomeGross += amount;
            stats.incomeNet += net;
            stats.taxPayable += tax;
        } else {
            stats.expenseGross += amount;
            stats.expenseNet += net;
            stats.taxReceivable += tax;
        }
    });

    stats.taxTraffic = stats.taxPayable - stats.taxReceivable;
    return stats;
}

export async function generateExport(year: number, month: number, format: 'DATEV' | 'Standard', frame: AccountFrame): Promise<string> {
    const supabase = createClient();
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const { data: receipts } = await supabase
        .from('receipts')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate);

    if (!receipts || receipts.length === 0) return '';

    const headers = getExportHeaders(format);
    const rows = [headers.join(';')];

    receipts.forEach((r: any) => {
        const amount = parseFloat(r.total_amount).toFixed(2).replace('.', ',');
        const dateRaw = new Date(r.date);
        const dateCode = format === 'DATEV'
            ? `${dateRaw.getDate()}${String(dateRaw.getMonth() + 1).padStart(2, '0')}` // DDMM
            : r.date;

        const description = (r.vendor || r.category || '').substring(0, 30); // DATEV limit often 30-40 chars
        const account = getAccount(r.category, r.type, frame);

        // Simple Logic for "Gegenkonto" (Cash/Bank)
        // Ideally we would map payment method. Defaulting to 1200 (Bank) or 1000 (Kasse)
        const contraAccount = frame === 'SKR03' ? 1200 : 1800;

        if (format === 'DATEV') {
            // DATEV Format (Simplified CSV import)
            // Umsatz | S/H | Währung | Kurs | Datum | Belegfeld1 | Buchungstext | Konto | Gegenkonto | BU-Schlüssel

            // S/H Logic: Income = H (Credit), Expense = S (Debit)?? or simple Amount? 
            // Better: Always positive amount, "S" or "H" determines direction relative to Konto?
            // Simplified: Just Amount. DATEV Batch import handles +/- often by "Soll/Haben-Kennzeichen".
            // Income (Erlöse) -> Have (H) on Revenue Account
            // Expense (Kosten) -> Soll (S) on Expense Account

            const sh = r.type === 'Einnahme' ? 'H' : 'S';

            const line = [
                amount,
                sh,
                'EUR',
                '',
                dateCode,
                r.id.substring(0, 10), // Document ID (Belegfeld1)
                description,
                account,
                contraAccount,
                '' // BU-Schlüssel (often 9 for 19% USt, etc. - can be complex, leaving empty for MVP)
            ].join(';');
            rows.push(line);

        } else {
            // Standard Format
            const line = [
                r.date,
                r.type,
                r.category,
                r.vendor,
                (parseFloat(r.total_amount) - parseFloat(r.tax_amount)).toFixed(2).replace('.', ','),
                parseFloat(r.tax_amount).toFixed(2).replace('.', ','),
                amount,
                r.status || 'Pending'
            ].join(';');
            rows.push(line);
        }
    });

    return rows.join('\n');
}
