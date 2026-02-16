export interface BankTransaction {
    id: string;
    date: string;
    amount: number;
    purpose: string;
    sender_receiver: string;
    status: 'Unmatched' | 'Matched' | 'Ignored';
    matched_receipt_id?: string;
    matched_invoice_id?: string;
}

export interface BankImportResult {
    total: number;
    imported: number;
    duplicates: number;
    errors: number;
}
