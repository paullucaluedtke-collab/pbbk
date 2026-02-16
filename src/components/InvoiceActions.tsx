"use client";

import { useState } from 'react';
import { Invoice } from '@/types/invoice';
import { generateInvoicePDF } from '@/utils/pdfGenerator';
import { deleteInvoice, updateInvoiceStatus } from '@/app/actions/invoiceActions';
import { Download, Trash2, Loader2, CheckCircle, Send, MoreVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function InvoiceActions({ invoice }: { invoice: Invoice }) {
    const [deleting, setDeleting] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const router = useRouter();

    const handleDownload = () => {
        generateInvoicePDF(invoice);
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
        statusActions.push({ label: 'Als versendet markieren', status: 'Sent', icon: <Send size={14} />, color: '#2563eb' });
    }
    if (invoice.status === 'Draft' || invoice.status === 'Sent' || invoice.status === 'Overdue') {
        statusActions.push({ label: 'Als bezahlt markieren', status: 'Paid', icon: <CheckCircle size={14} />, color: '#16a34a' });
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', position: 'relative' }}>
            <button
                onClick={handleDownload}
                style={{ padding: '0.25rem', border: '1px solid #e5e7eb', borderRadius: '4px', background: '#fff', cursor: 'pointer' }}
                title="PDF herunterladen"
            >
                <Download size={16} color="#4b5563" />
            </button>

            {statusActions.length > 0 && (
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        disabled={updating}
                        style={{ padding: '0.25rem', border: '1px solid #e5e7eb', borderRadius: '4px', background: '#fff', cursor: 'pointer' }}
                        title="Status ändern"
                    >
                        {updating ? <Loader2 size={16} color="#6b7280" style={{ animation: 'spin 1s linear infinite' }} /> : <MoreVertical size={16} color="#6b7280" />}
                    </button>

                    {menuOpen && (
                        <>
                            <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 10 }} />
                            <div style={{
                                position: 'absolute', right: 0, top: '100%', marginTop: '4px',
                                background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 20,
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
                                        onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
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
                style={{ padding: '0.25rem', border: '1px solid #fecaca', borderRadius: '4px', background: '#fff', cursor: deleting ? 'wait' : 'pointer' }}
                title="Rechnung löschen"
            >
                {deleting ? <Loader2 size={16} color="#ef4444" style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={16} color="#ef4444" />}
            </button>
        </div>
    );
}
