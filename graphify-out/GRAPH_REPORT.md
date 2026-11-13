# Graph Report - C:\Users\Power\OneDrive\Desktop\projects\Flatmates  (2026-11-13)

## Corpus Check
- 49 files · ~16,976 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 318 nodes · 326 edges · 31 communities detected
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]

## God Nodes (most connected - your core abstractions)
1. `FlatmateCard()` - 4 edges
2. `from` - 4 edges
3. `useAuth()` - 3 edges
4. `app` - 2 edges
5. `COUNT` - 2 edges
6. `navigate` - 2 edges
7. `handleLogout()` - 2 edges
8. `ProtectedRoute()` - 2 edges
9. `AdminRoute()` - 2 edges
10. `validate()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `calculateGroupSplit()` --calls--> `from`  [INFERRED]
  C:\Users\Power\OneDrive\Desktop\projects\Flatmates\server\src\services\split.service.ts → C:\Users\Power\OneDrive\Desktop\projects\Flatmates\client\src\pages\Login.tsx
- `seedAdmin()` --calls--> `COUNT`  [INFERRED]
  C:\Users\Power\OneDrive\Desktop\projects\Flatmates\server\src\config\seedAdmin.ts → C:\Users\Power\OneDrive\Desktop\projects\Flatmates\client\src\components\charts\TrendChart.tsx
- `FlatmateCard()` --calls--> `getInitials()`  [INFERRED]
  C:\Users\Power\OneDrive\Desktop\projects\Flatmates\client\src\components\flatmates\FlatmateCard.tsx → C:\Users\Power\OneDrive\Desktop\projects\Flatmates\client\src\utils\format.ts
- `FlatmateCard()` --calls--> `getAvatarColor()`  [INFERRED]
  C:\Users\Power\OneDrive\Desktop\projects\Flatmates\client\src\components\flatmates\FlatmateCard.tsx → C:\Users\Power\OneDrive\Desktop\projects\Flatmates\client\src\utils\format.ts
- `FlatmateCard()` --calls--> `formatCurrency()`  [INFERRED]
  C:\Users\Power\OneDrive\Desktop\projects\Flatmates\client\src\components\flatmates\FlatmateCard.tsx → C:\Users\Power\OneDrive\Desktop\projects\Flatmates\client\src\utils\format.ts

## Communities

### Community 0 - "Community 0"
_Manages user login, password changes, validation, token issuance, and rate limiting for security._
Cohesion: 0.05
Nodes (32): app, changePasswordSchema, { email, password }, isPasswordValid, isValid, loginLimiter, loginSchema, { oldPassword, newPassword } (+24 more)

### Community 1 - "Community 1"

Cohesion: 0.1
Nodes (17): activeUserIds, activeUsers, calculatedSplits, createItemSchema, item, listItemsQuerySchema, { name, price, quantity, type }, { page = 1, limit = 15, type } (+9 more)

### Community 2 - "Community 2"

Cohesion: 0.1
Nodes (13): FlatmateCard(), formatCurrency(), getAvatarColor(), getInitials(), groupByDate(), [email, setEmail], [error, setError], from (+5 more)

### Community 3 - "Community 3"

Cohesion: 0.11
Nodes (17): [activeCount, setActiveCount], handleSubmit(), [isSubmitting, setIsSubmitting], [isSuccess, setIsSuccess], isValidPrice, [name, setName], [nameError, setNameError], navigate (+9 more)

### Community 4 - "Community 4"

Cohesion: 0.11
Nodes (17): activeCount, avatarBg, [createError, setCreateError], [createLoading, setCreateLoading], fetchUsers, handleCreateUser(), initials, [loading, setLoading] (+9 more)

### Community 5 - "Community 5"

Cohesion: 0.11
Nodes (18): fetchItems, fetchMonthTotal, fetchSummary, grouped, groupSpendMonth, handleLoadMore(), [hasMore, setHasMore], indSpendMonth (+10 more)

### Community 6 - "Community 6"

Cohesion: 0.12
Nodes (12): currentUserId, fromUserId, recipient, recordSettlementSchema, router, settlement, { toUserId, amount, fromUserId: specifiedFromId }, period (+4 more)

### Community 7 - "Community 7"

Cohesion: 0.13
Nodes (11): barW, groupH, indH, rect, SLATE, svgRef, TEAL, [tooltip, setTooltip] (+3 more)

### Community 8 - "Community 8"

Cohesion: 0.13
Nodes (14): alexBalances, alexForSam, allUsers, balances, bBalance, cBalance, items, samBalance (+6 more)

### Community 9 - "Community 9"

Cohesion: 0.14
Nodes (13): { active, name, resetPassword, role }, createUserSchema, existing, id, { name, email, temporaryPassword, role }, passwordHash, router, salt (+5 more)

### Community 10 - "Community 10"

Cohesion: 0.15
Nodes (11): BAR_W, CHART_H, GAP, [hoverIdx, setHoverIdx], isCurrentMonth, isHovered, maxTotal, TEAL (+3 more)

### Community 11 - "Community 11"

Cohesion: 0.17
Nodes (12): avatarBg, DESKTOP_NAV_ITEMS, handleLogout(), Icon, initials, isActive, isAdd, isAdmin (+4 more)

### Community 12 - "Community 12"

Cohesion: 0.17
Nodes (9): [data, setData], fetchBalances, [loading, setLoading], [selected, setSelected], [settleAmount, setSettleAmount], [settleError, setSettleError], [settleLoading, setSettleLoading], [settleSuccess, setSettleSuccess] (+1 more)

### Community 13 - "Community 13"

Cohesion: 0.18
Nodes (8): allUsers, balances, currentUserId, groupItems, router, settlements, totalOwedToYou, totalYouOwe

### Community 14 - "Community 14"

Cohesion: 0.2
Nodes (5): containerRef, debouncedQuery, [isLoading, setIsLoading], [showDropdown, setShowDropdown], [suggestions, setSuggestions]

### Community 15 - "Community 15"

Cohesion: 0.22
Nodes (8): activeMemberIds, memberBSplit, memberCSplit, payerId, payerSplit, splits, sum, totalAmount

### Community 16 - "Community 16"

Cohesion: 0.33
Nodes (5): AuthContext, AuthProvider, useAuth(), AdminRoute(), ProtectedRoute()

### Community 17 - "Community 17"

Cohesion: 0.33
Nodes (4): currentMonthKey, [loading, setLoading], now, [stats, setStats]

### Community 18 - "Community 18"

Cohesion: 0.5
Nodes (3): baseStyles, sizeStyles, variantStyles

### Community 19 - "Community 19"
_Unable to determine domain due to missing code entities._
Cohesion: 0.67
Nodes (0): 

### Community 20 - "Community 20"
_The domain manages the active/inactive state of entities within the system._
Cohesion: 0.67
Nodes (1): isActive

### Community 21 - "Community 21"
_Provides a RESTful interface for clients to interact with the backend services._
Cohesion: 1.0
Nodes (1): api

### Community 22 - "Community 22"
_Unable to determine domain due to missing code entities._
Cohesion: 1.0
Nodes (0): 

### Community 23 - "Community 23"

Cohesion: 1.0
Nodes (1): CountUp

### Community 24 - "Community 24"

Cohesion: 1.0
Nodes (1): inputId

### Community 25 - "Community 25"

Cohesion: 1.0
Nodes (1): heights

### Community 26 - "Community 26"
_Unable to determine domain due to missing code entities._
Cohesion: 1.0
Nodes (0): 

### Community 27 - "Community 27"
_Unable to determine domain due to missing code entities._
Cohesion: 1.0
Nodes (0): 

### Community 28 - "Community 28"
_Unable to determine domain due to missing code entities._
Cohesion: 1.0
Nodes (0): 

### Community 29 - "Community 29"
_Unable to determine domain due to missing code entities._
Cohesion: 1.0
Nodes (0): 

### Community 30 - "Community 30"
_Unable to determine domain due to missing code entities._
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **213 isolated node(s):** `api`, `TEAL`, `SLATE`, `[tooltip, setTooltip]`, `svgRef` (+208 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 21`** (2 nodes): `client.ts`, `api`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (2 nodes): `ItemCard.tsx`, `ItemCard()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (2 nodes): `CountUp.tsx`, `CountUp`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (2 nodes): `Input.tsx`, `inputId`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (2 nodes): `Skeletons.tsx`, `heights`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (1 nodes): `postcss.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (1 nodes): `tailwind.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (1 nodes): `vite.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (1 nodes): `main.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (1 nodes): `Modal.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.