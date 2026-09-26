# Pull Request: Frontend Test Suite Setup & Stable Modules Coverage

## Overview
This Pull Request introduces the complete unit and integration test infrastructure for the frontend application (`frontend-miifts`) using **Vitest**, **React Testing Library**, and **jsdom**, achieving robust coverage across all stable application modules.

To prevent compatibility issues and unnecessary rework, the specifications in **Sprint 7** (`SPRINT7-BACK.MD`) were analyzed, strategically excluding modules subject to imminent changes (Subjects/Detail, Reminders/Push, Admin Panel, and Corequisites), while documenting pending tests in `Test_Faltantes.md`.

---

## Implemented Changes

### 1. Testing Environment Setup (Phase 1)
- Installed testing dependencies compatible with React 19 and Vite:
  - `vitest`
  - `@testing-library/react`
  - `@testing-library/jest-dom`
  - `jsdom`
  - `@testing-library/user-event`
- Created `vitest.config.ts` integrated with Vite aliases and plugins.
- Created `src/test/setup.ts` for global DOM matchers configuration.
- Added `"test"` and `"test:run"` scripts in `package.json`.

### 2. Base Layer & Storage Tests (Phase 2)
- **`src/auth/storage.test.ts`**: Tests for `localStorage` token read/write, user persistence, corrupted JSON handling, and JWT expiration (`exp`) decoding.
- **`src/lib/apiClient.test.ts`**: Tests for HTTP requests, `Authorization: Bearer` header injection, `204 No Content` response handling, `ApiError` propagation, typed validation error mapping (`422`), and unauthorized session (`401`) callbacks.

### 3. Shared UI Components Tests (Phase 3)
- **`ConfirmDialog.test.tsx`**: Verification of conditional rendering (`open`), configurable texts, and confirmation/close click events.
- **`Paginador.test.tsx`**: Validation of page limits, disabled state on boundary pages, and correct page change emission.
- **`ListState.test.tsx`**: Verification of loading states (`Skeleton`), error states with retry (`ErrorState`), empty states (`EmptyState`), and conditional child rendering.

### 4. Hooks & Stable Modules Tests (Phase 4)
- **`useToast.test.ts`**: Tests for emission, persistence, temporary expiration, and manual dismissal of toast notifications.
- **`useApiForm.test.ts`**: Verification of field error registration and cleanup based on API responses.
- **`ConveniosScreen.test.tsx`**: Tests for tab navigation (Universities / Talento Tech), list rendering, and external link opening.
- **`PerfilScreen.test.tsx`**: Validation of user data rendering, academic statistics, and profile action buttons.

### 5. Scope & Subsequent Documentation
- **`Test_Faltantes.md`**: Detailed breakdown of tests intentionally omitted to avoid conflicts with Sprint 7 changes (Subjects workflow & retaking, Push notifications / Service Worker, and Admin panel for corequisites).

---

## Quality Metrics & Validation
- **Total tests executed:** 33 unit and integration tests.
- **Result:** 100% passing (`9/9` test suites passed).
- **Validation command:** `npm run test:run`
