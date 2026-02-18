export interface CompanySettings {
    id?: string;
    user_id?: string;
    company_name: string;
    address_line1: string;
    address_line2: string;
    city_zip: string;
    phone: string;
    email: string;
    website: string;
    bank_name: string;
    iban: string;
    bic: string;
    tax_id: string;
}

export const defaultCompanySettings: CompanySettings = {
    company_name: '',
    address_line1: '',
    address_line2: '',
    city_zip: '',
    phone: '',
    email: '',
    website: '',
    bank_name: '',
    iban: '',
    bic: '',
    tax_id: '',
};
