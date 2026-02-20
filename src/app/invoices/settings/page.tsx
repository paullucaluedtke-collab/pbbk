"use client";

import { useState, useEffect } from 'react';
import { CompanySettings, defaultCompanySettings } from '@/types/companySettings';
import { getCompanySettings, saveCompanySettings } from '@/app/actions/companyActions';
import { Save, Loader2, Building2, Check } from 'lucide-react';

export default function CompanySettingsPage() {
    const [settings, setSettings] = useState<CompanySettings>(defaultCompanySettings);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getCompanySettings();
                if (data) setSettings(data);
            } catch (e) {
                console.error('Failed to load settings', e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        setSaved(false);
        try {
            await saveCompanySettings(settings);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (e: any) {
            setError(e.message || 'Fehler beim Speichern');
        } finally {
            setSaving(false);
        }
    };

    const updateField = (field: keyof CompanySettings, value: string) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px',
        border: '1px solid var(--border)', fontSize: '0.875rem',
        background: 'var(--background)', color: 'var(--foreground)',
        outline: 'none'
    };

    const labelStyle: React.CSSProperties = {
        display: 'block', fontSize: '0.8rem', fontWeight: 600,
        marginBottom: '0.25rem', color: 'var(--foreground)'
    };

    const sectionTitleStyle: React.CSSProperties = {
        fontSize: '1rem', fontWeight: 600, margin: '1.5rem 0 1rem 0',
        paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)',
        color: 'var(--foreground)'
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--muted-foreground)' }}>
                <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
                <p>Lade Einstellungen...</p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '700px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                <div style={{
                    width: '48px', height: '48px', borderRadius: '12px',
                    background: 'var(--accent)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Building2 size={24} color="var(--accent-foreground)" />
                </div>
                <div>
                    <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Firmeneinstellungen</h1>
                    <p style={{ margin: 0, color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>
                        Diese Daten erscheinen auf Ihren Rechnungen
                    </p>
                </div>
            </div>

            <div style={{
                background: 'var(--secondary)', borderRadius: '8px',
                border: '1px solid var(--border)', padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)'
            }}>
                {/* Company Info */}
                <h3 style={sectionTitleStyle}>Firmeninformationen</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={labelStyle}>Firmenname *</label>
                        <input style={inputStyle} value={settings.company_name} onChange={e => updateField('company_name', e.target.value)} placeholder="Meine Firma GmbH" />
                    </div>
                    <div>
                        <label style={labelStyle}>Adresszeile 1</label>
                        <input style={inputStyle} value={settings.address_line1} onChange={e => updateField('address_line1', e.target.value)} placeholder="Musterstraße 1" />
                    </div>
                    <div>
                        <label style={labelStyle}>Adresszeile 2</label>
                        <input style={inputStyle} value={settings.address_line2} onChange={e => updateField('address_line2', e.target.value)} placeholder="Etage / Gebäude" />
                    </div>
                    <div>
                        <label style={labelStyle}>PLZ & Ort</label>
                        <input style={inputStyle} value={settings.city_zip} onChange={e => updateField('city_zip', e.target.value)} placeholder="12345 Musterstadt" />
                    </div>
                    <div>
                        <label style={labelStyle}>Steuernummer</label>
                        <input style={inputStyle} value={settings.tax_id} onChange={e => updateField('tax_id', e.target.value)} placeholder="012/345/67890" />
                    </div>
                    <div>
                        <label style={labelStyle}>USt-IdNr.</label>
                        <input style={inputStyle} value={settings.vat_id || ''} onChange={e => updateField('vat_id', e.target.value)} placeholder="DE123456789" />
                    </div>
                </div>

                {/* Contact */}
                <h3 style={sectionTitleStyle}>Kontaktdaten</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={labelStyle}>Telefon</label>
                        <input style={inputStyle} value={settings.phone} onChange={e => updateField('phone', e.target.value)} placeholder="+49 123 456789" />
                    </div>
                    <div>
                        <label style={labelStyle}>E-Mail</label>
                        <input style={inputStyle} value={settings.email} onChange={e => updateField('email', e.target.value)} placeholder="info@firma.de" />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={labelStyle}>Website</label>
                        <input style={inputStyle} value={settings.website} onChange={e => updateField('website', e.target.value)} placeholder="www.firma.de" />
                    </div>
                </div>

                {/* Bank */}
                <h3 style={sectionTitleStyle}>Bankverbindung</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={labelStyle}>Bankname</label>
                        <input style={inputStyle} value={settings.bank_name} onChange={e => updateField('bank_name', e.target.value)} placeholder="Sparkasse Musterstadt" />
                    </div>
                    <div>
                        <label style={labelStyle}>IBAN</label>
                        <input style={inputStyle} value={settings.iban} onChange={e => updateField('iban', e.target.value)} placeholder="DE89 3704 0044 0532 0130 00" />
                    </div>
                    <div>
                        <label style={labelStyle}>BIC</label>
                        <input style={inputStyle} value={settings.bic} onChange={e => updateField('bic', e.target.value)} placeholder="COBADEFFXXX" />
                    </div>
                </div>

                {/* Actions */}
                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button
                        onClick={handleSave}
                        disabled={saving || !settings.company_name}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.6rem 1.5rem', borderRadius: '6px',
                            background: 'var(--primary)', color: 'var(--primary-foreground)',
                            border: 'none', cursor: saving ? 'wait' : 'pointer',
                            fontWeight: 600, fontSize: '0.9rem',
                            opacity: saving || !settings.company_name ? 0.5 : 1
                        }}
                    >
                        {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
                        {saving ? 'Speichere...' : 'Speichern'}
                    </button>

                    {saved && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--success)', fontSize: '0.875rem' }}>
                            <Check size={16} /> Gespeichert!
                        </span>
                    )}
                </div>

                {error && (
                    <p style={{ marginTop: '1rem', color: 'var(--danger)', fontSize: '0.875rem' }}>{error}</p>
                )}
            </div>
        </div>
    );
}
