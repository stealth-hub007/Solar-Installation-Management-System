import React from 'react';

/**
 * Enterprise Form Input with inline validation, error messages, and icon support
 */
export const Input = ({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  helperText,
  required = false,
  disabled = false,
  icon: Icon,
  prefix,
  suffix,
  className = '',
  rows,
  ...props
}) => {
  const inputId = id || name || `input-${Math.random().toString(36).substring(2, 9)}`;

  const isTextarea = type === 'textarea';
  const InputComponent = isTextarea ? 'textarea' : 'input';

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between"
        >
          <span>
            {label}
            {required && <span className="text-rose-500 ml-1 font-bold">*</span>}
          </span>
          {helperText && !error && (
            <span className="text-[11px] text-slate-400 font-normal">{helperText}</span>
          )}
        </label>
      )}

      <div className="relative rounded-lg shadow-sm">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}

        {prefix && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 text-xs font-medium">
            {prefix}
          </div>
        )}

        <InputComponent
          id={inputId}
          name={name}
          type={isTextarea ? undefined : type}
          value={value ?? ''}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={placeholder}
          rows={isTextarea ? (rows || 3) : undefined}
          className={`w-full rounded-lg text-xs font-medium transition-all duration-150 outline-none
            ${isTextarea ? 'py-2 px-3' : 'h-9 px-3'}
            ${Icon ? 'pl-9' : ''}
            ${prefix ? 'pl-11' : ''}
            ${suffix ? 'pr-10' : ''}
            ${
              error
                ? 'border-rose-300 bg-rose-50/30 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                : 'border border-slate-200 bg-white text-slate-800 hover:border-slate-300 focus:border-[#0284C7] focus:ring-2 focus:ring-[#E0F2FE]'
            }
            ${disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200' : ''}
          `}
          {...props}
        />

        {suffix && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 text-xs font-medium">
            {suffix}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-[11px] font-medium text-rose-500 flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-rose-500"></span>
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;

