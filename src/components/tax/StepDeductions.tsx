"use client";

import { DeductionData } from '@/types/taxReturn';
import TaxInfoBox from './TaxInfoBox';

interface StepDeductionsProps {
    data: DeductionData;
    onChange: (data: DeductionData) => void;
}

export default function StepDeductions({ data, onChange }: StepDeductionsProps) {
    const update = (field: keyof DeductionData, value: number) => {
        onChange({ ...data, [field]: value });
    };

    const numChange = (field: keyof DeductionData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        update(field, Number(e.target.value) || 0);
    };

    // Live calculations
    const commutePauschale = (() => {
        const km = data.commute_km;
        const days = data.commute_days;
        if (km <= 0 || days <= 0) return 0;
        const first20 = Math.min(km, 20) * 0.30 * days;
        const above20 = Math.max(km - 20, 0) * 0.38 * days;
        return Math.round((first20 + above20) * 100) / 100;
    })();

    const homeOfficePauschale = Math.min(Math.min(data.home_office_days, 210) * 6, 1260);

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

    const calcBadge = (value: number) => (
        <span style={{
            display: 'inline-block', fontSize: '0.75rem', fontWeight: 600,
            padding: '2px 8px', borderRadius: '4px',
            background: 'var(--success-bg)', color: 'var(--success-text)',
            marginLeft: '0.5rem'
        }}>
            = {value.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
        </span>
    );

    return (
        <div>
            <h2 style={{ fontSize: '1.25rem', margin: '0 0 0.5rem' }}>Werbungskosten</h2>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                Kosten, die mit Ihrer Arbeit zusammenhängen
            </p>

            <TaxInfoBox type="tip">
                Der <strong>Arbeitnehmer-Pauschbetrag</strong> beträgt 1.230 €. Nur wenn Ihre tatsächlichen Werbungskosten höher sind, lohnt sich die detaillierte Angabe.
            </TaxInfoBox>

            <h3 style={sectionStyle}>
                Pendlerpauschale
                {commutePauschale > 0 && calcBadge(commutePauschale)}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                    <label style={labelStyle}>Einfache Entfernung (km)</label>
                    <input style={inputStyle} type="number" value={data.commute_km || ''} onChange={numChange('commute_km')} placeholder="0" />
                </div>
                <div>
                    <label style={labelStyle}>Arbeitstage im Jahr</label>
                    <input style={inputStyle} type="number" value={data.commute_days || ''} onChange={numChange('commute_days')} placeholder="230" />
                </div>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>
                Erste 20 km: 0,30 €/km • Ab 21. km: 0,38 €/km
            </p>

            <h3 style={sectionStyle}>
                Home-Office-Pauschale
                {data.home_office_days > 0 && calcBadge(homeOfficePauschale)}
            </h3>
            <div style={{ maxWidth: '300px' }}>
                <label style={labelStyle}>Tage im Home Office</label>
                <input style={inputStyle} type="number" value={data.home_office_days || ''} onChange={numChange('home_office_days')} placeholder="0" />
                <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>
                    6 €/Tag • Max 210 Tage • Max 1.260 €
                </p>
            </div>

            <h3 style={sectionStyle}>Weitere Werbungskosten</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                    <label style={labelStyle}>Arbeitsmittel (€)</label>
                    <input style={inputStyle} type="number" value={data.work_equipment || ''} onChange={numChange('work_equipment')} placeholder="0.00" />
                    <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', margin: '0.25rem 0 0' }}>PC, Büromöbel, Fachliteratur</p>
                </div>
                <div>
                    <label style={labelStyle}>Fortbildungskosten (€)</label>
                    <input style={inputStyle} type="number" value={data.training_costs || ''} onChange={numChange('training_costs')} placeholder="0.00" />
                </div>
                <div>
                    <label style={labelStyle}>Bewerbungskosten (€)</label>
                    <input style={inputStyle} type="number" value={data.application_costs || ''} onChange={numChange('application_costs')} placeholder="0.00" />
                </div>
                <div>
                    <label style={labelStyle}>Reisekosten (€)</label>
                    <input style={inputStyle} type="number" value={data.travel_costs || ''} onChange={numChange('travel_costs')} placeholder="0.00" />
                </div>
                <div>
                    <label style={labelStyle}>Umzugskosten (€)</label>
                    <input style={inputStyle} type="number" value={data.moving_costs || ''} onChange={numChange('moving_costs')} placeholder="0.00" />
                    <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', margin: '0.25rem 0 0' }}>Nur beruflich bedingt</p>
                </div>
                <div>
                    <label style={labelStyle}>Doppelte Haushaltsführung (€)</label>
                    <input style={inputStyle} type="number" value={data.double_household || ''} onChange={numChange('double_household')} placeholder="0.00" />
                </div>
                <div>
                    <label style={labelStyle}>Gewerkschaftsbeiträge (€)</label>
                    <input style={inputStyle} type="number" value={data.union_fees || ''} onChange={numChange('union_fees')} placeholder="0.00" />
                </div>
                <div>
                    <label style={labelStyle}>Kontoführungsgebühren (€)</label>
                    <input style={inputStyle} type="number" value={data.account_fees || ''} onChange={numChange('account_fees')} placeholder="16" />
                    <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', margin: '0.25rem 0 0' }}>Pauschale: 16 €</p>
                </div>
            </div>
        </div>
    );
}
