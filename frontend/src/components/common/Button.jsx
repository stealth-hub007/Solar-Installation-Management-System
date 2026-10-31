import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Standardized Modern Enterprise Button Component for SIMS
 * Uniform button heights, generous vertical & horizontal padding,
 * modern clean rounded corners, and crisp hover/focus states.
 */
export const Button = React.forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loading = false,
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
    const isSpinning = Boolean(isLoading || loading);

    const baseStyles =
      'inline-flex flex-row flex-nowrap items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0284C7] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none select-none active:scale-[0.98] whitespace-nowrap cursor-pointer tracking-normal shadow-xs';

    const variants = {
      primary:
        'bg-[#0284C7] hover:bg-[#0369A1] text-white border border-[#0284C7] hover:border-[#0369A1] shadow-sm hover:shadow active:bg-[#075985]',
      secondary:
        'bg-sky-50 hover:bg-sky-100 text-[#0369A1] font-semibold border border-[#BAE6FD] hover:border-[#7DD3FC] shadow-xs',
      outline:
        'border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 hover:border-slate-400 shadow-xs',
      blueOutline:
        'border border-[#0284C7] text-[#0284C7] bg-white hover:bg-sky-50 hover:border-[#0369A1] shadow-xs',
      forestOutline:
        'border border-[#0284C7] text-[#0284C7] bg-white hover:bg-sky-50 shadow-xs',
      ghost:
        'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent shadow-none',
      danger:
        'bg-rose-600 hover:bg-rose-700 text-white border border-rose-600 shadow-sm hover:shadow active:bg-rose-800',
      success:
        'bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-600 shadow-sm hover:shadow active:bg-emerald-800',
      subtle:
        'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200/80 shadow-xs',
    };

    // Standardized enterprise dimensions with generous padding & heights
    const sizes = {
      xs: 'h-8 min-h-[32px] px-3 py-1.5 text-xs font-medium gap-1.5 rounded-md',
      sm: 'h-9 min-h-[36px] px-3.5 py-2 text-xs sm:text-sm font-semibold gap-2 rounded-lg',
      md: 'h-10 min-h-[40px] px-4.5 py-2.5 text-sm font-semibold gap-2.5 rounded-lg',
      lg: 'h-11 min-h-[44px] px-5.5 py-3 text-base font-bold gap-3 rounded-lg',
    };

    const selectedVariant = variants[variant] || variants.primary;
    const selectedSize = sizes[size] || sizes.md;

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isSpinning}
        onClick={onClick}
        className={`${baseStyles} ${selectedVariant} ${selectedSize} ${className}`}
        {...props}
      >
        {isSpinning ? (
          <Loader2 className="w-4 h-4 animate-spin text-current shrink-0 mr-1.5" />
        ) : Icon ? (
          <Icon className="w-4 h-4 shrink-0 text-current mr-1.5" />
        ) : null}
        <span className="inline-flex items-center gap-2 whitespace-nowrap text-inherit">
          {children}
        </span>
        {!isSpinning && IconRight && (
          <IconRight className="w-4 h-4 shrink-0 text-current ml-1.5" />
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
