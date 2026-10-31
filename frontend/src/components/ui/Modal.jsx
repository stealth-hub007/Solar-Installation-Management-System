import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size,
  maxWidth = 'max-w-lg',
  footer,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeMap = {
    xs: 'max-w-sm',
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-2xl',
    xl: 'max-w-3xl',
    '2xl': 'max-w-4xl',
    full: 'max-w-5xl',
  };

  const resolvedWidth = size ? sizeMap[size] || size : maxWidth;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Centering container with margin bounds */}
      <div className="flex min-h-full items-center justify-center p-3 sm:p-6 text-left">
        {/* Dialog box with internal scroll protection */}
        <div
          role="dialog"
          aria-modal="true"
          className={`relative w-full ${resolvedWidth} my-auto rounded-2xl bg-white shadow-2xl border border-slate-200/90 z-10 transition-all flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200`}
        >
          {/* Header (pinned) */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0 bg-white">
            <div className="pr-4 min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate">{title}</h3>
              {subtitle && <p className="text-xs text-slate-500 mt-0.5 truncate">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body (scrolls smoothly) */}
          <div className="p-6 overflow-y-auto flex-1 overscroll-contain text-slate-700">
            {children}
          </div>

          {/* Optional Footer (pinned) */}
          {footer && (
            <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-end gap-3 shrink-0 rounded-b-2xl">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
