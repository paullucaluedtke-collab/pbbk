"use client";

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastMessage {
    id: number;
    type: ToastType;
    text: string;
}

interface ToastContextType {
    showToast: (text: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => { } });

export function useToast() {
    return useContext(ToastContext);
}

let globalToastId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const showToast = useCallback((text: string, type: ToastType = 'success') => {
        const id = ++globalToastId;
        setToasts(prev => [...prev, { id, type, text }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    const dismiss = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const iconMap = {
        success: <CheckCircle size={18} color="#16a34a" />,
        error: <XCircle size={18} color="#ef4444" />,
        info: <Info size={18} color="#2563eb" />,
        warning: <AlertTriangle size={18} color="#f59e0b" />,
    };

    const borderMap = {
        success: '#bbf7d0',
        error: '#fecaca',
        info: '#bfdbfe',
        warning: '#fde68a',
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div style={{
                position: 'fixed', bottom: '1.5rem', right: '1.5rem',
                display: 'flex', flexDirection: 'column', gap: '0.5rem',
                zIndex: 9999, maxWidth: '400px'
            }}>
                {toasts.map(t => (
                    <div key={t.id} style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        padding: '0.75rem 1rem',
                        background: 'white', borderRadius: '8px',
                        border: `1px solid ${borderMap[t.type]}`,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                        animation: 'slideIn 0.3s ease-out',
                        fontSize: '0.875rem', color: '#0f172a'
                    }}>
                        {iconMap[t.type]}
                        <span style={{ flex: 1 }}>{t.text}</span>
                        <button onClick={() => dismiss(t.id)} style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: '#94a3b8', padding: '2px'
                        }}>
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </ToastContext.Provider>
    );
}
