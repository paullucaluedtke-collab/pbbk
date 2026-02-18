"use client";

import { IncomeData } from '@/types/taxReturn';
import TaxInfoBox from './TaxInfoBox';

interface StepIncomeProps {
    data: IncomeData;
    onChange: (data: IncomeData) => void;
}

export default function StepIncome({ data, onChange }: StepIncomeProps) {
    const update = (field: keyof IncomeData, value: any) => {
        onChange({ ...data, [field]: value });
    };

    const numChange = (field: keyof IncomeData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        update(field, Number(e.target.value) || 0);
    };

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px',
        border: '1px solid var(--border)', fontSize: '0.875rem',
        background: 'var(--background)', color: 'var(--foreground)', outline: 'none'
    };

    const labelStyle: React.CSSProperties = {
        display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem',
        color: 'var(--foreground)'
    };

    const sectionStyle: React.CSSProperties = {
        fontSize: '1rem', fontWeight: 600, margin: '1.5rem 0 1rem',
        paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)'
    };

    return (
        <div>
            <h2 style={{ fontSize: '1.25rem', margin: '0 0 0.5rem' }}>Einkünfte</h2>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                Tragen Sie Ihre Einkünfte aus dem Steuerjahr ein
            </p>

            <h3 style={sectionStyle}>Arbeitseinkommen (Lohnsteuerbescheinigung)</h3>
            <TaxInfoBox>
                Diese Daten finden Sie auf Ihrer <strong>Lohnsteuerbescheinigung</strong>, die Sie von Ihrem Arbeitgeber erhalten.
            </TaxInfoBox>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                    <label style={labelStyle}>Bruttogehalt (€) *</label>
                    <input style={inputStyle} type="number" value={data.gross_salary || ''} onChange={numChange('gross_salary')} placeholder="0.00" />
                </div>
                <div>
                    <label style={labelStyle}>Einkommensteuer bezahlt (€)</label>
                    <input style={inputStyle} type="number" value={data.income_tax_paid || ''} onChange={numChange('income_tax_paid')} placeholder="0.00" />
                </div>
                <div>
                    <label style={labelStyle}>Solidaritätszuschlag bezahlt (€)</label>
                    <input style={inputStyle} type="number" value={data.soli_paid || ''} onChange={numChange('soli_paid')} placeholder="0.00" />
                </div>
                <div>
                    <label style={labelStyle}>Kirchensteuer bezahlt (€)</label>
                    <input style={inputStyle} type="number" value={data.church_tax_paid || ''} onChange={numChange('church_tax_paid')} placeholder="0.00" />
                </div>
            </div>

            <h3 style={sectionStyle}>Kapitalerträge</h3>
            <TaxInfoBox type="tip">
                Kapitalerträge (Zinsen, Dividenden) werden meist direkt mit <strong>25% Abgeltungssteuer</strong> besteuert. Tragen Sie hier ggf. zu viel gezahlte Steuern ein.
            </TaxInfoBox>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                    <label style={labelStyle}>Kapitalerträge (€)</label>
                    <input style={inputStyle} type="number" value={data.capital_gains || ''} onChange={numChange('capital_gains')} placeholder="0.00" />
                </div>
                <div>
                    <label style={labelStyle}>Abgeltungssteuer bezahlt (€)</label>
                    <input style={inputStyle} type="number" value={data.capital_gains_tax_paid || ''} onChange={numChange('capital_gains_tax_paid')} placeholder="0.00" />
                </div>
            </div>

            <h3 style={sectionStyle}>Vermietung & Verpachtung</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                    <label style={labelStyle}>Mieteinnahmen (€)</label>
                    <input style={inputStyle} type="number" value={data.rental_income || ''} onChange={numChange('rental_income')} placeholder="0.00" />
                </div>
                <div>
                    <label style={labelStyle}>Werbungskosten Vermietung (€)</label>
                    <input style={inputStyle} type="number" value={data.rental_expenses || ''} onChange={numChange('rental_expenses')} placeholder="0.00" />
                </div>
            </div>

            <h3 style={sectionStyle}>Sonstige Einkünfte</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                    <label style={labelStyle}>Betrag (€)</label>
                    <input style={inputStyle} type="number" value={data.other_income || ''} onChange={numChange('other_income')} placeholder="0.00" />
                </div>
                <div>
                    <label style={labelStyle}>Beschreibung</label>
                    <input style={inputStyle} value={data.other_income_description}
                        onChange={e => update('other_income_description', e.target.value)} placeholder="z.B. Rente, Unterhalt..." />
                </div>
            </div>
        </div>
    );
}
