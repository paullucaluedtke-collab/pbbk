"use server";

import { createClient } from '@/lib/supabaseServer';

export async function getNextInvoiceNumber(): Promise<string> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return '';

    const year = new Date().getFullYear();
    const prefix = `RE-${year}-`;

    // Fetch the latest invoice number for the current year
    const { data, error } = await supabase
        .from('invoices')
        .select('invoice_number')
        .eq('user_id', user.id)
        .ilike('invoice_number', `${prefix}%`)
        .order('invoice_number', { ascending: false })
        .limit(1);

    if (error) {
        console.error('Error fetching sequential invoice number:', error);
        // Fallback to random if DB fails, to prevent blocking
        return `RE-${year}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    if (data && data.length > 0) {
        const lastNumber = data[0].invoice_number;
        // Extract the number part
        const parts = lastNumber.split('-');
        if (parts.length === 3) {
            const num = parseInt(parts[2], 10);
            if (!isNaN(num)) {
                // Increment
                const nextNum = num + 1;
                // Pad with zeros if needed (e.g. 001), but for now simple increment is safer
                return `${prefix}${nextNum}`;
            }
        }
    }

    // Default start Number if no invoices for this year found
    return `${prefix}1001`;
}
