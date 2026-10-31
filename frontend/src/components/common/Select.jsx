import React from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Enterprise Form Select with inline validation and label styling
 */
export const Select = ({
  label,
  id,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option...',
  error,
  helperText,
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const selectId = id || name || `select-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
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
        <select
          id={selectId}
          name={name}
          value={value ?? ''}
          onChange={onChange}
          disabled={disabled}
          className={`w-full appearance-none h-9 px-3 pr-8 rounded-lg text-xs font-medium transition-all duration-150 outline-none
            ${
              error
                ? 'border-rose-300 bg-rose-50/30 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                : 'border border-slate-200 bg-white text-slate-800 hover:border-slate-300 focus:border-[#0284C7] focus:ring-2 focus:ring-[#E0F2FE]'
            }
            ${disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200' : ''}
          `}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => {
            const optVal = typeof opt === 'object' ? opt.value : opt;
            const optLabel = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={optVal} value={optVal}>
                {optLabel}
              </option>
            );
          })}
        </select>

        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400">
          <ChevronDown className="w-4 h-4" />
        </div>
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

export default Select;

