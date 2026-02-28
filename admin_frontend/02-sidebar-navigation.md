# Global Navigation & Sidebar Structure

## 1. Overview
The sidebar serves as the primary navigation for the Education ERP. It follows a **vertical, collapsible, accordion-style** design.

**Style Guide:**
*   **Default State:** Expanded (Icon + Text).
*   **Collapsed State:** Icon only (Text appears on hover/tooltip).
*   **Behavior:** "One-at-a-time" expansion (clicking a new module collapses the previous one).
*   **Visuals:** Modern, clean, professional SaaS aesthetic (dark or light theme based on brand).

---

## 2. Final Sidebar Modules (13 Items)

### 1️⃣ Dashboard
*   **Icon:** `fa-solid fa-gauge-high`
*   **Sub-menu:** None (Single Link)

### 2️⃣ Front Office (Reception)
*   **Icon:** `fa-solid fa-bell-concierge`
*   **Sub-menu:**
    *   Visitor Log (Gate Pass)
    *   Call Logs (Incoming/Outgoing)
    *   Postal Dispatch/Receive
    *   Lost & Found / Complaints

### 3️⃣ Admissions
*   **Icon:** `fa-solid fa-user-plus`
*   **Sub-menu:**
    *   Enquiries
    *   Appointments
    *   Applications
    *   Add Student
    *   Admission Payment
    *   Admission Reports

### 4️⃣ Student Management
*   **Icon:** `fa-solid fa-graduation-cap`
*   **Sub-menu:**
    *   Student Directory (Search/Profile)
    *   Daily Attendance
    *   Student Discipline
    *   Promotion & Alumni
    *   Student Transfer
    *   Student Status Management
    *   Certificate Center
    *   Student Documents

### 5️⃣ Academics & LMS
*   **Icon:** `fa-solid fa-book-open`
*   **Sub-menu:**
    *   Class & Section Master
    *   Subject Management
    *   Academic Calendar
    *   Syllabus Planner
    *   Teacher Allocation
    *   Timetable Management
    *   Syllabus Tracking
    *   Daily Homework / Assignments
    *   Exam Management
    *   Result Processing

### 6️⃣ Examinations
*   **Icon:** `fa-solid fa-file-pen`
*   **Sub-menu:**
    *   Exam Setup / Creation
    *   Exam Schedule / Date Sheet
    *   Admit Card Generation
    *   Marks Entry (Subject-wise)
    *   Marks Lock / Approval
    *   Result Processing
    *   Result Publish Control
    *   Report Card Printing
    *   Exam Reports

### 7️⃣ HR & Payroll
*   **Icon:** `fa-solid fa-users-gear`
*   **Sub-menu:**
    *   Employee Directory
    *   Staff Attendance (Biometric/Manual)
    *   Leave Management
    *   Shift Management
    *   Salary Structure Setup
    *   Payroll Processing
    *   Salary Slip Generation
    *   Recruitment / Job Applications
    *   Employee Discipline

### 8️⃣ Finance & Accounting
*   **Icon:** `fa-solid fa-coins`
*   **Sub-menu:**
    *   Fee Management
    *   Expense Management
    *   Vendor Management
    *   Inventory & Stock
    *   Accounting & Financial Reports

### 9️⃣ Library Management
*   **Icon:** `fa-solid fa-book`
*   **Sub-menu:**
    *   Book Catalog / Accession Register
    *   Issue & Return (Circulation)
    *   Book Reservations
    *   Digital Library (E-Books)
    *   Library Reports (Fines, Damaged)

### 🔟 Transport & Hostel
*   **Icon:** `fa-solid fa-bus`
*   **Sub-menu:**
    *   **Transport:**
        *   Route Master & Stops
        *   Vehicle Master & Maintenance
        *   Driver/Conductor Roster
        *   Transport Allocation (Student/Staff)
    *   **Hostel:**
        *   Room Master
        *   Hostel Allocation
        *   Mess/Canteen Menu

### 1️⃣1️⃣ Communication
*   **Icon:** `fa-solid fa-comments`
*   **Sub-menu:**
    *   Notice Board
    *   Event Calendar
    *   PTM Scheduler
    *   Bulk SMS / Email / App Push
    *   Feedback & Surveys

### 1️⃣2️⃣ Reports & Intelligence
*   **Icon:** `fa-solid fa-chart-pie`
*   **Sub-menu:**
    *   Central Report Center (All modules)
    *   Student Trends
    *   Financial Health Check
    *   Custom Report Builder

