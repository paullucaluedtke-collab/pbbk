"use server";

import { createClient } from '@/lib/supabaseServer';
import { BankImportResult, BankTransaction } from '@/types/bank';
import { revalidatePath } from 'next/cache';

export async function getBankTransactions() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('bank_transactions')
        .select(`
            *,
            receipts (
                id,
                date,
                total_amount,
                vendor
            ),
            invoices (
                id,
                invoice_number,
                total_amount,
                customer_id
            )
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false });

    if (error) {
        console.error('Error fetching transactions:', error);
        return [];
    }

    return data as any[];
}

export async function importBankCSV(formData: FormData): Promise<BankImportResult> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const file = formData.get('file') as File;
    if (!file) throw new Error("No file uploaded");

    const text = await file.text();
    const lines = text.split('\n');

    // Simple CSV Parser (Assumes: Date, Amount, Sender/Receiver, Purpose)
    // Adjust logic based on actual CSV format later
    const result: BankImportResult = { total: 0, imported: 0, duplicates: 0, errors: 0 };

    // Skip header row if exists (heuristic: check if first col is 'Date' or 'Datum')
    let startIndex = 0;
    if (lines[0].toLowerCase().includes('datum') || lines[0].toLowerCase().includes('date')) {
        startIndex = 1;
    }

    const transactionsToInsert = [];

    for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        result.total++;

        try {
            // Split by semicolon (common in DE) or comma
            const separator = line.includes(';') ? ';' : ',';
            const cols = line.split(separator).map(c => c.replace(/^"|"$/g, '').trim());

            if (cols.length < 2) continue;

            // Simple Mapping Strategy
            // 0: Date, 1: Amount, 2: Sender/Receiver, 3: Purpose (fallback)
            const dateStr = cols[0]; // DD.MM.YYYY
            const amountStr = cols[1]; // 1.234,56
            const purpose = cols[2] || '';
            const senderReceiver = cols[3] || '';

            // Parse Date (DD.MM.YYYY -> YYYY-MM-DD)
            const [day, month, year] = dateStr.split('.');
            const isoDate = `${year}-${month}-${day}`;

            // Parse Amount (German: 1.000,00 -> 1000.00)
            const amount = parseFloat(amountStr.replace(/\./g, '').replace(',', '.'));

            if (isNaN(amount) || !isoDate) {
                result.errors++;
                continue;
            }

            transactionsToInsert.push({
                user_id: user.id,
                date: isoDate,
                amount: amount,
                purpose: purpose,
                sender_receiver: senderReceiver,
                status: 'Unmatched'
            });

        } catch (e) {
            console.error('Parse error line ' + i, e);
            result.errors++;
        }
    }

    if (transactionsToInsert.length > 0) {
        const { error } = await supabase
            .from('bank_transactions')
            .insert(transactionsToInsert); // Note: In real app, handling duplicates (upsert) is better

        if (error) {
            console.error('Insert error:', error);
            throw new Error('Database insert failed');
        }
        result.imported = transactionsToInsert.length;
    }

    // Trigger Auto-Match
    await autoMatchTransactions();

    revalidatePath('/bank');
    return result;
}

export async function importBankAI(transactionsData: any[]): Promise<BankImportResult> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const result: BankImportResult = { total: 0, imported: 0, duplicates: 0, errors: 0 };
    const transactionsToInsert = [];

    for (const tx of transactionsData) {
        result.total++;
        try {
            if (!tx.date || typeof tx.amount !== 'number') {
                result.errors++;
                continue;
            }

            transactionsToInsert.push({
                user_id: user.id,
                date: tx.date,
                amount: tx.amount,
                purpose: tx.purpose || '',
                sender_receiver: tx.sender_receiver || '',
                status: 'Unmatched'
            });
        } catch (e) {
            console.error('Parse error AI tx', e);
            result.errors++;
        }
    }

    if (transactionsToInsert.length > 0) {
        const { error } = await supabase
            .from('bank_transactions')
            .insert(transactionsToInsert);

        if (error) {
            console.error('Insert error:', error);
            throw new Error('Database insert failed');
        }
        result.imported = transactionsToInsert.length;
    }

    // Trigger Auto-Match
    await autoMatchTransactions();

    revalidatePath('/bank');
    return result;
}

export async function autoMatchTransactions() {
    const supabase = createClient();

    // 1. Fetch Unmatched Transactions
    const { data: transactions } = await supabase
        .from('bank_transactions')
        .select('*')
        .eq('status', 'Unmatched');

    if (!transactions || transactions.length === 0) return;

    // 2. Fetch Unmatched Receipts & Invoices
    const { data: receipts } = await supabase
        .from('receipts')
        .select('*')
        .eq('status', 'Verified');

    // Fetch invoices that are NOT paid, including customer data
    const { data: invoices } = await supabase
        .from('invoices')
        .select(`
            *,
            customer:customers (
                name
            )
        `)
        .neq('status', 'Paid');

    if (!receipts && !invoices) return;

    // 3. Advanced Matching Logic
    for (const tx of transactions) {
        if (tx.amount > 0 && invoices) {
            // INCOME -> match against invoice
            const match = invoices.find(inv => {
                const amountMatches = Math.abs(inv.total_amount - tx.amount) < 0.05;

                // Extra checks for safety: invoice number in purpose OR customer name in sender/receiver
                const purposeText = (tx.purpose || '').toLowerCase();
                const senderText = (tx.sender_receiver || '').toLowerCase();

                const purposeMatches = purposeText.includes(inv.invoice_number.toLowerCase());

                // Safe check since customers exist via join
                const customerName = (inv.customer as any)?.name?.toLowerCase() || '';
                const nameMatches = customerName && (senderText.includes(customerName) || purposeText.includes(customerName));

                // We require BOTH the amount to match AND either the invoice number or the customer name to be present
                return amountMatches && (purposeMatches || nameMatches);
            });

            if (match) {
                await supabase
                    .from('bank_transactions')
                    .update({
                        status: 'Matched',
                        matched_invoice_id: match.id
                    })
                    .eq('id', tx.id);

                // Mark invoice as Paid
                await supabase
                    .from('invoices')
                    .update({ status: 'Paid' })
                    .eq('id', match.id);
            }
        }
        else if (tx.amount < 0 && receipts) {
            // EXPENSE -> match against receipt
            const match = receipts.find(r => Math.abs(r.total_amount - Math.abs(tx.amount)) < 0.05);

            if (match) {
                await supabase
                    .from('bank_transactions')
                    .update({
                        status: 'Matched',
                        matched_receipt_id: match.id
                    })
                    .eq('id', tx.id);
            }
        }
    }
}
