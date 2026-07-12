import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-24 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map(toast => (
          <div 
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3 min-w-[300px] max-w-sm rounded-lg shadow-elevated animate-fade-in-right transform transition-all duration-300
              ${toast.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 
                toast.type === 'error' ? 'bg-red-50 border border-red-200 text-red-800' : 
                'bg-sky-50 border border-sky-200 text-sky-800'}
            `}
          >
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />}
            
            <p className="text-sm font-medium flex-1 pt-0.5">{toast.message}</p>
            
            <button 
              onClick={() => removeToast(toast.id)}
              className={`p-1 rounded-full transition-colors shrink-0
                ${toast.type === 'success' ? 'hover:bg-green-100 text-green-600' : 
                  toast.type === 'error' ? 'hover:bg-red-100 text-red-600' : 
                  'hover:bg-sky-100 text-sky-600'}
              `}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
