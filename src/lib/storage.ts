import { ReceiptData } from '@/types/receipt';
import { supabase } from '@/lib/supabaseClient';

export const getReceipts = async (supabaseClient?: any): Promise<ReceiptData[]> => {
    const client = supabaseClient || supabase;
    if (!client) return [];

    const { data, error } = await client
        .from('receipts')
        .select('*')
        .order('date', { ascending: false });

    if (error) {
        console.error('Error fetching receipts:', error);
        throw new Error(error.message);
    }

    const receiptsWithSignedUrls = await Promise.all(
        (data || []).map(async (r: any) => {
            let imageUrl = r.image_url;

            // If image_url suggests it's stored in Supabase storage and not an external link
            // Try to sign it if it's a relative path or matches our bucket pattern
            // Current save logic stores full public URL. 
            // Better approach: Store path in DB, or extract path from URL.
            // For this fix: We will try to sign the path "userid/receiptid.jpg"

            const path = `${r.user_id}/${r.id}.jpg`; // Re-construct path convention from saveReceipt

            const { data: signedData } = await client.storage
                .from('receipts')
                .createSignedUrl(path, 60 * 60); // 1 hour validity

            if (signedData?.signedUrl) {
                imageUrl = signedData.signedUrl;
            }

            return {
                id: r.id,
                date: r.date,
                vendor: r.vendor,
                category: r.category,
                type: r.type,
                taxAmount: parseFloat(r.tax_amount),
                totalAmount: parseFloat(r.total_amount),
                property: r.property,
                imageUrl: imageUrl, // Use signed URL
                status: r.status || 'Pending',
                verifiedAt: r.verified_at,
                verifiedBy: r.verified_by
            };
        })
    );

    return receiptsWithSignedUrls;
};

export const saveReceipt = async (receipt: ReceiptData, imageBuffer: Buffer, supabaseClient?: any): Promise<void> => {
    const client = supabaseClient || supabase;
    if (!client) throw new Error("Supabase not configured");

    const { data: { user } } = await client.auth.getUser();
    if (!user) throw new Error("User not valid session");

    // 1. Upload Image to Storage
    const filename = `${user.id}/${receipt.id}.jpg`;

    const { error: uploadError } = await client.storage
        .from('receipts')
        .upload(filename, imageBuffer, {
            contentType: 'image/jpeg',
            upsert: true
        });

    if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error('Image upload failed');
    }

    // Get public URL (legacy)
    // const { data: { publicUrl } } = client.storage.from('receipts').getPublicUrl(filename);

    // Check if we can sign it immediately for the current session return object?
    // For DB, we store the filename path or keep publicUrl as placeholder. 
    // To minimize DB changes, we keep publicUrl logic but `getReceipts` will ignore it and sign on fly.
    // Actually, let's store the generated publicURL just in case bucket becomes public later,
    // but relies on getReceipts to sign it.

    const { data: { publicUrl } } = client.storage
        .from('receipts')
        .getPublicUrl(filename);

    receipt.imageUrl = publicUrl;

    // 2. Insert into DB
    const { error: dbError } = await client
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
            image_url: publicUrl,
            status: receipt.status || 'Pending'
        });

    if (dbError) {
        console.error('DB Insert error:', dbError);
        throw new Error(dbError.message);
    }
};

export const deleteReceipt = async (id: string, supabaseClient?: any): Promise<void> => {
    const client = supabaseClient || supabase;
    if (!client) return;

    const { data: { user } } = await client.auth.getUser();
    if (!user) return;

    // Delete Image
    const filename = `${user.id}/${id}.jpg`;
    await client.storage.from('receipts').remove([filename]);

    // Delete Record
    const { error } = await client
        .from('receipts')
        .delete()
        .eq('id', id);

    if (error) console.error('Delete error', error);
};

export const updateReceipt = async (updatedReceipt: ReceiptData, supabaseClient?: any): Promise<void> => {
    const client = supabaseClient || supabase;
    if (!client) return;

    const { error } = await client
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
