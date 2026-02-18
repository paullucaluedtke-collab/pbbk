"use client";

import { SpecialExpenses } from '@/types/taxReturn';
import TaxInfoBox from './TaxInfoBox';

interface StepSpecialExpensesProps {
    data: SpecialExpenses;
    onChange: (data: SpecialExpenses) => void;
}

export default function StepSpecialExpenses({ data, onChange }: StepSpecialExpensesProps) {
    const update = (field: keyof SpecialExpenses, value: number) => {
        onChange({ ...data, [field]: value });
    };

    const numChange = (field: keyof SpecialExpenses) => (e: React.ChangeEvent<HTMLInputElement>) => {
        update(field, Number(e.target.value) || 0);
    };

    const craftsmanCredit = Math.min(data.craftsman_costs * 0.20, 1200);
    const householdCredit = Math.min(data.household_services * 0.20, 4000);

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

    const calcBadge = (value: number, label: string) => value > 0 ? (
        <span style={{
            display: 'inline-block', fontSize: '0.75rem', fontWeight: 600,
            padding: '2px 8px', borderRadius: '4px',
            background: 'var(--success-bg)', color: 'var(--success-text)',
            marginLeft: '0.5rem'
        }}>
            {label}: {value.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
        </span>
    ) : null;

    return (
        <div>
            <h2 style={{ fontSize: '1.25rem', margin: '0 0 0.5rem' }}>Sonderausgaben</h2>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                Versicherungen, Spenden und weitere abzugsfähige Ausgaben
            </p>

            <h3 style={sectionStyle}>Vorsorgeaufwendungen</h3>
            <TaxInfoBox>
                Die Beträge finden Sie auf Ihrer <strong>Lohnabrechnung</strong> (Arbeitnehmeranteil) oder in den Beitragsbescheinigungen Ihrer Versicherungen.
            </TaxInfoBox>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                    <label style={labelStyle}>Krankenversicherung (€)</label>
                    <input style={inputStyle} type="number" value={data.health_insurance || ''} onChange={numChange('health_insurance')} placeholder="0.00" />
                </div>
                <div>
                    <label style={labelStyle}>Pflegeversicherung (€)</label>
                    <input style={inputStyle} type="number" value={data.nursing_insurance || ''} onChange={numChange('nursing_insurance')} placeholder="0.00" />
                </div>
                <div>
                    <label style={labelStyle}>Rentenversicherung (€)</label>
                    <input style={inputStyle} type="number" value={data.pension_contributions || ''} onChange={numChange('pension_contributions')} placeholder="0.00" />
                </div>
                <div>
                    <label style={labelStyle}>Arbeitslosenversicherung (€)</label>
                    <input style={inputStyle} type="number" value={data.unemployment_insurance || ''} onChange={numChange('unemployment_insurance')} placeholder="0.00" />
                </div>
            </div>

            <h3 style={sectionStyle}>Altersvorsorge</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                    <label style={labelStyle}>Riester-Beiträge (€)</label>
                    <input style={inputStyle} type="number" value={data.riester_contributions || ''} onChange={numChange('riester_contributions')} placeholder="0.00" />
                </div>
                <div>
                    <label style={labelStyle}>Rürup-/Basisrente (€)</label>
                    <input style={inputStyle} type="number" value={data.ruerup_contributions || ''} onChange={numChange('ruerup_contributions')} placeholder="0.00" />
                </div>
            </div>

            <h3 style={sectionStyle}>Spenden & Kirchensteuer</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                    <label style={labelStyle}>Spenden (€)</label>
                    <input style={inputStyle} type="number" value={data.donations || ''} onChange={numChange('donations')} placeholder="0.00" />
                    <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', margin: '0.25rem 0 0' }}>An gemeinnützige Organisationen</p>
                </div>
                <div>
                    <label style={labelStyle}>Kirchensteuer (€)</label>
                    <input style={inputStyle} type="number" value={data.church_tax_deduction || ''} onChange={numChange('church_tax_deduction')} placeholder="0.00" />
                </div>
                <div>
                    <label style={labelStyle}>Ausbildungskosten (€)</label>
                    <input style={inputStyle} type="number" value={data.education_costs || ''} onChange={numChange('education_costs')} placeholder="0.00" />
                    <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', margin: '0.25rem 0 0' }}>Erstausbildung: max 6.000 €</p>
                </div>
            </div>

            <h3 style={sectionStyle}>
                Handwerker & Haushaltshilfe
                {calcBadge(craftsmanCredit, 'Steuerermäßigung')}
                {calcBadge(householdCredit, 'Steuerermäßigung')}
            </h3>
            <TaxInfoBox type="tip">
                <strong>Handwerkerleistungen:</strong> 20% der Arbeitskosten (nicht Material) werden direkt von der Steuerschuld abgezogen — max 1.200 €.<br />
                <strong>Haushaltsnahe Dienstleistungen:</strong> 20% der Kosten — max 4.000 €.
            </TaxInfoBox>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                    <label style={labelStyle}>Handwerkerleistungen — Arbeitskosten (€)</label>
                    <input style={inputStyle} type="number" value={data.craftsman_costs || ''} onChange={numChange('craftsman_costs')} placeholder="0.00" />
                </div>
                <div>
                    <label style={labelStyle}>Haushaltsnahe Dienstleistungen (€)</label>
                    <input style={inputStyle} type="number" value={data.household_services || ''} onChange={numChange('household_services')} placeholder="0.00" />
                    <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', margin: '0.25rem 0 0' }}>Putzhilfe, Gärtner, Pflegedienst etc.</p>
                </div>
            </div>
        </div>
    );
}
