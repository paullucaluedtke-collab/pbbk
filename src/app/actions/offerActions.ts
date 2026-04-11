"use server";

import { createClient } from '@/lib/supabaseServer';
import { Offer, OfferStatus } from '@/types/offer';
import { revalidatePath } from 'next/cache';

export async function getOffers(): Promise<Offer[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

    if (error) {
        console.error('Error fetching offers:', error);
        return [];
    }

    return data || [];
}

export async function getOffer(id: string): Promise<Offer | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

    if (error) return null;
    return data;
}

export async function saveOffer(offer: Partial<Offer>): Promise<string> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Nicht angemeldet');

    const payload = {
        ...offer,
        user_id: user.id
    };

    if (offer.id) {
        // Update
        const { error } = await supabase
            .from('offers')
            .update(payload)
            .eq('id', offer.id)
            .eq('user_id', user.id);

        if (error) throw new Error('Update fehlgeschlagen: ' + error.message);
        revalidatePath('/offers');
        return offer.id;
    } else {
        // Create
        const { data, error } = await supabase
            .from('offers')
            .insert(payload)
            .select('id')
            .single();

        if (error) throw new Error('Erstellen fehlgeschlagen: ' + error.message);
        revalidatePath('/offers');
        return data.id;
    }
}

export async function deleteOffer(id: string): Promise<void> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Nicht angemeldet');

    const { error } = await supabase
        .from('offers')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) throw new Error('Löschen fehlgeschlagen: ' + error.message);
    revalidatePath('/offers');
}

export async function convertToInvoice(offerId: string): Promise<string> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Nicht angemeldet');

    // 1. Get Offer
    const { data: offer } = await supabase
        .from('offers')
        .select('*')
        .eq('id', offerId)
        .eq('user_id', user.id)
        .single();

    if (!offer) throw new Error('Angebot nicht gefunden');

    // 2. Create Invoice (map offer fields to invoice schema)
    const invoicePayload = {
        user_id: user.id,
        customer_id: offer.customer_id || null,
        invoice_number: `INV-${offer.offer_number}`,
        date: new Date().toISOString().slice(0, 10),
        due_date: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
        subtotal: offer.subtotal,
        tax_amount: offer.tax_total,
        total_amount: offer.total,
        status: 'Draft',
        footer_text: `Erstellt aus Angebot ${offer.offer_number}`
    };

    const { data: invoice, error: invError } = await supabase
        .from('invoices')
        .insert(invoicePayload)
        .select('id')
        .single();

    if (invError) throw new Error('Rechnung konnte nicht erstellt werden: ' + invError.message);

    // 2b. Create invoice items from offer items
    if (offer.items && Array.isArray(offer.items) && offer.items.length > 0) {
        const invoiceItems = offer.items.map((item: any) => ({
            invoice_id: invoice.id,
            user_id: user.id,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.price,
            tax_rate: item.tax,
            total_price: item.quantity * item.price
        }));

        const { error: itemsError } = await supabase
            .from('invoice_items')
            .insert(invoiceItems);

        if (itemsError) {
            console.error('Error creating invoice items from offer:', itemsError);
        }
    }

    // 3. Update Offer Status
    await supabase
        .from('offers')
        .update({ status: 'Converted' as OfferStatus, converted_invoice_id: invoice.id })
        .eq('id', offerId);

    revalidatePath('/offers');
    revalidatePath('/invoices');
    return invoice.id;
}
