# from

> God node · 4 connections · [C:\Users\Power\OneDrive\Desktop\projects\Flatmates\client\src\pages\Login.tsx](file:///C:/Users/Power/OneDrive/Desktop/projects/Flatmates/client/src/pages/Login.tsx#L11)

## Call Trace Diagram

```mermaid
sequenceDiagram
    participant P0 as from
    participant P1 as groupByDate()
    participant P2 as calculateGroupSplit()
    participant P3 as getSpendingStats()
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
- [[groupByDate()]] `INFERRED`
- [[calculateGroupSplit()]] `INFERRED`
- [[getSpendingStats()]] `INFERRED`

### contains
- [[Login.tsx]] `EXTRACTED`

---

*Part of the graphify knowledge wiki. See [[index]] to navigate.*