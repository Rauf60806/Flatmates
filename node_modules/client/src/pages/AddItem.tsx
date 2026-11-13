import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Users, User, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { SegmentedToggle } from '../components/ui/SegmentedToggle';
import { ItemAutocomplete } from '../components/items/ItemAutocomplete';
import { Stepper } from '../components/items/Stepper';
import { Button } from '../components/ui/Button';
import { formatCurrency } from '../utils/format';

type ItemType = 'individual' | 'group';

export const AddItem: React.FC = () => {
  const navigate = useNavigate();

  const [type, setType] = useState<ItemType>('group');
  const [name, setName] = useState('');
  const [priceStr, setPriceStr] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeCount, setActiveCount] = useState(0);

  const [nameError, setNameError] = useState('');
  const [priceError, setPriceError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Load active user count for group split preview
  useEffect(() => {
    const fetchActiveCount = async () => {
      try {
        const res = await api.get('/admin/users');
        if (res.data.success) {
          const count = (res.data.users || []).filter((u: any) => u.active).length;
          setActiveCount(count);
        }
      } catch {
        setActiveCount(0);
      }
    };
    fetchActiveCount();
  }, []);

  const priceInPaise = Math.round(parseFloat(priceStr || '0') * 100);
  const totalInPaise = priceInPaise * quantity;
  const isValidPrice = priceInPaise > 0;

  const perPersonShare = activeCount > 0 && isValidPrice
    ? Math.floor(totalInPaise / activeCount)
    : 0;

  const handleSelectSuggestion = (suggName: string, suggPrice: number) => {
    setName(suggName);
    setPriceStr((suggPrice / 100).toString());
    setNameError('');
    setPriceError('');
  };

  const validate = (): boolean => {
    let valid = true;
    if (!name.trim()) {
      setNameError('Please enter an item name.');
      valid = false;
    } else {
      setNameError('');
    }
    if (!isValidPrice) {
      setPriceError('Please enter a valid price greater than 0.');
      valid = false;
    } else {
      setPriceError('');
    }
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await api.post('/items', {
        name: name.trim(),
        price: priceInPaise,
        quantity,
        type,
      });

      setIsSuccess(true);

      setTimeout(() => {
        navigate('/', { replace: true });
      }, 1200);
    } catch (err: any) {
      setSubmitError(err?.response?.data?.message || 'Failed to record expense. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15, stiffness: 300 }}
          className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mb-5"
        >
          <Check className="w-10 h-10 text-success" strokeWidth={3} />
        </motion.div>
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl font-bold text-ink-light"
        >
          Expense Recorded!
        </motion.h3>
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-ink-muted mt-1"
        >
          {type === 'group' ? 'Split among all active flatmates.' : 'Added to your individual expenses.'}
        </motion.p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-0 pt-3 md:pt-0 pb-10 space-y-6">
      {/* Back button & Page Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="hidden md:inline-flex p-2 text-ink-muted hover:text-ink-light rounded-xl hover:bg-gray-100 transition-colors"
          aria-label="Back to home"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-extrabold text-ink-light tracking-tight">Add Expense</h2>
          <p className="text-xs sm:text-sm text-ink-muted mt-0.5">Record a new shared or individual item</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* Type Toggle */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-2">Expense Type</p>
            <SegmentedToggle
              value={type}
              onChange={(v) => setType(v as ItemType)}
              className="w-full"
              options={[
                { value: 'group', label: 'Group Expense', icon: <Users className="w-4 h-4" /> },
                { value: 'individual', label: 'Individual Expense', icon: <User className="w-4 h-4" /> },
              ]}
            />
            <AnimatePresence>
              {type === 'group' && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-xs text-teal mt-2 font-medium flex items-center gap-1.5"
                >
                  <span>👥</span> Split equally among {activeCount} active flatmates
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Responsive 2-Column Grid on Tablet/PC for Item Name and Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Item Name Autocomplete */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5">Item Name</p>
              <ItemAutocomplete
                value={name}
                onChange={(v) => { setName(v); setNameError(''); }}
                onSelectSuggestion={handleSelectSuggestion}
                error={nameError}
              />
            </div>

            {/* Price Input */}
            <div>
              <label
                htmlFor="price-input"
                className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5"
              >
                Unit Price
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-ink-muted text-base font-medium pointer-events-none">৳</span>
                <input
                  id="price-input"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={priceStr}
                  onChange={(e) => { setPriceStr(e.target.value); setPriceError(''); }}
                  placeholder="0.00"
                  className={`
                    w-full min-h-[48px] pl-8 pr-4 rounded-xl border bg-white text-ink-light placeholder-gray-400
                    text-base transition-all duration-150 outline-none tabular-nums
                    ${priceError
                      ? 'border-danger focus:ring-2 focus:ring-danger/20'
                      : 'border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20'
                    }
                  `}
                />
              </div>
              {priceError && <p className="mt-1.5 text-xs font-medium text-danger">{priceError}</p>}
            </div>
          </div>

          {/* Quantity Stepper */}
          <div className="bg-gray-50/80 border border-gray-100 rounded-2xl p-4">
            <Stepper value={quantity} onChange={setQuantity} label="Quantity" />
          </div>

          {/* Live Total Preview */}
          <AnimatePresence>
            {isValidPrice && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-teal/5 border border-teal/20 rounded-2xl p-5 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-ink-light">Total Expense</span>
                  <span className="text-2xl font-extrabold tabular-nums text-teal">
                    {formatCurrency(totalInPaise)}
                  </span>
                </div>
                {type === 'group' && activeCount > 0 && (
                  <div className="flex items-center justify-between pt-2.5 border-t border-teal/15">
                    <span className="text-xs text-ink-muted">Your estimated share ({activeCount} flatmates)</span>
                    <span className="text-sm font-bold tabular-nums text-ink-light">
                      ~{formatCurrency(perPersonShare)} / person
                    </span>
                  </div>
                )}
                {type === 'group' && (
                  <p className="text-[11px] text-ink-muted">
                    Exact calculation: Any odd paise/cents remainder is absorbed by the payer.
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {submitError && (
            <div className="text-sm text-danger bg-danger/5 border border-danger/20 rounded-xl px-4 py-3">
              {submitError}
            </div>
          )}

          <div className="pt-2">
            <Button type="submit" fullWidth size="lg" isLoading={isSubmitting}>
              Record Expense
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
