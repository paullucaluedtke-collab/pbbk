"use client";

import { TaxReturn, TaxResult } from '@/types/taxReturn';
import { calculateTax, formatEuro } from '@/utils/taxCalculator';
import { ArrowUp, ArrowDown, TrendingUp, Download, AlertTriangle } from 'lucide-react';
import TaxInfoBox from './TaxInfoBox';

interface StepSummaryProps {
    taxReturn: TaxReturn;
    onDownloadPDF: () => void;
}

export default function StepSummary({ taxReturn, onDownloadPDF }: StepSummaryProps) {
    const result = calculateTax(taxReturn);
    const isRefund = result.estimated_refund > 0;

    const cardStyle: React.CSSProperties = {
        background: 'var(--secondary)', borderRadius: '10px',
        border: '1px solid var(--border)', padding: '1.25rem',
        boxShadow: 'var(--shadow-sm)'
    };

    const rowStyle: React.CSSProperties = {
        display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0',
        fontSize: '0.9rem'
    };

    return (
        <div>
            <h2 style={{ fontSize: '1.25rem', margin: '0 0 0.5rem' }}>Zusammenfassung</h2>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                Übersicht Ihrer Steuererklärung {taxReturn.year}
            </p>

            {/* Hero: Estimated Refund */}
            <div style={{
                ...cardStyle, textAlign: 'center', marginBottom: '1.5rem',
                background: isRefund
                    ? 'linear-gradient(135deg, rgba(22,163,74,0.08), rgba(16,185,129,0.08))'
                    : 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(249,115,22,0.08))',
                border: `1px solid ${isRefund ? 'rgba(22,163,74,0.3)' : 'rgba(239,68,68,0.3)'}`,
                padding: '2rem'
            }}>
                <div style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: '56px', height: '56px', borderRadius: '14px',
                    background: isRefund ? 'var(--success-bg)' : 'var(--danger-bg)',
                    marginBottom: '0.75rem'
                }}>
                    {isRefund ? <ArrowUp size={28} color="var(--success)" /> : <ArrowDown size={28} color="var(--danger)" />}
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)', marginBottom: '0.25rem' }}>
                    {isRefund ? 'Geschätzte Erstattung' : 'Geschätzte Nachzahlung'}
                </div>
                <div style={{
                    fontSize: '2.5rem', fontWeight: 800,
                    color: isRefund ? 'var(--success)' : 'var(--danger)',
                    lineHeight: 1.2
                }}>
                    {isRefund ? '+' : ''}{formatEuro(result.estimated_refund)}
                </div>
            </div>

            <TaxInfoBox type="warning">
                <strong>Hinweis:</strong> Dies ist eine <strong>Schätzung</strong> basierend auf Ihren Angaben.
                Das tatsächliche Ergebnis kann je nach Prüfung durch das Finanzamt abweichen.
                Für die offizielle Abgabe nutzen Sie bitte ELSTER oder einen Steuerberater.
            </TaxInfoBox>

            {/* Tax Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={cardStyle}>
                    <h3 style={{ margin: '0 0 1rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <TrendingUp size={18} color="#8b5cf6" /> Steuerberechnung
                    </h3>
                    <div style={rowStyle}>
                        <span>Zu versteuerndes Einkommen</span>
                        <strong>{formatEuro(result.taxable_income)}</strong>
                    </div>
                    <div style={{ ...rowStyle, borderTop: '1px solid var(--border)' }}>
                        <span>Einkommensteuer</span>
                        <span>{formatEuro(result.income_tax)}</span>
                    </div>
                    <div style={rowStyle}>
                        <span>Solidaritätszuschlag</span>
                        <span>{formatEuro(result.solidarity_surcharge)}</span>
                    </div>
                    {result.church_tax > 0 && (
                        <div style={rowStyle}>
                            <span>Kirchensteuer</span>
                            <span>{formatEuro(result.church_tax)}</span>
                        </div>
                    )}
                    {result.craftsman_credit > 0 && (
                        <div style={{ ...rowStyle, color: 'var(--success)' }}>
                            <span>− Handwerkerermäßigung</span>
                            <span>−{formatEuro(result.craftsman_credit)}</span>
                        </div>
                    )}
                    {result.household_credit > 0 && (
                        <div style={{ ...rowStyle, color: 'var(--success)' }}>
                            <span>− Haushaltshilfe-Ermäßigung</span>
                            <span>−{formatEuro(result.household_credit)}</span>
                        </div>
                    )}
                    <div style={{
                        ...rowStyle, borderTop: '2px solid var(--border)',
                        fontWeight: 700, fontSize: '1rem', paddingTop: '0.75rem'
                    }}>
                        <span>Gesamte Steuerlast</span>
                        <span>{formatEuro(result.total_tax)}</span>
                    </div>
                </div>

                <div style={cardStyle}>
                    <h3 style={{ margin: '0 0 1rem', fontSize: '0.95rem' }}>Bereits bezahlte Steuern</h3>
                    <div style={rowStyle}>
                        <span>Lohnsteuer</span>
                        <span>{formatEuro(taxReturn.income.income_tax_paid)}</span>
                    </div>
                    <div style={rowStyle}>
                        <span>Solidaritätszuschlag</span>
                        <span>{formatEuro(taxReturn.income.soli_paid)}</span>
                    </div>
                    {taxReturn.income.church_tax_paid > 0 && (
                        <div style={rowStyle}>
                            <span>Kirchensteuer</span>
                            <span>{formatEuro(taxReturn.income.church_tax_paid)}</span>
                        </div>
                    )}
                    <div style={{
                        ...rowStyle, borderTop: '2px solid var(--border)',
                        fontWeight: 700, fontSize: '1rem', paddingTop: '0.75rem'
                    }}>
                        <span>Gesamt bezahlt</span>
                        <span>{formatEuro(result.total_already_paid)}</span>
                    </div>

                    <div style={{
                        marginTop: '1rem', padding: '0.75rem', borderRadius: '8px',
                        background: 'var(--accent)', textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>Effektiver Steuersatz</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{result.effective_tax_rate}%</div>
                    </div>
                </div>
            </div>

            {/* Personal Data Summary */}
            <div style={{ ...cardStyle, marginBottom: '1.5rem' }}>
                <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem' }}>Persönliche Daten</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <div>
                        <span style={{ color: 'var(--muted-foreground)' }}>Name:</span>{' '}
                        {taxReturn.personal.first_name} {taxReturn.personal.last_name}
                    </div>
                    <div>
                        <span style={{ color: 'var(--muted-foreground)' }}>Steuer-ID:</span>{' '}
                        {taxReturn.personal.tax_id || '–'}
                    </div>
                    <div>
                        <span style={{ color: 'var(--muted-foreground)' }}>Familienstand:</span>{' '}
                        {taxReturn.personal.marital_status === 'married' ? 'Verheiratet (Splitting)' :
                            taxReturn.personal.marital_status === 'single' ? 'Ledig' :
                                taxReturn.personal.marital_status === 'divorced' ? 'Geschieden' : 'Verwitwet'}
                    </div>
                    <div>
                        <span style={{ color: 'var(--muted-foreground)' }}>Kinder:</span>{' '}
                        {taxReturn.personal.children.length}
                    </div>
                    <div>
                        <span style={{ color: 'var(--muted-foreground)' }}>Kirchenmitglied:</span>{' '}
                        {taxReturn.personal.church_member ? `Ja (${taxReturn.personal.church_tax_rate}%)` : 'Nein'}
                    </div>
                </div>
            </div>

            {/* Download */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button onClick={onDownloadPDF} style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.75rem 2rem', borderRadius: '8px',
                    background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                    color: '#fff', border: 'none', cursor: 'pointer',
                    fontWeight: 600, fontSize: '1rem'
                }}>
                    <Download size={18} /> PDF herunterladen
                </button>
            </div>
        </div>
    );
}
