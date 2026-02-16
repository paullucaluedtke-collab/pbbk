"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Invoice } from '@/types/invoice';
import { getInvoices } from '@/app/actions/invoiceActions';
import { FileText, AlertTriangle, CheckCircle, Clock, FilePlus, Users, Repeat } from 'lucide-react';
import OnboardingHint from '@/components/OnboardingHint';

export default function InvoicesDashboard() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getInvoices();
                setInvoices(data);
            } catch (e) {
                console.error("Failed to load invoices", e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const openInvoices = invoices.filter(i => i.status === 'Sent' || i.status === 'Draft');
    const overdueInvoices = invoices.filter(i => {
        if (i.status === 'Paid') return false;
        if (!i.due_date) return false;
        return new Date(i.due_date) < new Date();
    });
    const paidInvoices = invoices.filter(i => i.status === 'Paid');

    const sumTotal = (list: Invoice[]) => list.reduce((s, i) => s + (i.total_amount || 0), 0);

    const openTotal = sumTotal(openInvoices);
    const overdueTotal = sumTotal(overdueInvoices);
    const paidTotal = sumTotal(paidInvoices);

    if (loading) {
        return <div style={{ textAlign: 'center', marginTop: '4rem', color: '#888' }}>Lade Rechnungsdaten...</div>;
    }

    return (
        <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Übersicht</h1>

            <OnboardingHint title="Willkommen in der Fakturierung!" dismissKey="invoice_onboarding">
                Hier können Sie Rechnungen erstellen, Kunden verwalten und Abo-Rechnungen automatisch generieren lassen.
                Nutzen Sie die Sidebar links, um zwischen den Bereichen zu wechseln.
            </OnboardingHint>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', background: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <Clock size={18} color="#2563eb" />
                        <h3 style={{ margin: 0, color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>Offene Rechnungen</h3>
                    </div>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.25rem 0 0 0', color: '#0f172a' }}>
                        {openTotal.toFixed(2)} €
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0.25rem 0 0 0' }}>{openInvoices.length} Rechnungen</p>
                </div>

                <div style={{ padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', background: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <AlertTriangle size={18} color="#ef4444" />
                        <h3 style={{ margin: 0, color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>Überfällig</h3>
                    </div>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.25rem 0 0 0', color: overdueTotal > 0 ? '#ef4444' : '#0f172a' }}>
                        {overdueTotal.toFixed(2)} €
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0.25rem 0 0 0' }}>{overdueInvoices.length} Rechnungen</p>
                </div>

                <div style={{ padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', background: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <CheckCircle size={18} color="#16a34a" />
                        <h3 style={{ margin: 0, color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>Bezahlt</h3>
                    </div>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.25rem 0 0 0', color: '#16a34a' }}>
                        {paidTotal.toFixed(2)} €
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0.25rem 0 0 0' }}>{paidInvoices.length} Rechnungen</p>
                </div>

                <div style={{ padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', background: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <FileText size={18} color="#8b5cf6" />
                        <h3 style={{ margin: 0, color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>Gesamt</h3>
                    </div>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.25rem 0 0 0', color: '#0f172a' }}>
                        {sumTotal(invoices).toFixed(2)} €
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0.25rem 0 0 0' }}>{invoices.length} Rechnungen</p>
                </div>
            </div>

            {/* Quick Actions */}
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#334155' }}>Schnellzugriff</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <Link href="/invoices/create" style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0',
                    textDecoration: 'none', color: '#0f172a', background: 'white',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'box-shadow 0.15s, border-color 0.15s'
                }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                >
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FilePlus size={20} color="#2563eb" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Neue Rechnung</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Rechnung erstellen & als PDF exportieren</div>
                    </div>
                </Link>

                <Link href="/invoices/customers" style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0',
                    textDecoration: 'none', color: '#0f172a', background: 'white',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'box-shadow 0.15s, border-color 0.15s'
                }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                >
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Users size={20} color="#16a34a" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Kunden verwalten</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Kundenstamm anlegen & bearbeiten</div>
                    </div>
                </Link>

                <Link href="/invoices/subscriptions" style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0',
                    textDecoration: 'none', color: '#0f172a', background: 'white',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'box-shadow 0.15s, border-color 0.15s'
                }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                >
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Repeat size={20} color="#d97706" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Abo-Rechnungen</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Wiederkehrende Rechnungen automatisieren</div>
                    </div>
                </Link>

                <Link href="/invoices/list" style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0',
                    textDecoration: 'none', color: '#0f172a', background: 'white',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'box-shadow 0.15s, border-color 0.15s'
                }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                >
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileText size={20} color="#7c3aed" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Alle Rechnungen</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Übersicht aller erstellten Rechnungen</div>
                    </div>
                </Link>
            </div>
        </div>
    );
}
