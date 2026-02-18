"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, ArrowLeft, Plus } from 'lucide-react';

export default function OffersLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const navItems = [
        { href: '/offers', label: 'Angebotsliste', icon: FileText, exact: true },
        { href: '/offers/new', label: 'Neues Angebot', icon: Plus },
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <div style={{
                        width: '32px', height: '32px', borderRadius: '8px',
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <FileText size={18} color="white" />
                    </div>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--foreground)' }}>
                        Angebote
                    </h2>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
                    {navItems.map(item => {
                        const active = isActive(item.href, item.exact);
                        const Icon = item.icon;
                        return (
                            <Link key={item.href} href={item.href} style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                padding: '10px 12px', textDecoration: 'none',
                                color: active ? 'var(--foreground)' : 'var(--secondary-foreground)',
                                borderRadius: '6px', fontSize: '0.9rem',
                                fontWeight: active ? 600 : 500,
                                background: active ? 'var(--border)' : 'transparent',
                                transition: 'background 0.15s',
                            }}
                                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--border)'; }}
                                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
                                <Icon size={18} /> {item.label}
                            </Link>
                        );
                    })}

                    <div style={{
                        marginTop: 'auto', borderTop: '1px solid var(--border)',
                        paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem'
                    }}>
                        <Link href="/" style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '10px 12px', textDecoration: 'none', color: 'var(--muted-foreground)',
                            borderRadius: '6px', fontSize: '0.85rem', fontWeight: 500, transition: 'background 0.15s',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--border)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                            <ArrowLeft size={16} /> Zurück
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
