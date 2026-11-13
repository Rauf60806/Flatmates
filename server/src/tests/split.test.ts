import { describe, it, expect } from 'vitest';
import { calculateGroupSplit } from '../services/split.service.js';

describe('split.service - calculateGroupSplit', () => {
  it('divides evenly when total amount is divisible by member count', () => {
    const totalAmount = 30000; // ৳300.00
    const payerId = 'user-a';
    const activeMemberIds = ['user-a', 'user-b', 'user-c'];

    const splits = calculateGroupSplit(totalAmount, payerId, activeMemberIds);

    expect(splits).toHaveLength(3);
    expect(splits.find((s) => s.userId === 'user-a')?.share).toBe(10000);
    expect(splits.find((s) => s.userId === 'user-b')?.share).toBe(10000);
    expect(splits.find((s) => s.userId === 'user-c')?.share).toBe(10000);

    const sum = splits.reduce((acc, s) => acc + s.share, 0);
    expect(sum).toBe(totalAmount);
  });

  it('assigns remainder cents to the payer when not evenly divisible', () => {
    const totalAmount = 1000; // ৳10.00 split among 3 members: 1000 / 3 = 333 rem 1
    const payerId = 'user-a';
    const activeMemberIds = ['user-a', 'user-b', 'user-c'];

    const splits = calculateGroupSplit(totalAmount, payerId, activeMemberIds);

    expect(splits).toHaveLength(3);
    const payerSplit = splits.find((s) => s.userId === 'user-a');
    const memberBSplit = splits.find((s) => s.userId === 'user-b');
    const memberCSplit = splits.find((s) => s.userId === 'user-c');

    expect(payerSplit?.share).toBe(334); // 333 + 1 remainder
    expect(memberBSplit?.share).toBe(333);
    expect(memberCSplit?.share).toBe(333);

    const sum = splits.reduce((acc, s) => acc + s.share, 0);
    expect(sum).toBe(totalAmount);
  });

  it('handles 4 members with remainder 2 cents (payer absorbs all remainder)', () => {
    const totalAmount = 1002; // 1002 / 4 = 250 rem 2
    const payerId = 'user-p';
    const activeMemberIds = ['user-p', 'user-1', 'user-2', 'user-3'];

    const splits = calculateGroupSplit(totalAmount, payerId, activeMemberIds);
    expect(splits.find((s) => s.userId === 'user-p')?.share).toBe(252);
    expect(splits.find((s) => s.userId === 'user-1')?.share).toBe(250);
    expect(splits.find((s) => s.userId === 'user-2')?.share).toBe(250);
    expect(splits.find((s) => s.userId === 'user-3')?.share).toBe(250);

    const sum = splits.reduce((acc, s) => acc + s.share, 0);
    expect(sum).toBe(totalAmount);
  });

  it('handles 1 person split correctly', () => {
    const totalAmount = 5000;
    const payerId = 'user-solo';
    const activeMemberIds = ['user-solo'];

    const splits = calculateGroupSplit(totalAmount, payerId, activeMemberIds);
    expect(splits).toHaveLength(1);
    expect(splits[0].userId).toBe('user-solo');
    expect(splits[0].share).toBe(5000);
  });

  it('automatically includes payer even if omitted from activeMemberIds list', () => {
    const totalAmount = 200;
    const payerId = 'user-payer';
    const activeMemberIds = ['user-other'];

    const splits = calculateGroupSplit(totalAmount, payerId, activeMemberIds);
    expect(splits).toHaveLength(2);
    expect(splits.find((s) => s.userId === 'user-payer')?.share).toBe(100);
    expect(splits.find((s) => s.userId === 'user-other')?.share).toBe(100);
  });

  it('throws error for non-positive or non-integer amounts', () => {
    expect(() => calculateGroupSplit(0, 'user-a', ['user-a'])).toThrow();
    expect(() => calculateGroupSplit(-500, 'user-a', ['user-a'])).toThrow();
    expect(() => calculateGroupSplit(12.5, 'user-a', ['user-a'])).toThrow();
  });

  it('throws error when active member list is empty and payer is missing', () => {
    expect(() => calculateGroupSplit(1000, '', [])).toThrow();
  });
});
