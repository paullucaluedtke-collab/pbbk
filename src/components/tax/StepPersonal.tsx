"use client";

import { PersonalInfo, ChildInfo, MaritalStatus } from '@/types/taxReturn';
import TaxInfoBox from './TaxInfoBox';
import { Plus, Trash2 } from 'lucide-react';

interface StepPersonalProps {
    data: PersonalInfo;
    onChange: (data: PersonalInfo) => void;
}

const bundeslaender = [
    'Baden-Württemberg', 'Bayern', 'Berlin', 'Brandenburg', 'Bremen', 'Hamburg',
    'Hessen', 'Mecklenburg-Vorpommern', 'Niedersachsen', 'Nordrhein-Westfalen',
    'Rheinland-Pfalz', 'Saarland', 'Sachsen', 'Sachsen-Anhalt', 'Schleswig-Holstein', 'Thüringen'
];

export default function StepPersonal({ data, onChange }: StepPersonalProps) {
    const update = (field: keyof PersonalInfo, value: any) => {
        onChange({ ...data, [field]: value });
    };

    const addChild = () => {
        onChange({ ...data, children: [...data.children, { name: '', birthdate: '', kindergeld: true }] });
    };

    const updateChild = (idx: number, field: keyof ChildInfo, value: any) => {
        const children = [...data.children];
        children[idx] = { ...children[idx], [field]: value };
        onChange({ ...data, children });
    };

    const removeChild = (idx: number) => {
        onChange({ ...data, children: data.children.filter((_, i) => i !== idx) });
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
            <h2 style={{ fontSize: '1.25rem', margin: '0 0 0.5rem' }}>Persönliche Daten</h2>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                Ihre Grunddaten für die Steuererklärung
            </p>

            <TaxInfoBox>
                Die <strong>Steuer-Identifikationsnummer</strong> (11 Ziffern) finden Sie auf Ihrem Einkommensteuerbescheid oder Ihrer Lohnsteuerbescheinigung.
            </TaxInfoBox>

            <h3 style={sectionStyle}>Person</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                    <label style={labelStyle}>Vorname *</label>
                    <input style={inputStyle} value={data.first_name} onChange={e => update('first_name', e.target.value)} placeholder="Max" />
                </div>
                <div>
                    <label style={labelStyle}>Nachname *</label>
                    <input style={inputStyle} value={data.last_name} onChange={e => update('last_name', e.target.value)} placeholder="Mustermann" />
                </div>
                <div>
                    <label style={labelStyle}>Geburtsdatum</label>
                    <input style={inputStyle} type="date" value={data.birthdate} onChange={e => update('birthdate', e.target.value)} />
                </div>
                <div>
                    <label style={labelStyle}>Steuer-ID</label>
                    <input style={inputStyle} value={data.tax_id} onChange={e => update('tax_id', e.target.value)} placeholder="12 345 678 901" maxLength={14} />
                </div>
            </div>

            <h3 style={sectionStyle}>Adresse</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Straße & Hausnummer</label>
                    <input style={inputStyle} value={data.street} onChange={e => update('street', e.target.value)} placeholder="Musterstraße 1" />
                </div>
                <div>
                    <label style={labelStyle}>PLZ</label>
                    <input style={inputStyle} value={data.zip} onChange={e => update('zip', e.target.value)} placeholder="12345" maxLength={5} />
                </div>
                <div>
                    <label style={labelStyle}>Ort</label>
                    <input style={inputStyle} value={data.city} onChange={e => update('city', e.target.value)} placeholder="Musterstadt" />
                </div>
                <div>
                    <label style={labelStyle}>Bundesland</label>
                    <select style={inputStyle} value={data.bundesland} onChange={e => update('bundesland', e.target.value)}>
                        <option value="">Bitte wählen</option>
                        {bundeslaender.map(bl => <option key={bl} value={bl}>{bl}</option>)}
                    </select>
                </div>
                <div>
                    <label style={labelStyle}>Finanzamt</label>
                    <input style={inputStyle} value={data.finanzamt} onChange={e => update('finanzamt', e.target.value)} placeholder="FA Musterstadt" />
                </div>
            </div>

            <h3 style={sectionStyle}>Familienstand</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                    <label style={labelStyle}>Familienstand</label>
                    <select style={inputStyle} value={data.marital_status} onChange={e => update('marital_status', e.target.value as MaritalStatus)}>
                        <option value="single">Ledig</option>
                        <option value="married">Verheiratet / Eingetragene Lebenspartnerschaft</option>
                        <option value="divorced">Geschieden</option>
                        <option value="widowed">Verwitwet</option>
                    </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                        <input type="checkbox" checked={data.church_member}
                            onChange={e => update('church_member', e.target.checked)}
                            style={{ width: '16px', height: '16px', accentColor: '#8b5cf6' }} />
                        Kirchenmitglied
                    </label>
                    {data.church_member && (
                        <div style={{ marginTop: '0.5rem' }}>
                            <select style={{ ...inputStyle, width: 'auto' }} value={data.church_tax_rate}
                                onChange={e => update('church_tax_rate', Number(e.target.value))}>
                                <option value={8}>8% (Bayern/BW)</option>
                                <option value={9}>9% (alle anderen)</option>
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {data.marital_status === 'married' && (
                <>
                    <h3 style={sectionStyle}>Partner/in</h3>
                    <TaxInfoBox type="tip">
                        Bei Verheirateten wird automatisch der <strong>Splittingtarif</strong> angewandt — das führt oft zu einer höheren Erstattung.
                    </TaxInfoBox>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Vorname Partner/in</label>
                            <input style={inputStyle} value={data.partner_first_name || ''} onChange={e => update('partner_first_name', e.target.value)} />
                        </div>
                        <div>
                            <label style={labelStyle}>Nachname Partner/in</label>
                            <input style={inputStyle} value={data.partner_last_name || ''} onChange={e => update('partner_last_name', e.target.value)} />
                        </div>
                        <div>
                            <label style={labelStyle}>Steuer-ID Partner/in</label>
                            <input style={inputStyle} value={data.partner_tax_id || ''} onChange={e => update('partner_tax_id', e.target.value)} maxLength={14} />
                        </div>
                        <div>
                            <label style={labelStyle}>Bruttoeinkommen Partner/in (€)</label>
                            <input style={inputStyle} type="number" value={data.partner_income || ''} onChange={e => update('partner_income', Number(e.target.value) || 0)} />
                        </div>
                    </div>
                </>
            )}

            <h3 style={sectionStyle}>Kinder</h3>
            {data.children.map((child, idx) => (
                <div key={idx} style={{
                    display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '0.75rem',
                    alignItems: 'end', marginBottom: '0.75rem',
                    padding: '0.75rem', background: 'var(--accent)', borderRadius: '8px'
                }}>
                    <div>
                        <label style={labelStyle}>Name</label>
                        <input style={inputStyle} value={child.name} onChange={e => updateChild(idx, 'name', e.target.value)} />
                    </div>
                    <div>
                        <label style={labelStyle}>Geburtsdatum</label>
                        <input style={inputStyle} type="date" value={child.birthdate} onChange={e => updateChild(idx, 'birthdate', e.target.value)} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', paddingBottom: '0.3rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                            <input type="checkbox" checked={child.kindergeld}
                                onChange={e => updateChild(idx, 'kindergeld', e.target.checked)}
                                style={{ accentColor: '#8b5cf6' }} />
                            Kindergeld
                        </label>
                    </div>
                    <button onClick={() => removeChild(idx)} style={{
                        background: 'var(--danger-bg)', color: 'var(--danger)', border: 'none',
                        borderRadius: '6px', padding: '0.5rem', cursor: 'pointer', marginBottom: '0.1rem'
                    }}>
                        <Trash2 size={16} />
                    </button>
                </div>
            ))}
            <button onClick={addChild} style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.5rem 1rem', borderRadius: '6px', background: 'var(--accent)',
                color: 'var(--accent-foreground)', border: '1px dashed var(--border)',
                cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500
            }}>
                <Plus size={16} /> Kind hinzufügen
            </button>
        </div>
    );
}
