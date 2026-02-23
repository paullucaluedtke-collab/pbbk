"use client";

import { useState } from 'react';
import { ReceiptData } from '@/types/receipt';
import { Trash2, Eye, Check, X, Search } from 'lucide-react';
import styles from './ReceiptTable.module.css';

interface ReceiptTableProps {
    data: ReceiptData[];
    onUpdate: (index: number, field: keyof ReceiptData & string, value: string | number) => void;
    onDelete: (index: number) => void;
    onViewImage: (imageUrl: string) => void;
    onVerify: (index: number, status: 'Verified' | 'Rejected') => void;
}

export default function ReceiptTable({ data, onUpdate, onDelete, onViewImage, onVerify }: ReceiptTableProps) {
    const [search, setSearch] = useState('');
    const [sortField, setSortField] = useState<'date' | 'totalAmount' | 'vendor'>('date');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

    if (data.length === 0) {
        return (
            <div className={styles.emptyState}>
                <p>Noch keine Belege erfasst. Laden Sie oben ein Bild hoch, um zu starten.</p>
            </div>
        );
    }

    const filtered = data.filter(r => {
        if (!search) return true;
        const q = search.toLowerCase();
        return r.vendor.toLowerCase().includes(q)
            || r.category.toLowerCase().includes(q)
            || r.date.includes(q)
            || String(r.totalAmount).includes(q);
    });

    const sorted = [...filtered].sort((a, b) => {
        let cmp = 0;
        if (sortField === 'date') cmp = a.date.localeCompare(b.date);
        else if (sortField === 'totalAmount') cmp = a.totalAmount - b.totalAmount;
        else if (sortField === 'vendor') cmp = a.vendor.localeCompare(b.vendor);
        return sortDir === 'desc' ? -cmp : cmp;
    });

    const handleSort = (field: typeof sortField) => {
        if (sortField === field) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDir('desc');
        }
    };

    const sortIcon = (field: typeof sortField) => {
        if (sortField !== field) return ' ↕';
        return sortDir === 'asc' ? ' ↑' : ' ↓';
    };

    const handleDelete = (index: number) => {
        const receipt = data[index];
        if (!confirm(`Beleg "${receipt.vendor}" (${receipt.totalAmount.toFixed(2)} €) wirklich löschen?`)) return;
        onDelete(index);
    };

    // Map sorted items back to original index
    const getOriginalIndex = (receipt: ReceiptData) => data.findIndex(r => r.id === receipt.id);

    return (
        <div>
            {/* Search Bar */}
            <div style={{ marginBottom: '1rem', position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
                <input
                    type="text"
                    placeholder="Belege durchsuchen (Händler, Kategorie, Datum, Betrag)..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                        width: '100%', padding: '0.6rem 0.75rem 0.6rem 2.25rem',
                        borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.875rem',
                        outline: 'none', background: 'var(--background)', color: 'var(--foreground)'
                    }}
                />
                {search && (
                    <span style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                        {filtered.length} von {data.length}
                    </span>
                )}
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.colTiny}>Bild</th>
                            <th>Status</th>
                            <th>Typ</th>
                            <th onClick={() => handleSort('date')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                Datum{sortIcon('date')}
                            </th>
                            <th onClick={() => handleSort('vendor')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                Händler{sortIcon('vendor')}
                            </th>
                            <th>Kategorie</th>
                            <th>Objekt</th>
                            <th className={styles.numberCol}>MwSt</th>
                            <th onClick={() => handleSort('totalAmount')} className={styles.numberCol} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                Betrag{sortIcon('totalAmount')}
                            </th>
                            <th className={styles.actions}>Aktionen</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sorted.map((receipt) => {
                            const originalIndex = getOriginalIndex(receipt);
                            return (
                                <tr key={receipt.id} className={receipt.status === 'Rejected' ? styles.rejectedRow : ''}>
                                    <td className={styles.colTiny}>
                                        {receipt.imageUrl && (
                                            <button
                                                onClick={() => onViewImage(receipt.imageUrl!)}
                                                className={styles.iconBtn}
                                                title="Beleg ansehen"
                                            >
                                                <Eye size={16} />
                                            </button>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${styles[receipt.status]}`}>
                                            {receipt.status === 'Verified' ? 'OK' :
                                                receipt.status === 'Rejected' ? 'Abgelehnt' : 'Offen'}
                                        </span>
                                    </td>
                                    <td>
                                        <select
                                            value={receipt.type}
                                            onChange={(e) => onUpdate(originalIndex, 'type', e.target.value)}
                                            className={`${styles.input} ${receipt.type === 'Einnahme' ? styles.income : styles.expense}`}
                                        >
                                            <option value="Ausgabe">Ausgabe</option>
                                            <option value="Einnahme">Einnahme</option>
                                        </select>
                                    </td>
                                    <td>
                                        <input
                                            type="date"
                                            value={receipt.date}
                                            onChange={(e) => onUpdate(originalIndex, 'date', e.target.value)}
                                            className={styles.input}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={receipt.vendor}
                                            onChange={(e) => onUpdate(originalIndex, 'vendor', e.target.value)}
                                            className={styles.input}
                                            placeholder="Händler"
                                        />
                                    </td>
                                    <td>
                                        <select
                                            value={receipt.category}
                                            onChange={(e) => onUpdate(originalIndex, 'category', e.target.value)}
                                            className={styles.input}
                                        >
                                            <option value="Sonstiges">Sonstiges</option>
                                            <option value="Büromat./Porto/Tel.">Büromat./Porto/Tel.</option>
                                            <option value="Fortbildung">Fortbildung</option>
                                            <option value="KFZ-Kosten">KFZ-Kosten</option>
                                            <option value="Miete/Nebenkosten">Miete/Nebenkosten</option>
                                            <option value="Reisekosten">Reisekosten</option>
                                            <option value="Bewirtung">Bewirtung</option>
                                            <option value="Wareneingang">Wareneingang</option>
                                            <option value="Fremdleistung">Fremdleistung</option>
                                            <option value="Geldtransit">Geldtransit</option>
                                            <option value="Privatentnahme">Privatentnahme</option>
                                            <option value="Grundstückskosten">Grundstückskosten</option>
                                            <option value="Betriebskosten allgemein">Betriebskosten allgemein</option>
                                            <option value="Kartenzahlung">Kartenzahlung</option>
                                            <option value="Barquittung Pension & Frühstück">Barquittung Pension & Frühstück</option>
                                        </select>
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={receipt.property || ''}
                                            onChange={(e) => onUpdate(originalIndex, 'property', e.target.value)}
                                            className={styles.input}
                                            placeholder={receipt.category === 'Miete/Nebenkosten' ? 'Objekt' : '-'}
                                            disabled={receipt.category !== 'Miete/Nebenkosten'}
                                        />
                                    </td>
                                    <td className={styles.numberCol}>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={receipt.taxAmount}
                                            onChange={(e) => onUpdate(originalIndex, 'taxAmount', parseFloat(e.target.value) || 0)}
                                            className={`${styles.input} ${styles.number}`}
                                            style={{ color: '#64748b', fontSize: '0.8rem' }}
                                        />
                                    </td>
                                    <td className={styles.numberCol}>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={receipt.totalAmount}
                                            onChange={(e) => onUpdate(originalIndex, 'totalAmount', parseFloat(e.target.value) || 0)}
                                            className={`${styles.input} ${styles.number} ${styles.bold}`}
                                        />
                                    </td>
                                    <td className={styles.actions}>
                                        {receipt.status === 'Pending' && (
                                            <>
                                                <button onClick={() => onVerify(originalIndex, 'Verified')} className={styles.verifyBtn} title="Freigeben">
                                                    <Check size={18} />
                                                </button>
                                                <button onClick={() => onVerify(originalIndex, 'Rejected')} className={styles.rejectBtn} title="Ablehnen">
                                                    <X size={18} />
                                                </button>
                                            </>
                                        )}
                                        <button onClick={() => handleDelete(originalIndex)} className={styles.deleteBtn} title="Löschen">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
