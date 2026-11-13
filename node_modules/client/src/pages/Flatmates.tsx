import React, { useState, useEffect, useCallback } from 'react';
import { api, ApiBalanceSummary } from '../api/client';
import { FlatmateCard } from '../components/flatmates/FlatmateCard';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { BalanceCardSkeleton } from '../components/ui/Skeletons';
import { formatCurrency } from '../utils/format';
import { useAuth } from '../context/AuthContext';

interface BalanceData {
  totals: {
    totalOwedToYou: number;
    totalYouOwe: number;
    netBalance: number;
  };
  balances: ApiBalanceSummary[];
}

export const Flatmates: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ApiBalanceSummary | null>(null);
  const [settleAmount, setSettleAmount] = useState('');
  const [settleLoading, setSettleLoading] = useState(false);
  const [settleSuccess, setSettleSuccess] = useState(false);
  const [settleError, setSettleError] = useState('');

  const fetchBalances = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/balances');
      if (res.data.success) {
        setData(res.data);
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  const handleSettle = async () => {
    if (!selected) return;
    const amount = Math.round(parseFloat(settleAmount || '0') * 100);
    if (amount <= 0) {
      setSettleError('Please enter a valid amount.');
      return;
    }

    setSettleLoading(true);
    setSettleError('');
    try {
      await api.post('/settlements', {
        toUserId: selected.userId,
        amount,
      });
      setSettleSuccess(true);
      setTimeout(() => {
        setSelected(null);
        setSettleSuccess(false);
        setSettleAmount('');
        fetchBalances();
      }, 1500);
    } catch (err: any) {
      setSettleError(err?.response?.data?.message || 'Failed to record settlement.');
    }
    setSettleLoading(false);
  };

  const closeModal = () => {
    setSelected(null);
    setSettleAmount('');
    setSettleError('');
    setSettleSuccess(false);
  };

  if (!user) return null;

  return (
    <div className="px-4 md:px-0 pt-5 md:pt-0 pb-8 space-y-6">
      {/* Page Title & Subtitle */}
      <div>
        <h2 className="text-2xl font-extrabold text-ink-light tracking-tight">Flatmates & Balances</h2>
        <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
          Track shared dues, net balances, and settle up with roommates
        </p>
      </div>

      {/* Summary Cards */}
      {data && !loading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-success/5 rounded-2xl p-5 border border-success/15 shadow-sm">
            <p className="text-xs text-ink-muted font-bold uppercase tracking-wider mb-1">
              Owed to you
            </p>
            <p className="text-2xl font-extrabold tabular-nums text-success">
              {formatCurrency(data.totals.totalOwedToYou)}
            </p>
          </div>
          <div className="bg-danger/5 rounded-2xl p-5 border border-danger/15 shadow-sm">
            <p className="text-xs text-ink-muted font-bold uppercase tracking-wider mb-1">
              You owe
            </p>
            <p className="text-2xl font-extrabold tabular-nums text-danger">
              {formatCurrency(data.totals.totalYouOwe)}
            </p>
          </div>
          <div className={`rounded-2xl p-5 border shadow-sm ${
            data.totals.netBalance > 0
              ? 'bg-success/5 border-success/15'
              : data.totals.netBalance < 0
              ? 'bg-danger/5 border-danger/15'
              : 'bg-white border-gray-100'
          }`}>
            <p className="text-xs text-ink-muted font-bold uppercase tracking-wider mb-1">
              Overall Net Position
            </p>
            <p className={`text-2xl font-extrabold tabular-nums ${
              data.totals.netBalance > 0
                ? 'text-success'
                : data.totals.netBalance < 0
                ? 'text-danger'
                : 'text-ink-muted'
            }`}>
              {data.totals.netBalance > 0 ? '+' : ''}{formatCurrency(data.totals.netBalance)}
            </p>
          </div>
        </div>
      )}

      {/* Flatmate Balance Cards - Responsive Grid on Tablet / PC */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-ink-light uppercase tracking-wider">
            All Roommates ({data?.balances.length || 0})
          </h3>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <BalanceCardSkeleton key={i} />)}
          </div>
        ) : data?.balances.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center max-w-md mx-auto">
            <p className="text-4xl mb-3">🏠</p>
            <p className="text-base font-semibold text-ink-light">No other flatmates registered yet</p>
            <p className="text-xs text-ink-muted mt-1.5 leading-relaxed">
              An admin can invite and add flatmates from the Admin panel.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.balances.map((balance) => (
              <FlatmateCard
                key={balance.userId}
                balance={balance}
                onClick={() => setSelected(balance)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selected}
        onClose={closeModal}
        title={selected?.name}
        description={selected?.email}
      >
        {selected && (
          <div className="space-y-5">
            {/* Balance Status */}
            <div
              className={`rounded-2xl px-4 py-3 ${
                selected.status === 'owes_you'
                  ? 'bg-success/8'
                  : selected.status === 'you_owe'
                  ? 'bg-danger/8'
                  : 'bg-gray-50'
              }`}
            >
              <p
                className={`text-sm font-semibold ${
                  selected.status === 'owes_you'
                    ? 'text-success'
                    : selected.status === 'you_owe'
                    ? 'text-danger'
                    : 'text-ink-muted'
                }`}
              >
                {selected.status === 'owes_you'
                  ? `${selected.name.split(' ')[0]} owes you ${formatCurrency(selected.netBalance)}`
                  : selected.status === 'you_owe'
                  ? `You owe ${selected.name.split(' ')[0]} ${formatCurrency(Math.abs(selected.netBalance))}`
                  : 'All settled up!'}
              </p>
            </div>

            {/* Recent Shared Items */}
            {selected.recentSharedItems.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-2">
                  Recent Shared Items
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                  {selected.recentSharedItems.slice(0, 8).map((si) => (
                    <div key={si.id} className="flex items-center justify-between py-1.5 border-b border-gray-50">
                      <div>
                        <p className="text-sm font-medium text-ink-light">{si.name}</p>
                        <p className="text-xs text-ink-muted">
                          {si.payerId === user.id
                            ? `You paid · Their share: ${formatCurrency(si.theirShare)}`
                            : `They paid · Your share: ${formatCurrency(si.yourShare)}`}
                        </p>
                      </div>
                      <span className="text-xs tabular-nums font-semibold text-ink-light">
                        {formatCurrency(si.total)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Settle Up Section */}
            {selected.status !== 'settled' && (
              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-3">
                  Record Settlement
                </h4>

                {settleSuccess ? (
                  <div className="text-center py-4">
                    <p className="text-success font-semibold">Settlement recorded! ✓</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-ink-muted font-medium pointer-events-none">৳</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="1"
                        value={settleAmount}
                        onChange={(e) => { setSettleAmount(e.target.value); setSettleError(''); }}
                        placeholder={`Quick fill: ${(Math.abs(selected.netBalance) / 100).toFixed(0)}`}
                        className="w-full min-h-[48px] pl-8 pr-4 rounded-xl border border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none text-base bg-white text-ink-light"
                      />
                    </div>
                    {settleError && (
                      <p className="text-xs font-medium text-danger">{settleError}</p>
                    )}
                    <Button onClick={handleSettle} fullWidth isLoading={settleLoading}>
                      {selected.status === 'you_owe'
                        ? `Record payment to ${selected.name.split(' ')[0]}`
                        : `Record payment from ${selected.name.split(' ')[0]}`}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
