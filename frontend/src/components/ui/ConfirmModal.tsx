import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, Trash2, Loader2 } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
  type = 'danger'
}) => {
  const colors = {
    danger: {
      bg: 'bg-red-50',
      text: 'text-red-500',
      border: 'border-red-100',
      button: 'bg-red-500 hover:bg-red-600 shadow-red-200'
    },
    warning: {
      bg: 'bg-amber-50',
      text: 'text-amber-500',
      border: 'border-amber-100',
      button: 'bg-amber-500 hover:bg-amber-600 shadow-amber-200'
    },
    info: {
      bg: 'bg-blue-50',
      text: 'text-blue-500',
      border: 'border-blue-100',
      button: 'bg-primary hover:bg-primary-dark shadow-primary/20'
    }
  };

  const activeColors = colors[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            onClick={onClose} 
          />
          
          {/* Modal Content */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.9, opacity: 0, y: 20 }} 
            className="relative bg-white rounded-3xl p-8 md:p-10 w-full max-w-md shadow-2xl overflow-hidden border border-slate-100"
          >
            <div className="absolute top-0 right-0 p-4">
              <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className={`w-20 h-20 ${activeColors.bg} ${activeColors.text} rounded-3xl flex items-center justify-center mb-8 shadow-inner`}>
                {type === 'danger' ? <Trash2 className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
              </div>
              
              <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{title}</h2>
              <p className="text-slate-500 font-medium leading-relaxed mb-10">
                {message}
              </p>

              <div className="flex w-full gap-4">
                <button 
                  onClick={onClose}
                  className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl font-bold hover:bg-slate-100 transition-all active:scale-95"
                >
                  {cancelText}
                </button>
                <button 
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`flex-[1.5] py-4 text-white rounded-2xl font-bold transition-all active:scale-95 shadow-xl flex items-center justify-center gap-2 ${activeColors.button} disabled:opacity-50`}
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
