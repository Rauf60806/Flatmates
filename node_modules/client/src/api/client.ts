import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  active?: boolean;
}

export interface ApiItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
  type: 'individual' | 'group';
  paidById: string;
  createdAt: string;
  updatedAt: string;
  paidBy: {
    id: string;
    name: string;
    email: string;
  };
  splits: Array<{
    id: string;
    userId: string;
    share: number;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
}

export interface ApiBalanceSummary {
  userId: string;
  name: string;
  email: string;
  active: boolean;
  netBalance: number;
  status: 'owes_you' | 'you_owe' | 'settled';
  theyOweYouTotal: number;
  youOweThemTotal: number;
  settledFromYou: number;
  settledToYou: number;
  recentSharedItems: Array<{
    id: string;
    name: string;
    total: number;
    payerId: string;
    yourShare: number;
    theirShare: number;
    createdAt: string;
  }>;
}

export interface ApiStatsOverview {
  currentMonthTotal: number;
  lastMonthTotal: number;
  percentageChange: number;
  changeDirection: 'increased' | 'decreased' | 'unchanged';
  dailyAverage: number;
  highestSpendingDay: {
    date: string;
    amount: number;
  } | null;
  topItems: Array<{
    name: string;
    totalAmount: number;
    percentage: number;
  }>;
  sixMonthTrend: Array<{
    monthKey: string;
    monthLabel: string;
    year: number;
    groupSpend: number;
    individualSpend: number;
    totalSpend: number;
  }>;
  insight: string;
}

export interface ApiDailySummary {
  date: string;
  groupSpend: number;
  individualSpend: number;
  totalSpend: number;
}
