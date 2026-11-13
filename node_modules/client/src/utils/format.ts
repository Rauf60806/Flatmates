/**
 * Formats an integer minor-unit value (poisha/cents) into a currency string in Bangladeshi Taka.
 * e.g. 15050 -> "৳150.50" or 10000 -> "৳100"
 */
export function formatCurrency(minorUnits: number, symbol = '৳'): string {
  const amount = minorUnits / 100;
  if (amount % 1 === 0) {
    return `${symbol}${amount.toLocaleString('en-IN')}`;
  }
  return `${symbol}${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Returns a human-readable relative date label.
 */
export function formatDateLabel(dateStr: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const itemDate = new Date(dateStr);
  itemDate.setHours(0, 0, 0, 0);

  if (itemDate.getTime() === today.getTime()) return 'Today';
  if (itemDate.getTime() === yesterday.getTime()) return 'Yesterday';

  return itemDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: itemDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Extracts initials from a full name (up to 2 chars).
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');
}

/**
 * Returns a consistent avatar background color based on the name.
 */
export function getAvatarColor(name: string): string {
  const colors = [
    'bg-teal',
    'bg-slate',
    'bg-indigo-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-cyan-600',
    'bg-lime-600',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Groups items by their date string (YYYY-MM-DD).
 */
export function groupByDate<T extends { createdAt: string }>(
  items: T[]
): Array<{ label: string; date: string; items: T[] }> {
  const groups = new Map<string, T[]>();

  for (const item of items) {
    const dateKey = item.createdAt.split('T')[0];
    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }
    groups.get(dateKey)!.push(item);
  }

  return Array.from(groups.entries()).map(([date, groupItems]) => ({
    label: formatDateLabel(date),
    date,
    items: groupItems,
  }));
}
