"use client";

import { useEffect, useState } from 'react';
import { getSubscriptions, deleteSubscription, checkAndRunSubscriptions } from '@/app/actions/subscriptionActions';
import { Subscription } from '@/types/subscription';
import Link from 'next/link';
import { Plus, Trash2, Calendar, PlayCircle } from 'lucide-react';
import styles from '@/app/page.module.css';

export default function SubscriptionsPage() {
    const [subs, setSubs] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [runningCheck, setRunningCheck] = useState(false);

    const load = async () => {
        setLoading(true);
        const data = await getSubscriptions();
        setSubs(data);
        setLoading(false);
    };

    useEffect(() => {
        load();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Abo wirklich beenden?')) return;
        await deleteSubscription(id);
        load();
    };

    const handleRunCheck = async () => {
        setRunningCheck(true);
        const res = await checkAndRunSubscriptions();
        if (res.processed > 0) alert(`${res.processed} Rechnung(en) erstellt!`);
        else alert('Keine fälligen Abos.');
        setRunningCheck(false);
        load(); // Reload to see updated next_run
    };

    return (
        <main className={styles.main}>
            <header className={styles.header}>
                <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h1 className={styles.title}>Abo-Verwaltung</h1>
                        <p className={styles.subtitle}>Wiederkehrende Rechnungen</p>
                        <div style={{ marginTop: '0.5rem' }}>
                            <Link href="/invoices" style={{ color: '#0070f3', textDecoration: 'none', fontSize: '0.9rem' }}>
                                &larr; Zurück zu Rechnungen
                            </Link>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={handleRunCheck} className={styles.secondaryButton} disabled={runningCheck}>
                            <PlayCircle size={16} style={{ marginRight: '5px' }} />
                            {runningCheck ? 'Prüfe...' : 'Jetzt prüfen'}
                        </button>
                        <Link href="/invoices/subscriptions/new" className={styles.primaryButton}>
                            <Plus size={16} style={{ marginRight: '5px' }} />
                            Neues Abo
                        </Link>
                    </div>
                </div>
            </header>

            <div className="container">
                <div className={styles.card}>
                    {loading ? <p>Lade Abos...</p> : subs.length === 0 ? (
                        <p className="text-muted">Keine aktiven Abonnements.</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #eee', textAlign: 'left' }}>
                                    <th style={{ padding: '10px' }}>Kunde</th>
                                    <th style={{ padding: '10px' }}>Intervall</th>
                                    <th style={{ padding: '10px' }}>Nächste Ausführung</th>
                                    <th style={{ padding: '10px' }}>Betrag (Positionen)</th>
                                    <th style={{ padding: '10px' }}>Aktionen</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subs.map(sub => (
                                    <tr key={sub.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                        <td style={{ padding: '10px' }}>
                                            <strong>{sub.customers?.name}</strong>
                                        </td>
                                        <td style={{ padding: '10px' }}>
                                            <span style={{
                                                padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem',
                                                background: '#e0f2fe', color: '#0369a1'
                                            }}>
                                                {sub.interval === 'monthly' ? 'Monatlich' :
                                                    sub.interval === 'quarterly' ? 'Quartalsweise' : 'Jährlich'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '10px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <Calendar size={14} color="#64748b" />
                                                {new Date(sub.next_run).toLocaleDateString('de-DE')}
                                            </div>
                                        </td>
                                        <td style={{ padding: '10px', fontSize: '0.9rem' }}>
                                            {sub.template_data.items.length} Position(en)
                                        </td>
                                        <td style={{ padding: '10px' }}>
                                            <button
                                                onClick={() => handleDelete(sub.id)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                                                title="Abo beenden"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </main>
    );
}
