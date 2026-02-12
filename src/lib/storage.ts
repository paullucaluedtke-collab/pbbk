import fs from 'fs';
import path from 'path';
import { ReceiptData } from '@/types/receipt';

const DATA_DIR = path.join(process.cwd(), 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'receipts.json');

// Ensure directories exist
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export const getReceipts = (): ReceiptData[] => {
    if (!fs.existsSync(DB_FILE)) {
        return [];
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    try {
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
};

export const saveReceipt = async (receipt: ReceiptData, imageBuffer: Buffer): Promise<void> => {
    const receipts = getReceipts();

    // Save Image
    const filename = `${receipt.id}.jpg`;
    const filepath = path.join(UPLOADS_DIR, filename);
    await fs.promises.writeFile(filepath, imageBuffer);

    // Update receipt with local path (relative or API route)
    // We will serve via /api/images/[filename]
    receipt.imageUrl = `/api/images/${filename}`;

    receipts.unshift(receipt);
    await fs.promises.writeFile(DB_FILE, JSON.stringify(receipts, null, 2));
};

export const deleteReceipt = async (id: string): Promise<void> => {
    let receipts = getReceipts();
    const receipt = receipts.find(r => r.id === id);

    if (receipt) {
        // Try to delete image file
        const filename = `${id}.jpg`;
        const filepath = path.join(UPLOADS_DIR, filename);
        if (fs.existsSync(filepath)) {
            try {
                await fs.promises.unlink(filepath);
            } catch (e) {
                console.error("Failed to delete image file", e);
            }
        }
    }

    receipts = receipts.filter(r => r.id !== id);
    await fs.promises.writeFile(DB_FILE, JSON.stringify(receipts, null, 2));
};

export const updateReceipt = async (updatedReceipt: ReceiptData): Promise<void> => {
    let receipts = getReceipts();
    const index = receipts.findIndex(r => r.id === updatedReceipt.id);

    if (index !== -1) {
        receipts[index] = updatedReceipt;
        await fs.promises.writeFile(DB_FILE, JSON.stringify(receipts, null, 2));
    }
};
