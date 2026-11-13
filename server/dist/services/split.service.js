/**
 * Calculates exact minor-unit shares for a group expense among active flatmates.
 * To eliminate floating-point rounding errors and cents loss, any remainder
 * is assigned to the paying member so sum(shares) === totalAmount exactly.
 */
export function calculateGroupSplit(totalAmount, payerId, activeMemberIds) {
    if (!Number.isInteger(totalAmount) || totalAmount <= 0) {
        throw new Error('Total amount must be a positive integer in minor units (paise/cents)');
    }
    if (!activeMemberIds || activeMemberIds.length === 0) {
        throw new Error('Active members list cannot be empty for group split');
    }
    // Ensure payer is part of the split even if missing from activeMemberIds list
    const memberSet = new Set(activeMemberIds);
    memberSet.add(payerId);
    const uniqueMembers = Array.from(memberSet);
    const n = uniqueMembers.length;
    const baseShare = Math.floor(totalAmount / n);
    const remainder = totalAmount % n;
    const splits = uniqueMembers.map((userId) => {
        const isPayer = userId === payerId;
        return {
            userId,
            share: isPayer ? baseShare + remainder : baseShare,
        };
    });
    // Self-verification check: sum of shares must be identical to totalAmount
    const calculatedSum = splits.reduce((acc, curr) => acc + curr.share, 0);
    if (calculatedSum !== totalAmount) {
        throw new Error(`Split sum mismatch: expected ${totalAmount}, got ${calculatedSum}`);
    }
    return splits;
}
