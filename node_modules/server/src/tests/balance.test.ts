import { describe, it, expect } from 'vitest';
import {
  calculatePairwiseBalances,
  FlatmateUser,
  ItemWithSplits,
  SettlementRecord,
} from '../services/balance.service.js';

describe('balance.service - calculatePairwiseBalances', () => {
  const userA: FlatmateUser = { id: 'u-a', name: 'Alex', email: 'alex@example.com' };
  const userB: FlatmateUser = { id: 'u-b', name: 'Sam', email: 'sam@example.com' };
  const userC: FlatmateUser = { id: 'u-c', name: 'Jordan', email: 'jordan@example.com' };
  const allUsers = [userA, userB, userC];

  it('calculates debt when User A pays for a group expense', () => {
    // User A pays ৳300 for group item (split 100 each for A, B, C)
    const items: ItemWithSplits[] = [
      {
        id: 'item-1',
        name: 'Groceries',
        price: 30000,
        quantity: 1,
        total: 30000,
        type: 'group',
        paidById: 'u-a',
        createdAt: new Date(),
        splits: [
          { userId: 'u-a', share: 10000 },
          { userId: 'u-b', share: 10000 },
          { userId: 'u-c', share: 10000 },
        ],
      },
    ];

    const balances = calculatePairwiseBalances('u-a', allUsers, items, []);

    const bBalance = balances.find((b) => b.userId === 'u-b');
    const cBalance = balances.find((b) => b.userId === 'u-c');

    expect(bBalance?.netBalance).toBe(10000); // Sam owes Alex ৳100
    expect(bBalance?.status).toBe('owes_you');

    expect(cBalance?.netBalance).toBe(10000); // Jordan owes Alex ৳100
    expect(cBalance?.status).toBe('owes_you');
  });

  it('calculates reciprocal debts and offsets them properly', () => {
    // 1. Alex pays ৳300 for group (100 each for A, B, C)
    // 2. Sam pays ৳600 for group (200 each for A, B, C)
    const items: ItemWithSplits[] = [
      {
        id: 'item-1',
        name: 'Groceries',
        price: 30000,
        quantity: 1,
        total: 30000,
        type: 'group',
        paidById: 'u-a',
        createdAt: new Date('2026-01-01'),
        splits: [
          { userId: 'u-a', share: 10000 },
          { userId: 'u-b', share: 10000 },
          { userId: 'u-c', share: 10000 },
        ],
      },
      {
        id: 'item-2',
        name: 'Electric Bill',
        price: 60000,
        quantity: 1,
        total: 60000,
        type: 'group',
        paidById: 'u-b',
        createdAt: new Date('2026-01-02'),
        splits: [
          { userId: 'u-a', share: 20000 },
          { userId: 'u-b', share: 20000 },
          { userId: 'u-c', share: 20000 },
        ],
      },
    ];

    // From perspective of Alex:
    // Sam owes Alex 100
    // Alex owes Sam 200
    // Net: Alex owes Sam 100 (-10000)
    const alexBalances = calculatePairwiseBalances('u-a', allUsers, items, []);
    const samForAlex = alexBalances.find((b) => b.userId === 'u-b');
    expect(samForAlex?.netBalance).toBe(-10000);
    expect(samForAlex?.status).toBe('you_owe');

    // From perspective of Sam:
    // Sam owes Alex 100
    // Alex owes Sam 200
    // Net: Alex owes Sam 100 (+10000)
    const samBalances = calculatePairwiseBalances('u-b', allUsers, items, []);
    const alexForSam = samBalances.find((b) => b.userId === 'u-a');
    expect(alexForSam?.netBalance).toBe(10000);
    expect(alexForSam?.status).toBe('owes_you');
  });

  it('factors in direct settlements correctly to reach settled balance', () => {
    // Alex owes Sam ৳100 (-10000)
    const items: ItemWithSplits[] = [
      {
        id: 'item-2',
        name: 'Electric Bill',
        price: 30000,
        quantity: 1,
        total: 30000,
        type: 'group',
        paidById: 'u-b',
        createdAt: new Date('2026-01-02'),
        splits: [
          { userId: 'u-a', share: 10000 },
          { userId: 'u-b', share: 10000 },
          { userId: 'u-c', share: 10000 },
        ],
      },
    ];

    // Alex sends ৳100 to Sam via settlement
    const settlements: SettlementRecord[] = [
      {
        id: 'set-1',
        fromUserId: 'u-a',
        toUserId: 'u-b',
        amount: 10000,
        createdAt: new Date('2026-01-03'),
      },
    ];

    const alexBalances = calculatePairwiseBalances('u-a', allUsers, items, settlements);
    const samBalance = alexBalances.find((b) => b.userId === 'u-b');

    expect(samBalance?.netBalance).toBe(0);
    expect(samBalance?.status).toBe('settled');
  });

  it('ignores individual items when computing pairwise balances', () => {
    const items: ItemWithSplits[] = [
      {
        id: 'item-solo',
        name: 'Personal Coffee',
        price: 25000,
        quantity: 1,
        total: 25000,
        type: 'individual',
        paidById: 'u-a',
        createdAt: new Date(),
        splits: [{ userId: 'u-a', share: 25000 }],
      },
    ];

    const balances = calculatePairwiseBalances('u-a', allUsers, items, []);
    for (const b of balances) {
      expect(b.netBalance).toBe(0);
      expect(b.status).toBe('settled');
    }
  });
});
