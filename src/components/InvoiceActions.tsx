"use client";

import { useState } from 'react';
import { Invoice } from '@/types/invoice';
import { CompanySettings } from '@/types/companySettings';
import { generateInvoicePDF } from '@/utils/pdfGenerator';
import { deleteInvoice, updateInvoiceStatus } from '@/app/actions/invoiceActions';
import { getCompanySettings } from '@/app/actions/companyActions';
import { Download, Trash2, Loader2, CheckCircle, Send, MoreVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function InvoiceActions({ invoice }: { invoice: Invoice }) {
    const [deleting, setDeleting] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [companyCache, setCompanyCache] = useState<CompanySettings | null>(null);
    const router = useRouter();

    const handleDownload = async () => {
        try {
            // Fetch company settings (cached after first call)
            let settings = companyCache;
            if (!settings) {
                settings = await getCompanySettings();
                if (settings) setCompanyCache(settings);
            }
            await generateInvoicePDF(invoice, settings);
        } catch (err) {
            console.error('PDF generation failed:', err);
            alert('Fehler beim Erstellen der PDF. Bitte versuchen Sie es erneut.');
        }
    };

    const handleDelete = async () => {
        if (!confirm(`Rechnung ${invoice.invoice_number} wirklich löschen?`)) return;
        setDeleting(true);
        try {
            await deleteInvoice(invoice.id);
            router.refresh();
        } catch (err) {
            console.error(err);
            alert('Fehler beim Löschen der Rechnung.');
        } finally {
            setDeleting(false);
        }
    };

    const handleStatusChange = async (status: Invoice['status']) => {
        setUpdating(true);
        setMenuOpen(false);
        try {
            await updateInvoiceStatus(invoice.id, status);
            router.refresh();
        } catch (err) {
            console.error(err);
            alert('Fehler beim Aktualisieren.');
        } finally {
            setUpdating(false);
        }
    };

    const statusActions = [] as { label: string; status: Invoice['status']; icon: React.ReactNode; color: string }[];

    if (invoice.status === 'Draft') {
        statusActions.push({ label: 'Als versendet markieren', status: 'Sent', icon: <Send size={14} />, color: 'var(--info)' });
    }
    if (invoice.status === 'Draft' || invoice.status === 'Sent' || invoice.status === 'Overdue') {
        statusActions.push({ label: 'Als bezahlt markieren', status: 'Paid', icon: <CheckCircle size={14} />, color: 'var(--success)' });
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', position: 'relative' }}>
            <button
                onClick={handleDownload}
                style={{ padding: '0.25rem', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--secondary)', cursor: 'pointer' }}
                title="PDF herunterladen"
            >
                <Download size={16} color="var(--muted-foreground)" />
            </button>

            {statusActions.length > 0 && (
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        disabled={updating}
                        style={{ padding: '0.25rem', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--secondary)', cursor: 'pointer' }}
                        title="Status ändern"
                    >
                        {updating ? <Loader2 size={16} color="var(--muted-foreground)" style={{ animation: 'spin 1s linear infinite' }} /> : <MoreVertical size={16} color="var(--muted-foreground)" />}
                    </button>

                    {menuOpen && (
                        <>
                            <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 10 }} />
                            <div style={{
                                position: 'absolute', right: 0, top: '100%', marginTop: '4px',
                                background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: '8px',
                                boxShadow: 'var(--shadow-lg)', zIndex: 20,
                                minWidth: '220px', overflow: 'hidden'
                            }}>
                                {statusActions.map(a => (
                                    <button
                                        key={a.status}
                                        onClick={() => handleStatusChange(a.status)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                                            width: '100%', padding: '0.6rem 0.75rem',
                                            border: 'none', background: 'none', cursor: 'pointer',
                                            fontSize: '0.825rem', color: a.color, textAlign: 'left'
                                        }}
                                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--muted)')}
                                        onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                                    >
                                        {a.icon} {a.label}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}

            <button
                onClick={handleDelete}
                disabled={deleting}
                style={{ padding: '0.25rem', border: '1px solid var(--danger-bg)', borderRadius: '4px', background: 'var(--secondary)', cursor: deleting ? 'wait' : 'pointer' }}
                title="Rechnung löschen"
            >
                {deleting ? <Loader2 size={16} color="var(--danger)" style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={16} color="var(--danger)" />}
            </button>
        </div>
    );
}
