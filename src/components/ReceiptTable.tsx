"use client";

import { ReceiptData } from '@/types/receipt';
import { Trash2, Eye } from 'lucide-react';
import styles from './ReceiptTable.module.css';

interface ReceiptTableProps {
    data: ReceiptData[];
    onUpdate: (index: number, field: keyof ReceiptData & string, value: string | number) => void;
    onDelete: (index: number) => void;
    onViewImage: (imageUrl: string) => void;
}

export default function ReceiptTable({ data, onUpdate, onDelete, onViewImage }: ReceiptTableProps) {
    if (data.length === 0) {
        return (
            <div className={styles.emptyState}>
                <p>Noch keine Belege erfasst.</p>
            </div>
        );
    }

    return (
        <div className={styles.tableWrapper}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th className={styles.colTiny}></th>
                        <th>Typ</th>
                        <th>Datum</th>
                        <th>Händler</th>
                        <th>Kategorie</th>
                        <th>Objekt/Info</th>
                        <th>Steuer (€)</th>
                        <th>Gesamt (€)</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((receipt, index) => (
                        <tr key={receipt.id}>
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
                                <select
                                    value={receipt.type}
                                    onChange={(e) => onUpdate(index, 'type', e.target.value)}
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
                                    onChange={(e) => onUpdate(index, 'date', e.target.value)}
                                    className={styles.input}
                                />
                            </td>
                            <td>
                                <input
                                    type="text"
                                    value={receipt.vendor}
                                    onChange={(e) => onUpdate(index, 'vendor', e.target.value)}
                                    className={styles.input}
                                    placeholder="Händler"
                                />
                            </td>
                            <td>
                                <select
                                    value={receipt.category}
                                    onChange={(e) => onUpdate(index, 'category', e.target.value)}
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
                                </select>
                            </td>
                            <td>
                                <input
                                    type="text"
                                    value={receipt.property || ''}
                                    onChange={(e) => onUpdate(index, 'property', e.target.value)}
                                    className={styles.input}
                                    placeholder={receipt.category === 'Miete/Nebenkosten' ? 'Objekt/Adresse' : '-'}
                                    disabled={receipt.category !== 'Miete/Nebenkosten'}
                                />
                            </td>
                            <td>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={receipt.taxAmount}
                                    onChange={(e) => onUpdate(index, 'taxAmount', parseFloat(e.target.value) || 0)}
                                    className={`${styles.input} ${styles.number}`}
                                />
                            </td>
                            <td>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={receipt.totalAmount}
                                    onChange={(e) => onUpdate(index, 'totalAmount', parseFloat(e.target.value) || 0)}
                                    className={`${styles.input} ${styles.number} ${styles.bold}`}
                                />
                            </td>
                            <td className={styles.actions}>
                                <button
                                    onClick={() => onDelete(index)}
                                    className={styles.deleteBtn}
                                    title="Löschen"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
