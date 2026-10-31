import React from 'react';
import { Search, X } from 'lucide-react';

export const SearchBar = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search records...',
  className = '',
  size = 'md', // 'sm' | 'md'
}) => {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search
        className={`absolute left-3 text-slate-400 pointer-events-none ${
          size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'
        }`}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 transition-all outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-[#E0F2FE] hover:border-slate-300
          ${size === 'sm' ? 'h-8 pl-8 pr-7 text-xs' : 'h-9 pl-9 pr-8 text-xs font-medium'}
        `}
      />
      {value && (
        <button
          type="button"
          onClick={() => (onClear ? onClear() : onChange(''))}
          className="absolute right-2.5 p-0.5 text-slate-400 hover:text-slate-600 rounded"
          title="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;

