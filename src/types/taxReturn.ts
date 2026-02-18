// === Tax Return Types ===

export type TaxStepId = 'personal' | 'income' | 'deductions' | 'special' | 'extraordinary' | 'summary';

export type TaxReturnStatus = 'Draft' | 'InProgress' | 'Completed' | 'Submitted';

export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed';

export interface ChildInfo {
    name: string;
    birthdate: string;
    kindergeld: boolean; // Anspruch auf Kindergeld
}

export interface PersonalInfo {
    first_name: string;
    last_name: string;
    birthdate: string;
    tax_id: string; // Steuer-ID (11-stellig)
    street: string;
    zip: string;
    city: string;
    marital_status: MaritalStatus;
    church_member: boolean;
    church_tax_rate: number; // 8 or 9 percent
    bundesland: string;
    finanzamt: string;
    children: ChildInfo[];
    // Partner (if married)
    partner_first_name?: string;
    partner_last_name?: string;
    partner_birthdate?: string;
    partner_tax_id?: string;
    partner_income?: number;
}

export interface IncomeData {
    // Einkünfte aus nichtselbstständiger Arbeit
    gross_salary: number;         // Bruttogehalt
    income_tax_paid: number;      // Einkommensteuer lt. Lohnsteuerbescheinigung
    soli_paid: number;            // Solidaritätszuschlag bezahlt
    church_tax_paid: number;      // Kirchensteuer bezahlt
    // Kapitalerträge
    capital_gains: number;        // Kapitalerträge
    capital_gains_tax_paid: number; // Abgeltungssteuer bezahlt
    // Vermietung und Verpachtung
    rental_income: number;        // Mieteinnahmen
    rental_expenses: number;      // Werbungskosten Vermietung (Abschreibung, Reparaturen, etc.)
    // Sonstige Einkünfte
    other_income: number;
    other_income_description: string;
}

export interface DeductionData {
    // Pendlerpauschale
    commute_km: number;           // Einfache Entfernung in km
    commute_days: number;         // Arbeitstage (default 230)
    // Arbeitsmittel
    work_equipment: number;       // Kosten für Arbeitsmittel (PC, Büromöbel, etc.)
    // Home-Office-Pauschale
    home_office_days: number;     // Tage im Home Office (max 210, à 6€, max 1.260€)
    // Fortbildung
    training_costs: number;       // Fortbildungskosten
    // Bewerbungskosten
    application_costs: number;
    // Umzugskosten (beruflich bedingt)
    moving_costs: number;
    // Doppelte Haushaltsführung
    double_household: number;
    // Reisekosten
    travel_costs: number;
    // Gewerkschaftsbeiträge
    union_fees: number;
    // Kontoführungsgebühren (Pauschale 16€)
    account_fees: number;
}

export interface SpecialExpenses {
    // Vorsorgeaufwendungen
    health_insurance: number;         // Krankenversicherung
    nursing_insurance: number;        // Pflegeversicherung
    pension_contributions: number;    // Rentenversicherung
    unemployment_insurance: number;   // Arbeitslosenversicherung
    // Riester/Rürup
    riester_contributions: number;
    ruerup_contributions: number;
    // Spenden
    donations: number;
    // Kirchensteuer (already covered by income, but needed for deduction)
    church_tax_deduction: number;
    // Ausbildungskosten
    education_costs: number;
    // Handwerkerleistungen (20% steuerlich absetzbar, max 1.200€ Steuerermäßigung)
    craftsman_costs: number;          // Arbeitskosten (nicht Material)
    // Haushaltsnahe Dienstleistungen (20%, max 4.000€ Steuerermäßigung)
    household_services: number;       // z.B. Putzhilfe, Gärtner
}

export interface ExtraordinaryBurdens {
    medical_costs: number;        // Krankheitskosten
    care_costs: number;           // Pflegekosten
    disability_degree: number;    // Grad der Behinderung (0 = keine)
    funeral_costs: number;        // Bestattungskosten
    disaster_costs: number;       // Schadensfälle (z.B. Hochwasser)
}

export interface TaxResult {
    taxable_income: number;
    income_tax: number;
    solidarity_surcharge: number;
    church_tax: number;
    total_tax: number;
    total_already_paid: number;
    estimated_refund: number;     // positive = Erstattung, negative = Nachzahlung
    // Steuerermäßigungen
    craftsman_credit: number;
    household_credit: number;
    effective_tax_rate: number;
}

export interface TaxReturn {
    id: string;
    user_id: string;
    year: number;
    status: TaxReturnStatus;
    current_step: TaxStepId;
    personal: PersonalInfo;
    income: IncomeData;
    deductions: DeductionData;
    special_expenses: SpecialExpenses;
    extraordinary: ExtraordinaryBurdens;
    created_at?: string;
    updated_at?: string;
}

// Default values for initializing a new TaxReturn
export const defaultPersonalInfo: PersonalInfo = {
    first_name: '', last_name: '', birthdate: '', tax_id: '',
    street: '', zip: '', city: '',
    marital_status: 'single', church_member: false, church_tax_rate: 9,
    bundesland: '', finanzamt: '', children: [],
};

export const defaultIncomeData: IncomeData = {
    gross_salary: 0, income_tax_paid: 0, soli_paid: 0, church_tax_paid: 0,
    capital_gains: 0, capital_gains_tax_paid: 0,
    rental_income: 0, rental_expenses: 0,
    other_income: 0, other_income_description: '',
};

export const defaultDeductionData: DeductionData = {
    commute_km: 0, commute_days: 230,
    work_equipment: 0, home_office_days: 0,
    training_costs: 0, application_costs: 0,
    moving_costs: 0, double_household: 0,
    travel_costs: 0, union_fees: 0, account_fees: 16,
};

export const defaultSpecialExpenses: SpecialExpenses = {
    health_insurance: 0, nursing_insurance: 0,
    pension_contributions: 0, unemployment_insurance: 0,
    riester_contributions: 0, ruerup_contributions: 0,
    donations: 0, church_tax_deduction: 0, education_costs: 0,
    craftsman_costs: 0, household_services: 0,
};

export const defaultExtraordinaryBurdens: ExtraordinaryBurdens = {
    medical_costs: 0, care_costs: 0, disability_degree: 0,
    funeral_costs: 0, disaster_costs: 0,
};
