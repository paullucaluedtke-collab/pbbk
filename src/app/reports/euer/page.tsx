"use client";

import { useState, useEffect } from 'react';
import { getFinancialSummary, getMonthlyData, FinancialSummary, MonthlyData } from '@/app/actions/reportActions';
import { Loader2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function EuerReportPage() {
    const [year, setYear] = useState(new Date().getFullYear());
    const [summary, setSummary] = useState<FinancialSummary | null>(null);
    const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            getFinancialSummary(year),
            getMonthlyData(year)
        ]).then(([sum, months]) => {
            setSummary(sum);
            setMonthlyData(months);
            setLoading(false);
        });
    }, [year]);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(val);
    };

    const downloadPDF = () => {
        const doc = new jsPDF();

        doc.setFontSize(20);
        doc.text(`EÜR Bericht ${year}`, 14, 22);

        doc.setFontSize(11);
        doc.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, 14, 30);

        if (summary) {
            doc.text(`Einnahmen: ${formatCurrency(summary.revenue)}`, 14, 40);
            doc.text(`Ausgaben: ${formatCurrency(summary.expenses)}`, 14, 46);
            doc.text(`Gewinn: ${formatCurrency(summary.profit)}`, 14, 52);
        }

        autoTable(doc, {
            startY: 60,
            head: [['Monat', 'Einnahmen', 'Ausgaben', 'Gewinn']],
            body: monthlyData.map(m => [
                m.month,
                formatCurrency(m.revenue),
                formatCurrency(m.expenses),
                formatCurrency(m.profit)
            ]),
        });

        doc.save(`EUER_Bericht_${year}.pdf`);
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted-foreground)' }}>
                <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
                <p>Lade Finanzdaten...</p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1000px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', margin: 0 }}>EÜR & Gewinnermittlung</h1>
                    <p style={{ margin: '0.25rem 0 0', color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>
                        Finanzüberblick für das Jahr {year}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <select
                        value={year}
                        onChange={e => setYear(Number(e.target.value))}
                        style={{
                            padding: '0.5rem', borderRadius: '6px',
                            border: '1px solid var(--border)', background: 'var(--background)',
                            color: 'var(--foreground)', fontSize: '1rem', fontWeight: 600
                        }}
                    >
                        {[0, 1, 2, 3, 4].map(i => {
                            const y = new Date().getFullYear() - i;
                            return <option key={y} value={y}>{y}</option>;
                        })}
                    </select>
                    <button
                        onClick={downloadPDF}
                        style={{
                            padding: '0.6rem 1.25rem', borderRadius: '8px',
                            background: 'var(--primary)', color: 'var(--primary-foreground)',
                            border: 'none', fontWeight: 600, cursor: 'pointer'
                        }}
                    >
                        PDF Export
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ padding: '1.5rem', borderRadius: '10px', background: 'var(--secondary)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--muted-foreground)' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Einnahmen (bezahlt)</span>
                        <TrendingUp size={18} color="var(--success)" />
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--foreground)' }}>
                        {formatCurrency(summary?.revenue || 0)}
                    </div>
                </div>

                <div style={{ padding: '1.5rem', borderRadius: '10px', background: 'var(--secondary)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--muted-foreground)' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Ausgaben (Belege)</span>
                        <TrendingDown size={18} color="var(--warning)" />
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--foreground)' }}>
                        {formatCurrency(summary?.expenses || 0)}
                    </div>
                </div>

                <div style={{ padding: '1.5rem', borderRadius: '10px', background: 'var(--secondary)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--muted-foreground)' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Gewinn</span>
                        <DollarSign size={18} color="var(--info)" />
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: (summary?.profit || 0) >= 0 ? 'var(--success-text)' : 'var(--danger-text)' }}>
                        {formatCurrency(summary?.profit || 0)}
                    </div>
                </div>
            </div>

            {/* Monthly Table */}
            <div style={{ background: 'var(--secondary)', borderRadius: '10px', border: '1px solid var(--border)', overflow: 'hidden', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', minWidth: '600px' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--muted)' }}>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Monat</th>
                            <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>Einnahmen</th>
                            <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>Ausgaben</th>
                            <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>Gewinn</th>
                        </tr>
                    </thead>
                    <tbody>
                        {monthlyData.map((m, idx) => (
                            <tr key={idx} style={{ borderBottom: idx < 11 ? '1px solid var(--border)' : 'none' }}>
                                <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>{m.month}</td>
                                <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--success-text)' }}>{formatCurrency(m.revenue)}</td>
                                <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--warning-text)' }}>{formatCurrency(m.expenses)}</td>
                                <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: m.profit >= 0 ? 'var(--foreground)' : 'var(--danger-text)' }}>{formatCurrency(m.profit)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
