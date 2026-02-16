"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSubscription } from '@/app/actions/subscriptionActions';
import { getCustomers } from '@/app/actions/invoiceActions'; // Reuse existing
import Link from 'next/link';
import styles from '@/app/page.module.css';

export default function NewSubscriptionPage() {
    const router = useRouter();
    const [customers, setCustomers] = useState<any[]>([]);

    // Form State
    const [customerId, setCustomerId] = useState('');
    const [interval, setInterval] = useState('monthly');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

    // Template Items (Simplified: One item for MVP)
    const [description, setDescription] = useState('Pauschale Wartung');
    const [price, setPrice] = useState('100.00');

    useEffect(() => {
        getCustomers().then(setCustomers);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createSubscription({
                customer_id: customerId,
                interval: interval as any,
                next_run: startDate,
                template_data: {
                    items: [
                        { description, quantity: 1, unit_price: parseFloat(price), tax_rate: 19 }
                    ]
                }
            });
            router.push('/invoices/subscriptions');
        } catch (err) {
            alert('Fehler beim Erstellen');
        }
    };

    return (
        <main className={styles.main}>
            <div className="container" style={{ maxWidth: '600px' }}>
                <h1 className={styles.title}>Neues Abo erstellen</h1>

                <form onSubmit={handleSubmit} className={styles.card}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Kunde</label>
                        <select
                            required
                            className={styles.input}
                            value={customerId}
                            onChange={e => setCustomerId(e.target.value)}
                        >
                            <option value="">Bitte wählen...</option>
                            {customers.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginBottom: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Intervall</label>
                            <select
                                className={styles.input}
                                value={interval}
                                onChange={e => setInterval(e.target.value)}
                            >
                                <option value="monthly">Monatlich</option>
                                <option value="quarterly">Quartalsweise</option>
                                <option value="yearly">Jährlich</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Startdatum (Erste Aulführung)</label>
                            <input
                                type="date"
                                required
                                className={styles.input}
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <hr style={{ margin: '1.5rem 0', border: '0', borderTop: '1px solid #eee' }} />
                    <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Rechnungsvorlage (Position)</h3>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Beschreibung</label>
                        <input
                            type="text"
                            required
                            className={styles.input}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Preis (Netto) €</label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            className={styles.input}
                            value={price}
                            onChange={e => setPrice(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                        <button type="submit" className={styles.primaryButton}>Erstellen</button>
                        <Link href="/invoices/subscriptions" className={styles.secondaryButton}>Abbrechen</Link>
                    </div>
                </form>
            </div>
        </main>
    );
}
