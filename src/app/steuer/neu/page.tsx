"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createTaxReturn } from '@/app/actions/taxActions';
import { FilePlus, Loader2, Calendar } from 'lucide-react';

export default function NeueSteuererklaerung() {
    const [year, setYear] = useState(new Date().getFullYear() - 1);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - 1 - i);

    const handleCreate = async () => {
        setCreating(true);
        setError(null);
        try {
            const id = await createTaxReturn(year);
            router.push(`/steuer/${id}`);
        } catch (e: any) {
            setError(e.message || 'Fehler beim Erstellen');
            setCreating(false);
        }
    };

    const cardStyle: React.CSSProperties = {
        background: 'var(--secondary)', borderRadius: '10px',
        border: '1px solid var(--border)', padding: '2rem',
        boxShadow: 'var(--shadow-sm)', maxWidth: '500px'
    };

    return (
        <div style={{ maxWidth: '600px' }}>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Neue Steuererklärung</h1>
            <p style={{ color: 'var(--muted-foreground)', marginBottom: '2rem', fontSize: '0.9rem' }}>
                Wählen Sie das Steuerjahr und starten Sie die geführte Eingabe.
            </p>

            <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <Calendar size={24} color="#8b5cf6" />
                    <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Steuerjahr wählen</h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    {years.map(y => (
                        <button
                            key={y}
                            onClick={() => setYear(y)}
                            style={{
                                padding: '1rem', borderRadius: '8px', border: '2px solid',
                                borderColor: year === y ? '#8b5cf6' : 'var(--border)',
                                background: year === y ? 'rgba(139,92,246,0.1)' : 'var(--background)',
                                color: year === y ? '#8b5cf6' : 'var(--foreground)',
                                cursor: 'pointer', fontWeight: year === y ? 700 : 500,
                                fontSize: '1.1rem', transition: 'all 0.15s',
                            }}
                        >
                            {y}
                        </button>
                    ))}
                </div>

                <button
                    onClick={handleCreate}
                    disabled={creating}
                    style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: '0.5rem', padding: '0.75rem', borderRadius: '8px',
                        background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                        color: '#fff', border: 'none', cursor: creating ? 'wait' : 'pointer',
                        fontWeight: 600, fontSize: '1rem', opacity: creating ? 0.7 : 1,
                        transition: 'opacity 0.2s'
                    }}
                >
                    {creating ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <FilePlus size={18} />}
                    {creating ? 'Erstelle...' : `Erklärung ${year} starten`}
                </button>

                {error && (
                    <p style={{ marginTop: '1rem', color: 'var(--danger)', fontSize: '0.85rem' }}>{error}</p>
                )}
            </div>
        </div>
    );
}
