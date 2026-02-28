# Syllabus Planner & Tracker - Frontend Specifications

## 1. Feature Overview
The **Syllabus Planner & Tracker** module bridges the gap between high-level academic planning and daily classroom execution. It serves two distinct but connected purposes:
1.  **Syllabus Planner (Admin/Academic Head)**: A strategic tool to define the curriculum structure, chapter sequencing, and allotted time (in working days) for each subject in a class. This ensures the syllabus is covered systematically before exams.
2.  **Syllabus Tracker (Teachers)**: An execution tool where teachers view the plan and mark chapters as "Started" or "Completed". It provides real-time visibility into whether the syllabus is running on schedule, ahead, or lagging behind.

**Dependencies**: `Class` → `Subject` → `Timetable` (Optional) → **Syllabus Planner** → `Lesson Planner`.

## 2. Page Overview
The interface accommodates two distinct user groups:
*   **Admin View**: Features a master planning interface to manage and orchestrate syllabus plans across all classes and subjects. Emphasizes lists, creation modals, and macro-level tracking.
*   **Teacher View**: Features an execution-focused dashboard (Tracker) displaying a chronological list of assigned chapters, progress bars, and actionable state toggles (Start/Complete) for active curriculum tracking.

## 3. UI Components

| Component Name | Description | State/Props |
| :--- | :--- | :--- |
| **Syllabus Plan List** | Hierarchical view showing subjects mapped to nested, collapsible chapters and topics. | Collapsed by default |
| **Filter Bar (Admin)** | Dropdowns for Academic Session, Class, and Subject to filter the Plan List. | Selected Values, Disabled if loading |
| **Create Plan Button** | Triggers the Syllabus Plan creation modal. | enabled, disabled |
| **Chapter Input Form (Admin)** | Dynamic form to add/remove chapters, set names, and define planned durations. | Array of fields, Validation States |
| **Data Rows** | Compact horizontal UI components presenting duration, dates, and teachers in condensed pills (6px padding, 340px fixed width). | Master Chapter, Curriculum Topic |
| **Actual Days Container** | Statically rendered badge to maintain structural alignment across all rows. | Shows actual days or "In Progress" placeholder |
| **Merged Status Badge** | Color-coded indicators reflecting BOTH status and performance logic natively. | Blue = In Progress, Green = Completed (On Time), Red = Completed (Early/Delayed) |
| **Early Feedback Modal** | Dialog prompting a teacher for reasoning when completing a chapter early. | Textarea Input, 1-5 Rating Component |

## 4. Layout Structure

### Admin Syllabus Planner List
*   **Header**: Page Title, Breadcrumbs, "+ Create Syllabus Plan" CTA.
*   **Filter Section**: Horizontal bar featuring Dropdowns: Session, Class, Subject.
*   **Main Container**: Nested list format. High-level Master Chapters are presented as interactive rows. Clicking a chapter reveals nested Curriculum Topics. Chapters are collapsed by default to save initial query space.
*   **Data Density**: Uses compact row layouts with right-aligned status indicators and consistent placeholder renderings (e.g. static 'In Progress' for missing actual completion days) to avoid UI jarring or flex shifting.

### Teacher Syllabus Tracker
*   **Header**: Current Subject context and overall completion percentage.
*   **View Toggle**: Buttons to switch between Timeline View or List View.
*   **Timeline Container**: Vertical list of Chapter Cards mapping sequentially down the screen.

## 5. User Flow

### Admin Flow (Master Planning)
1.  **Navigate**: Admin goes to **Academics** → **Syllabus Planner**.
2.  **Filter**: Selects `Session: 2024-25`, `Class: X`, `Subject: Math`.
3.  **Initiate**: Clicks "Create Plan" (or Edit existing).
4.  **Add Chapters**: Adds "Chapter 1" (5 days) and "Chapter 2" (8 days). The system automatically calculates tentative dates starting from the Session Start Date, skipping holidays via the Academic Calendar integration.
5.  **Save**: Plan is committed and pushed into the respective Teacher's Tracker view.

### Teacher Flow (Tracker)
1.  **Navigate**: Teacher goes to **Academics** → **Syllabus Tracker**.
2.  **View**: Examines the mapped sequence of chapters for their assigned class block.
3.  **Execute**:
    *   Clicks "Start" on Chapter 1.
    *   Clicks "Mark Complete" when finished.
4.  **Feedback Intervention**: If the system detects early completion, it prompts a modal for "Reason for early completion" before finalizing the status.

## 6. Component Behavior

### Create/Edit Syllabus Plan (Admin Modal)
*   Adding a chapter generates a dynamic row containing an auto-sequenced Chapter Number, a text input for the Name, and a numerical input for the Duration (working days).
*   The **End Date** column is calculated automatically on the client side based on the start date + duration + calendar mappings, rendering as read-only.
*   A Footer dynamically aggregates the total days consumed by all chapters against the total available working days in the session.

### Teacher Progress Actions
*   Clicking **Start Chapter** transitions a chapter card's badge to "In Progress" (Blue) and captures the active timestamp. The "Actual Days" component visually anchors as "In Progress".
*   Clicking **Mark Complete** evaluates the current timestamp against the planned completion date to badging overrides.
    *   If On-Time: The Status Badge shifts to an emerald Green theme with a checkmark.
    *   If Early or Delayed: The Status Badge shifts to a Red theme with a warning triangle to clearly identify deviations.

