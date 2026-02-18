import {
    TaxReturn, TaxResult, PersonalInfo, IncomeData,
    DeductionData, SpecialExpenses, ExtraordinaryBurdens
} from '@/types/taxReturn';

/**
 * Deutsche Einkommensteuer-Berechnung (vereinfacht, Stand 2025)
 * Basiert auf §32a EStG — Zonenformel
 */

// === Einkommensteuer nach Grundtarif (§32a EStG, Stand 2025) ===
function calculateIncomeTaxBasic(zvE: number): number {
    if (zvE <= 0) return 0;

    // Zone 1: Grundfreibetrag
    if (zvE <= 11784) return 0;

    // Zone 2: Progressionszone I (11.785 – 17.005)
    if (zvE <= 17005) {
        const y = (zvE - 11784) / 10000;
        return Math.floor((922.98 * y + 1400) * y);
    }

    // Zone 3: Progressionszone II (17.006 – 66.760)
    if (zvE <= 66760) {
        const z = (zvE - 17005) / 10000;
        return Math.floor((181.19 * z + 2397) * z + 1025.38);
    }

    // Zone 4: Proportionalzone I (66.761 – 277.825)
    if (zvE <= 277825) {
        return Math.floor(0.42 * zvE - 10602.13);
    }

    // Zone 5: Reichensteuer (ab 277.826)
    return Math.floor(0.45 * zvE - 18936.88);
}

// === Splittingtarif (§32a Abs. 5 EStG) ===
function calculateIncomeTaxSplitting(zvE: number): number {
    // Splittingtarif: Steuerbetrag = 2 × ESt(zvE / 2)
    return 2 * calculateIncomeTaxBasic(Math.floor(zvE / 2));
}

// === Solidaritätszuschlag ===
function calculateSoli(incomeTax: number): number {
    // Freigrenze: 18.130€ (Grundtarif), darüber 5,5% mit Milderungszone
    if (incomeTax <= 18130) return 0;

    // Milderungszone: 11,9% des Unterschiedsbetrags
    const milderung = (incomeTax - 18130) * 0.119;
    const fullSoli = incomeTax * 0.055;

    return Math.floor(Math.min(milderung, fullSoli) * 100) / 100;
}

// === Kirchensteuer ===
function calculateChurchTax(incomeTax: number, rate: number): number {
    return Math.floor(incomeTax * (rate / 100) * 100) / 100;
}

// === Pendlerpauschale berechnen ===
function calculateCommutePauschale(km: number, days: number): number {
    // Erste 20 km: 0,30€, ab 21. km: 0,38€
    if (km <= 0 || days <= 0) return 0;
    const first20 = Math.min(km, 20) * 0.30 * days;
    const above20 = Math.max(km - 20, 0) * 0.38 * days;
    return Math.round((first20 + above20) * 100) / 100;
}

// === Home-Office-Pauschale ===
function calculateHomeOfficePauschale(days: number): number {
    // 6€ pro Tag, max 210 Tage = max 1.260€
    const effectiveDays = Math.min(days, 210);
    return Math.min(effectiveDays * 6, 1260);
}

// === Werbungskosten gesamt ===
function calculateTotalDeductions(d: DeductionData): number {
    const commute = calculateCommutePauschale(d.commute_km, d.commute_days);
    const homeOffice = calculateHomeOfficePauschale(d.home_office_days);

    const total = commute + homeOffice + d.work_equipment + d.training_costs
        + d.application_costs + d.moving_costs + d.double_household
        + d.travel_costs + d.union_fees + d.account_fees;

    // Arbeitnehmer-Pauschbetrag: 1.230€ (2025)
    return Math.max(total, 1230);
}

// === Sonderausgaben gesamt ===
function calculateTotalSpecialExpenses(s: SpecialExpenses): number {
    // Vorsorgeaufwendungen (vereinfacht)
    const vorsorge = s.health_insurance + s.nursing_insurance
        + s.pension_contributions + s.unemployment_insurance
        + s.riester_contributions + s.ruerup_contributions;

    // Sonderausgaben-Pauschbetrag: 36€ (Ledige) / 72€ (Verheiratete) — wird ignoriert wenn höher
    const sonstige = s.donations + s.church_tax_deduction + s.education_costs;

    return vorsorge + sonstige;
}

