"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createCustomer, getCustomer, updateCustomer } from '@/app/actions/customerActions';
import { Customer, defaultCustomer } from '@/types/customer';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function CustomerForm({ params }: { params?: { id: string } }) {
    const isNew = !params?.id;
    const [customer, setCustomer] = useState<Partial<Customer>>(defaultCustomer);
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (!isNew && params?.id) {
            getCustomer(params.id).then(data => {
                if (data) setCustomer(data);
                setLoading(false);
            });
        }
    }, [isNew, params?.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            if (isNew) {
                await createCustomer(customer as any);
            } else if (params?.id) {
                await updateCustomer(params.id, customer);
            }
            router.push('/customers');
        } catch (err: any) {
            setError(err.message || 'Fehler beim Speichern');
            setSaving(false);
        }
    };

    const handleChange = (field: keyof Customer, value: string) => {
        setCustomer(prev => ({ ...prev, [field]: value }));
    };

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px',
        border: '1px solid var(--border)', fontSize: '0.9rem',
        background: 'var(--background)', color: 'var(--foreground)', outline: 'none'
    };

    const labelStyle: React.CSSProperties = {
        display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem',
        color: 'var(--foreground)'
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', marginTop: '6rem', color: 'var(--muted-foreground)' }}>
                <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
                <p>Lade Kundendaten...</p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '800px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <Link href="/customers" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '36px', height: '36px', borderRadius: '8px',
                    border: '1px solid var(--border)', color: 'var(--foreground)',
                    background: 'var(--background)'
                }}>
                    <ArrowLeft size={18} />
                </Link>
                <h1 style={{ fontSize: '1.5rem', margin: 0 }}>
                    {isNew ? 'Neuen Kunden anlegen' : 'Kunde bearbeiten'}
                </h1>
            </div>

            <form onSubmit={handleSubmit} style={{
                background: 'var(--secondary)', borderRadius: '10px',
                border: '1px solid var(--border)', padding: '2rem',
                boxShadow: 'var(--shadow-sm)'
            }}>
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    <div>
                        <label style={labelStyle}>Firmenname / Name *</label>
                        <input
                            required
                            style={inputStyle}
                            value={customer.name || ''}
                            onChange={e => handleChange('name', e.target.value)}
                            placeholder="Musterfirma GmbH"
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>E-Mail</label>
                            <input
                                type="email"
                                style={inputStyle}
                                value={customer.email || ''}
                                onChange={e => handleChange('email', e.target.value)}
                                placeholder="kontakt@musterfirma.de"
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Steuer-ID / USt-IdNr.</label>
                            <input
                                style={inputStyle}
                                value={customer.tax_id || ''}
                                onChange={e => handleChange('tax_id', e.target.value)}
                                placeholder="DE123456789"
                            />
                        </div>
                    </div>

                    <div>
                        <label style={labelStyle}>Straße & Hausnummer</label>
                        <input
                            style={inputStyle}
                            value={customer.address_line1 || ''}
                            onChange={e => handleChange('address_line1', e.target.value)}
                            placeholder="Musterstraße 1"
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>PLZ & Ort</label>
                            <input
                                style={inputStyle}
                                value={customer.city_zip || ''}
                                onChange={e => handleChange('city_zip', e.target.value)}
                                placeholder="12345 Musterstadt"
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Adresszusatz</label>
                            <input
                                style={inputStyle}
                                value={customer.address_line2 || ''}
                                onChange={e => handleChange('address_line2', e.target.value)}
                                placeholder="z.B. Hinterhaus"
                            />
                        </div>
                    </div>

                    <div>
                        <label style={labelStyle}>Zahlungsbedingungen (Standard)</label>
                        <select
                            style={inputStyle}
                            value={customer.payment_terms || '14 Tage netto'}
                            onChange={e => handleChange('payment_terms', e.target.value)}
                        >
                            <option value="Sofort fällig">Sofort fällig</option>
                            <option value="7 Tage netto">7 Tage netto</option>
                            <option value="14 Tage netto">14 Tage netto</option>
                            <option value="30 Tage netto">30 Tage netto</option>
                        </select>
                    </div>

                    {error && (
                        <div style={{
                            padding: '0.75rem', borderRadius: '6px',
                            background: 'var(--danger-bg)', color: 'var(--danger)',
                            fontSize: '0.9rem', border: '1px solid var(--danger)'
                        }}>
                            {error}
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <button
                            type="submit"
                            disabled={saving}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.75rem 2rem', borderRadius: '8px',
                                background: 'var(--primary)', color: 'var(--primary-foreground)',
                                border: 'none', cursor: saving ? 'wait' : 'pointer',
                                fontWeight: 600, fontSize: '1rem', opacity: saving ? 0.7 : 1
                            }}
                        >
                            {saving ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={18} />}
                            {isNew ? 'Kunde anlegen' : 'Speichern'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
