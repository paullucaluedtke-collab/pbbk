import { useState, useCallback } from 'react';
import { Upload, FileImage, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { importBankAI } from '@/app/actions/bankActions';
import uploadStyles from './UploadZone.module.css';
import bankStyles from './BankImport.module.css';

export default function BankImportAI() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFile = async (file: File) => {
        setIsProcessing(true);
        setError(null);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            // 1. Analyze via AI
            const aiRes = await fetch('/api/analyze-bank', {
                method: 'POST',
                body: formData,
            });

            if (!aiRes.ok) {
                const errData = await aiRes.json();
                throw new Error(errData.error || 'Fehler bei der KI-Analyse');
            }

            const transactionsData = await aiRes.json();

            if (!Array.isArray(transactionsData) || transactionsData.length === 0) {
                throw new Error('Keine Transaktionen gefunden oder ungültiges Format.');
            }

            // 2. Save via Server Action
            const saveRes = await importBankAI(transactionsData);
            setResult(saveRes);

        } catch (err: any) {
            setError(err.message || 'Import fehlgeschlagen');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, []);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    }, []);

    return (
        <div style={{ flex: 1 }}>
            <div
                className={`${uploadStyles.uploadZone} ${isDragging ? uploadStyles.dragging : ''} ${isProcessing ? uploadStyles.processing : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{ padding: '2rem 1rem', marginBottom: '1rem' }}
            >
                <input
                    type="file"
                    id="bank-ai-upload"
                    className={uploadStyles.fileInput}
                    onChange={handleChange}
                    accept="image/*,application/pdf"
                    disabled={isProcessing}
                />

                <label htmlFor="bank-ai-upload" className={uploadStyles.label} style={{ cursor: isProcessing ? 'default' : 'pointer' }}>
                    <div className={uploadStyles.iconWrapper}>
                        {isProcessing ? (
                            <Loader2 className={uploadStyles.spinner} size={48} />
                        ) : (
                            <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center' }}>
                                <div className={uploadStyles.actionButton}>
                                    <FileImage size={32} />
                                    <span>Datei wählen</span>
                                </div>
                                <div className={uploadStyles.actionButton} onClick={(e) => {
                                    e.preventDefault();
                                    document.getElementById('bank-ai-camera')?.click();
                                }}>
                                    <Upload size={32} />
                                    <span>Kamera</span>
                                </div>
                            </div>
                        )}
                    </div>
                </label>

                {/* Hidden Camera Input */}
                <input
                    type="file"
                    id="bank-ai-camera"
                    className={uploadStyles.fileInput}
                    onChange={handleChange}
                    accept="image/*"
                    capture="environment"
                    disabled={isProcessing}
                />
            </div>

            {error && (
                <div className={bankStyles.error}>
                    <AlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}

            {result && (
                <div className={bankStyles.success}>
                    <CheckCircle size={16} />
                    <span>
                        KI-Import: {result.imported} hinzugefügt ({result.errors} Fehler).
                    </span>
                </div>
            )}
        </div>
    );
}
