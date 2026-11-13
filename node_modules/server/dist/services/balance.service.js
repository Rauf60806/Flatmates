/**
 * Calculates net pairwise financial balances between currentUserId and every other flatmate.
 */
export function calculatePairwiseBalances(currentUserId, allUsers, allItems, allSettlements) {
    const otherUsers = allUsers.filter((u) => u.id !== currentUserId);
    return otherUsers.map((otherUser) => {
        let theyOweYou = 0;
        let youOweThem = 0;
        const sharedItems = [];
        // Process group items
        for (const item of allItems) {
            if (item.type !== 'group')
                continue;
            const userSplit = item.splits.find((s) => s.userId === currentUserId);
            const otherSplit = item.splits.find((s) => s.userId === otherUser.id);
            // Case 1: You paid, other flatmate was included in split
            if (item.paidById === currentUserId && otherSplit) {
                theyOweYou += otherSplit.share;
                sharedItems.push({
                    id: item.id,
                    name: item.name,
                    total: item.total,
                    payerId: item.paidById,
                    yourShare: userSplit ? userSplit.share : 0,
                    theirShare: otherSplit.share,
                    createdAt: item.createdAt,
                });
            }
            // Case 2: Other flatmate paid, you were included in split
            else if (item.paidById === otherUser.id && userSplit) {
                youOweThem += userSplit.share;
                sharedItems.push({
                    id: item.id,
                    name: item.name,
                    total: item.total,
                    payerId: item.paidById,
                    yourShare: userSplit.share,
                    theirShare: otherSplit ? otherSplit.share : 0,
                    createdAt: item.createdAt,
                });
            }
        }
        // Settlements: money sent from A to B reduces what A owes B
        // Settlements: money sent from B to A reduces what B owes A
        let settledFromYou = 0;
        let settledToYou = 0;
        for (const s of allSettlements) {
            if (s.fromUserId === currentUserId && s.toUserId === otherUser.id) {
                settledFromYou += s.amount;
            }
            else if (s.fromUserId === otherUser.id && s.toUserId === currentUserId) {
                settledToYou += s.amount;
            }
        }
        // Net balance = (what they owe you - what you owe them) + (money you paid them - money they paid you)
        const netBalance = (theyOweYou - youOweThem) + (settledFromYou - settledToYou);
        let status = 'settled';
        if (netBalance > 0) {
            status = 'owes_you';
        }
        else if (netBalance < 0) {
            status = 'you_owe';
        }
        return {
            userId: otherUser.id,
            name: otherUser.name,
            email: otherUser.email,
            active: otherUser.active ?? true,
            netBalance,
            status,
            theyOweYouTotal: theyOweYou,
            youOweThemTotal: youOweThem,
            settledFromYou,
            settledToYou,
            recentSharedItems: sharedItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        };
    });
}
