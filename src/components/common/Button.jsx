import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Reusable Button Component for SIMS (Light Blue & White Theme)
 */
export const Button = React.forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      icon: Icon,
      iconRight: IconRight,
      className = '',
      type = 'button',
      onClick,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed select-none active:scale-[0.98]';

    const variants = {
      primary:
        'bg-[#0284C7] hover:bg-[#0369A1] text-white focus:ring-[#0284C7] shadow-sm hover:shadow',
      secondary:
        'bg-[#E0F2FE] hover:bg-[#BAE6FD] text-[#0369A1] font-semibold focus:ring-[#0284C7] border border-[#BAE6FD]',
      outline:
        'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 focus:ring-slate-300',
      blueOutline:
        'border border-[#0284C7] text-[#0284C7] bg-white hover:bg-[#F0F7FF] focus:ring-[#0284C7]',
      forestOutline:
        'border border-[#0284C7] text-[#0284C7] bg-white hover:bg-[#F0F7FF] focus:ring-[#0284C7]',
      ghost:
        'text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:ring-slate-200',
      danger:
        'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500 shadow-sm',
      subtle:
        'bg-slate-100 hover:bg-slate-200 text-slate-800 focus:ring-slate-200',
    };

    const sizes = {
      xs: 'text-xs px-2.5 py-1.5 gap-1.5',
      sm: 'text-xs sm:text-sm px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2 gap-2',
      lg: 'text-base px-5 py-2.5 gap-2.5',
    };

    const selectedVariant = variants[variant] || variants.primary;
    const selectedSize = sizes[size] || sizes.md;

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        onClick={onClick}
        className={`${baseStyles} ${selectedVariant} ${selectedSize} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : Icon ? (
          <Icon className="w-4 h-4 shrink-0" />
        ) : null}
        <span>{children}</span>
        {!isLoading && IconRight && <IconRight className="w-4 h-4 shrink-0" />}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
