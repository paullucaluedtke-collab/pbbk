import { Customer } from './customer';

export type { Customer };

export interface InvoiceItem {
    id: string;
    invoice_id: string;
    user_id: string;
    description: string;
    quantity: number;
    unit_price: number;
    tax_rate: number;
    total_price: number;
}

export interface Invoice {
    id: string;
    user_id: string;
    customer_id?: string;
    invoice_number: string;
    date: string;
    due_date?: string;
    status: 'Draft' | 'Sent' | 'Paid' | 'Overdue';
    subtotal: number;
    tax_amount: number;
    total_amount: number;
    footer_text?: string;
    created_at?: string;
    items?: InvoiceItem[];
    customer?: Customer;
}
