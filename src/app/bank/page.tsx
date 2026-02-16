"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getBankTransactions } from '@/app/actions/bankActions';
import BankImport from '@/components/BankImport';
import { BankTransaction } from '@/types/bank';
import { ArrowLeft, Check, AlertCircle, RefreshCw, FileText } from 'lucide-react';
import OnboardingHint from '@/components/OnboardingHint';
import styles from '@/app/page.module.css'; // Reusing main styles for consistency

export default function BankPage() {
    const [transactions, setTransactions] = useState<BankTransaction[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        const data = await getBankTransactions();
        setTransactions(data);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    return (
        <main className={styles.main}>
            <header className={styles.header}>
                <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link href="/" style={{ color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center' }}>
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className={styles.title}>Bankabgleich</h1>
                        <p className={styles.subtitle}>Kontoauszüge importieren und zuordnen</p>
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                        <Link href="/invoices" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', color: '#64748b', fontSize: '0.85rem', padding: '0.4rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px', background: 'white' }}>
                            <FileText size={14} /> Fakturierung
                        </Link>
                    </div>
                </div>
            </header>

            <div className="container">
                <div className={styles.card}>
                    <OnboardingHint title="Bankabgleich" dismissKey="bank_import">
                        Exportieren Sie Ihre Kontoauszüge als CSV-Datei aus Ihrem Online-Banking und laden Sie diese hier hoch. Das System gleicht die Transaktionen automatisch mit Ihren erfassten Belegen ab.
                    </OnboardingHint>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <BankImport />
                        <button onClick={loadData} className={styles.secondaryButton} title="Aktualisieren">
                            <RefreshCw size={16} />
                        </button>
                    </div>

                    <div style={{ marginTop: '2rem' }}>
                        {loading ? (
                            <p>Lade Transaktionen...</p>
                        ) : transactions.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', border: '1px dashed var(--border)', borderRadius: 'var(--radius)' }}>
                                <p>Keine Transaktionen vorhanden. Bitte CSV importieren.</p>
                            </div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--muted-foreground)' }}>
                                        <th style={{ padding: '0.75rem', width: '100px' }}>Datum</th>
                                        <th style={{ padding: '0.75rem' }}>Gegenkonto / Verwendungszweck</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'right' }}>Betrag</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'center', width: '120px' }}>Status</th>
                                        <th style={{ padding: '0.75rem' }}>Zuordnung</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((tx) => (
                                        <tr key={tx.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '0.75rem' }}>{new Date(tx.date).toLocaleDateString('de-DE')}</td>
                                            <td style={{ padding: '0.75rem' }}>
                                                <div style={{ fontWeight: 500 }}>{tx.sender_receiver}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{tx.purpose}</div>
                                            </td>
                                            <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600, color: tx.amount < 0 ? '#ef4444' : '#16a34a' }}>
                                                {tx.amount.toFixed(2)} €
                                            </td>
                                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                <span style={{
                                                    display: 'inline-block', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500,
                                                    backgroundColor: tx.status === 'Matched' ? '#dcfce7' : '#f1f5f9',
                                                    color: tx.status === 'Matched' ? '#166534' : '#475569'
                                                }}>
                                                    {tx.status === 'Matched' ? 'Zugeordnet' : 'Offen'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.75rem', fontSize: '0.8rem' }}>
                                                {tx.status === 'Matched' ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#166534' }}>
                                                        <Check size={14} />
                                                        {(tx as any).receipts ? `Beleg vom ${(tx as any).receipts.date}` : 'Rechnung'}
                                                    </div>
                                                ) : (
                                                    <div style={{ color: '#94a3b8', fontStyle: 'italic' }}>Kein Treffer</div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
