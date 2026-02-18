"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, FileText, FilePlus, Repeat, ArrowLeft, Landmark, Settings } from 'lucide-react';

export default function InvoicingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const navItems = [
        { href: '/invoices', label: 'Dashboard', icon: LayoutDashboard, exact: true },
        { href: '/invoices/create', label: 'Neue Rechnung', icon: FilePlus },
        { href: '/invoices/list', label: 'Alle Rechnungen', icon: FileText },
        { href: '/invoices/customers', label: 'Kunden', icon: Users },
        { href: '/invoices/subscriptions', label: 'Abo-Rechnungen', icon: Repeat },
        { href: '/invoices/settings', label: 'Einstellungen', icon: Settings },
    ];

    const isActive = (href: string, exact?: boolean) => {
        if (exact) return pathname === href;
        return pathname.startsWith(href);
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <aside style={{
                width: '250px', backgroundColor: 'var(--muted)', padding: '1.5rem',
                borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column'
            }}>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 700, color: 'var(--foreground)' }}>
                    Fakturierung
                </h2>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
                    {navItems.map(item => {
                        const active = isActive(item.href, item.exact);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    padding: '10px 12px', textDecoration: 'none',
                                    color: active ? 'var(--foreground)' : 'var(--secondary-foreground)',
                                    borderRadius: '6px', fontSize: '0.9rem',
                                    fontWeight: active ? 600 : 500,
                                    background: active ? 'var(--border)' : 'transparent',
                                    transition: 'background 0.15s, color 0.15s',
                                }}
                                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--border)'; }}
                                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                            >
                                <Icon size={18} />
                                {item.label}
                            </Link>
                        );
                    })}

                    <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <Link href="/" style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '10px 12px', textDecoration: 'none', color: 'var(--muted-foreground)',
                            borderRadius: '6px', fontSize: '0.85rem', fontWeight: 500,
                            transition: 'background 0.15s',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--border)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                            <ArrowLeft size={16} /> Zurück zu Belegen
                        </Link>
                        <Link href="/bank" style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '10px 12px', textDecoration: 'none', color: 'var(--muted-foreground)',
                            borderRadius: '6px', fontSize: '0.85rem', fontWeight: 500,
                            transition: 'background 0.15s',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--border)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                            <Landmark size={16} /> Bankabgleich
                        </Link>
                    </div>
                </nav>
            </aside>
            <main style={{ flex: 1, padding: '2rem', backgroundColor: 'var(--background)' }}>
                {children}
            </main>
        </div>
    );
}