// === Zumutbare Eigenbelastung (§33 Abs. 3 EStG) ===
function calculateReasonableBurden(
    totalIncome: number,
    maritalStatus: string,
    childrenCount: number
): number {
    // Stufe 1: bis 15.340€, Stufe 2: 15.340 – 51.130€, Stufe 3: über 51.130€
    let rate1 = 0, rate2 = 0, rate3 = 0;

    if (childrenCount === 0) {
        if (maritalStatus === 'single') {
            rate1 = 0.05; rate2 = 0.06; rate3 = 0.07;
        } else {
            rate1 = 0.04; rate2 = 0.05; rate3 = 0.06;
        }
    } else if (childrenCount <= 2) {
        rate1 = 0.02; rate2 = 0.03; rate3 = 0.04;
    } else {
        rate1 = 0.01; rate2 = 0.01; rate3 = 0.02;
    }

    const s1 = Math.min(totalIncome, 15340);
    const s2 = Math.max(0, Math.min(totalIncome, 51130) - 15340);
    const s3 = Math.max(0, totalIncome - 51130);

    return Math.round((s1 * rate1 + s2 * rate2 + s3 * rate3) * 100) / 100;
}

// === Außergewöhnliche Belastungen ===
function calculateExtraordinary(
    e: ExtraordinaryBurdens,
    totalIncome: number,
    maritalStatus: string,
    childrenCount: number
): number {
    // Behindertenpauschbetrag
    let disabilityPauschale = 0;
    if (e.disability_degree >= 20) {
        const pauschTable: Record<number, number> = {
            20: 384, 30: 620, 40: 860, 50: 1140, 60: 1440,
            70: 1780, 80: 2120, 90: 2460, 100: 2840
        };
        const nearest = Math.min(Math.floor(e.disability_degree / 10) * 10, 100);
        disabilityPauschale = pauschTable[nearest] || 0;
    }

    const totalBurdens = e.medical_costs + e.care_costs + e.funeral_costs + e.disaster_costs;
    const reasonableBurden = calculateReasonableBurden(totalIncome, maritalStatus, childrenCount);
    const deductible = Math.max(0, totalBurdens - reasonableBurden);

    return deductible + disabilityPauschale;
}

// === HAUPTBERECHNUNG ===
export function calculateTax(taxReturn: TaxReturn): TaxResult {
    const { personal, income, deductions, special_expenses, extraordinary } = taxReturn;
    const isSplitting = personal.marital_status === 'married';

    // 1. Gesamteinkünfte
    const totalGrossIncome = income.gross_salary
        + Math.max(0, income.rental_income - income.rental_expenses)
        + income.other_income;
    // Kapitalerträge werden separat besteuert (Abgeltungssteuer) — nicht in die ESt

    // 2. Werbungskosten abziehen
    const totalDeductions = calculateTotalDeductions(deductions);

    // 3. Sonderausgaben
    const totalSpecial = calculateTotalSpecialExpenses(special_expenses);

    // 4. Außergewöhnliche Belastungen
    const totalExtraordinary = calculateExtraordinary(
        extraordinary, totalGrossIncome, personal.marital_status, personal.children.length
    );

    // 5. Zu versteuerndes Einkommen
    let zvE = totalGrossIncome - totalDeductions - totalSpecial - totalExtraordinary;
    if (isSplitting && personal.partner_income) {
        zvE += personal.partner_income;
    }
    zvE = Math.max(0, Math.floor(zvE));

    // 6. Einkommensteuer
    const incomeTax = isSplitting
        ? calculateIncomeTaxSplitting(zvE)
        : calculateIncomeTaxBasic(zvE);

    // 7. Solidaritätszuschlag
    const soli = calculateSoli(incomeTax);

    // 8. Kirchensteuer
    const churchTax = personal.church_member
        ? calculateChurchTax(incomeTax, personal.church_tax_rate)
        : 0;

    // 9. Steuerermäßigungen (direkt von der Steuerschuld abgezogen)
    // Handwerkerleistungen: 20% der Arbeitskosten, max 1.200€
    const craftsmanCredit = Math.min(special_expenses.craftsman_costs * 0.20, 1200);
    // Haushaltsnahe Dienstleistungen: 20%, max 4.000€
    const householdCredit = Math.min(special_expenses.household_services * 0.20, 4000);

    const totalTax = Math.max(0, incomeTax - craftsmanCredit - householdCredit) + soli + churchTax;

    // 10. Bereits bezahlte Steuern
    const totalPaid = income.income_tax_paid + income.soli_paid + income.church_tax_paid;

    // 11. Erstattung / Nachzahlung
    const refund = totalPaid - totalTax;

    const effectiveRate = totalGrossIncome > 0
        ? Math.round((totalTax / totalGrossIncome) * 10000) / 100
        : 0;

    return {
        taxable_income: zvE,
        income_tax: incomeTax,
        solidarity_surcharge: soli,
        church_tax: churchTax,
        total_tax: totalTax,
        total_already_paid: totalPaid,
        estimated_refund: refund,
        craftsman_credit: craftsmanCredit,
        household_credit: householdCredit,
        effective_tax_rate: effectiveRate,
    };
}

// Helper: Format currency
export function formatEuro(amount: number): string {
    return amount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}
