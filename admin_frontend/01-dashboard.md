# Education ERP Dashboard - Module Documentation

## 1. Role-Based Dashboard Architecture
The Dashboard module is the central landing page for the ERP system. It is designed to be **Role-Aware**, meaning the content, layout, and widgets rendered are strictly determined by the authenticated user's role.

### 1.1 Architecture Overview
*   **Dynamic Rendering**: The frontend does not hardcode the dashboard layout. Instead, it requests the dashboard configuration from the backend upon load.
*   **Portal Switcher**: Users can toggle between **Admin Portal** and **Teacher Portal** using the header control. This switches the functional context without logging out.
*   **Single Codebase**: Both Admin and Teacher dashboards share the same frontend shell (`index.html`), ensuring consistent navigation and branding.
*   **Strict Isolation**: Teachers must NEVER receive data or widgets intended for Admins. Portal-based filtering is enforced on the sidebar and dashboard.

### 1.2 Supported Roles
1.  **Admin / Super Admin**:
    *   **Focus**: Management, Financial Health, Risk Mitigation.
    *   **Layout**: Fixed 5-Section Layout (Financial, Admissions, Academic, Engagement, Risks).
    *   **Status**: **LOCKED** (Layout must not be dynamically altered).
2.  **Teacher / Academic Staff**:
    *   **Focus**: Operational Execution (Classes, Homework, Attendance).
    *   **Layout**: Widget-based Feed (Timetable, Tasks, Notices).
    *   **Status**: Dynamic widget configuration.

---

## 2. Admin Dashboard (EXISTING — LOCKED)
**Constraint**: This layout is fixed and optimized for decision-makers. It must not be changed.

### 2.1 Section 1: Financial Health
*   **KPIs**: Total Collected, Pending Fees, Overdue Amount, Collection %.
*   **Chart**: Revenue Trend (Smooth Bezier Curve).

### 2.2 Section 2: Admissions & Growth
*   **KPIs**: Active Students, New Admissions, Enquiries, Conversion Rate.
*   **Charts**: Class-wise Strength (Bar), Conversion Funnel.

### 2.3 Section 3: Academic Control
*   **KPIs**: Student Attendance %, Absentees (3+ Days), Teacher Attendance %, Syllabus Completion %.
*   **Info Cards**: Upcoming Exams, Last Exam Status.

### 2.4 Section 4: Engagement & Communication
*   **KPIs**: PTM Scheduled, Events This Month, Birthdays Today, Notices Sent.

### 2.5 Section 5: Risk & Attention Required (Sticky Right Column)
*   **Alerts**: High Pending Fee Classes, Low Attendance Classes, Discipline Cases.
*   **Design**: Distinct "Alert Style" background.

---

## 3. Teacher Dashboard (NEW)
**Focus**: "What do I need to do today?"

### 3.1 Widgets
1.  **KPI Cards (4)**:
    *   **Today's Classes**: Count of scheduled classes.
    *   **Pending Attendance**: Count of classes pending attendance markings.
    *   **Total Holidays**: Count of holidays in the current month.
    *   **Overall Syllabus**: Weighted average of syllabus completion across all assigned classes.
2.  **Today's Timetable**:
    *   List view with status indicators (Done, In Progress, Upcoming).
3.  **Syllabus Progress (Class-wise)**:
    *   Compact progress bars showing completion status per class section.
4.  **Tasks To Do**:
    *   Interactive checklist for daily action items (Mark Attendance, Submit Reports, etc.).
5.  **Notices**:
    *   List of recent circulars with "New" badges.

---

## 4. Dashboard Data Sources

### 4.1 Admin Dashboard Data Sources
*   `fees_table`: Collection and pending dues.
*   `students_table`: Enrollment stats.
*   `attendance_table` (Student & Staff): Daily attendance logs.
*   `syllabus_chapters_table`: Completion tracking.
*   `alerts_table`: Generated risk notifications.

### 4.2 Teacher Dashboard Data Sources
*   `timetable_table`: Daily schedule.
*   `lesson_plans_table`: Planning status.
*   `attendance_table`: Marking and validating student presence.
*   `syllabus_chapters_table`: Topic progress.
*   `homework_table`: Assignment tracking.

---

## 5. Dashboard API Specification

### 5.1 Endpoint
`GET /api/dashboard`

### 5.2 Response: Admin (Example)
```json
{
  "role": "admin",
  "dashboardType": "admin",
  "layout": "fixed_5_section",
  "widgets": [
    { "id": "financial_health", "data": { ... } },
    { "id": "admissions_growth", "data": { ... } },
    // ... all 5 sections
  ]
}
```

### 5.3 Response: Teacher (Example)
```json
{
  "role": "teacher",
  "dashboardType": "teacher",
  "layout": "vertical_widget_feed",
  "widgets": [
    { "id": "todays_classes", "title": "My Classes", "data": [...] },
    { "id": "pending_tasks", "title": "Action Items", "data": [...] }
  ]
}
```

---

## 6. Database Schema Addition

### New Table: `dashboard_configs`
Stores the default widget configuration for different roles (mainly for non-admin roles).

| Field Name | Data Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Unique Config ID |
| `role` | VARCHAR(50) | NOT NULL | e.g., 'teacher', 'student', 'parent' |
| `widget_key` | VARCHAR(100) | NOT NULL | ID of the widget component (e.g., 'timetable_widget') |
| `widget_name` | VARCHAR(100) | | Display name |
| `display_order` | INT | | Sort order on the dashboard |
| `is_active` | BOOLEAN | DEFAULT TRUE | Feature toggle |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Audit |

---

## 7. RBAC Enforcement

*   **Middleware check**: The API must validate `req.user.role` before processing the request.
*   **Data Isolation**:
    *   If `role == 'teacher'`, the backend **MUST NOT** query financial tables.
    *   If `role == 'teacher'`, the backend **MUST** filter data by `teacher_id`.
*   **Error Handling**: Attempting to access Admin widgets as a Teacher results in `403 Forbidden`.

---

## 8. Test Cases

### 8.1 Functional Tests
*   **TC-DSH-001**: **Admin Load**: Login as Admin -> Call API -> Verify response contains `dashboardType: "admin"` and all 5 sections.
*   **TC-DSH-002**: **Teacher Load**: Login as Teacher -> Call API -> Verify response contains `dashboardType: "teacher"` and `widget` list (Classes, Tasks).
*   **TC-DSH-003**: **Security**: Login as Teacher -> Attempt to fetch `/api/dashboard/financial-health` directly -> Expect `403 Forbidden`.
*   **TC-DSH-004**: **Branch Isolation**: Login as Branch A Admin -> Verify data returned belongs ONLY to Branch A.

### 8.2 Frontend Tests
*   **TC-FE-001**: Verify `index.html` renders the **Admin Layout** (Grid) when `dashboardType === 'admin'`.
*   **TC-FE-002**: Verify `index.html` renders the **Teacher Layout** (Feed) when `dashboardType === 'teacher'`.
*   **TC-FE-003**: Verify Global Filters (Date/Branch) are hidden or read-only for Teachers if not applicable.

