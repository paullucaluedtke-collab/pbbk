"use server";

import { createClient } from '@/lib/supabaseServer';
import { revalidatePath } from 'next/cache';

export async function verifyReceipt(id: string, status: 'Verified' | 'Rejected') {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase
        .from('receipts')
        .update({
            status,
            verified_at: new Date().toISOString(),
            verified_by: user.id
        })
        .eq('id', id);

    if (error) {
        console.error('Error verifying receipt:', error);
        throw new Error('Verification failed');
    }

    revalidatePath('/');
}
