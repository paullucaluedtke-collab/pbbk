export interface Customer {
    id: string;
    user_id: string;
    name: string;
    email?: string;
    address_line1?: string;
    address_line2?: string;
    city_zip?: string;
    tax_id?: string;
    payment_terms?: string;
    created_at?: string;
}

export const defaultCustomer: Omit<Customer, 'id' | 'user_id' | 'created_at'> = {
    name: '',
    email: '',
    address_line1: '',
    address_line2: '',
    city_zip: '',
    tax_id: '',
    payment_terms: '14 Tage netto',
};
