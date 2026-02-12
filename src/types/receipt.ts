export type ReceiptType = 'Ausgabe' | 'Einnahme';

export interface ReceiptData {
    id: string;
    date: string;
    vendor: string;
    category: string;
    taxAmount: number;
    totalAmount: number;
    type: ReceiptType;
    property?: string; // Für Vermietung und Verpachtung
    imageUrl?: string; // Base64 data definition
}
