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
        return <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--muted-foreground)' }}>Lade Rechnungsdaten...</div>;
    }

    const cardStyle: React.CSSProperties = {
        padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)', background: 'var(--secondary)'
    };

    const quickActionStyle: React.CSSProperties = {
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border)',
        textDecoration: 'none', color: 'var(--foreground)', background: 'var(--secondary)',
        boxShadow: 'var(--shadow-sm)', transition: 'box-shadow 0.15s, border-color 0.15s'
    };

    return (
        <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Übersicht</h1>

            <OnboardingHint title="Willkommen in der Fakturierung!" dismissKey="invoice_onboarding">
                Hier können Sie Rechnungen erstellen, Kunden verwalten und Abo-Rechnungen automatisch generieren lassen.
                Nutzen Sie die Sidebar links, um zwischen den Bereichen zu wechseln.
            </OnboardingHint>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <Clock size={18} color="var(--info)" />
                        <h3 style={{ margin: 0, color: 'var(--muted-foreground)', fontSize: '0.875rem', fontWeight: 500 }}>Offene Rechnungen</h3>
                    </div>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.25rem 0 0 0', color: 'var(--foreground)' }}>
                        {openTotal.toFixed(2)} €
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', margin: '0.25rem 0 0 0' }}>{openInvoices.length} Rechnungen</p>
                </div>

                <div style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <AlertTriangle size={18} color="var(--danger)" />
                        <h3 style={{ margin: 0, color: 'var(--muted-foreground)', fontSize: '0.875rem', fontWeight: 500 }}>Überfällig</h3>
                    </div>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.25rem 0 0 0', color: overdueTotal > 0 ? 'var(--danger)' : 'var(--foreground)' }}>
                        {overdueTotal.toFixed(2)} €
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', margin: '0.25rem 0 0 0' }}>{overdueInvoices.length} Rechnungen</p>
                </div>

                <div style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <CheckCircle size={18} color="var(--success)" />
                        <h3 style={{ margin: 0, color: 'var(--muted-foreground)', fontSize: '0.875rem', fontWeight: 500 }}>Bezahlt</h3>
                    </div>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.25rem 0 0 0', color: 'var(--success)' }}>
                        {paidTotal.toFixed(2)} €
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', margin: '0.25rem 0 0 0' }}>{paidInvoices.length} Rechnungen</p>
                </div>

                <div style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <FileText size={18} color="var(--accent-foreground)" />
                        <h3 style={{ margin: 0, color: 'var(--muted-foreground)', fontSize: '0.875rem', fontWeight: 500 }}>Gesamt</h3>
                    </div>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.25rem 0 0 0', color: 'var(--foreground)' }}>
                        {sumTotal(invoices).toFixed(2)} €
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', margin: '0.25rem 0 0 0' }}>{invoices.length} Rechnungen</p>
                </div>
            </div>

            {/* Quick Actions */}
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--secondary-foreground)' }}>Schnellzugriff</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <Link href="/invoices/create" style={quickActionStyle}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = 'var(--ring)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--info-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FilePlus size={20} color="var(--info)" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Neue Rechnung</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Rechnung erstellen & als PDF exportieren</div>
                    </div>
                </Link>

                <Link href="/invoices/customers" style={quickActionStyle}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = 'var(--ring)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Users size={20} color="var(--success)" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Kunden verwalten</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Kundenstamm anlegen & bearbeiten</div>
                    </div>
                </Link>

                <Link href="/invoices/subscriptions" style={quickActionStyle}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = 'var(--ring)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--warning-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Repeat size={20} color="var(--warning)" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Abo-Rechnungen</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Wiederkehrende Rechnungen automatisieren</div>
                    </div>
                </Link>

                <Link href="/invoices/list" style={quickActionStyle}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = 'var(--ring)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileText size={20} color="var(--accent-foreground)" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Alle Rechnungen</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Übersicht aller erstellten Rechnungen</div>
                    </div>
                </Link>
            </div>
        </div>
    );
}
