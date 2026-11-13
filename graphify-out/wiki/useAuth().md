# useAuth()

> God node · 3 connections · [C:\Users\Power\OneDrive\Desktop\projects\Flatmates\client\src\context\AuthContext.tsx](file:///C:/Users/Power/OneDrive/Desktop/projects/Flatmates/client/src/context/AuthContext.tsx#L59)

## Call Trace Diagram

```mermaid
sequenceDiagram
    participant P0 as useAuth()
    participant P1 as ProtectedRoute()
    participant P2 as AdminRoute()
    P0->>+ P1: calls
    P1-->>- P0: return
    P1->>+ P0: calls
    P0-->>- P1: return
    P0->>+ P2: calls
    P2-->>- P0: return
    P2->>+ P0: calls
    P0-->>- P2: return
```

## Connections by Relation

### calls
- [[ProtectedRoute()]] `INFERRED`
- [[AdminRoute()]] `INFERRED`

### contains
- [[AuthContext.tsx]] `EXTRACTED`

---

*Part of the graphify knowledge wiki. See [[index]] to navigate.*