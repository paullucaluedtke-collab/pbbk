"use client";

import { useState } from 'react';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { importBankCSV } from '@/app/actions/bankActions';
import styles from './BankImport.module.css';

export default function BankImport() {
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setError(null);
        setResult(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await importBankCSV(formData);
            setResult(res);
        } catch (err: any) {
            setError(err.message || 'Import fehlgeschlagen');
        } finally {
            setIsUploading(false);
            // Reset input
            e.target.value = '';
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.uploadBox}>
                <label className={styles.label}>
                    <input
                        type="file"
                        accept=".csv,.txt"
                        onChange={handleFileChange}
                        disabled={isUploading}
                        className={styles.fileInput}
                    />
                    <div className={styles.buttonContent}>
                        <Upload size={20} />
                        <span>{isUploading ? 'Importiere...' : 'CSV / MT940 hochladen'}</span>
                    </div>
                </label>
            </div>

            {error && (
                <div className={styles.error}>
                    <AlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}

            {result && (
                <div className={styles.success}>
                    <CheckCircle size={16} />
                    <span>
                        Import erfolgreich: {result.imported} neu, {result.errors} Fehler.
                    </span>
                </div>
            )}
        </div>
    );
}
