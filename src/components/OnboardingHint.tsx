"use client";

import { Info, X } from 'lucide-react';
import { useState } from 'react';

interface Props {
    title: string;
    children: React.ReactNode;
    dismissKey?: string;
}

export default function OnboardingHint({ title, children, dismissKey }: Props) {
    const storageKey = dismissKey ? `hint_dismissed_${dismissKey}` : null;
    const [dismissed, setDismissed] = useState(() => {
        if (!storageKey) return false;
        if (typeof window === 'undefined') return false;
        return localStorage.getItem(storageKey) === '1';
    });

    if (dismissed) return null;

    const handleDismiss = () => {
        setDismissed(true);
        if (storageKey) localStorage.setItem(storageKey, '1');
    };

    return (
        <div style={{
            display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
            padding: '1rem 1.25rem',
            background: 'var(--hint-bg)',
            border: '1px solid var(--hint-border)',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            fontSize: '0.875rem', color: 'var(--hint-text)',
            lineHeight: 1.5
        }}>
            <Info size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
                <strong style={{ display: 'block', marginBottom: '0.25rem' }}>{title}</strong>
                {children}
            </div>
            <button onClick={handleDismiss} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--hint-text)', opacity: 0.5, padding: '2px', flexShrink: 0
            }} title="Hinweis schließen">
                <X size={16} />
            </button>
        </div>
    );
}
