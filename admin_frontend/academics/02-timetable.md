# Timetable Management - Frontend Specifications

## 1. Feature Overview
The **Timetable Module** allows Academic Administrators to orchestrate and publish class schedules. It bridges structural planning with operational daily scheduling.

**Key Features**:
*   **2-Step Creation Process**:
    1.  **Define Structure**: Create a "Schedule Container" (e.g., Class 5A - Jan 2024). This automatically sets the timing framework containing Assembly, default breaks, and calculated period durations.
    2.  **Assign Content**: Fill the periods with Classes, Exams, or non-academic Events.
*   **Visual Grid**: Automatically calculates period start/end times and supports visually spanning blocks across multiple periods natively on the frontend canvas.
*   **Dynamic Breaks**: Optionally inject custom breaks directly into the timeline between any standard periods without corrupting the overarching schedule mathematical logic.
*   **Conflict Warnings**: Real-time validation visually highlighting if a selected teacher is busy at that specific timeframe across the institution.

## 2. Page Overview
The UI offers a unified dashboard canvas combining macro-level list views with a micro-level execution Grid Builder. The active builder workspace displays an interactive week grid where empty cells act as drop-zones for Slide-over Assignment drawers. The entire page maps complex relational mapping (Teacher-Subject-Time) into intuitive drag/click visual blocks.

## 3. UI Components

| Component Name | Description | State/Props |
| :--- | :--- | :--- |
| **Class List Grid** | Dashboard landing view displaying cards for all assigned classes with status. | Empty, Populated |
| **Timetable Canvas Grid** | Interactive table rendering Days (X-axis) against computed Time Slots (Y-axis). | Rendered layout context |
| **Grid Cell Blocks** | Visual representation inside the calendar. Color-coded based on assignment type. | Empty, Class (Indigo), Exam (Red), Event (Orange) |
| **Assign Slot Drawer** | Slide-out overlay facilitating the assignment of Teachers and Subjects to blocks. | Active Tab (Class/Exam/Event), Loading |
| **Container Modal** | Setup form capturing macro metrics (e.g. Total Periods, Assembly Duration). | Visible, Hidden, Validating |
| **Status Indicators** | Icons representing availability checks (e.g. Green Check, Red Cross) dynamically. | Boolean Available state |

## 4. Layout Structure
*   **Page Header**: Subject/Module Title context, "Create Timetable Structure" action.
*   **Main Workspace**: Initially a directory of Class cards. Once clicked, transitions into the full Timetable Grid interface.
*   **Grid Framework**: Leftmost column lists computed timestamp intervals. Main body contains the cell blocks mapping Monday-Saturday.
*   **Drawers / Modals**: Slide out from the right (for granular cell mapping) or pop center (for macro structural framing).

## 5. User Flow
1.  **Navigate**: User goes to **Academics** → **Timetable**.
2.  **Select Class**: The UI lands on a "List Classes" view. Click on a Class/Section card.
3.  **Define Structure**: If empty, click **"Create Timetable Structure"**. In the creation modal, set parameters (Start Time, Assembly, Total Periods).
4.  **Builder Mode**: The UI transitions to the active Grid Canvas.
5.  **Assign Teacher & Subject**:
    *   Click the **"+ Assign"** button on any empty grid block.
    *   The **Assign Slot** drawer slides from the right.
    *   Select from Tabs: `Class`, `Exam`, or `Event`.
    *   Select Subject and Teacher. Conflict indicators visually guide the choice.
    *   Submit. The drawer auto-closes and maps the assignment natively.
6.  **Add Custom Breaks**: Hover beneath a specific `Period X` time in the left column and click `+ Break` to dynamically inject an interval.

## 6. Component Behavior
*   **Grid Spanning Visuals**: When assigning an `Exam` or `Event` with a user-supplied "Duration (Periods)" metric > 1, the frontend computes the mathematical pixel height mapped to the table rows and injects a single continuous HTML block overlapping the grid visually through absolute/relative positioning.
*   **Dynamic Time Rendering**: Changing the "Morning Assembly Duration" in the container immediately forces the Frontend DOM to calculate and rewrite the Start/End timestamps spanning vertically down the left column.

