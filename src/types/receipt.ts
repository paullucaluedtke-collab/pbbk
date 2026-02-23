export type ReceiptType = 'Ausgabe' | 'Einnahme';

export type TaxCategory =
    | 'Büromat./Porto/Tel.'
    | 'Fortbildung'
    | 'KFZ-Kosten'
    | 'Miete/Nebenkosten'
    | 'Reisekosten'
    | 'Bewirtung'
    | 'Wareneingang'
    | 'Fremdleistung'
    | 'Geldtransit'
    | 'Privatentnahme'
    | 'Grundstückskosten'
    | 'Betriebskosten allgemein'
    | 'Kartenzahlung'
    | 'Barquittung Pension & Frühstück'
    | 'Sonstiges';

export interface ReceiptData {
    id: string;
    date: string;
    vendor: string;
    category: TaxCategory;
    taxAmount: number;
    totalAmount: number;
    type: ReceiptType;
    property?: string; // Für Vermietung und Verpachtung
    imageUrl?: string; // Base64 or URL
    status: 'Pending' | 'Verified' | 'Rejected';
    verifiedAt?: string;
    verifiedBy?: string;
    confidence?: 'high' | 'medium' | 'low';
}
