"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { saveOffer, getOffer, convertToInvoice } from '@/app/actions/offerActions';
import { getCustomers } from '@/app/actions/customerActions';
import { Offer, OfferItem, defaultOffer } from '@/types/offer';
import { Customer } from '@/types/customer';
import { ArrowLeft, Save, Loader2, Plus, Trash2, FileCheck } from 'lucide-react';
import Link from 'next/link';

export default function OfferForm({ params }: { params?: { id: string } }) {
    const isNew = !params?.id;
    const [offer, setOffer] = useState<Partial<Offer>>(defaultOffer);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [converting, setConverting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const searchParams = useSearchParams();
    const preselectedCustomerId = searchParams.get('customerId');

    useEffect(() => {
        // Load customers for dropdown
        getCustomers().then(data => {
            setCustomers(data);
            if (preselectedCustomerId) {
                const customer = data.find(c => c.id === preselectedCustomerId);
                if (customer) {
                    setOffer(prev => ({
                        ...prev,
                        customer_id: customer.id,
                        customer_name: customer.name,
                        customer_address: [customer.address_line1, customer.address_line2, customer.city_zip].filter(Boolean).join('\n'),
                    }));
                }
            }
        });

        if (!isNew && params?.id) {
            getOffer(params.id).then(data => {
                if (data) setOffer(data);
                setLoading(false);
            });
        }
    }, [isNew, params?.id, preselectedCustomerId]);

    const handleCustomerChange = (customerId: string) => {
        const customer = customers.find(c => c.id === customerId);
        if (customer) {
            setOffer(prev => ({
                ...prev,
                customer_id: customer.id,
                customer_name: customer.name,
                customer_address: [customer.address_line1, customer.address_line2, customer.city_zip].filter(Boolean).join('\n'),
            }));
        }
    };

    const handleItemChange = (idx: number, field: keyof OfferItem, value: any) => {
        const newItems = [...(offer.items || [])];
        newItems[idx] = { ...newItems[idx], [field]: value };
        setOffer(prev => updateTotals({ ...prev, items: newItems }));
    };

    const addItem = () => {
        const newItems = [...(offer.items || []), { description: '', quantity: 1, price: 0, tax: 19 }];
        setOffer(prev => updateTotals({ ...prev, items: newItems }));
    };

    const removeItem = (idx: number) => {
        const newItems = (offer.items || []).filter((_, i) => i !== idx);
        setOffer(prev => updateTotals({ ...prev, items: newItems }));
    };

    const updateTotals = (o: Partial<Offer>) => {
        let subtotal = 0;
        let taxTotal = 0;
        (o.items || []).forEach(item => {
            const lineTotal = item.quantity * item.price;
            subtotal += lineTotal;
            taxTotal += lineTotal * (item.tax / 100);
        });
        return {
            ...o,
            subtotal: Math.round(subtotal * 100) / 100,
            tax_total: Math.round(taxTotal * 100) / 100,
            total: Math.round((subtotal + taxTotal) * 100) / 100,
        };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            await saveOffer(offer);
            router.push('/offers');
        } catch (err: any) {
            setError(err.message || 'Fehler beim Speichern');
            setSaving(false);
        }
    };

    const handleConvert = async () => {
        if (!params?.id || !confirm('Angebot jetzt in eine Rechnung umwandeln?')) return;
        setConverting(true);
        try {
            const invoiceId = await convertToInvoice(params.id);
            router.push('/invoices'); // Or direct to invoice detail
        } catch (err: any) {
            alert(err.message);
            setConverting(false);
        }
    };

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px',
        border: '1px solid var(--border)', fontSize: '0.9rem',
        background: 'var(--background)', color: 'var(--foreground)', outline: 'none'
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', marginTop: '6rem', color: 'var(--muted-foreground)' }}>
                <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
                <p>Lade Angebot...</p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '900px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link href="/offers" style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: '36px', height: '36px', borderRadius: '8px',
                        border: '1px solid var(--border)', color: 'var(--foreground)',
                        background: 'var(--background)'
                    }}>
                        <ArrowLeft size={18} />
                    </Link>
                    <h1 style={{ fontSize: '1.5rem', margin: 0 }}>
                        {isNew ? 'Neues Angebot' : 'Angebot bearbeiten'}
                    </h1>
                </div>
                {!isNew && offer.status !== 'Converted' && (
                    <button
                        onClick={handleConvert}
                        disabled={converting}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.6rem 1.25rem', borderRadius: '8px',
                            background: 'var(--success-bg)', color: 'var(--success-text)',
                            border: '1px solid var(--success)', fontWeight: 600, fontSize: '0.9rem',
                            cursor: converting ? 'wait' : 'pointer'
                        }}
                    >
                        {converting ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <FileCheck size={18} />}
                        In Rechnung wandeln
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} style={{
                background: 'var(--secondary)', borderRadius: '10px',
                border: '1px solid var(--border)', padding: '2rem',
                boxShadow: 'var(--shadow-sm)'
            }}>
                {/* Header Data */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Kunde</label>
                        <select
                            style={inputStyle}
                            value={offer.customer_id || ''}
                            onChange={e => handleCustomerChange(e.target.value)}
                        >
                            <option value="">Kunde wählen...</option>
                            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <textarea
                            style={{ ...inputStyle, marginTop: '0.5rem', minHeight: '80px', fontFamily: 'inherit' }}
                            value={offer.customer_address || ''}
                            onChange={e => setOffer(prev => ({ ...prev, customer_address: e.target.value }))}
                            placeholder="Adresse"
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Angebots-Nr.</label>
                            <input
                                style={inputStyle}
                                value={offer.offer_number || ''}
                                onChange={e => setOffer(prev => ({ ...prev, offer_number: e.target.value }))}
                                placeholder="AN-2025-001"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Datum</label>
                            <input
                                type="date"
                                style={inputStyle}
                                value={offer.date || ''}
                                onChange={e => setOffer(prev => ({ ...prev, date: e.target.value }))}
                            />
                        </div>
                    </div>
                </div>

                {/* Items */}
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Positionen</h3>
                <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1.5fr 1fr 1fr auto', gap: '1rem', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted-foreground)' }}>
                        <div>Beschreibung</div>
                        <div style={{ textAlign: 'right' }}>Menge</div>
                        <div style={{ textAlign: 'right' }}>Einzelpreis</div>
                        <div style={{ textAlign: 'right' }}>Steuer (%)</div>
                        <div style={{ textAlign: 'right' }}>Gesamt</div>
                        <div></div>
                    </div>
                    {(offer.items || []).map((item, idx) => (
                        <div key={idx} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1.5fr 1fr 1fr auto', gap: '1rem', marginBottom: '0.75rem', alignItems: 'center' }}>
                            <input
                                style={inputStyle}
                                value={item.description}
                                onChange={e => handleItemChange(idx, 'description', e.target.value)}
                                placeholder="Leistung / Produkt"
                            />
                            <input
                                type="number"
                                style={{ ...inputStyle, textAlign: 'right' }}
                                value={item.quantity}
                                onChange={e => handleItemChange(idx, 'quantity', Number(e.target.value))}
                            />
                            <input
                                type="number"
                                style={{ ...inputStyle, textAlign: 'right' }}
                                value={item.price}
                                onChange={e => handleItemChange(idx, 'price', Number(e.target.value))}
                            />
                            <input
                                type="number"
                                style={{ ...inputStyle, textAlign: 'right' }}
                                value={item.tax ?? 19}
                                onChange={e => handleItemChange(idx, 'tax', Number(e.target.value))}
                            />
                            <div style={{ textAlign: 'right', fontWeight: 600 }}>
                                {(item.quantity * item.price).toFixed(2)} €
                            </div>
                            <button
                                type="button"
                                onClick={() => removeItem(idx)}
                                style={{ color: 'var(--danger)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem' }}
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addItem}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.5rem 1rem', borderRadius: '6px',
                            background: 'var(--accent)', color: 'var(--accent-foreground)',
                            border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem'
                        }}
                    >
                        <Plus size={16} /> Position hinzufügen
                    </button>
                </div>

                {/* Totals */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
                    <div style={{ width: '250px', textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--muted-foreground)' }}>Netto:</span>
                            <span>{offer.subtotal?.toFixed(2)} €</span>
                        </div>
                        {/* Dynamic Tax Rates */}
                        {(() => {
                            const taxesByRate: { [rate: number]: { tax: number, net: number } } = {};
                            (offer.items || []).forEach(item => {
                                const rate = item.tax ?? 19;
                                const netForLine = item.quantity * item.price;
                                const taxForLine = netForLine * (rate / 100);

                                if (!taxesByRate[rate]) taxesByRate[rate] = { tax: 0, net: 0 };
                                taxesByRate[rate].tax += taxForLine;
                                taxesByRate[rate].net += netForLine;
                            });

                            const rates = Object.keys(taxesByRate).map(Number).filter(r => taxesByRate[r].net > 0);

                            if (rates.length === 0) {
                                return (
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--muted-foreground)' }}>MwSt:</span>
                                        <span>{(offer.tax_total || 0).toFixed(2)} €</span>
                                    </div>
                                );
                            }

                            return rates.map(rate => (
                                <div key={rate} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--muted-foreground)' }}>{rate}% USt. auf {taxesByRate[rate].net.toFixed(2)} €:</span>
                                    <span>{taxesByRate[rate].tax.toFixed(2)} €</span>
                                </div>
                            ));
                        })()}
                        <div style={{
                            display: 'flex', justifyContent: 'space-between',
                            fontWeight: 700, fontSize: '1.1rem',
                            borderTop: '2px solid var(--border)', paddingTop: '0.5rem'
                        }}>
                            <span>Gesamt:</span>
                            <span>{offer.total?.toFixed(2)} €</span>
                        </div>
                    </div>
                </div>

                {error && (
                    <div style={{
                        padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem',
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
                        {isNew ? 'Angebot erstellen' : 'Speichern'}
                    </button>
                </div>
            </form>
        </div>
    );
}