## 7. API Integration

| Endpoint | Method | Purpose | Payload |
| :--- | :--- | :--- | :--- |
| `/api/schedules` | GET | Fetch timetable container definitions | `?class_id=X&section_id=Y` |
| `/api/schedules` | POST | Lock in mathematical structure logic | `{ start_time, total_periods, etc }` |
| `/api/schedules/{id}/periods` | GET | Grab active cell assignment matrix | |
| `/api/periods` | POST | Commit a specific slot assignment | `{ schedule_id, day, period_number, subject_id, teacher_id }` |

## 8. Request and Response JSON examples

**Create Schedule Structure Request:**
```json
{
  "class_id": "uuid-class1",
  "section_id": "uuid-secA",
  "month": "January",
  "start_time": "08:00",
  "total_periods": 8,
  "period_duration": 40,
  "assembly_duration": 15
}
```

**Assign Period Request:**
```json
{
  "schedule_id": "uuid-sched1",
  "day": "Monday",
  "period_number": 3,
  "type": "class",
  "subject_id": "uuid-subMath",
  "teacher_id": "uuid-teacherDave"
}
```

## 9. State Management
*   **Loading State**: Entire Grid is overlaid with a low-opacity white blur containing an active spinner while assignments fetch or structure commits.
*   **Success State**: Cell mapping updates instantly reflecting the returned object matrix. Drawer slides away smoothly.
*   **Empty State**: View mode displays an illustration "No periods assigned. Click 'Assign' to start."
*   **Error State**: Teacher conflicts or network crashes yield specific red alert banners pinning to the top of the Slide Drawer or the overall Layout Header.

## 10. Validation Rules
*   **Macro Container**: `Total Periods` input bounds strictly forced (Min: 1, Max: 12).
*   **Slot Assignment**: A user cannot assign a `teacher_id` if the underlying API validation state indicates they are already booked for that intersection array block.

## 11. Error Handling
*   **Teacher Conflict (HTTP 409)**: If the Drawer Submit is pressed and the API rejects the allocation, the specific dropdown field (Teacher Picker) wraps in a bold Red border. A tooltip dynamically injects the rejection payload (e.g., "Busy in Class 4-B").

## 12. Responsive Behavior
*   **Desktop**: Unified full grid spanning left-to-right (Monday-Saturday).
*   **Tablet**: Allows horizontal scrolling across the table body keeping the Time column pinned to the left axis.
*   **Mobile**: The strict geometric grid is abandoned. Converts to a Stacked Card view (rendering Day titles as accordion headers expanding into vertical lists of period objects). "Create Schedule" container modal transitions to a full-screen mobile takeover view.

## 13. Edge Cases
*   **Dynamic Custom Break Injection**: Toggling a custom break mid-day forces the javascript handler to append the break interval minutes strictly to all subsequent sibling periods down the Y-axis without corrupting the overarching Day logic bounds.

## 14. Acceptance Criteria
*   [ ] Academic coordinators can establish a complex daily timeframe architecture using a single configuration form (Container).
*   [ ] Real-time validation actively discourages creating scheduling conflicts natively before submission.
*   [ ] Multi-period assignments faithfully render structurally as expected over traditional CSS grid boundaries.
*   [ ] Support toggling between Class definitions, Exam designations, and generalized Events distinctly visible via semantic color.

## 15. Frontend Test Cases

| Test ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **TC-FE-TT-001** | Create Schedule UI Boot | Fill form (8 periods, 08:00 start) | Modal closes, list refreshes, mathematical grid computes rendering 8 empty dashed block rows. |
| **TC-FE-TT-002** | Assign Period Success | Click empty cell -> Select Maths -> Mr. Smith -> Save | Drawer retreats. "Maths - Mr. Smith" Indigo block takes residence in the grid slot. |
| **TC-FE-TT-003** | Trap Conflict Error Display | Assign a deliberately double-booked teacher | Native field UI error triggers indicating specific API rejection text. No cell mapping occurs. |
| **TC-FE-TT-004** | Multi-block Spanning | Select `Exam` tab -> Assign duration `3 periods` | Output block intersects lines natively rendering continuously through standard period dividers. |

---
*End of Frontend Document*
