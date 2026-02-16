"use server";

import { createClient } from '@/lib/supabaseServer';
import { Subscription } from '@/types/subscription';
import { revalidatePath } from 'next/cache';

export async function getSubscriptions() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('subscriptions')
        .select('*, customers(name)')
        .eq('user_id', user.id)
        .neq('status', 'cancelled')
        .order('next_run', { ascending: true });

    if (error) {
        console.error('Error fetching subscriptions:', error);
        return [];
    }

    return data as Subscription[];
}

export async function createSubscription(data: Partial<Subscription>) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase
        .from('subscriptions')
        .insert({
            user_id: user.id,
            customer_id: data.customer_id,
            interval: data.interval,
            next_run: data.next_run,
            status: 'active',
            template_data: data.template_data
        });

    if (error) {
        console.error('Error creating subscription:', error);
        throw new Error('Failed to create subscription');
    }

    revalidatePath('/invoices/subscriptions'); // Path to be created
}

export async function deleteSubscription(id: string) {
    const supabase = createClient();

    // Soft delete (or set status cancelled)
    const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('id', id);

    if (error) throw new Error('Failed to cancel subscription');
    revalidatePath('/invoices/subscriptions');
}

export async function checkAndRunSubscriptions() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { processed: 0, errors: 0 };

    const today = new Date().toISOString().split('T')[0];

    // Fetch due subscriptions
    const { data: dueSubs, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .lte('next_run', today);

    if (error || !dueSubs || dueSubs.length === 0) return { processed: 0, errors: 0 };

    let processed = 0;
    let errors = 0;

    for (const sub of dueSubs) {
        try {
            // 1. Create Invoice
            await generateInvoiceFromSubscription(sub, user.id);

            // 2. Calculate Next Run
            const nextDate = new Date(sub.next_run);
            if (sub.interval === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
            else if (sub.interval === 'quarterly') nextDate.setMonth(nextDate.getMonth() + 3);
            else if (sub.interval === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);

            const nextRunStr = nextDate.toISOString().split('T')[0];

            // 3. Update Subscription
            await supabase
                .from('subscriptions')
                .update({ next_run: nextRunStr })
                .eq('id', sub.id);

            processed++;
        } catch (e) {
            console.error(`Failed to process sub ${sub.id}`, e);
            errors++;
        }
    }

    if (processed > 0) revalidatePath('/invoices');
    return { processed, errors };
}

async function generateInvoiceFromSubscription(sub: any, userId: string) {
    // Generate Invoice Number (Simple logic: Year-Month-Random/Seq)
    // For MVP, using Date string + random suffix/prefix or just rely on addInvoice to handle?
    // Let's assume we construct a draft.

    const invoiceData = {
        customer_id: sub.customer_id,
        date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days due
        invoice_number: `ABO-` + Date.now().toString().slice(-6), // Temporary ID logic
        status: 'Draft',
        items: sub.template_data.items,
        // Calculate totals logic should be here or in addInvoice
        // Assuming addInvoice handles item calculations if passed correctly
        footer_text: sub.template_data.footer_text
    };

    // Need to import addInvoice from current action file structure. 
    // If addInvoice expects form data, we might need a direct DB insert here or refactor addInvoice.
    // Refactoring addInvoice to accept object data is best practice.
    // For now, let's do a direct insert to be safe and independent of FormData.

    const supabase = createClient();

    // Calculate totals
    let subtotal = 0;
    let taxAmount = 0;
    invoiceData.items.forEach((item: any) => {
        const lineTotal = item.quantity * item.unit_price;
        subtotal += lineTotal;
        taxAmount += lineTotal * (item.tax_rate / 100);
    });
    const totalAmount = subtotal + taxAmount;

    // Insert Invoice
    const { data: inv, error: invError } = await supabase
        .from('invoices')
        .insert({
            user_id: userId,
            customer_id: invoiceData.customer_id,
            invoice_number: invoiceData.invoice_number,
            date: invoiceData.date,
            due_date: invoiceData.due_date,
            status: 'Draft',
            subtotal,
            tax_amount: taxAmount,
            total_amount: totalAmount,
            footer_text: invoiceData.footer_text
        })
        .select()
        .single();

    if (invError) throw invError;

    // Insert Items
    const itemsToInsert = invoiceData.items.map((item: any) => ({
        invoice_id: inv.id,
        user_id: userId,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        tax_rate: item.tax_rate,
        total_price: item.quantity * item.unit_price
    }));

    const { error: itemError } = await supabase
        .from('invoice_items')
        .insert(itemsToInsert);

    if (itemError) throw itemError;
}
