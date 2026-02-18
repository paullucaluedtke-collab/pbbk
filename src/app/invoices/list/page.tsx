import { getInvoices } from '@/app/actions/invoiceActions';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import styles from '@/app/page.module.css';
import InvoiceActions from '@/components/InvoiceActions';

export const dynamic = 'force-dynamic';

export default async function InvoiceListPage() {
    const invoices = await getInvoices();

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', margin: 0 }}>Rechnungen</h1>
                <Link href="/invoices/create" className={styles.primaryButton} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={18} /> Neue Rechnung
                </Link>
            </div>

            <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: 'var(--table-header-bg)', borderBottom: '1px solid var(--border)' }}>
                        <tr>
                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: 'var(--secondary-foreground)' }}>Nr.</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: 'var(--secondary-foreground)' }}>Kunde</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: 'var(--secondary-foreground)' }}>Datum</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: 'var(--secondary-foreground)' }}>Status</th>
                            <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: 600, color: 'var(--secondary-foreground)' }}>Betrag</th>
                            <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: 600, color: 'var(--secondary-foreground)' }}>Aktionen</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                                    Keine Rechnungen gefunden.
                                </td>
                            </tr>
                        ) : (
                            invoices.map((invoice) => (
                                <tr key={invoice.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem', color: 'var(--foreground)', fontWeight: 500 }}>{invoice.invoice_number}</td>
                                    <td style={{ padding: '1rem', color: 'var(--secondary-foreground)' }}>
                                        {invoice.customer?.name || 'Unbekannt'}
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--muted-foreground)' }}>{new Date(invoice.date).toLocaleDateString('de-DE')}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            fontWeight: 500,
                                            backgroundColor:
                                                invoice.status === 'Paid' ? 'var(--success-bg)' :
                                                    invoice.status === 'Sent' ? 'var(--info-bg)' :
                                                        invoice.status === 'Overdue' ? 'var(--danger-bg)' : 'var(--muted)',
                                            color:
                                                invoice.status === 'Paid' ? 'var(--success-text)' :
                                                    invoice.status === 'Sent' ? 'var(--info-text)' :
                                                        invoice.status === 'Overdue' ? 'var(--danger-text)' : 'var(--secondary-foreground)',
                                        }}>
                                            {invoice.status === 'Paid' ? 'Bezahlt' :
                                                invoice.status === 'Sent' ? 'Versendet' :
                                                    invoice.status === 'Overdue' ? 'Überfällig' : 'Entwurf'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: 'var(--foreground)' }}>
                                        {invoice.total_amount?.toFixed(2)} €
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <InvoiceActions invoice={invoice} />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
