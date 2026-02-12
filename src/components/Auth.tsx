"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { AlertCircle, Check, Mail } from 'lucide-react';
import styles from '@/app/page.module.css'; // Reusing main styles for consistency

export default function Auth() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        if (!supabase) {
            setMessage({ type: 'error', text: 'Supabase is not configured. Please add keys to .env.local' });
            setLoading(false);
            return;
        }

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${window.location.origin}`,
            },
        });

        if (error) {
            setMessage({ type: 'error', text: error.message });
        } else {
            setMessage({ type: 'success', text: 'Magic Link gesendet! Bitte überprüfe deine E-Mails.' });
        }
        setLoading(false);
    };

    return (
        <div className={styles.card} style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Anmelden</h2>
            <p style={{ marginBottom: '2rem', textAlign: 'center', color: '#666' }}>
                Melde dich an, um deine Belege zu synchronisieren.
            </p>

            <form onSubmit={handleLogin}>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>E-Mail</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="deine@email.com"
                        className={styles.input} // Ensure this style exists or use inline
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ddd' }}
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={styles.primaryButton}
                    style={{ width: '100%', justifyContent: 'center' }}
                >
                    {loading ? 'Sende Link...' : (
                        <>
                            <Mail size={18} style={{ marginRight: '8px' }} />
                            Magic Link senden
                        </>
                    )}
                </button>
            </form>

            {message && (
                <div style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    backgroundColor: message.type === 'success' ? '#e8f5e9' : '#ffebee',
                    color: message.type === 'success' ? '#2e7d32' : '#c62828',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                    <span>{message.text}</span>
                </div>
            )}
        </div>
    );
}
