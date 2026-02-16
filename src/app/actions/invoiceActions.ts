"use server";

import { createClient } from '@/lib/supabaseServer';
import { Invoice, InvoiceItem } from '@/types/invoice';
import { revalidatePath } from 'next/cache';

export async function getInvoices(): Promise<Invoice[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
        .from('invoices')
        .select('*, customer:customers(*), items:invoice_items(*)')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching invoices:', error);
        throw new Error(error.message);
    }

    return data as Invoice[];
}

export async function createInvoice(invoice: Partial<Invoice>, items: Partial<InvoiceItem>[]): Promise<Invoice> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    // 1. Create Invoice Header
    const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
            ...invoice,
            user_id: user.id
        })
        .select()
        .single();

    if (invoiceError) {
        console.error('Error creating invoice:', invoiceError);
        throw new Error(invoiceError.message);
    }

    // 2. Create Invoice Items
    if (items.length > 0) {
        const itemsWithIds = items.map(item => ({
            ...item,
            invoice_id: invoiceData.id,
            user_id: user.id
        }));

        const { error: itemsError } = await supabase
            .from('invoice_items')
            .insert(itemsWithIds);

        if (itemsError) {
            console.error('Error creating invoice items:', itemsError);
            // Cleanup: delete invoice if items fail? Or just warn?
            throw new Error(itemsError.message);
        }
    }

    revalidatePath('/invoices');
    revalidatePath('/invoices/list');
    return invoiceData;
}

export async function deleteInvoice(id: string): Promise<void> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    // 1. Delete invoice items first (foreign key)
    const { error: itemsError } = await supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', id);

    if (itemsError) {
        console.error('Error deleting invoice items:', itemsError);
        throw new Error(itemsError.message);
    }

    // 2. Delete invoice
    const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting invoice:', error);
        throw new Error(error.message);
    }

    revalidatePath('/invoices');
    revalidatePath('/invoices/list');
}

export async function updateInvoiceStatus(id: string, status: Invoice['status']): Promise<void> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('invoices')
        .update({ status })
        .eq('id', id);

    if (error) {
        console.error('Error updating invoice status:', error);
        throw new Error(error.message);
    }

    revalidatePath('/invoices');
    revalidatePath('/invoices/list');
}