## 7. API Integration

| Endpoint | Method | Purpose | Payload |
| :--- | :--- | :--- | :--- |
| `/api/syllabus/plans` | GET | Fetch list of syllabus plans (Admin) | Query parameters (class, subject) |
| `/api/syllabus/plans` | POST | Create a new syllabus plan | `{ class_id, subject_id, chapters: [] }` |
| `/api/syllabus/tracker` | GET | Fetch active tracking timeline (Teacher) | Query parameters (class, subject) |
| `/api/syllabus/chapters/{id}/status` | PATCH | Update a chapter's progression state | `{ status, completion_date, feedback }` |

## 8. Request and Response JSON examples

**Create Plan Request:**
```json
{
  "class_id": "uuid-class1",
  "subject_id": "uuid-sub1",
  "chapters": [
    { "name": "Real Numbers", "planned_duration_days": 5 },
    { "name": "Polynomials", "planned_duration_days": 8 }
  ]
}
```

**Teacher Tracker Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid-chap1",
      "chapter_name": "Real Numbers",
      "planned_start_date": "2024-04-01",
      "planned_end_date": "2024-04-07",
      "status": "in_progress",
      "actual_start_date": "2024-04-01"
    }
  ]
}
```

**Update Status Request (Teacher):**
```json
{
  "status": "completed",
  "completion_date": "2024-04-05",
  "early_completion_feedback": "Students understood the topic faster than expected."
}
```

## 9. State Management

*   **Loading State**: Skeleton rows in tables or shimmering cards in the Timeline view during network fetching. Buttons show spinner icons during save operations.
*   **Success State**: Toast notifications confirming "Syllabus Plan Saved Successfully" or "Chapter Marked Complete". UI conditionally updates status badges immediately.
*   **Empty State**: "No syllabus plans found. Create one to get started." illustration rendered in table bodies.
*   **Error State**: Inline form errors for duration mismatches or red toast notifications on API failures.

## 10. Validation Rules

*   **Plan Creation**: A syllabus plan must have at least 1 chapter.
*   **Duration Matching**: The sum of all topic durations within a specific chapter **must exactly equal** the `Planned Duration` defined for that broader chapter.
*   **Feedback Modal**: If triggered, the "Reason" text area requires a minimum of 10 characters before submission is allowed.

## 11. Error Handling

*   **API Timeouts**: Modal submission buttons re-enable, displaying a "Request Timed Out. Please try again." toast.
*   **Over-allocation**: Submitting a plan attempting to use more working days than strictly available within the session calendar returns a prominent form banner error, rejecting the payload.

## 12. Responsive Behavior

*   **Desktop**: Displays full horizontal table rows for planning and side-by-side metric charts in trackers.
*   **Tablet**: Table columns gracefully collapse less critical data (e.g., Total Chapters).
*   **Mobile**: Teacher Tracking view shifts entirely directly to an upright card-list model. "Mark Complete" actions become full-width bottom sheet drawers. Admin Planning on mobile is restricted to viewing; deep editing hides behind an "Use Desktop to edit" prompt.

## 13. Edge Cases

1.  **Holiday Logic Injection**: Calendar updates mid-session cause the frontend to calculate "Projected End Dates" differently than baseline "Planned Dates", triggering a warning icon.
2.  **Sequential Locking**: A teacher cannot "Complete" Chapter 3 if Chapter 2 remains "Not Started". The frontend disables the action button and forces sequential tracking.

## 14. Acceptance Criteria

*   [ ] Admin can define a full syllabus with day-wise duration for both Chapters and nested Topics via a dynamic form.
*   [ ] Application prevents saving if Chapter durations don't equal the sum of their Topics' durations.
*   [ ] System automatically computes and projects End Dates on the frontend utilizing an injected holiday schema matrix.
*   [ ] Teacher dashboard faithfully segregates responsibilities across visual cards.
*   [ ] The Early Completion modal triggers deterministically and captures text logic properly on early submissions.

## 15. Frontend Test Cases

| Test ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **TC-FE-SYL-001** | Duration Verification Rule | Enter Chapter duration: 10. Nested topics total: 8. Hit Save. | Validation error highlights mismatch. Save block triggers. |
| **TC-FE-SYL-002** | Automatic Date Calc | Insert a 5-day duration chapter starting on a Friday. | End Date cell automatically reflects the following Thursday (skipping Sat/Sun). |
| **TC-FE-SYL-003** | Sequential Action Lock | Load Tracker. Locate Chapter 2. Without starting Chapter 1, attempt logic on Chapter 2. | Action button on Chapter 2 is disabled with a tooltip indicating Chapter 1 blockade. |
| **TC-FE-SYL-004** | Early Completion Intercept | Start a chapter. Attempt to 'Complete' it 3 days before expected end. | Modal pops up demanding feedback. Final PATCH command is halted until field is satisfied. |
| **TC-FE-SYL-005** | Form Dynamic Scaling | In Admin Modal, click "Add Chapter" 15 times. | Modal correctly provides scroll context. Input elements array maps cleanly. |

---
*End of Frontend Document*
