"use client";

import { useState, useEffect } from 'react';
import { Customer, Invoice, InvoiceItem } from '@/types/invoice';
import { createInvoice } from '@/app/actions/invoiceActions';
import { getNextInvoiceNumber } from '@/app/actions/invoiceNumberAction';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import styles from '@/app/page.module.css';
import { useRouter, useSearchParams } from 'next/navigation';

interface InvoiceFormProps {
    customers: Customer[];
}

export default function InvoiceForm({ customers }: InvoiceFormProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const preselectedCustomerId = searchParams.get('customerId');
    const [loading, setLoading] = useState(false);

    // Header Data
    const [customerId, setCustomerId] = useState(preselectedCustomerId || '');
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const defaultDue = new Date();
    defaultDue.setDate(defaultDue.getDate() + 14);
    const [dueDate, setDueDate] = useState(defaultDue.toISOString().slice(0, 10));

    const handleDateChange = (newDate: string) => {
        setDate(newDate);
        // Auto-update due date to +14 days
        const d = new Date(newDate);
        d.setDate(d.getDate() + 14);
        setDueDate(d.toISOString().slice(0, 10));
    };

    // Items
    const [items, setItems] = useState<Partial<InvoiceItem>[]>([
        { description: '', quantity: 1, unit_price: 0, tax_rate: 19, total_price: 0 }
    ]);

    // Computed Totals
    const subtotal = items.reduce((sum, item) => sum + (item.quantity! * item.unit_price!), 0);
    const taxAmount = items.reduce((sum, item) => sum + (item.quantity! * item.unit_price! * (item.tax_rate! / 100)), 0);
    const totalAmount = subtotal + taxAmount;



    useEffect(() => {
        // Fetch sequential invoice number on mount
        getNextInvoiceNumber().then(num => {
            if (num) setInvoiceNumber(num);
        });
    }, []);

    const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
        const newItems = [...items];
        (newItems[index] as any)[field] = value;

        // Recalculate total for this item (for display if needed, though we calc globally)
        // Here we just update state
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { description: '', quantity: 1, unit_price: 0, tax_rate: 19 }]);
    };

    const removeItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const handleSubmit = async (status: 'Draft' | 'Sent') => {
        if (!customerId) return alert('Bitte wählen Sie einen Kunden aus.');
        if (!invoiceNumber) return alert('Rechnungsnummer fehlt.');

        setLoading(true);
        try {
            await createInvoice({
                customer_id: customerId,
                invoice_number: invoiceNumber,
                date,
                due_date: dueDate || undefined,
                status,
                subtotal,
                tax_amount: taxAmount,
                total_amount: totalAmount,
            }, items);

            router.push('/invoices/list');
        } catch (error) {
            console.error(error);
            alert('Fehler beim Speichern der Rechnung.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <ArrowLeft size={24} />
                </button>
                <h1 style={{ margin: 0 }}>Neue Rechnung</h1>
            </div>

            <div className={styles.card} style={{ padding: '2rem', marginBottom: '2rem' }}>
                {/* Header */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Kunde</label>
                        <select
                            value={customerId}
                            onChange={e => setCustomerId(e.target.value)}
                            className={styles.input}
                            style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
                        >
                            <option value="">-- Kunde wählen --</option>
                            {customers.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        <div style={{ marginTop: '0.5rem' }}>
                            <a href="/invoices/customers" style={{ fontSize: '0.9rem', color: '#0070f3' }}>+ Neuen Kunden anlegen</a>
                        </div>
                    </div>
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Rechnungs-Nr.</label>
                                <input
                                    type="text"
                                    value={invoiceNumber}
                                    onChange={e => setInvoiceNumber(e.target.value)}
                                    className={styles.input}
                                    style={{ width: '100%', padding: '0.75rem' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Datum</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={e => handleDateChange(e.target.value)}
                                    className={styles.input}
                                    style={{ width: '100%', padding: '0.75rem' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Fälligkeitsdatum</label>
                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={e => setDueDate(e.target.value)}
                                    className={styles.input}
                                    style={{ width: '100%', padding: '0.75rem' }}
                                />
                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Automatisch +14 Tage</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Items */}
                <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Positionen</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '4fr 1fr 2fr 1fr 2fr 0.5fr', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                    <div>Beschreibung</div>
                    <div>Menge</div>
                    <div>Einzelpreis (€)</div>
                    <div>Steuer (%)</div>
                    <div style={{ textAlign: 'right' }}>Gesamt</div>
                    <div></div>
                </div>

                {items.map((item, index) => (
                    <div key={index} style={{ display: 'grid', gridTemplateColumns: '4fr 1fr 2fr 1fr 2fr 0.5fr', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                        <input
                            type="text"
                            value={item.description}
                            onChange={e => handleItemChange(index, 'description', e.target.value)}
                            className={styles.input}
                            placeholder="Leistung / Produkt"
                            style={{ padding: '0.5rem' }}
                        />
                        <input
                            type="number"
                            min="0.1" step="0.1"
                            value={item.quantity}
                            onChange={e => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                            className={styles.input}
                            style={{ padding: '0.5rem' }}
                        />
                        <input
                            type="number"
                            min="0" step="0.01"
                            value={item.unit_price}
                            onChange={e => handleItemChange(index, 'unit_price', parseFloat(e.target.value))}
                            className={styles.input}
                            style={{ padding: '0.5rem' }}
                        />
                        <input
                            type="number"
                            min="0"
                            value={item.tax_rate}
                            onChange={e => handleItemChange(index, 'tax_rate', parseFloat(e.target.value))}
                            className={styles.input}
                            style={{ padding: '0.5rem' }}
                        />
                        <div style={{ textAlign: 'right', fontWeight: 500 }}>
                            {((item.quantity || 0) * (item.unit_price || 0)).toFixed(2)} €
                        </div>
                        <button
                            onClick={() => removeItem(index)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c62828' }}
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}

                <button
                    onClick={addItem}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0070f3', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '1rem' }}
                >
                    <Plus size={18} /> Position hinzufügen
                </button>

                {/* Footer / Totals */}
                <div style={{ marginTop: '3rem', borderTop: '2px solid #eee', paddingTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ width: '300px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span>Netto:</span>
                            <span>{subtotal.toFixed(2)} €</span>
                        </div>
                        {/* Dynamic Tax Rates */}
                        {(() => {
                            const taxesByRate: { [rate: number]: { tax: number, net: number } } = {};
                            items.forEach(item => {
                                const rate = item.tax_rate ?? 19;
                                const netForLine = (item.quantity || 0) * (item.unit_price || 0);
                                const taxForLine = netForLine * (rate / 100);

                                if (!taxesByRate[rate]) taxesByRate[rate] = { tax: 0, net: 0 };
                                taxesByRate[rate].tax += taxForLine;
                                taxesByRate[rate].net += netForLine;
                            });

                            const rates = Object.keys(taxesByRate).map(Number).filter(r => taxesByRate[r].net > 0);

                            if (rates.length === 0) {
                                return (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span>MwSt:</span>
                                        <span>{taxAmount.toFixed(2)} €</span>
                                    </div>
                                );
                            }

                            return rates.map(rate => (
                                <div key={rate} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ color: '#666' }}>{rate}% USt. auf {taxesByRate[rate].net.toFixed(2)} €:</span>
                                    <span>{taxesByRate[rate].tax.toFixed(2)} €</span>
                                </div>
                            ));
                        })()}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
                            <span>Gesamtbetrag:</span>
                            <span>{totalAmount.toFixed(2)} €</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '3rem' }}>
                    <button
                        onClick={() => handleSubmit('Draft')}
                        disabled={loading}
                        style={{ padding: '1rem 2rem', border: '1px solid #ddd', borderRadius: '4px', background: '#fff', cursor: 'pointer' }}
                    >
                        Als Entwurf speichern
                    </button>
                    <button
                        onClick={() => handleSubmit('Sent')}
                        disabled={loading}
                        className={styles.primaryButton}
                        style={{ padding: '1rem 2rem', display: 'flex', alignItems: 'center', gap: '10px' }}
                    >
                        <Save size={20} /> Rechnung erstellen
                    </button>
                </div>
            </div>
        </div>
    );
}
