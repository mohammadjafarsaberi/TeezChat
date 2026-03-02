import { X } from 'lucide-react';
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

type ToastVariant = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    title?: string;
    description: string;
    variant: ToastVariant;
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).substring(7);
        setToasts((prev) => [...prev, { ...toast, id }]);

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}

function ToastContainer({
    toasts,
    onRemove,
}: {
    toasts: Toast[];
    onRemove: (id: string) => void;
}) {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
            ))}
        </div>
    );
}

function ToastItem({
    toast,
    onRemove,
}: {
    toast: Toast;
    onRemove: (id: string) => void;
}) {
    const variantStyles = {
        success: 'border-brand-primary/30 bg-brand-muted text-foreground',
        error: 'border-red-200 bg-red-50 text-red-900',
        info: 'border-blue-200 bg-blue-50 text-blue-900',
        warning: 'border-yellow-200 bg-yellow-50 text-yellow-900',
    };

    return (
        <Alert
            className={`min-w-[300px] max-w-md animate-in slide-in-from-top-5 fade-in ${variantStyles[toast.variant]}`}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    {toast.title && (
                        <AlertTitle className="mb-1">{toast.title}</AlertTitle>
                    )}
                    <AlertDescription className="text-sm">
                        {toast.description}
                    </AlertDescription>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-transparent"
                    onClick={() => onRemove(toast.id)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </Alert>
    );
}
