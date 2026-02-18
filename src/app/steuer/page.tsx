"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getTaxReturns, deleteTaxReturn } from '@/app/actions/taxActions';
import { TaxReturn } from '@/types/taxReturn';
import { FilePlus, Trash2, Edit, Calculator, FileCheck, AlertCircle } from 'lucide-react';

const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
    Draft: { label: 'Entwurf', color: 'var(--warning)', bg: 'var(--warning-bg)' },
    InProgress: { label: 'In Bearbeitung', color: 'var(--info)', bg: 'var(--info-bg)' },
    Completed: { label: 'Abgeschlossen', color: 'var(--success)', bg: 'var(--success-bg)' },
    Submitted: { label: 'Eingereicht', color: '#8b5cf6', bg: '#ede9fe' },
};

export default function SteuerDashboard() {
    const [returns, setReturns] = useState<TaxReturn[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        getTaxReturns().then(data => { setReturns(data); setLoading(false); });
    }, []);

    const handleDelete = async (id: string, year: number) => {
        if (!confirm(`Steuererklärung ${year} wirklich löschen?`)) return;
        await deleteTaxReturn(id);
        setReturns(r => r.filter(x => x.id !== id));
    };

    const cardStyle: React.CSSProperties = {
        background: 'var(--secondary)', borderRadius: '10px',
        border: '1px solid var(--border)', padding: '1.5rem',
        boxShadow: 'var(--shadow-sm)'
    };

    return (
        <div style={{ maxWidth: '800px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', margin: 0 }}>Meine Steuererklärungen</h1>
                    <p style={{ margin: '0.25rem 0 0', color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>
                        Einfache Einkommensteuer für Privatpersonen
                    </p>
                </div>
                <Link href="/steuer/neu" style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.6rem 1.25rem', borderRadius: '8px',
                    background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                    color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem',
                    border: 'none', transition: 'opacity 0.2s'
                }}>
                    <FilePlus size={18} /> Neue Erklärung
                </Link>
            </div>

            {/* Info Banner */}
            <div style={{
                ...cardStyle, marginBottom: '1.5rem',
                background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(99,102,241,0.08))',
                border: '1px solid rgba(139,92,246,0.2)',
            }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <AlertCircle size={20} color="#8b5cf6" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div style={{ fontSize: '0.85rem', color: 'var(--foreground)', lineHeight: 1.6 }}>
                        <strong>Hinweis:</strong> Diese Funktion erstellt eine <strong>Übersicht Ihrer Steuerdaten</strong> und
                        berechnet eine <strong>geschätzte Erstattung/Nachzahlung</strong>. Die Ergebnisse dienen zur Orientierung —
                        für die offizielle Abgabe nutzen Sie bitte ELSTER oder einen Steuerberater.
                    </div>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted-foreground)' }}>
                    <Calculator size={32} style={{ animation: 'spin 2s linear infinite', marginBottom: '1rem' }} />
                    <p>Lade Steuererklärungen...</p>
                </div>
            ) : returns.length === 0 ? (
                <div style={{
                    ...cardStyle, textAlign: 'center', padding: '4rem 2rem'
                }}>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '16px',
                        background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '1rem'
                    }}>
                        <Calculator size={28} color="white" />
                    </div>
                    <h3 style={{ margin: '0 0 0.5rem' }}>Noch keine Steuererklärung</h3>
                    <p style={{ color: 'var(--muted-foreground)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                        Starten Sie Ihre erste Erklärung — der Assistent führt Sie Schritt für Schritt.
                    </p>
                    <Link href="/steuer/neu" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.6rem 1.5rem', borderRadius: '8px',
                        background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                        color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem',
                    }}>
                        <FilePlus size={18} /> Jetzt starten
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {returns.map(r => {
                        const status = statusLabels[r.status] || statusLabels.Draft;
                        return (
                            <div key={r.id} style={{
                                ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                transition: 'box-shadow 0.2s',
                            }}
                                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-md)'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-sm)'; }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '44px', height: '44px', borderRadius: '10px',
                                        background: 'var(--accent)', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <FileCheck size={22} color="var(--accent-foreground)" />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1rem' }}>Steuererklärung {r.year}</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                                            <span style={{
                                                fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px',
                                                background: status.bg, color: status.color, fontWeight: 600
                                            }}>
                                                {status.label}
                                            </span>
                                            {r.updated_at && (
                                                <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                                                    Zuletzt: {new Date(r.updated_at).toLocaleDateString('de-DE')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => router.push(`/steuer/${r.id}`)} style={{
                                        display: 'flex', alignItems: 'center', gap: '6px',
                                        padding: '0.4rem 1rem', borderRadius: '6px',
                                        background: 'var(--primary)', color: 'var(--primary-foreground)',
                                        border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem'
                                    }}>
                                        <Edit size={14} /> {r.status === 'Completed' ? 'Ansehen' : 'Fortsetzen'}
                                    </button>
                                    <button onClick={() => handleDelete(r.id, r.year)} style={{
                                        display: 'flex', alignItems: 'center', gap: '4px',
                                        padding: '0.4rem 0.75rem', borderRadius: '6px',
                                        background: 'var(--danger-bg)', color: 'var(--danger)',
                                        border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem'
                                    }}>
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
