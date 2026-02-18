"use client";

import { ExtraordinaryBurdens } from '@/types/taxReturn';
import TaxInfoBox from './TaxInfoBox';

interface StepExtraordinaryProps {
    data: ExtraordinaryBurdens;
    onChange: (data: ExtraordinaryBurdens) => void;
}

export default function StepExtraordinary({ data, onChange }: StepExtraordinaryProps) {
    const update = (field: keyof ExtraordinaryBurdens, value: number) => {
        onChange({ ...data, [field]: value });
    };

    const numChange = (field: keyof ExtraordinaryBurdens) => (e: React.ChangeEvent<HTMLInputElement>) => {
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
            <h2 style={{ fontSize: '1.25rem', margin: '0 0 0.5rem' }}>Außergewöhnliche Belastungen</h2>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                Ungewöhnliche, aber unvermeidbare Kosten
            </p>

            <TaxInfoBox>
                Außergewöhnliche Belastungen werden erst ab einer <strong>zumutbaren Eigenbelastung</strong> steuerlich berücksichtigt.
                Diese hängt von Ihrem Einkommen, Familienstand und der Anzahl Ihrer Kinder ab (typisch 1–7% des Einkommens).
            </TaxInfoBox>

            <h3 style={sectionStyle}>Krankheit & Pflege</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                    <label style={labelStyle}>Krankheitskosten (€)</label>
                    <input style={inputStyle} type="number" value={data.medical_costs || ''} onChange={numChange('medical_costs')} placeholder="0.00" />
                    <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', margin: '0.25rem 0 0' }}>
                        Arztkosten, Medikamente, Brille, Zahnersatz
                    </p>
                </div>
                <div>
                    <label style={labelStyle}>Pflegekosten (€)</label>
                    <input style={inputStyle} type="number" value={data.care_costs || ''} onChange={numChange('care_costs')} placeholder="0.00" />
                    <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', margin: '0.25rem 0 0' }}>
                        Pflegeheim, häusliche Pflege
                    </p>
                </div>
            </div>

            <h3 style={sectionStyle}>Behinderung</h3>
            <TaxInfoBox type="tip">
                Ab einem Grad der Behinderung (GdB) von 20 steht Ihnen ein <strong>Behindertenpauschbetrag</strong> zu (384 € bis 2.840 € je nach GdB).
            </TaxInfoBox>
            <div style={{ maxWidth: '300px' }}>
                <label style={labelStyle}>Grad der Behinderung (GdB)</label>
                <input style={inputStyle} type="number" min={0} max={100} step={10}
                    value={data.disability_degree || ''} onChange={numChange('disability_degree')} placeholder="0" />
                {data.disability_degree >= 20 && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--success)', marginTop: '0.5rem', fontWeight: 600 }}>
                        ✓ Pauschbetrag wird automatisch berücksichtigt
                    </p>
                )}
            </div>

            <h3 style={sectionStyle}>Sonstiges</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                    <label style={labelStyle}>Bestattungskosten (€)</label>
                    <input style={inputStyle} type="number" value={data.funeral_costs || ''} onChange={numChange('funeral_costs')} placeholder="0.00" />
                </div>
                <div>
                    <label style={labelStyle}>Schadensfälle (€)</label>
                    <input style={inputStyle} type="number" value={data.disaster_costs || ''} onChange={numChange('disaster_costs')} placeholder="0.00" />
                    <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', margin: '0.25rem 0 0' }}>
                        z.B. Hochwasser, Brand (nicht versichert)
                    </p>
                </div>
            </div>
        </div>
    );
}
