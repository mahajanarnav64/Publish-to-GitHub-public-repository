# 📏 MockPro UI — Project Rules & Conventions

> **Version**: 1.0.0 | **Last Updated**: 2026-02-12
> **Project**: MockPro UI (`ui-mockpro`)
> **Stack**: React 18 · Redux Toolkit · Ant Design 5 · SCSS · Webpack 5

These rules define the coding standards, conventions, and architectural patterns for the MockPro UI codebase. Every developer (and AI assistant) must follow these rules when adding, modifying, or reviewing code.

---

## Table of Contents

1. [Project Architecture](#1-project-architecture)
2. [File & Naming Conventions](#2-file--naming-conventions)
3. [React Component Rules](#3-react-component-rules)
4. [Redux Rules](#4-redux-rules)
5. [API & Networking Rules](#5-api--networking-rules)
6. [Error Handling Rules](#6-error-handling-rules)
7. [Styling Rules](#7-styling-rules)
8. [Routing Rules](#8-routing-rules)
9. [Security Rules](#9-security-rules)
10. [Performance Rules](#10-performance-rules)
11. [Dependency Rules](#11-dependency-rules)
12. [Code Style Rules](#12-code-style-rules)
13. [Git & Workflow Rules](#13-git--workflow-rules)

---

## 1. Project Architecture

### 1.1 Directory Structure

```
src/
├── App.jsx                    # Root: All route definitions
├── index.jsx                  # Entry: Provider tree (Redux, Router, Theme, OAuth)
├── axios-instance.jsx         # Singleton: Axios with interceptors (401/403)
├── theme-context.jsx          # Context: Dark/light theme toggle
│
├── pages/                     # 📄 Routed page-level components
│   ├── login/                 # Public routes
│   ├── marketing-page/        # Public marketing page
│   └── home/
│       ├── admin-home/        # Admin panel pages
│       ├── student-home/      # Student panel pages
│       └── super-admin-home/  # Super Admin panel pages
│
├── components/                # 🧩 Shared, reusable components
│   ├── side-bar/
│   ├── nav-header/
│   ├── rich-text-editor/
│   ├── create-new-exam/
│   ├── latex-preview/
│   └── ...
│
├── redux/                     # 🗃️ State management (flat structure)
│   ├── store.js               # Store configuration
│   ├── root-reducer.js        # Combined reducers
│   └── *-slice.js             # Individual feature slices
│
├── hooks/                     # 🪝 Custom React hooks
├── utils/                     # 🔧 Pure utility functions
├── configs/                   # ⚙️ Configuration files
│   └── constants.js           # ALL API URLs and app constants
├── styles/                    # 🎨 Global SCSS files
│   ├── variables.scss         # Theme CSS variables & SCSS variables
│   ├── typography.scss        # Font definitions
│   ├── buttons.scss           # Button styles
│   └── themes.scss            # Theme-specific overrides
├── assets/                    # 📦 Static files (images, icons, Lottie)
├── context/                   # React Context providers
├── features/                  # Feature-specific modules
└── services/                  # Service layer
```

### 1.2 Architecture Rules

| #   | Rule                                        | Rationale                                                                                              |
| --- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------- |
| A1  | **Pages are routed, components are reused** | `pages/` contains components tied to a route. `components/` contains reusable pieces used across pages |
| A2  | **Redux slices are flat**                   | All slices live in `src/redux/` — no nested folders                                                    | State is easier to locate |
| A3  | **No business logic in components**         | API calls go through Redux thunks. Components only dispatch and read state                             |
| A4  | **Configuration is centralized**            | API URLs, constants, and env-specific config go in `src/configs/`                                      |
| A5  | **Global styles live in `styles/`**         | Component-specific styles live next to the component                                                   |
| A6  | **No circular imports**                     | Module A → B → A is forbidden. Restructure if needed                                                   |
| A7  | **Provider tree order**                     | `Provider (Redux) → PersistGate → GoogleOAuthProvider → Router → ThemeProvider → App`                  |

---

## 2. File & Naming Conventions

### 2.1 File Names

| Entity                | Convention                | Example                             |
| --------------------- | ------------------------- | ----------------------------------- |
| React component files | `kebab-case.jsx`          | `exam-review.jsx`                   |
| Style files           | `kebab-case.scss`         | `exam-review.scss`                  |
| Redux slices          | `kebab-case-slice.js`     | `exam-template-slice.js`            |
| Utility files         | `kebab-case.js` or `.jsx` | `date-utils.jsx`, `role-utils.js`   |
| Custom hooks          | `useCamelCase.js`         | `useRoles.js`, `useSwipe.js`        |
| Config files          | `kebab-case.js`           | `constants.js`                      |
| Folders               | `kebab-case`              | `batch-analysis/`, `question-card/` |

### 2.2 Code Identifiers

| Entity                   | Convention                 | Example                                          |
| ------------------------ | -------------------------- | ------------------------------------------------ |
| React components         | `PascalCase`               | `ExamReview`, `BatchAnalysis`                    |
| Functions                | `camelCase`                | `fetchExams`, `handleSubmit`                     |
| Constants (exports)      | `UPPER_SNAKE_CASE`         | `GET_ALL_EXAMS`, `BOXINNOVATE_APP_API_URL`       |
| Redux thunk actions      | `camelCase`, verb-prefixed | `fetchExams`, `createBatch`, `deleteUser`        |
| Redux thunk type strings | `"sliceName/actionName"`   | `"auth/loginUser"`, `"examTemplate/hostExam"`    |
| Redux state keys         | `camelCase`                | `loading`, `examDetails`, `questionCountCatWise` |
| Custom hooks             | `use` + `PascalCase`       | `useRoles`, `useSwipe`, `useForbiddenError`      |
| SCSS classes             | `kebab-case`               | `.exam-review-container`                         |
| SCSS variables           | `$kebab-case`              | `$font-size-body`, `$border-radius`              |
| CSS custom properties    | `--kebab-case`             | `--bg-color`, `--text-color`                     |
| Boolean variables        | `is`/`has`/`should` prefix | `isLoggedIn`, `hasRoles`, `isDarkTheme`          |
| Event handlers           | `handle` prefix            | `handleSubmit`, `handleChange`, `handleDelete`   |
| Callback props           | `on` prefix                | `onPayloadReady`, `onQuestionAdded`, `onClose`   |

### 2.3 File Extension Rules

| Extension | When to Use                                                            |
| --------- | ---------------------------------------------------------------------- |
| `.jsx`    | Files containing JSX (React components, context providers, auth-utils) |
| `.js`     | Pure JavaScript (Redux slices, utilities, configs, hooks)              |
| `.scss`   | Component and global styles                                            |

---

## 3. React Component Rules

### 3.1 Component Declaration

```jsx
// ✅ CORRECT: Arrow function with const
const ExamReview = ({ examId, onBack }) => {
  // hooks at top
  const dispatch = useDispatch();
  const { isDarkTheme } = useTheme();
  const { loading, error, data } = useSelector((state) => state.examDetails);

  // state
  const [isEditing, setIsEditing] = useState(false);

  // effects
  useEffect(() => { /* ... */ }, []);

  // handlers
  const handleSubmit = () => { /* ... */ };

  // render helpers
  const renderQuestionList = () => { /* ... */ };

  // main return
  return ( /* JSX */ );
};

export default ExamReview;
```

### 3.2 Component Rules

| #   | Rule                                | Detail                                                                             |
| --- | ----------------------------------- | ---------------------------------------------------------------------------------- |
| R1  | **One component per file**          | No multiple exported components in a single file                                   |
| R2  | **Max ~400 lines**                  | Break larger components into sub-components in a `components/` subfolder           |
| R3  | **Hooks at the top**                | All hooks (`useState`, `useEffect`, `useSelector`, `useDispatch`) before any logic |
| R4  | **No nested component definitions** | Don't define components inside other components                                    |
| R5  | **Use destructuring**               | Destructure props at the function parameter level                                  |
| R6  | **Default exports for components**  | `export default ComponentName;` at the bottom                                      |
| R7  | **Named exports for hooks/utils**   | `export const useRoles = () => { ... };`                                           |
| R8  | **Loading states required**         | Always show `<Spin>` or skeleton when `loading` is true                            |
| R9  | **Error states required**           | Always show error UI when `error` is truthy                                        |
| R10 | **Empty states required**           | Show meaningful empty messages when data arrays are empty                          |

### 3.3 Import Order

```jsx
// 1. React imports
import React, { useState, useEffect, useMemo, lazy, Suspense } from "react";

// 2. Third-party libraries
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Table, Modal, message, Spin, Select } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import moment from "moment";

// 3. Redux thunks and actions
import { fetchExams, deleteExam } from "../../redux/exam-slice";

// 4. Custom hooks
import { useRoles } from "../../hooks/useRoles";
import { useTheme } from "../../theme-context";

// 5. Components
import RenderMixedContent from "../../components/render-mixed-content";

// 6. Utils and constants
import { GET_ALL_EXAMS } from "../../configs/constants";
import { formatCustomRange } from "../../utils/date-utils";

// 7. Assets
import examIcon from "../../assets/exam-icon.svg";

// 8. Styles (ALWAYS LAST)
import "./exam-review.scss";
```

---

## 4. Redux Rules

### 4.1 Slice Pattern (Mandatory)

```javascript
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../axios-instance";
import { API_URL } from "../configs/constants";

// 1. Thunks come FIRST
export const fetchData = createAsyncThunk(
  "sliceName/fetchData",
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "An error occurred",
      );
    }
  },
);

// 2. Slice definition
const dataSlice = createSlice({
  name: "sliceName",
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearData: (state) => {
      state.data = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchData.fulfilled, (state, action) => {
        state.data = action.payload.data;
        state.loading = false;
      })
      .addCase(fetchData.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
        state.loading = false;
      });
  },
});

// 3. Named exports for actions
export const { clearData } = dataSlice.actions;

// 4. Optional: Named selectors
export const selectData = (state) => state.sliceName.data;
export const selectLoading = (state) => state.sliceName.loading;

// 5. Default export for reducer
export default dataSlice.reducer;
```

### 4.2 Redux Rules

| #   | Rule                                | Detail                                                                                |
| --- | ----------------------------------- | ------------------------------------------------------------------------------------- |
| S1  | **Always use `rejectWithValue`**    | In async thunk catch blocks, return `rejectWithValue(error.response?.data)`           |
| S2  | **Three states per thunk**          | Every thunk must handle `.pending`, `.fulfilled`, `.rejected`                         |
| S3  | **Reset error on pending**          | Set `state.error = null` in pending case                                              |
| S4  | **Use custom axios instance**       | `import axios from "../axios-instance"` — never from `"axios"` directly               |
| S5  | **API URLs from constants**         | Never hardcode URLs in thunks                                                         |
| S6  | **Register in root-reducer**        | Every new slice must be added to `src/redux/root-reducer.js`                          |
| S7  | **Persist whitelist**               | Only `auth` and `notifications` are persisted. Adding new slices requires discussion  |
| S8  | **No API calls in components**      | All API calls go through Redux thunks                                                 |
| S9  | **Use `builder` syntax**            | `extraReducers` uses the `builder` callback pattern, not the object notation          |
| S10 | **Thunk prefix matches slice name** | `"auth/loginUser"` for auth slice, `"examTemplate/fetchData"` for exam template slice |

---

## 5. API & Networking Rules

### 5.1 Axios Instance

| #   | Rule                        | Detail                                                                    |
| --- | --------------------------- | ------------------------------------------------------------------------- |
| N1  | **Only one axios instance** | `src/axios-instance.jsx` is the single source. Never create another       |
| N2  | **Token auto-injected**     | Request interceptor adds `Authorization` header automatically             |
| N3  | **401 auto-redirects**      | Response interceptor clears storage and redirects to `/login`             |
| N4  | **403 auto-handled**        | Response interceptor shows error message and sets `error.isHandled`       |
| N5  | **Check `isHandled`**       | In components, check `error.isHandled` before showing additional error UI |

### 5.2 API Constants Pattern

```javascript
// In src/configs/constants.js

// Static endpoints → export const (UPPER_SNAKE_CASE)
export const GET_ALL_EXAMS = `${BOXINNOVATE_APP_API_URL}/api/exam`;

// Dynamic endpoints → export function (camelCase)
export const deleteExam = (examId) =>
  `${BOXINNOVATE_APP_API_URL}/api/exam/${examId}`;

// Parameterized endpoints → export function with multiple params
export const editExamQuestion = (examId, questionId) =>
  `${BOXINNOVATE_APP_API_URL}/api/exam/${examId}/questions/${questionId}`;
```

### 5.3 Environment Configuration

```javascript
// Environment is determined by REACT_APP_ENV:
// "production"  → https://mp.boxinnovate.com
// "demo"        → https://demo.boxinnovate.com
// "test"        → https://test.boxinnovate.com
// default (dev) → https://test.boxinnovate.com
```

---

## 6. Error Handling Rules

| #   | Rule                          | Detail                                                                                                     |
| --- | ----------------------------- | ---------------------------------------------------------------------------------------------------------- |
| E1  | **Every async has try-catch** | No unhandled promise rejections                                                                            |
| E2  | **Use error utilities**       | Prefer `smartErrorHandler`, `handleApiError`, `isErrorAlreadyHandled` from `utils/error-handling-utils.js` |
| E3  | **No swallowed errors**       | Empty `catch {}` is forbidden — at minimum log with `console.error`                                        |
| E4  | **User-friendly messages**    | Show contextual messages: "Failed to create exam" not "Network Error"                                      |
| E5  | **Use `antd` message**        | `message.success()`, `message.error()`, `message.warning()` for user feedback                              |
| E6  | **No `alert()`**              | Never use `window.alert()` — use Ant Design `message` or `Modal.confirm`                                   |
| E7  | **403 dedup**                 | Check `isErrorAlreadyHandled(error)` before showing error messages                                         |
| E8  | **Fallback UI**               | Components must render an error state, never a blank screen                                                |
| E9  | **Optional chaining**         | Always use `error?.response?.data?.message` for safe access                                                |

---

## 7. Styling Rules

### 7.1 Theme System

The project uses CSS custom properties for theming. There are two themes: **light** (`:root`) and **dark** (`.dark-theme`).

| #   | Rule                                  | Detail                                                                                       |
| --- | ------------------------------------- | -------------------------------------------------------------------------------------------- |
| T1  | **Colors use CSS variables**          | `var(--bg-color)`, `var(--text-color)`, etc. — never hardcoded hex values                    |
| T2  | **Both themes required**              | Every new CSS variable must be defined in BOTH `:root` AND `.dark-theme` in `variables.scss` |
| T3  | **Non-theme constants use SCSS vars** | Font sizes, spacing, border-radius use `$variable-name`                                      |
| T4  | **No inline styles**                  | Use SCSS classes instead of `style={{}}` in JSX                                              |
| T5  | **No `!important`**                   | Fix CSS specificity instead of using `!important`                                            |
| T6  | **Co-located SCSS**                   | Each component has its own `.scss` file in the same directory                                |
| T7  | **Responsive design**                 | Use `useMediaQuery` hook or CSS media queries for mobile/tablet/desktop                      |
| T8  | **Ant Design overrides**              | Override Ant Design styles via SCSS with proper specificity, not inline                      |

### 7.2 SCSS Breakpoints

```scss
// Mobile: < 768px
// Tablet: 768px - 1280px
// Desktop: > 1280px

@media (max-width: 767px) {
  /* mobile */
}
@media (min-width: 768px) and (max-width: 1280px) {
  /* tablet */
}
@media (min-width: 1281px) {
  /* desktop */
}
```

### 7.3 Adding New Theme Colors

```scss
// 1. Add to :root in src/styles/variables.scss
:root {
  --new-feature-bg: #f5f5ff;
  --new-feature-border: #d4d4ff;
}

// 2. Add corresponding dark theme value
.dark-theme {
  --new-feature-bg: #1a1a2e;
  --new-feature-border: #2a2a4e;
}

// 3. Use in component SCSS
.new-feature {
  background: var(--new-feature-bg);
  border: 1px solid var(--new-feature-border);
}
```

---

## 8. Routing Rules

### 8.1 Route Definition Rules

| #   | Rule                             | Detail                                                                  |
| --- | -------------------------------- | ----------------------------------------------------------------------- |
| RT1 | **All routes in `App.jsx`**      | Never define routes elsewhere                                           |
| RT2 | **Lazy load all pages**          | `const Page = lazy(() => import("./pages/..."))`                        |
| RT3 | **Wrap with Suspense**           | Every lazy-loaded component wrapped in `<Suspense fallback={...}>`      |
| RT4 | **Use `RingLoader`**             | Standard Suspense fallback is `<RingLoader color="#6366f1" />`          |
| RT5 | **ProtectedRoute for auth**      | All authenticated routes use `<ProtectedRoute requiredInterfaceId={X}>` |
| RT6 | **Outlet for nested routes**     | Layout components (`AdminHome`, `StudentHome`) use `<Outlet>`           |
| RT7 | **ScrollToTop mounted globally** | `<ScrollToTop />` is mounted once in `App.jsx`                          |

### 8.2 Interface IDs (Role-Based Access)

| Interface ID | Role        | Layout Component | Route Prefix        |
| ------------ | ----------- | ---------------- | ------------------- |
| `1`          | Super Admin | `SuperAdminHome` | `/super-admin-home` |
| `2`          | Admin       | `AdminHome`      | `/admin-home`       |
| `3`          | Student     | `StudentHome`    | `/student-home`     |

### 8.3 Root Route Redirect Logic

```
If logged in + valid token:
  interfaceId === 1 → /super-admin-home
  interfaceId === 2 → /admin-home
  interfaceId === 3 → /student-home
Else → /login
```

---

## 9. Security Rules

| #    | Rule                               | Detail                                                                        |
| ---- | ---------------------------------- | ----------------------------------------------------------------------------- |
| SEC1 | **No secrets in source code**      | API keys, tokens, passwords never hardcoded                                   |
| SEC2 | **Google Client ID is okay**       | Public OAuth client IDs can be in code (they are meant to be public)          |
| SEC3 | **Use ProtectedRoute**             | Never rely on UI-only hiding for access control                               |
| SEC4 | **Sanitize user input**            | Before rendering with `dangerouslySetInnerHTML` (only used in LaTeX renderer) |
| SEC5 | **No `eval()`**                    | Never use `eval()`, `new Function()`, or similar                              |
| SEC6 | **Token in Redux**                 | Token stored via redux-persist; auto-cleared on 401                           |
| SEC7 | **Storage cleanup on auth events** | Clear localStorage/sessionStorage on logout, 401, and unauthorized access     |
| SEC8 | **Validate route params**          | Sanitize URL params before using in API calls                                 |

---

## 10. Performance Rules

| #   | Rule                               | Detail                                                                             |
| --- | ---------------------------------- | ---------------------------------------------------------------------------------- |
| P1  | **Lazy load pages**                | All route-level components use `React.lazy()`                                      |
| P2  | **Virtualize long lists**          | Lists with > 50 items use `react-virtuoso`                                         |
| P3  | **Debounce search**                | Search inputs debounced (300ms-500ms) before API calls                             |
| P4  | **Server-side pagination**         | Don't fetch all data at once for tables > 50 rows                                  |
| P5  | **Memoize expensive renders**      | Use `useMemo` for heavy computations, `useCallback` for stable handler references  |
| P6  | **Clean up side effects**          | Clear timers, listeners, and subscriptions in `useEffect` cleanup                  |
| P7  | **Tree-shakeable imports**         | `import { Button } from "antd"` not `import antd from "antd"`                      |
| P8  | **Dynamic imports for heavy libs** | Charts, 3D (Three.js), Quill should be dynamically imported                        |
| P9  | **Avoid re-renders**               | Don't create objects/arrays inline in JSX; move to `useMemo`                       |
| P10 | **No `console.log` in production** | Use `console.warn` or `console.error` sparingly; remove `console.log` before merge |

---

## 11. Dependency Rules

| #   | Rule                         | Detail                                                                |
| --- | ---------------------------- | --------------------------------------------------------------------- |
| D1  | **Justify new packages**     | Every new dependency needs a reason. Is there a lighter alternative?  |
| D2  | **Check bundle impact**      | Run `npm run wpbuild:analyze` before adding new deps                  |
| D3  | **Use existing libraries**   | Before adding a new lib, check if an existing one covers the use case |
| D4  | **Keep compatible versions** | Don't upgrade major versions without testing                          |
| D5  | **Node version**             | Requires Node >= 20.12.2 (defined in `package.json` `engines`)        |

### 11.1 Key Dependencies Reference

| Library               | Purpose       | Import Pattern                                                        |
| --------------------- | ------------- | --------------------------------------------------------------------- |
| `antd`                | UI components | `import { Button, Table } from "antd"`                                |
| `@ant-design/icons`   | Icons         | `import { ArrowLeftOutlined } from "@ant-design/icons"`               |
| `react-redux`         | State hooks   | `import { useSelector, useDispatch } from "react-redux"`              |
| `@reduxjs/toolkit`    | Redux logic   | `import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"`    |
| `react-router-dom`    | Routing       | `import { useNavigate, useLocation, Outlet } from "react-router-dom"` |
| `moment`              | Dates         | `import moment from "moment"`                                         |
| `react-chartjs-2`     | Charts        | `import { Pie, Line } from "react-chartjs-2"`                         |
| `react-virtuoso`      | Virtual lists | `import { Virtuoso } from "react-virtuoso"`                           |
| `react-katex`         | LaTeX         | `import { InlineMath, BlockMath } from "react-katex"`                 |
| `react-responsive`    | Responsive    | `import { useMediaQuery } from "react-responsive"`                    |
| `socket.io-client`    | WebSocket     | Used for Guru Drona AI chat                                           |
| `react-beautiful-dnd` | Drag & drop   | Used in marketing page sections                                       |
| `lottie-react`        | Animations    | Lottie JSON animations                                                |

---

## 12. Code Style Rules

### 12.1 General

| #   | Rule                    | Detail                                                           |
| --- | ----------------------- | ---------------------------------------------------------------- |
| CS1 | **Double quotes**       | `"string"` not `'string'`                                        |
| CS2 | **Semicolons**          | Always use semicolons                                            |
| CS3 | **2-space indentation** | Standard across all files                                        |
| CS4 | **Trailing commas**     | Use trailing commas in multiline objects/arrays                  |
| CS5 | **Arrow functions**     | Prefer arrow functions for callbacks and components              |
| CS6 | **Destructuring**       | Destructure props, state, and selector results                   |
| CS7 | **Template literals**   | Use backticks for interpolation                                  |
| CS8 | **Optional chaining**   | Use `?.` for nullable property access                            |
| CS9 | **Const by default**    | Use `const` unless you need to reassign, then `let`. Never `var` |

### 12.2 Comments

| #   | Rule                           | Detail                                                           |
| --- | ------------------------------ | ---------------------------------------------------------------- |
| CM1 | **JSDoc for public functions** | Exported functions/hooks have JSDoc with `@param` and `@returns` |
| CM2 | **No obvious comments**        | Don't comment what code does — comment WHY                       |
| CM3 | **TODO format**                | `// TODO: <description>` with your name if in a team             |
| CM4 | **No commented-out code**      | Remove dead code; use git history                                |
| CM5 | **Complex logic comments**     | Explain business rules and non-obvious decisions                 |

### 12.3 JSDoc Pattern (from project)

```javascript
/**
 * Get role ID by role name
 * @param {Array} roles - Array of role objects from API
 * @param {string} roleName - Name of the role (e.g., 'Admin', 'Teacher', 'Student')
 * @returns {number|null} - Role ID or null if not found
 */
export const getRoleIdByName = (roles, roleName) => { ... };

/**
 * Custom hook to ensure roles are loaded and provide role data
 * @param {boolean} autoFetch - Whether to automatically fetch roles if not loaded
 * @returns {Object} - Object containing roles, loading state, and fetch function
 */
export const useRoles = (autoFetch = true) => { ... };
```

---

## 13. Git & Workflow Rules

| #   | Rule                           | Detail                                                                                  |
| --- | ------------------------------ | --------------------------------------------------------------------------------------- |
| G1  | **Descriptive branch names**   | `feature/exam-review-inline-edit`, `fix/403-error-duplicate`, `refactor/batch-analysis` |
| G2  | **Small, focused commits**     | Each commit does one thing                                                              |
| G3  | **Meaningful commit messages** | `"feat: add inline editing to exam review"`, not `"update file"`                        |
| G4  | **No build artifacts**         | `dist/`, `node_modules/`, `.DS_Store` are in `.gitignore`                               |
| G5  | **Test before pushing**        | Run `npm start` and verify no console errors                                            |
| G6  | **No `console.log`**           | Remove all debug logs before committing                                                 |
| G7  | **Review your own diff**       | Check `git diff` before committing                                                      |
| G8  | **Package-lock**               | Commit `package-lock.json` when dependencies change                                     |

---

## Summary of Critical Rules (DO NOT BREAK)

These rules are non-negotiable. Violations will be flagged immediately:

| #     | Critical Rule                                                                         |
| ----- | ------------------------------------------------------------------------------------- |
| 🔴 1  | **ALWAYS use `src/axios-instance.jsx`** — never import raw `axios`                    |
| 🔴 2  | **ALWAYS define API URLs in `src/configs/constants.js`** — never hardcode             |
| 🔴 3  | **ALWAYS use `ProtectedRoute`** for authenticated pages with correct `interfaceId`    |
| 🔴 4  | **ALWAYS lazy-load page components** with `React.lazy()` + `<Suspense>`               |
| 🔴 5  | **ALWAYS use CSS custom properties** (`var(--name)`) for colors — never hardcoded hex |
| 🔴 6  | **ALWAYS support dark theme** — add vars to both `:root` and `.dark-theme`            |
| 🔴 7  | **ALWAYS use `rejectWithValue`** in Redux thunk catch blocks                          |
| 🔴 8  | **ALWAYS register new slices** in `src/redux/root-reducer.js`                         |
| 🔴 9  | **ALWAYS handle loading, error, and empty states** in UI                              |
| 🔴 10 | **NEVER store secrets** (API secret keys, passwords) in source code                   |
| 🔴 11 | **NEVER use `eval()`** or dynamic code execution                                      |
| 🔴 12 | **NEVER call APIs directly from components** — always use Redux thunks                |
