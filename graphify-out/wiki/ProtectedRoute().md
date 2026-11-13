# ProtectedRoute()

> God node · 2 connections · [C:\Users\Power\OneDrive\Desktop\projects\Flatmates\client\src\components\layout\RouteGuards.tsx](file:///C:/Users/Power/OneDrive/Desktop/projects/Flatmates/client/src/components/layout/RouteGuards.tsx#L5)

## Call Trace Diagram

```mermaid
sequenceDiagram
    participant P0 as ProtectedRoute()
    participant P1 as useAuth()
    participant P2 as AdminRoute()
    P0->>+ P1: calls
    P1-->>- P0: return
    P1->>+ P0: calls
    P0-->>- P1: return
    P1->>+ P2: calls
    P2-->>- P1: return
    P2->>+ P1: calls
    P1-->>- P2: return
```

## Connections by Relation

### calls
- [[useAuth()]] `INFERRED`

### contains
- [[RouteGuards.tsx]] `EXTRACTED`

---

*Part of the graphify knowledge wiki. See [[index]] to navigate.*