import JSZip from 'jszip';
import { ReceiptData } from '@/types/receipt';
import { generateCSV } from './csvHelper';

export const generateZipExport = async (receipts: ReceiptData[]) => {
    const zip = new JSZip();

    // 1. Add CSV
    const csvContent = generateCSV(receipts);
    zip.file(`belege_export_${new Date().toISOString().slice(0, 10)}.csv`, csvContent);

    // 2. Add Images
    const imgFolder = zip.folder("belege_bilder");

    // Track missing images
    const missingImages: string[] = [];

    await Promise.all(receipts.map(async (receipt) => {
        if (!receipt.imageUrl) return;

        try {
            // Clean filename from URL (e.g., /api/images/UUID.jpg -> UUID.jpg)
            const urlParts = receipt.imageUrl.split('/');
            const originalFilename = urlParts[urlParts.length - 1]; // UUID.jpg

            // Create a nice filename: DATE_VENDOR_category.jpg
            // Sanitize strings to be safe filenames
            const safeVendor = receipt.vendor.replace(/[^a-z0-9]/gi, '_').substring(0, 20);
            const saneDate = receipt.date;
            const ext = originalFilename.split('.').pop() || 'jpg';

            const newFilename = `${saneDate}_${safeVendor}_${receipt.id.substring(0, 4)}.${ext}`;

            // Fetch the image data
            const response = await fetch(receipt.imageUrl);
            if (!response.ok) throw new Error(`Failed to fetch ${receipt.imageUrl}`);

            const blob = await response.blob();
            imgFolder?.file(newFilename, blob);

        } catch (e) {
            console.error(`Failed to add image for receipt ${receipt.id}`, e);
            missingImages.push(receipt.id);
        }
    }));

    // Generate ZIP
    const content = await zip.generateAsync({ type: "blob" });

    // Trigger Download
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `Steueunterlagen_${new Date().toISOString().slice(0, 10)}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
