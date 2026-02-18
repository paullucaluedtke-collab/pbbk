"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import UploadZone from '@/components/UploadZone';
import ReceiptTable from '@/components/ReceiptTable';
import ImageModal from '@/components/ImageModal';
import { ReceiptData } from '@/types/receipt';
import { generateCSV, downloadCSV } from '@/utils/csvHelper';
import { generateZipExport } from '@/utils/exportHelper';
import { Download, Ban, AlertCircle, FileArchive, LogOut } from 'lucide-react';
import { addReceipt, fetchReceipts, removeReceipt, editReceipt } from '@/app/actions';
import { verifyReceipt } from '@/app/actions/verifyReceipt';
import DashboardStats from '@/components/DashboardStats';
import ExportMenu from '@/components/ExportMenu';
import OnboardingHint from '@/components/OnboardingHint';
import styles from './page.module.css';
import Auth from '@/components/Auth';
import { supabase } from '@/lib/supabaseClient';

export default function Home() {
    const [receipts, setReceipts] = useState<ReceiptData[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const [user, setUser] = useState<any>(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

    // Check Auth Session
    useEffect(() => {
        const checkUser = async () => {
            if (!supabase) {
                setLoadingAuth(false);
                return;
            }

            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            setLoadingAuth(false);

            const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                setUser(session?.user ?? null);
            });

            return () => subscription.unsubscribe();
        };
        checkUser();
    }, []);

    const handleLogout = async () => {
        if (!supabase) return;
        await supabase.auth.signOut();
        setUser(null);
        setReceipts([]); // Clear data on logout
    };

    // Initial Load from Server
    useEffect(() => {
        if (loadingAuth) return;
        if (supabase && !user) return;

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
    }, [user, loadingAuth]);

    const handleFileUpload = async (file: File) => {
        setIsProcessing(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                body: formData,
            });

            const analysisData = await response.json();

            if (!response.ok) {
                throw new Error(analysisData.error || 'Fehler beim Analysieren des Belegs');
            }

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

        try {
            await editReceipt(updatedReceipts[index]);
        } catch (err) {
            console.error('Error updating receipt:', err);
            setError('Fehler beim Aktualisieren des Belegs.');
        }
    };

    const handleDelete = async (index: number) => {
        const receiptToDelete = receipts[index];
        const updated = [...receipts];
        updated.splice(index, 1);
        setReceipts(updated);

        await removeReceipt(receiptToDelete.id);
    };

    const handleVerify = async (index: number, status: 'Verified' | 'Rejected') => {
        const updatedReceipts = [...receipts];
        updatedReceipts[index].status = status;
        setReceipts(updatedReceipts);

        await verifyReceipt(updatedReceipts[index].id, status);
    };

    const handleDownloadCSV = () => {
        const csv = generateCSV(receipts);
        downloadCSV(csv, `belege_export_${new Date().toISOString().slice(0, 10)}.csv`);
    };

    const handleDownloadZip = async () => {
        await generateZipExport(receipts);
    };

    const handleClear = async () => {
        if (confirm('Wirklich alle Daten löschen? Dies kann nicht rückgängig gemacht werden.')) {
            for (const r of receipts) {
                await removeReceipt(r.id);
            }
            setReceipts([]);
        }
    };

    if (!supabase) {
        return (
            <div className="container" style={{ maxWidth: '600px', margin: '4rem auto', padding: '2rem', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Setup Erforderlich</h2>
                <div style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem' }}>
                    <p>Um die Cloud-Speicherung und Multi-Device-Sync zu nutzen, fehlt noch die Verbindung zu Supabase.</p>
                </div>

                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Schritte:</h3>
                <ol style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                    <li style={{ marginBottom: '0.5rem' }}>Erstelle ein kostenloses Projekt auf <a href="https://supabase.com" target="_blank" style={{ color: '#0070f3' }}>supabase.com</a>.</li>
                    <li style={{ marginBottom: '0.5rem' }}>Gehe zu <strong>Project Settings &rarr; API</strong>.</li>
                    <li style={{ marginBottom: '0.5rem' }}>Kopiere die <strong>Project URL</strong> und den <strong>anon public Key</strong>.</li>
                    <li style={{ marginBottom: '0.5rem' }}>Füge diese in die Datei <code>.env.local</code> ein.</li>
                </ol>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>
                    Starten Sie danach den Server neu (<code>npm run dev</code>).
                </p>
            </div>
        );
    }

    if (loadingAuth) {
        return (
            <div className="container" style={{ textAlign: 'center', marginTop: '6rem' }}>
                <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <p style={{ marginTop: '1rem', color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>Lade Anwendung...</p>
            </div>
        );
    }

    if (supabase && !user) {
        return <Auth />;
    }

    return (
        <main className={styles.main}>
            <header className={styles.header}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 className={styles.title}>Bürokratie Killer</h1>
                        <p className={styles.subtitle}>Der intelligente Rechnungs-Extraktor</p>
                        <div style={{ marginTop: '0.5rem' }}>
                            <Link href="/invoices" style={{ color: 'var(--link)', textDecoration: 'none', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                &rarr; Zur Fakturierung
                            </Link>
                            <br />
                            <Link href="/bank" style={{ color: 'var(--link)', textDecoration: 'none', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '0.25rem' }}>
                                &rarr; Zum Bankabgleich
                            </Link>
                            <br />
                            <Link href="/steuer" style={{ color: 'var(--link)', textDecoration: 'none', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '0.25rem' }}>
                                &rarr; Zur Steuererklärung
                            </Link>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className={styles.secondaryButton}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                    >
                        <LogOut size={16} style={{ marginRight: '6px' }} />
                        Abmelden
                    </button>
                </div>
            </header>

            <div className="container">
                <div className={styles.card}>
                    <DashboardStats receipts={receipts} />

                    <OnboardingHint title="So funktioniert's:" dismissKey="receipt_upload">
                        Laden Sie ein Foto oder Scan Ihres Belegs hoch – die KI erkennt automatisch Datum, Händler, Betrag und MwSt. Sie können alle Werte danach noch bearbeiten.
                    </OnboardingHint>

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
                            <ExportMenu />
                            <button
                                onClick={handleDownloadZip}
                                disabled={receipts.length === 0}
                                className={styles.primaryButton}
                                style={{ backgroundColor: '#2e7d32' }}
                            >
                                <FileArchive size={16} /> Export für Steuerbüro (ZIP)
                            </button>
                            <button
                                onClick={handleClear}
                                disabled={receipts.length === 0}
                                style={{
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    color: 'var(--muted-foreground)', fontSize: '0.75rem', padding: '0.25rem 0.5rem',
                                    textDecoration: 'underline'
                                }}
                                title="Alle Belege unwiderruflich löschen"
                            >
                                Alle löschen
                            </button>
                        </div>
                    </div>

                    <ReceiptTable
                        data={receipts}
                        onUpdate={handleUpdate}
                        onDelete={handleDelete}
                        onVerify={handleVerify}
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
