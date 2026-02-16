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
                    <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                        <tr>
                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Nr.</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Kunde</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Datum</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Status</th>
                            <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Betrag</th>
                            <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Aktionen</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                                    Keine Rechnungen gefunden.
                                </td>
                            </tr>
                        ) : (
                            invoices.map((invoice) => (
                                <tr key={invoice.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '1rem', color: '#111827', fontWeight: 500 }}>{invoice.invoice_number}</td>
                                    <td style={{ padding: '1rem', color: '#374151' }}>
                                        {invoice.customer?.name || 'Unbekannt'}
                                    </td>
                                    <td style={{ padding: '1rem', color: '#6b7280' }}>{new Date(invoice.date).toLocaleDateString('de-DE')}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            fontWeight: 500,
                                            backgroundColor:
                                                invoice.status === 'Paid' ? '#d1fae5' :
                                                    invoice.status === 'Sent' ? '#dbeafe' :
                                                        invoice.status === 'Overdue' ? '#fee2e2' : '#f3f4f6',
                                            color:
                                                invoice.status === 'Paid' ? '#065f46' :
                                                    invoice.status === 'Sent' ? '#1e40af' :
                                                        invoice.status === 'Overdue' ? '#991b1b' : '#374151',
                                        }}>
                                            {invoice.status === 'Paid' ? 'Bezahlt' :
                                                invoice.status === 'Sent' ? 'Versendet' :
                                                    invoice.status === 'Overdue' ? 'Überfällig' : 'Entwurf'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: '#111827' }}>
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
