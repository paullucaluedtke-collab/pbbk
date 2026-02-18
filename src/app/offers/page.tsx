"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getOffers, deleteOffer } from '@/app/actions/offerActions';
import { Offer } from '@/types/offer';
import { FileText, Plus, Edit, Trash2, Search, Loader2 } from 'lucide-react';

export default function OffersPage() {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const router = useRouter();

    useEffect(() => {
        getOffers().then(data => {
            setOffers(data);
            setLoading(false);
        });
    }, []);

    const handleDelete = async (id: string, number: string) => {
        if (!confirm(`Angebot ${number} wirklich löschen?`)) return;
        await deleteOffer(id);
        setOffers(o => o.filter(x => x.id !== id));
    };

    const statusColors: Record<string, string> = {
        Draft: 'var(--muted-foreground)',
        Sent: 'var(--info)',
        Accepted: 'var(--success)',
        Rejected: 'var(--danger)',
        Converted: 'var(--success-text)',
    };

    const filteredOffers = offers.filter(o =>
        o.offer_number.toLowerCase().includes(search.toLowerCase()) ||
        o.customer_name.toLowerCase().includes(search.toLowerCase())
    );

    const cardStyle: React.CSSProperties = {
        background: 'var(--secondary)', borderRadius: '10px',
        border: '1px solid var(--border)', padding: '1.5rem',
        boxShadow: 'var(--shadow-sm)'
    };

    return (
        <div style={{ maxWidth: '1000px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', margin: 0 }}>Angebote</h1>
                    <p style={{ margin: '0.25rem 0 0', color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>
                        Angebote verwalten und in Rechnungen umwandeln
                    </p>
                </div>
                <Link href="/offers/new" style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.6rem 1.25rem', borderRadius: '8px',
                    background: 'var(--primary)',
                    color: 'var(--primary-foreground)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem',
                    border: 'none', transition: 'opacity 0.2s'
                }}>
                    <Plus size={18} /> Neues Angebot
                </Link>
            </div>

            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
                <input
                    type="text"
                    placeholder="Suchen nach Nr. oder Kunde..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                        width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                        borderRadius: '8px', border: '1px solid var(--border)',
                        background: 'var(--background)', fontSize: '0.9rem',
                        outline: 'none', color: 'var(--foreground)'
                    }}
                />
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted-foreground)' }}>
                    <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
                    <p>Lade Angebote...</p>
                </div>
            ) : filteredOffers.length === 0 ? (
                <div style={{ ...cardStyle, textAlign: 'center', padding: '4rem 2rem' }}>
                    <FileText size={48} color="var(--muted-foreground)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <h3>Keine Angebote gefunden</h3>
                    <p style={{ color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>
                        {search ? 'Keine Treffer für Ihre Suche.' : 'Erstellen Sie Ihr erstes Angebot.'}
                    </p>
                    {!search && (
                        <Link href="/offers/new" style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.6rem 1.5rem', borderRadius: '8px',
                            border: '1px solid var(--border)',
                            color: 'var(--foreground)', textDecoration: 'none', fontWeight: 600
                        }}>
                            <Plus size={18} /> Angebot erstellen
                        </Link>
                    )}
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                    {filteredOffers.map(offer => (
                        <div key={offer.id} style={{
                            ...cardStyle, display: 'flex', flexDirection: 'column', gap: '0.5rem',
                            transition: 'box-shadow 0.2s', padding: '1.25rem',
                            opacity: offer.status === 'Converted' ? 0.7 : 1
                        }}
                            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-md)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-sm)'; }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{offer.customer_name}</h3>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>{offer.offer_number}</span>
                                </div>
                                <span style={{
                                    fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px',
                                    border: `1px solid ${statusColors[offer.status] || 'var(--border)'}`,
                                    color: statusColors[offer.status] || 'var(--foreground)',
                                    fontWeight: 600
                                }}>
                                    {offer.status === 'Converted' ? 'Beauftragt' : offer.status}
                                </span>
                            </div>

                            <div style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)' }}>
                                {new Date(offer.date).toLocaleDateString('de-DE')}
                            </div>

                            <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                                    {offer.total.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                                </span>
                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    <button onClick={() => router.push(`/offers/${offer.id}`)} style={{
                                        background: 'transparent', border: 'none', padding: '4px',
                                        color: 'var(--primary)', cursor: 'pointer', borderRadius: '4px'
                                    }}>
                                        <Edit size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(offer.id, offer.offer_number)} style={{
                                        background: 'transparent', border: 'none', padding: '4px',
                                        color: 'var(--danger)', cursor: 'pointer', borderRadius: '4px'
                                    }}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
