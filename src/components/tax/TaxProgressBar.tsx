"use client";

import { TaxStepId } from '@/types/taxReturn';
import { User, Wallet, Briefcase, Heart, Shield, CheckCircle } from 'lucide-react';

interface TaxProgressBarProps {
    currentStep: TaxStepId;
    onStepClick: (step: TaxStepId) => void;
}

const steps: { id: TaxStepId; label: string; icon: React.ElementType }[] = [
    { id: 'personal', label: 'Persönlich', icon: User },
    { id: 'income', label: 'Einkünfte', icon: Wallet },
    { id: 'deductions', label: 'Werbungskosten', icon: Briefcase },
    { id: 'special', label: 'Sonderausgaben', icon: Heart },
    { id: 'extraordinary', label: 'Belastungen', icon: Shield },
    { id: 'summary', label: 'Zusammenfassung', icon: CheckCircle },
];

export default function TaxProgressBar({ currentStep, onStepClick }: TaxProgressBarProps) {
    const currentIdx = steps.findIndex(s => s.id === currentStep);

    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '1rem 0', marginBottom: '2rem', position: 'relative'
        }}>
            {/* Background line */}
            <div style={{
                position: 'absolute', top: '50%', left: '3%', right: '3%',
                height: '3px', background: 'var(--border)', transform: 'translateY(-50%)', zIndex: 0
            }} />
            {/* Progress line */}
            <div style={{
                position: 'absolute', top: '50%', left: '3%',
                width: `${(currentIdx / (steps.length - 1)) * 94}%`,
                height: '3px', background: 'linear-gradient(90deg, #8b5cf6, #6366f1)',
                transform: 'translateY(-50%)', zIndex: 1, transition: 'width 0.3s ease'
            }} />

            {steps.map((step, idx) => {
                const isCompleted = idx < currentIdx;
                const isCurrent = idx === currentIdx;
                const Icon = step.icon;

                return (
                    <button
                        key={step.id}
                        onClick={() => onStepClick(step.id)}
                        style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                            background: 'none', border: 'none', cursor: 'pointer',
                            zIndex: 2, padding: '0.25rem', minWidth: '70px'
                        }}
                    >
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: isCompleted || isCurrent
                                ? 'linear-gradient(135deg, #8b5cf6, #6366f1)'
                                : 'var(--secondary)',
                            border: isCompleted || isCurrent ? 'none' : '2px solid var(--border)',
                            color: isCompleted || isCurrent ? '#fff' : 'var(--muted-foreground)',
                            transition: 'all 0.3s ease',
                            boxShadow: isCurrent ? '0 0 0 4px rgba(139,92,246,0.2)' : 'none',
                        }}>
                            <Icon size={18} />
                        </div>
                        <span style={{
                            fontSize: '0.7rem', fontWeight: isCurrent ? 700 : 500,
                            color: isCurrent ? '#8b5cf6' : isCompleted ? 'var(--foreground)' : 'var(--muted-foreground)',
                        }}>
                            {step.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
