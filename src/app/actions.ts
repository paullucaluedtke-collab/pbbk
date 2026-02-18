"use server";

import { revalidatePath } from 'next/cache';
import { ReceiptData } from '@/types/receipt';
import { saveReceipt, getReceipts as getReceiptsFromStorage, deleteReceipt as deleteReceiptFromStorage, updateReceipt } from '@/lib/storage';
import { createClient } from '@/lib/supabaseServer';
import { createHash } from 'crypto';

export async function addReceipt(formData: FormData, analysisData: any) {
    const supabase = createClient();
    const file = formData.get('file') as File;

    if (!file) {
        throw new Error('No file uploaded');
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Compute SHA-256 hash for duplicate detection
    const fileHash = createHash('sha256').update(buffer).digest('hex');

    // Check for duplicate
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const { data: existing } = await supabase
            .from('receipts')
            .select('id, vendor, date')
            .eq('user_id', user.id)
            .eq('file_hash', fileHash)
            .limit(1);

        if (existing && existing.length > 0) {
            const dup = existing[0];
            throw new Error(
                `Dieser Beleg wurde bereits hochgeladen (${dup.vendor || 'Unbekannt'}, ${dup.date || 'kein Datum'}). Doppelte Uploads werden verhindert.`
            );
        }
    }

    const newReceipt: ReceiptData = {
        id: crypto.randomUUID(),
        date: analysisData.date || new Date().toISOString().split('T')[0],
        vendor: analysisData.vendor || 'Unbekannt',
        category: analysisData.category || 'Sonstiges',
        type: analysisData.type || 'Ausgabe',
        property: analysisData.property || undefined,
        taxAmount: typeof analysisData.taxAmount === 'number' ? analysisData.taxAmount : 0,
        totalAmount: typeof analysisData.totalAmount === 'number' ? analysisData.totalAmount : 0,
        imageUrl: '', // Will be set by saveReceipt
        status: 'Pending',
    };

    try {
        await saveReceipt(newReceipt, buffer, supabase, fileHash);
    } catch (e: any) {
        console.error("Save to Supabase failed:", e);
        throw new Error("Speichern fehlgeschlagen: " + e.message);
    }
    revalidatePath('/');
    return newReceipt;
}

export async function fetchReceipts() {
    const supabase = createClient();
    return getReceiptsFromStorage(supabase);
}

export async function removeReceipt(id: string) {
    const supabase = createClient();
    await deleteReceiptFromStorage(id, supabase);
    revalidatePath('/');
}

export async function editReceipt(receipt: ReceiptData) {
    const supabase = createClient();
    await updateReceipt(receipt, supabase);
    revalidatePath('/');
}
