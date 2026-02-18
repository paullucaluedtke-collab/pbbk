export type OfferStatus = 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Converted';

export interface OfferItem {
    description: string;
    quantity: number;
    price: number;
    tax: number; // 0, 7, 19
}

export interface Offer {
    id: string;
    user_id: string;
    offer_number: string;
    customer_id?: string;
    customer_name: string;
    customer_address: string;
    date: string;
    valid_until?: string;
    items: OfferItem[];
    subtotal: number;
    tax_total: number;
    total: number;
    status: OfferStatus;
    converted_invoice_id?: string;
    created_at?: string;
}

export const defaultOffer: Omit<Offer, 'id' | 'user_id' | 'created_at'> = {
    offer_number: '',
    customer_name: '',
    customer_address: '',
    date: new Date().toISOString().slice(0, 10),
    items: [{ description: '', quantity: 1, price: 0, tax: 19 }],
    subtotal: 0,
    tax_total: 0,
    total: 0,
    status: 'Draft',
};
