"use client";

import { Info } from 'lucide-react';

interface TaxInfoBoxProps {
    children: React.ReactNode;
    type?: 'info' | 'tip' | 'warning';
}

const styles: Record<string, { bg: string; border: string; icon: string }> = {
    info: { bg: 'var(--info-bg)', border: 'var(--info)', icon: 'var(--info)' },
    tip: { bg: 'var(--success-bg)', border: 'var(--success)', icon: 'var(--success)' },
    warning: { bg: 'var(--warning-bg)', border: 'var(--warning)', icon: 'var(--warning)' },
};

export default function TaxInfoBox({ children, type = 'info' }: TaxInfoBoxProps) {
    const s = styles[type];
    return (
        <div style={{
            background: s.bg, border: `1px solid ${s.border}`, borderRadius: '8px',
            padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex',
            gap: '0.75rem', alignItems: 'flex-start', fontSize: '0.85rem', lineHeight: 1.6
        }}>
            <Info size={16} color={s.icon} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>{children}</div>
        </div>
    );
}
