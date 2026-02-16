import { ReceiptData } from '@/types/receipt';
import { supabase } from '@/lib/supabaseClient';

export const getReceipts = async (): Promise<ReceiptData[]> => {
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('receipts')
        .select('*')
        .order('date', { ascending: false });

    if (error) {
        console.error('Error fetching receipts:', error);
        throw new Error(error.message);
    }

    return data.map((r: any) => ({
        id: r.id,
        date: r.date,
        vendor: r.vendor,
        category: r.category,
        type: r.type,
        taxAmount: parseFloat(r.tax_amount),
        totalAmount: parseFloat(r.total_amount),
        property: r.property,
        imageUrl: r.image_url,
    }));
};

export const saveReceipt = async (receipt: ReceiptData, imageBuffer: Buffer): Promise<void> => {
    if (!supabase) throw new Error("Supabase not configured");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not valid session");

    // 1. Upload Image to Storage
    const filename = `${user.id}/${receipt.id}.jpg`;

    const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(filename, imageBuffer, {
            contentType: 'image/jpeg',
            upsert: true
        });

    if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error('Image upload failed');
    }

    // Get public URL (assuming bucket is public, or signed URL)
    // For MVP, enable "Public" on bucket settings or use getPublicUrl
    const { data: { publicUrl } } = supabase.storage
        .from('receipts')
        .getPublicUrl(filename);

    receipt.imageUrl = publicUrl;

    // 2. Insert into DB
    const { error: dbError } = await supabase
        .from('receipts')
        .insert({
            id: receipt.id,
            user_id: user.id,
            date: receipt.date,
            vendor: receipt.vendor,
            category: receipt.category,
            type: receipt.type,
            tax_amount: receipt.taxAmount,
            total_amount: receipt.totalAmount,
            property: receipt.property,
            image_url: publicUrl
        });

    if (dbError) {
        console.error('DB Insert error:', dbError);
        throw new Error(dbError.message);
    }
};

export const deleteReceipt = async (id: string): Promise<void> => {
    if (!supabase) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Delete Image
    const filename = `${user.id}/${id}.jpg`;
    await supabase.storage.from('receipts').remove([filename]);

    // Delete Record
    const { error } = await supabase
        .from('receipts')
        .delete()
        .eq('id', id);

    if (error) console.error('Delete error', error);
};

export const updateReceipt = async (updatedReceipt: ReceiptData): Promise<void> => {
    if (!supabase) return;

    const { error } = await supabase
        .from('receipts')
        .update({
            date: updatedReceipt.date,
            vendor: updatedReceipt.vendor,
            category: updatedReceipt.category,
            type: updatedReceipt.type,
            tax_amount: updatedReceipt.taxAmount,
            total_amount: updatedReceipt.totalAmount,
            property: updatedReceipt.property,
        })
        .eq('id', updatedReceipt.id);

    if (error) console.error('Update error', error);
};
