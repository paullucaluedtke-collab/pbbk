"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCustomers, deleteCustomer } from '@/app/actions/customerActions';
import { Customer } from '@/types/customer';
import { Users, Plus, Edit, Trash2, Search, Loader2 } from 'lucide-react';

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const router = useRouter();

    useEffect(() => {
        getCustomers().then(data => {
            setCustomers(data);
            setLoading(false);
        });
    }, []);

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Kunde "${name}" wirklich löschen?`)) return;
        await deleteCustomer(id);
        setCustomers(c => c.filter(x => x.id !== id));
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase())
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
                    <h1 style={{ fontSize: '1.75rem', margin: 0 }}>Kundenverwaltung</h1>
                    <p style={{ margin: '0.25rem 0 0', color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>
                        Verwalten Sie Ihre Kontakte zentral
                    </p>
                </div>
                <Link href="/customers/new" style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.6rem 1.25rem', borderRadius: '8px',
                    background: 'var(--primary)',
                    color: 'var(--primary-foreground)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem',
                    border: 'none', transition: 'opacity 0.2s'
                }}>
                    <Plus size={18} /> Neuer Kunde
                </Link>
            </div>

            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
                <input
                    type="text"
                    placeholder="Suchen nach Namen oder E-Mail..."
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
                    <p>Lade Kunden...</p>
                </div>
            ) : filteredCustomers.length === 0 ? (
                <div style={{ ...cardStyle, textAlign: 'center', padding: '4rem 2rem' }}>
                    <Users size={48} color="var(--muted-foreground)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <h3>Keine Kunden gefunden</h3>
                    <p style={{ color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>
                        {search ? 'Keine Treffer für Ihre Suche.' : 'Legen Sie Ihren ersten Kunden an.'}
                    </p>
                    {!search && (
                        <Link href="/customers/new" style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.6rem 1.5rem', borderRadius: '8px',
                            border: '1px solid var(--border)',
                            color: 'var(--foreground)', textDecoration: 'none', fontWeight: 600
                        }}>
                            <Plus size={18} /> Kunde anlegen
                        </Link>
                    )}
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                    {filteredCustomers.map(customer => (
                        <div key={customer.id} style={{
                            ...cardStyle, display: 'flex', flexDirection: 'column', gap: '0.5rem',
                            transition: 'box-shadow 0.2s', padding: '1.25rem'
                        }}
                            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-md)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-sm)'; }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{customer.name}</h3>
                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    <button onClick={() => router.push(`/customers/${customer.id}`)} style={{
                                        background: 'transparent', border: 'none', padding: '4px',
                                        color: 'var(--muted-foreground)', cursor: 'pointer', borderRadius: '4px'
                                    }}>
                                        <Edit size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(customer.id, customer.name)} style={{
                                        background: 'transparent', border: 'none', padding: '4px',
                                        color: 'var(--danger)', cursor: 'pointer', borderRadius: '4px'
                                    }}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {customer.email && (
                                <div style={{ fontSize: '0.9rem', color: 'var(--link)' }}>
                                    <a href={`mailto:${customer.email}`} style={{ textDecoration: 'none', color: 'inherit' }}>{customer.email}</a>
                                </div>
                            )}

                            <div style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', marginTop: 'auto', paddingTop: '0.75rem' }}>
                                {[customer.address_line1, customer.city_zip].filter(Boolean).join(', ')}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
