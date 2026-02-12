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
                                <input
                                    type="text"
                                    value={receipt.category}
                                    onChange={(e) => onUpdate(index, 'category', e.target.value)}
                                    className={styles.input}
                                    placeholder="Kategorie"
                                    list="categories"
                                />
                                <datalist id="categories">
                                    <option value="Verpflegung" />
                                    <option value="Reise" />
                                    <option value="Werkzeug" />
                                    <option value="Büro" />
                                    <option value="Material" />
                                    <option value="KFZ" />
                                    <option value="Vermietung und Verpachtung" />
                                    <option value="Sonstiges" />
                                </datalist>
                            </td>
                            <td>
                                <input
                                    type="text"
                                    value={receipt.property || ''}
                                    onChange={(e) => onUpdate(index, 'property', e.target.value)}
                                    className={styles.input}
                                    placeholder={receipt.category === 'Vermietung und Verpachtung' ? 'Objekt/Adresse' : '-'}
                                    disabled={receipt.category !== 'Vermietung und Verpachtung'}
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
