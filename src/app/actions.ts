"use server";

import { revalidatePath } from 'next/cache';
import { ReceiptData } from '@/types/receipt';
import { saveReceipt, getReceipts as getReceiptsFromStorage, deleteReceipt as deleteReceiptFromStorage, updateReceipt } from '@/lib/storage';

export async function addReceipt(formData: FormData, analysisData: any) {
    const file = formData.get('file') as File;

    if (!file) {
        throw new Error('No file uploaded');
    }

    const buffer = Buffer.from(await file.arrayBuffer());

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
    };

    await saveReceipt(newReceipt, buffer);
    revalidatePath('/');
    return newReceipt;
}

export async function fetchReceipts() {
    return getReceiptsFromStorage();
}

export async function removeReceipt(id: string) {
    await deleteReceiptFromStorage(id);
    revalidatePath('/');
}

export async function editReceipt(receipt: ReceiptData) {
    await updateReceipt(receipt);
    revalidatePath('/');
}
