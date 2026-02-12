"use client";

import { useState, useEffect } from 'react';
import UploadZone from '@/components/UploadZone';
import ReceiptTable from '@/components/ReceiptTable';
import ImageModal from '@/components/ImageModal';
import { ReceiptData } from '@/types/receipt';
import { generateCSV, downloadCSV } from '@/utils/csvHelper';
import { generatePDF } from '@/utils/pdfHelper';
import { Download, Ban, AlertCircle, FileText } from 'lucide-react';
import { addReceipt, fetchReceipts, removeReceipt, editReceipt } from '@/app/actions';
import styles from './page.module.css';

export default function Home() {
    const [receipts, setReceipts] = useState<ReceiptData[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // Initial Load from Server
    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchReceipts();
                setReceipts(data);
            } catch (e) {
                console.error("Failed to load receipts", e);
                setError("Fehler beim Laden der Belege.");
            }
        };
        load();
    }, []);

    const handleFileUpload = async (file: File) => {
        setIsProcessing(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            // 1. Analyze via API (Client-side call to use OpenAI)
            const response = await fetch('/api/analyze', {
                method: 'POST',
                body: formData,
            });

            const analysisData = await response.json();

            if (!response.ok) {
                throw new Error(analysisData.error || 'Fehler beim Analysieren des Belegs');
            }

            // 2. Save via Server Action
            const savedReceipt = await addReceipt(formData, analysisData);

            setReceipts(prev => [savedReceipt, ...prev]);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Ein unbekannter Fehler ist aufgetreten.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUpdate = async (index: number, field: keyof ReceiptData & string, value: string | number) => {
        const updatedReceipts = [...receipts];
        (updatedReceipts[index] as any)[field] = value;
        setReceipts(updatedReceipts);

        // Save change to server
        await editReceipt(updatedReceipts[index]);
    };

    const handleDelete = async (index: number) => {
        const receiptToDelete = receipts[index];
        const updated = [...receipts];
        updated.splice(index, 1);
        setReceipts(updated);

        await removeReceipt(receiptToDelete.id);
    };

    const handleDownloadCSV = () => {
        const csv = generateCSV(receipts);
        downloadCSV(csv, `belege_export_${new Date().toISOString().slice(0, 10)}.csv`);
    };

    const handleDownloadPDF = () => {
        generatePDF(receipts);
    };

    const handleClear = async () => {
        if (confirm('Wirklich alle Daten löschen? Dies kann nicht rückgängig gemacht werden.')) {
            // Sequential delete for safety in MVP (could be batch optimized)
            for (const r of receipts) {
                await removeReceipt(r.id);
            }
            setReceipts([]);
        }
    };

    return (
        <main className={styles.main}>
            <header className={styles.header}>
                <div className="container">
                    <h1 className={styles.title}>Bürokratie Killer</h1>
                    <p className={styles.subtitle}>Der intelligente Rechnungs-Extraktor</p>
                </div>
            </header>

            <div className="container">
                <div className={styles.card}>
                    <UploadZone onFileSelect={handleFileUpload} isProcessing={isProcessing} />

                    {error && (
                        <div className={styles.errorBanner}>
                            <AlertCircle size={20} />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className={styles.controls}>
                        <h3>Erfasste Belege ({receipts.length})</h3>
                        <div className={styles.controlButtons}>
                            <button
                                onClick={handleClear}
                                disabled={receipts.length === 0}
                                className={styles.secondaryButton}
                            >
                                <Ban size={16} /> Alle löschen
                            </button>
                            <button
                                onClick={handleDownloadCSV}
                                disabled={receipts.length === 0}
                                className={styles.primaryButton}
                            >
                                <Download size={16} /> CSV
                            </button>
                            <button
                                onClick={handleDownloadPDF}
                                disabled={receipts.length === 0}
                                className={styles.primaryButton}
                            >
                                <FileText size={16} /> PDF Export
                            </button>
                        </div>
                    </div>

                    <ReceiptTable
                        data={receipts}
                        onUpdate={handleUpdate}
                        onDelete={handleDelete}
                        onViewImage={setSelectedImage}
                    />
                </div>
            </div>

            {selectedImage && (
                <ImageModal
                    imageUrl={selectedImage}
                    onClose={() => setSelectedImage(null)}
                />
            )}
        </main>
    );
}
