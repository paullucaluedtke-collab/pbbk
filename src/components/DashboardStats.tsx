"use client";

import { useMemo, useState } from 'react';
import { FinancialStats } from '@/app/actions/financeActions';
import { ReceiptData } from '@/types/receipt';
import { ArrowUpCircle, ArrowDownCircle, Banknote, Filter } from 'lucide-react';

interface Props {
    receipts: ReceiptData[];
}

export default function DashboardStats({ receipts }: Props) {
    const [filter, setFilter] = useState<string>('all');

    // Build available months from receipts
    const availableMonths = useMemo(() => {
        const months = new Set<string>();
        receipts.forEach(r => {
            if (r.date) {
                const d = new Date(r.date);
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                months.add(key);
            }
        });
        return Array.from(months).sort().reverse();
    }, [receipts]);

    const stats = useMemo(() => {
        const s: FinancialStats = {
            incomeNet: 0,
            incomeGross: 0,
            expenseNet: 0,
            expenseGross: 0,
            taxPayable: 0,
            taxReceivable: 0,
            taxTraffic: 0
        };

        receipts.forEach(r => {
            // Apply filter
            if (filter !== 'all' && r.date) {
                const d = new Date(r.date);
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                if (key !== filter) return;
            }

            const amount = r.totalAmount || 0;
            const tax = r.taxAmount || 0;
            const net = amount - tax;

            if (r.type === 'Einnahme') {
                s.incomeGross += amount;
                s.incomeNet += net;
                s.taxPayable += tax;
            } else {
                s.expenseGross += amount;
                s.expenseNet += net;
                s.taxReceivable += tax;
            }
        });

        s.taxTraffic = s.taxPayable - s.taxReceivable;
        return s;
    }, [receipts, filter]);

    const formatMonth = (key: string) => {
        const [y, m] = key.split('-');
        const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
        return `${months[parseInt(m) - 1]} ${y}`;
    };

    return (
        <div style={{ marginBottom: '2rem' }}>
            {/* Filter Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.875rem' }}>
                    <Filter size={16} />
                    <span style={{ fontWeight: 500 }}>Zeitraum:</span>
                </div>
                <select
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                    style={{
                        padding: '0.4rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        fontSize: '0.875rem',
                        color: '#0f172a',
                        background: 'white',
                        cursor: 'pointer',
                        outline: 'none'
                    }}
                >
                    <option value="all">Gesamt (alle Belege)</option>
                    {availableMonths.map(m => (
                        <option key={m} value={m}>{formatMonth(m)}</option>
                    ))}
                </select>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {/* Income */}
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#64748b' }}>
                        <ArrowUpCircle size={18} color="#16a34a" />
                        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Einnahmen (Netto)</span>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
                        {stats.incomeNet.toFixed(2)} €
                    </div>
                </div>

                {/* Expenses */}
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#64748b' }}>
                        <ArrowDownCircle size={18} color="#ef4444" />
                        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Ausgaben (Netto)</span>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
                        {stats.expenseNet.toFixed(2)} €
                    </div>
                </div>

                {/* Tax */}
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#64748b' }}>
                        <Banknote size={18} color="#2563eb" />
                        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>USt-Zahllast (Vorschau)</span>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: stats.taxTraffic > 0 ? '#ef4444' : '#16a34a' }}>
                        {stats.taxTraffic.toFixed(2)} €
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                        {stats.taxPayable.toFixed(2)}€ (USt) - {stats.taxReceivable.toFixed(2)}€ (VSt)
                    </div>
                </div>
            </div>
        </div>
    );
}
