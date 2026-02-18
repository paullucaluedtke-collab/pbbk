"use client";

import { useState, useCallback } from 'react';
import { Upload, FileImage, Loader2 } from 'lucide-react';
import styles from './UploadZone.module.css';

interface UploadZoneProps {
    onFileSelect: (file: File) => void;
    isProcessing: boolean;
}

export default function UploadZone({ onFileSelect, isProcessing }: UploadZoneProps) {
    const [isDragging, setIsDragging] = useState(false);

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
            onFileSelect(e.dataTransfer.files[0]);
        }
    }, [onFileSelect]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
        }
    }, [onFileSelect]);

    return (
        <div
            className={`${styles.uploadZone} ${isDragging ? styles.dragging : ''} ${isProcessing ? styles.processing : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <input
                type="file"
                id="file-upload"
                className={styles.fileInput}
                onChange={handleChange}
                accept="image/*,application/pdf"
                disabled={isProcessing}
            />

            <label htmlFor="file-upload" className={styles.label}>
                <div className={styles.iconWrapper}>
                    {isProcessing ? (
                        <Loader2 className={styles.spinner} size={48} />
                    ) : (
                        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center' }}>
                            <div className={styles.actionButton}>
                                <FileImage size={32} />
                                <span>Datei wählen</span>
                            </div>
                            <div className={styles.actionButton} onClick={(e) => {
                                e.preventDefault();
                                document.getElementById('camera-upload')?.click();
                            }}>
                                <Upload size={32} />
                                <span>Kamera</span>
                            </div>
                        </div>
                    )}
                </div>
                <h3 className={styles.title}>
                    {isProcessing ? 'Analysiere Beleg...' : 'Beleg hochladen oder fotografieren'}
                </h3>
                <p className={styles.subtitle}>
                    Unterstützt JPG, PNG, PDF
                </p>
            </label>

            {/* Hidden Camera Input */}
            <input
                type="file"
                id="camera-upload"
                className={styles.fileInput}
                onChange={handleChange}
                accept="image/*"
                capture="environment"
                disabled={isProcessing}
            />
        </div>
    );
}
