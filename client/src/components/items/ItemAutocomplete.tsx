import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { api } from '../../api/client';

interface Suggestion {
  name: string;
  lastPrice: number;
}

interface ItemAutocompleteProps {
  value: string;
  onChange: (name: string) => void;
  onSelectSuggestion: (name: string, price: number) => void;
  placeholder?: string;
  error?: string;
}

function useDebounce(value: string, delay: number): string {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export const ItemAutocomplete: React.FC<ItemAutocompleteProps> = ({
  value,
  onChange,
  onSelectSuggestion,
  placeholder = 'e.g. Groceries, Wi-Fi Bill...',
  error,
}) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebounce(value, 300);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/items/suggestions${debouncedQuery ? `?q=${encodeURIComponent(debouncedQuery)}` : ''}`);
        if (response.data.success) {
          setSuggestions(response.data.suggestions || []);
        }
      } catch {
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (showDropdown) {
      fetchSuggestions();
    }
  }, [debouncedQuery, showDropdown]);

  const handleSelect = (suggestion: Suggestion) => {
    onSelectSuggestion(suggestion.name, suggestion.lastPrice);
    setShowDropdown(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          placeholder={placeholder}
          className={`
            w-full min-h-[48px] pl-9 pr-4 rounded-xl border bg-white text-ink-light placeholder-gray-400
            text-base transition-all duration-150 outline-none
            ${error
              ? 'border-danger focus:ring-2 focus:ring-danger/20'
              : 'border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20'
            }
          `}
        />
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-danger">{error}</p>}

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.14 }}
            className="absolute top-full mt-1.5 left-0 right-0 bg-white border border-gray-100 rounded-xl shadow-xl z-30 overflow-hidden"
          >
            {isLoading ? (
              <div className="p-3 text-center text-xs text-ink-muted">Loading...</div>
            ) : suggestions.length === 0 ? (
              <div className="p-3 text-center text-xs text-ink-muted">
                {value ? 'No matching items found' : 'No recent items'}
              </div>
            ) : (
              <ul role="listbox">
                {suggestions.map((suggestion, idx) => (
                  <li
                    key={`${suggestion.name}-${idx}`}
                    role="option"
                    aria-selected={false}
                    onClick={() => handleSelect(suggestion)}
                    className="flex items-center justify-between px-4 py-3 hover:bg-teal/5 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
                  >
                    <span className="text-sm font-medium text-ink-light">{suggestion.name}</span>
                    <span className="text-xs text-ink-muted tabular-nums">
                      Last: ৳{(suggestion.lastPrice / 100).toFixed(0)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
