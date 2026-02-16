"use client";

import { useState } from 'react';
import { generateExport } from '@/app/actions/financeActions';
import { Download, ChevronDown } from 'lucide-react';
import { AccountFrame } from '@/utils/accountMapping';

export default function ExportMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [format, setFormat] = useState<'DATEV' | 'Standard'>('DATEV');
    const [frame, setFrame] = useState<AccountFrame>('SKR03');

    const handleExport = async () => {
        const csv = await generateExport(year, month, format, frame);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `export_${year}_${month}_${format}_${frame}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsOpen(false);
    };

    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    background: 'white', border: '1px solid #e2e8f0',
                    padding: '0.5rem 1rem', borderRadius: '0.5rem',
                    fontWeight: 500, fontSize: '0.875rem', cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
            >
                <Download size={16} />
                Export
                <ChevronDown size={14} style={{ marginLeft: '4px' }} />
            </button>

            {isOpen && (
                <>
                    {/* Click-outside overlay to close */}
                    <div onClick={() => setIsOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
                    <div style={{
                        position: 'absolute', right: 0, top: '100%', marginTop: '0.5rem',
                        background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.5rem',
                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                        width: '300px', zIndex: 50, padding: '1rem'
                    }}>
                        <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem' }}>Daten exportieren</h4>

                        {/* Month/Year Selection */}
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                            <input
                                type="number" value={year} onChange={e => setYear(parseInt(e.target.value))}
                                style={{ width: '80px', padding: '0.25rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                            />
                            <select
                                value={month} onChange={e => setMonth(parseInt(e.target.value))}
                                style={{ flex: 1, padding: '0.25rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                            >
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                    <option key={m} value={m}>{new Date(2000, m - 1, 1).toLocaleString('de-DE', { month: 'long' })}</option>
                                ))}
                            </select>
                        </div>

                        {/* Format Selection */}
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Format</label>
                            <select
                                value={format} onChange={e => setFormat(e.target.value as any)}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                            >
                                <option value="DATEV">DATEV (CSV)</option>
                                <option value="Standard">Standard (Excel/CSV)</option>
                            </select>
                            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                                {format === 'DATEV' ? 'Empfohlen für den Steuerberater.' : 'Einfache Liste für Excel.'}
                            </p>
                        </div>

                        {/* Account Frame Selection */}
                        {format === 'DATEV' && (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Kontorahmen</label>
                                <select
                                    value={frame} onChange={e => setFrame(e.target.value as any)}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                                >
                                    <option value="SKR03">SKR03</option>
                                    <option value="SKR04">SKR04</option>
                                </select>
                                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                                    SKR03 ist der gängigste Standard für kleine Unternehmen.
                                </p>
                            </div>
                        )}

                        <button
                            onClick={handleExport}
                            style={{
                                width: '100%', background: '#0f172a', color: 'white',
                                padding: '0.5rem', borderRadius: '4px', border: 'none',
                                cursor: 'pointer', fontWeight: 500
                            }}
                        >
                            Herunterladen
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
