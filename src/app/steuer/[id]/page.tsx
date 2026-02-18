"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getTaxReturn, saveTaxStep, submitTaxReturn } from '@/app/actions/taxActions';
import { TaxReturn, TaxStepId } from '@/types/taxReturn';
import TaxProgressBar from '@/components/tax/TaxProgressBar';
import StepPersonal from '@/components/tax/StepPersonal';
import StepIncome from '@/components/tax/StepIncome';
import StepDeductions from '@/components/tax/StepDeductions';
import StepSpecialExpenses from '@/components/tax/StepSpecialExpenses';
import StepExtraordinary from '@/components/tax/StepExtraordinary';
import StepSummary from '@/components/tax/StepSummary';
import { generateTaxPDF } from '@/utils/taxPdfGenerator';
import { Loader2, Save, ArrowLeft, ArrowRight, Check } from 'lucide-react';

const STEPS: TaxStepId[] = ['personal', 'income', 'deductions', 'special', 'extraordinary', 'summary'];

export default function TaxWizardPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [taxReturn, setTaxReturn] = useState<TaxReturn | null>(null);
    const [currentStep, setCurrentStep] = useState<TaxStepId>('personal');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        getTaxReturn(id).then(data => {
            if (data) {
                setTaxReturn(data);
                setCurrentStep(data.current_step || 'personal');
            }
            setLoading(false);
        });
    }, [id]);

    const currentIdx = STEPS.indexOf(currentStep);
    const isFirst = currentIdx === 0;
    const isLast = currentStep === 'summary';

    const getStepData = useCallback(() => {
        if (!taxReturn) return null;
        const map: Record<TaxStepId, any> = {
            personal: taxReturn.personal,
            income: taxReturn.income,
            deductions: taxReturn.deductions,
            special: taxReturn.special_expenses,
            extraordinary: taxReturn.extraordinary,
            summary: null,
        };
        return map[currentStep];
    }, [taxReturn, currentStep]);

    const handleStepDataChange = (data: any) => {
        if (!taxReturn) return;
        const fieldMap: Record<TaxStepId, keyof TaxReturn> = {
            personal: 'personal',
            income: 'income',
            deductions: 'deductions',
            special: 'special_expenses',
            extraordinary: 'extraordinary',
            summary: 'current_step',
        };
        setTaxReturn({ ...taxReturn, [fieldMap[currentStep]]: data });
        setSaved(false);
    };

    const handleSave = async () => {
        if (!taxReturn) return;
        setSaving(true);
        try {
            await saveTaxStep(id, currentStep, getStepData());
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (e) {
            console.error('Save failed:', e);
        } finally {
            setSaving(false);
        }
    };

    const handleNext = async () => {
        if (!taxReturn || isLast) return;
        // Auto-save current step
        setSaving(true);
        try {
            await saveTaxStep(id, currentStep, getStepData());
            const nextStep = STEPS[currentIdx + 1];
            setCurrentStep(nextStep);
        } catch (e) {
            console.error('Save failed:', e);
        } finally {
            setSaving(false);
        }
    };

    const handlePrev = () => {
        if (isFirst) return;
        setCurrentStep(STEPS[currentIdx - 1]);
    };

    const handleStepClick = (step: TaxStepId) => {
        setCurrentStep(step);
    };

    const handleComplete = async () => {
        if (!taxReturn) return;
        setSaving(true);
        try {
            await submitTaxReturn(id);
            setTaxReturn({ ...taxReturn, status: 'Completed' });
        } catch (e) {
            console.error('Submit failed:', e);
        } finally {
            setSaving(false);
        }
    };

    const handleDownloadPDF = () => {
        if (taxReturn) {
            generateTaxPDF(taxReturn);
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', marginTop: '6rem', color: 'var(--muted-foreground)' }}>
                <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
                <p>Lade Steuererklärung...</p>
            </div>
        );
    }

    if (!taxReturn) {
        return (
            <div style={{ textAlign: 'center', marginTop: '6rem' }}>
                <p>Steuererklärung nicht gefunden.</p>
                <button onClick={() => router.push('/steuer')}
                    style={{ marginTop: '1rem', padding: '0.5rem 1.5rem', borderRadius: '6px', background: 'var(--primary)', color: 'var(--primary-foreground)', border: 'none', cursor: 'pointer' }}>
                    Zurück zur Übersicht
                </button>
            </div>
        );
    }

    const cardStyle: React.CSSProperties = {
        background: 'var(--secondary)', borderRadius: '10px',
        border: '1px solid var(--border)', padding: '2rem',
        boxShadow: 'var(--shadow-sm)'
    };

    return (
        <div style={{ maxWidth: '850px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <h1 style={{ fontSize: '1.25rem', margin: 0 }}>Steuererklärung {taxReturn.year}</h1>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {saved && <span style={{ fontSize: '0.8rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}><Check size={14} /> Gespeichert</span>}
                    <button onClick={handleSave} disabled={saving} style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '0.4rem 1rem', borderRadius: '6px',
                        background: 'var(--accent)', color: 'var(--accent-foreground)',
                        border: '1px solid var(--border)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500
                    }}>
                        {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
                        Speichern
                    </button>
                </div>
            </div>

            <TaxProgressBar currentStep={currentStep} onStepClick={handleStepClick} />

            <div style={cardStyle}>
                {currentStep === 'personal' && <StepPersonal data={taxReturn.personal} onChange={d => handleStepDataChange(d)} />}
                {currentStep === 'income' && <StepIncome data={taxReturn.income} onChange={d => handleStepDataChange(d)} />}
                {currentStep === 'deductions' && <StepDeductions data={taxReturn.deductions} onChange={d => handleStepDataChange(d)} />}
                {currentStep === 'special' && <StepSpecialExpenses data={taxReturn.special_expenses} onChange={d => handleStepDataChange(d)} />}
                {currentStep === 'extraordinary' && <StepExtraordinary data={taxReturn.extraordinary} onChange={d => handleStepDataChange(d)} />}
                {currentStep === 'summary' && <StepSummary taxReturn={taxReturn} onDownloadPDF={handleDownloadPDF} />}
            </div>

            {/* Navigation */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem',
                alignItems: 'center'
            }}>
                <button onClick={handlePrev} disabled={isFirst} style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '0.6rem 1.25rem', borderRadius: '8px',
                    background: 'var(--secondary)', color: 'var(--foreground)',
                    border: '1px solid var(--border)', cursor: isFirst ? 'not-allowed' : 'pointer',
                    fontWeight: 600, fontSize: '0.9rem', opacity: isFirst ? 0.4 : 1,
                }}>
                    <ArrowLeft size={16} /> Zurück
                </button>

                {isLast ? (
                    <button onClick={handleComplete} disabled={saving} style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '0.6rem 1.5rem', borderRadius: '8px',
                        background: 'linear-gradient(135deg, #16a34a, #15803d)',
                        color: '#fff', border: 'none', cursor: 'pointer',
                        fontWeight: 600, fontSize: '0.9rem',
                    }}>
                        <Check size={16} /> Abschließen
                    </button>
                ) : (
                    <button onClick={handleNext} disabled={saving} style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '0.6rem 1.5rem', borderRadius: '8px',
                        background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                        color: '#fff', border: 'none', cursor: 'pointer',
                        fontWeight: 600, fontSize: '0.9rem',
                    }}>
                        {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Weiter'}
                        <ArrowRight size={16} />
                    </button>
                )}
            </div>
        </div>
    );
}
