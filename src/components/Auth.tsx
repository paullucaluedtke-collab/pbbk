"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { AlertCircle, Check, Mail, Lock, UserPlus, LogIn, FileText } from 'lucide-react';
import styles from '@/app/page.module.css'; // Reusing main styles for consistency

type AuthMode = 'magic_link' | 'login' | 'signup';

export default function Auth() {
    const [mode, setMode] = useState<AuthMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        if (!supabase) {
            setMessage({ type: 'error', text: 'Supabase is not configured. Please add keys to .env.local' });
            setLoading(false);
            return;
        }

        try {
            if (mode === 'magic_link') {
                const { error } = await supabase.auth.signInWithOtp({
                    email,
                    options: {
                        emailRedirectTo: `${window.location.origin}`,
                    },
                });
                if (error) throw error;
                setMessage({ type: 'success', text: 'Magic Link gesendet! Bitte überprüfe deine E-Mails.' });
            } else if (mode === 'login') {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                // Success leads to auto-redirect/refresh via onAuthStateChange in parent
            } else if (mode === 'signup') {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}`,
                    },
                });
                if (error) throw error;
                setMessage({ type: 'success', text: 'Registrierung erfolgreich! Bitte überprüfe deine E-Mails zur Bestätigung.' });
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Ein Fehler ist aufgetreten.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.card} style={{ maxWidth: '420px', margin: '4rem auto', padding: '2rem' }}>
            {/* Branding */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--muted-foreground) 100%)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                    <FileText size={28} color="var(--primary-foreground)" />
                </div>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: 'var(--foreground)' }}>Bürokratie Killer</h1>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', margin: 0 }}>Belege · Rechnungen · Buchhaltung</p>
            </div>

            <h2 style={{ marginBottom: '1.25rem', textAlign: 'center', fontSize: '1.1rem' }}>
                {mode === 'login' && 'Anmelden'}
                {mode === 'signup' && 'Registrieren'}
                {mode === 'magic_link' && 'Magic Link Login'}
            </h2>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    type="button"
                    onClick={() => setMode('login')}
                    style={{
                        background: 'none',
                        border: 'none',
                        borderBottom: mode === 'login' ? '2px solid var(--link)' : '2px solid transparent',
                        padding: '0.5rem',
                        cursor: 'pointer',
                        fontWeight: mode === 'login' ? 'bold' : 'normal',
                        color: mode === 'login' ? 'var(--link)' : 'var(--muted-foreground)'
                    }}
                >
                    Passwort
                </button>
                <button
                    type="button"
                    onClick={() => setMode('magic_link')}
                    style={{
                        background: 'none',
                        border: 'none',
                        borderBottom: mode === 'magic_link' ? '2px solid var(--link)' : '2px solid transparent',
                        padding: '0.5rem',
                        cursor: 'pointer',
                        fontWeight: mode === 'magic_link' ? 'bold' : 'normal',
                        color: mode === 'magic_link' ? 'var(--link)' : 'var(--muted-foreground)'
                    }}
                >
                    Magic Link
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--foreground)' }}>E-Mail</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="deine@email.com"
                        className={styles.input}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }}
                        required
                    />
                </div>

                {mode !== 'magic_link' && (
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--foreground)' }}>Passwort</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="********"
                            className={styles.input}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }}
                            required
                        />
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className={styles.primaryButton}
                    style={{ width: '100%', justifyContent: 'center', marginBottom: '1rem' }}
                >
                    {loading ? 'Lade...' : (
                        <>
                            {mode === 'magic_link' && <Mail size={18} style={{ marginRight: '8px' }} />}
                            {mode === 'login' && <LogIn size={18} style={{ marginRight: '8px' }} />}
                            {mode === 'signup' && <UserPlus size={18} style={{ marginRight: '8px' }} />}
                            {mode === 'magic_link' && 'Magic Link senden'}
                            {mode === 'login' && 'Anmelden'}
                            {mode === 'signup' && 'Registrieren'}
                        </>
                    )}
                </button>

                {mode !== 'magic_link' && (
                    <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--muted-foreground)' }}>
                        {mode === 'login' ? (
                            <>
                                Noch kein Konto?{' '}
                                <button
                                    type="button"
                                    onClick={() => setMode('signup')}
                                    style={{ background: 'none', border: 'none', color: 'var(--link)', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                                >
                                    Jetzt registrieren
                                </button>
                            </>
                        ) : (
                            <>
                                Bereits ein Konto?{' '}
                                <button
                                    type="button"
                                    onClick={() => setMode('login')}
                                    style={{ background: 'none', border: 'none', color: 'var(--link)', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                                >
                                    Anmelden
                                </button>
                            </>
                        )}
                    </div>
                )}
            </form>

            {message && (
                <div style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    backgroundColor: message.type === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)',
                    color: message.type === 'success' ? 'var(--success-text)' : 'var(--danger-text)',
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
