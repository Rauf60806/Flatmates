import React from 'react';
import { motion } from 'framer-motion';
import { Users, User } from 'lucide-react';
import { ApiItem } from '../../api/client';
import { formatCurrency } from '../../utils/format';

interface ItemCardProps {
  item: ApiItem;
  currentUserId: string;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, currentUserId }) => {
  const isGroup = item.type === 'group';
  const userPaid = item.paidById === currentUserId;

  const userSplit = item.splits.find((s) => s.userId === currentUserId);
  const userShare = userSplit ? userSplit.share : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 py-3"
    >
      {/* Type Icon */}
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          isGroup ? 'bg-teal/10 text-teal' : 'bg-slate/10 text-slate'
        }`}
      >
        {isGroup ? <Users className="w-5 h-5" /> : <User className="w-5 h-5" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink-light truncate">{item.name}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span
            className={`text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${
              isGroup
                ? 'bg-teal/10 text-teal'
                : 'bg-slate/10 text-slate'
            }`}
          >
            {isGroup ? 'Group' : 'Individual'}
          </span>
          {item.quantity > 1 && (
            <span className="text-xs text-ink-muted">
              {item.quantity} × {formatCurrency(item.price)}
            </span>
          )}
          {isGroup && (
            <span className="text-xs text-ink-muted truncate">
              {userPaid ? '• You paid' : `• Paid by ${item.paidBy.name.split(' ')[0]}`}
            </span>
          )}
        </div>
      </div>

      {/* Amount */}
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold tabular-nums text-ink-light">
          {formatCurrency(item.total)}
        </p>
        {isGroup && userShare > 0 && (
          <p className="text-[10px] text-ink-muted tabular-nums">
            Your share: {formatCurrency(userShare)}
          </p>
        )}
      </div>
    </motion.div>
  );
};