### 1️⃣3️⃣ Compliance & Document Engine
*   **Icon:** `fa-solid fa-file-shield`
*   **Sub-menu:**
    *   Student Documents
    *   Staff Documents
    *   Vehicle Documents
    *   Infrastructure Compliance
    *   Expiry Tracking
    *   Compliance Alerts

### 1️⃣4️⃣ Administration & Settings
*   **Icon:** `fa-solid fa-gears`
*   **Sub-menu:**
    *   Institute Profile (Logo, Seal, Details)
    *   Academic Session Setup
    *   Role-Based Permissions
    *   User Management
    *   Notification & Automation Settings
    *   Fee Alerts
    *   Attendance Alerts
    *   Discipline Alerts
    *   System Settings
    *   Data Import / Migration
    *   Audit Logs (Phase 2)

---

## 3. UX Rules & Behavior

### 3.1 Interaction Design
1.  **Hover Effects**:
    *   Sidebar Items: Slight background lighten/darken.
    *   Icon: Change color to Primary Brand Color.
2.  **Active State**:
    *   The "Parent" module text is bold and highlighted.
    *   The "Sub-menu" item has a distinct left-border or bullet indicator.
3.  **Collapse Logic**:
    *   Only **one** main module can be expanded at a time to reduce clutter (accordion).
    *   Clicking a new module auto-collapses the previous one.

### 3.2 Role-Based Visibility (RBAC)
*   **Super Admin**: Sees Everything (All 13 Modules).
*   **Accountant**: Sees Dashboard, Finance, Reports. (Hides Academics, Library, etc.).
*   **Teacher**: Sees Dashboard, Students, Academics, Exam, HR (Self).
*   **Librarian**: Sees Dashboard, Library, Students (Read-only).
*   **Driver/Transport In-charge**: Sees Transport, Alerts.

### 3.3 Portal-Based Visibility
Modules are further filtered based on the **Active Portal context**:
*   **Admin Portal**: Dashboard, Admissions, Finance, Settings, HR, Front Office.
*   **Teacher Portal**: Dashboard, Academics (My Classes), Attendance, Syllabus Tracker, Assignments.

---

## 4. Technical Implementation Notes
*   **State Management**: Use Global State (Redux/Context) to track `isSidebarOpen` and `activeModule`.
*   **Responsive**:
    *   **Desktop**: Fixed Left Sidebar (Width: 260px expanded, 70px collapsed).

### 5. Risk Assessment (Frontend)
*   **Accessibility Risk**:
    *   *Risk*: Collapsed sidebar icons might be confusing without tooltips for screen readers or new users.
    *   *Mitigation*: Implement `aria-label` and `title` attributes dynamically.
*   **Mobile Usability Risk**:
    *   *Risk*: Sidebar overlapping content on small screens or not dismissing on click-outside.
    *   *Mitigation*: Use a backdrop overlay with z-index management and tap-to-close behavior.

### 6. Acceptance Criteria (Frontend)
*   [ ] **Visual Fidelity**: Matches the design mockups (colors, spacing, icons).
*   [ ] **Responsiveness**: Collapses to icon-only on tablet (768px - 1024px) or user toggle. Hides completely into hamburger menu on mobile (< 768px).
*   [ ] **State Persistence**: Remembers the expansion state (Expanded/Collapsed) across page reloads (using `localStorage`).
*   [ ] **Active Link Highlighting**: The current page's module and sub-module link must be visually distinct (e.g., bold blue text, light blue background).

### 7. Data Rules (UI)
*   **Labels**: Max length ~20 chars before truncation with ellipsis `...`.
*   **Icons**: Consistent size (e.g., `w-5 h-5`) and alignment (centered in a fixed-width container).
*   **Scroll**: Sidebar content must be scrollable independently of the main page body.

### 8. Edge Cases & Handling
*   **Long Module Names**: Ensure text wraps or truncates gracefully without breaking layout logic.
*   **Deep Nesting**: The design supports 2 levels (Module -> Sub-menu). If a 3rd level is needed, verify it doesn't clutter the UI (avoid if possible).
*   **Network Failure**: If the backend fails to return navigation structure, fallback to a local "Emergency/Offline" menu or show a retry prompt.

### 9. Comprehensive Test Cases (Frontend)
*   **TC-FE-NAV-001**: Click "Students" -> Collapses any other open module (e.g., "Academics").
*   **TC-FE-NAV-002**: Navigate to `/students/directory` URL directly -> Sidebar automatically expands "Students" and highlights "Directory".
*   **TC-FE-NAV-003**: Resize window to < 768px -> Sidebar disappears. Click Hamburger -> Sidebar slides in.
*   **TC-FE-NAV-004**: Tab navigation -> Focus moves sequentially through menu items. Enter key expands/collapses modules.
