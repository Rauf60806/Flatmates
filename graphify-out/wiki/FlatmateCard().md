# FlatmateCard()

> God node · 4 connections · [C:\Users\Power\OneDrive\Desktop\projects\Flatmates\client\src\components\flatmates\FlatmateCard.tsx](file:///C:/Users/Power/OneDrive/Desktop/projects/Flatmates/client/src/components/flatmates/FlatmateCard.tsx#L10)

## Call Trace Diagram

```mermaid
sequenceDiagram
    participant P0 as FlatmateCard()
    participant P1 as getInitials()
    participant P2 as getAvatarColor()
    participant P3 as formatCurrency()
    P0->>+ P1: calls
    P1-->>- P0: return
    P1->>+ P0: calls
    P0-->>- P1: return
    P0->>+ P2: calls
    P2-->>- P0: return
    P2->>+ P0: calls
    P0-->>- P2: return
    P0->>+ P3: calls
    P3-->>- P0: return
    P3->>+ P0: calls
    P0-->>- P3: return
```

## Connections by Relation

### calls
- [[getInitials()]] `INFERRED`
- [[getAvatarColor()]] `INFERRED`
- [[formatCurrency()]] `INFERRED`

### contains
- [[FlatmateCard.tsx]] `EXTRACTED`

---

*Part of the graphify knowledge wiki. See [[index]] to navigate.*