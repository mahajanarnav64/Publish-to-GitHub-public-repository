# Hybrid School ERP

**Hybrid School ERP** is a comprehensive, multi-branch SaaS solution designed to streamline operations for educational institutions. It features a modern, responsive dashboard and a modular architecture to manage everything from admissions and finance to academic planning and HR.

## 📂 Project Structure

The project is organized into two main directories:

- **`frontend/`**: Contains the user interface and design prototypes.
    - Currently implemented as high-fidelity **HTML/CSS/JS** prototypes.
    - Uses **Tailwind CSS** for styling and **Alpine.js** for lightweight interactivity.
    - **Key File**: `frontend/index.html` (Main Dashboard).

- **`backend/`**: Contains the backend architecture, API specifications, and database schemas.
    - Currently contains detailed **Markdown documentation** for APIs and Schemas.
    - planned stack: **Node.js, Express, MongoDB, and Redis**.

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Edge, etc.).
- A code editor (VS Code recommended) to view the source.

### Running the Prototype
Since the current frontend is built with static HTML and client-side libraries:

1. Navigate to the `frontend` directory.
2. Open `index.html` in your web browser.
3. **Switch Roles**: Use the dropdown at the top-right to toggle between **Admin View** and **Teacher View**.

## ✨ Key Features

- **Centralized Admin Dashboard**: A 5-section command center providing real-time insights into:
  - **Financial Health**: Fee collection, revenue trends, and pending dues.
  - **Admissions**: Enrollment stats, enquiries, and conversion rates.
  - **Academic Control**: Attendance, syllabus completion, and homework tracking.
  - **Engagement**: Events, PTM operational schedules, and app activity.
  - **Risk Management**: Alerts for low attendance, dull fee payments, and other attention areas.

- **Teacher Dashboard**: An execution-focused view designed for single-subject teachers. Features include:
  - **Daily Operations**: Today's Classes and interactive Timetable.
  - **Action Items**: "Tasks To Do" list for attendance and reporting.
  - **Academic Progress**: Class-wise Syllabus tracking.
  - **Quick Stats**: Total Holidays and Attendance KPIs.

- **Modular Sidebar**: Navigation organized by functional modules (Front Office, Admissions, Students, Academics, Exams, HR, Finance).

## 🛡️ Role-Based Dashboard System

The system implements a **Role-Based Rendering Architecture** to serve different user personas from a single codebase.

### Architecture Overview
1.  **Frontend Call**: On load, the frontend requests `GET /api/dashboard`.
2.  **Backend Logic**: The controller identifies the user role (Admin vs Teacher) from the JWT.
3.  **Dynamic Response**:
    *   **Admins** receive a full analytics payload (Financials, Risks, Charts).
    *   **Teachers** receive a task-oriented payload (Classes, Timetable, Notices).
4.  **Frontend Rendering**: The `index.html` shell switches the layout engine:
    *   *Admin*: Renders the 5-section grid layout.
    *   *Teacher*: Renders the vertical widget feed (via `teacher_dashboard.html`).

### File Structure
```
/frontend
  ├── 01-dashboard.md           # Master Dashboard Documentation & Specs
  ├── teacher_dashboard.md      # Teacher Dashboard Specifics
  ├── index.html                # Main App Shell (Admin Dashboard + Role Switcher)
  └── teacher_dashboard.html    # Teacher Dashboard Component (iframe target)
```

### Security & RBAC
*   **Backend Enforcement**: Access control is enforced at the API level. Teachers cannot probe Admin endpoints (e.g., `/api/financial-health`) and will receive `403 Forbidden`.
*   **Data Isolation**: All teacher queries are scoped by `teacher_id` and `branch_id`.

## 🛠 Technology Stack

### Current Implementation (Frontend Prototype)
- **HTML5**: Semantic structure.
- **Tailwind CSS**: Utility-first styling (via CDN).
- **Alpine.js**: Reactive components and state management (via CDN).
- **FontAwesome**: Iconography.
- **Google Fonts**: Inter font family.

### Planned Architecture
- **Frontend**: React 18, Vite.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Primary), Redis (Caching).
- **Authentication**: JWT with Role-Based Access Control (RBAC).

## ✅ Acceptance Criteria (Dashboard Module)

- [ ] **Admin Dashboard**: Remains strictly defined with 5 sections (Financial to Risks).
- [ ] **Teacher Dashboard**: Renders correctly with "Today's Classes" and "Pending Tasks".
- [ ] **Role Validation**: Backend rejects unauthorized role dashboard requests.
- [ ] **Performance**: API response time < 300ms using role-based caching (`dashboard_{branch}_{role}`).

## 📚 Documentation

Detailed documentation for specific modules can be found within their respective directories:

- **Dashboard Specs**: `frontend/01-dashboard.md`
- **Teacher Specs**: `frontend/teacher_dashboard.md`
- **Backend Specs**: `backend/README.md`
