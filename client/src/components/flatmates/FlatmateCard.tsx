import React from 'react';
import { formatCurrency, getInitials, getAvatarColor } from '../../utils/format';
import { ApiBalanceSummary } from '../../api/client';

interface FlatmateCardProps {
  balance: ApiBalanceSummary;
  onClick: () => void;
}

export const FlatmateCard: React.FC<FlatmateCardProps> = ({ balance, onClick }) => {
  const initials = getInitials(balance.name);
  const avatarBg = getAvatarColor(balance.name);

  const badgeStyle =
    balance.status === 'owes_you'
      ? { bg: 'bg-success/10', text: 'text-success', label: `owes you ${formatCurrency(balance.netBalance)}` }
      : balance.status === 'you_owe'
      ? { bg: 'bg-danger/10', text: 'text-danger', label: `you owe ${formatCurrency(Math.abs(balance.netBalance))}` }
      : { bg: 'bg-gray-100', text: 'text-ink-muted', label: 'settled' };

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3.5 p-4 sm:p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-teal/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all text-left group"
    >
      {/* Avatar */}
      <div className={`w-12 h-12 rounded-full ${avatarBg} flex items-center justify-center flex-shrink-0`}>
        <span className="text-white text-sm font-bold">{initials}</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink-light truncate">{balance.name}</p>
        <p className="text-xs text-ink-muted mt-0.5 truncate">{balance.email}</p>
      </div>

      {/* Balance Badge */}
      <div className={`flex-shrink-0 px-3 py-1.5 rounded-full ${badgeStyle.bg}`}>
        <span className={`text-xs font-semibold ${badgeStyle.text} tabular-nums`}>
          {badgeStyle.label}
        </span>
      </div>
    </button>
  );
};
