# Academic Calendar - Frontend Module Documentation

## 1. Feature Overview

### Purpose
The **Academic Calendar** module is the central timekeeper for the entire ERP system. It defines the foundational "Working Days" and "Non-Working Days" (Sundays, Holidays) for a specific Academic Session.

### Why is this Critical?
Without an Academic Calendar, the system cannot calculate:
*   **Syllabus Planning**: "How many days will Chapter 4 take?" (Excludes holidays).
*   **Teacher Allocation**: "Is the teacher available on this date?"
*   **Attendance**: "Can I mark attendance for Sunday?" (Should be blocked).
*   **Exams**: "Can I schedule an exam on Diwali?" (Should be blocked).

### Dependency Chain
1.  **Academic Calendar** (MUST be created first).
2.  `Subject Management`
3.  `Syllabus Planner` (Relies on Calendar for duration calc).
4.  `Timetable` (Relies on Calendar for valid dates).
5.  `Lesson Planner` (Relies on Calendar for daily execution).

### Multi-Branch Isolation
*   Each branch has its own unique calendar.
*   "Branch A" might have a local holiday on Aug 12th, while "Branch B" works. The system supports this isolation via `branch_id`.

---

## 2. Page Overview
The Academic Calendar is a comprehensive view combining a calendar grid and administrative controls. It provides a visual snapshot of the entire academic year or specific months, distinctly coloring holidays, working days, and weekends.

---

## 3. UI Components

| Component Name | Description | State/Props |
| :--- | :--- | :--- |
| **Session Selector** | Dropdown to select the academic session (e.g., 2024-25). | Options list, Selected Value |
| **View Toggle** | Switches between Month, Week, and Year view. | Active View (Month/Week/Year) |
| **Calendar Grid** | Main calendar display area showing dates. | List of dates, Highlights |
| **Legend** | Explains color coding (Working, Sunday, Holiday). | Static |
| **Generate Calendar Button** | Primary action button if the calendar is empty. | Enabled/Disabled based on calendar existence |
| **Add Holiday/Event Modal** | Dialog to mark specific date ranges as holidays, exams, or events. | Start Date, End Date, Title, Type |

---

## 4. Layout Structure

### Screen 1: Academic Calendar Main View
*   **Header**: Session Selector (e.g., 2024-25), Legend (Working/Holiday/Sunday).
*   **View**: Month Grid, Horizontal Week blocks, or Yearly Month cards.
*   **Visuals**:
    *   **White Box**: Working Day.
    *   **Grey Box**: Sunday (Non-working).
    *   **Red Box**: Holiday.
    *   **Blue Border**: Today.
*   **Actions**:
    *   `Generate Calendar` (If empty).
    *   `Add Holiday / Add Event / Add Exam Period` (Modal triggers).

---

## 5. User Flow

### Standard Flow: Generate & Manage
1.  **Navigate**: Admin goes to **Academics** → **Academic Calendar**.
2.  **Select Session**: Chose "2024-2025".
3.  **Generate**: Click "Generate Calendar".
    *   System prompts for Start/End Date (e.g., April 1, 2024 to March 31, 2025).
    *   System auto-fills all dates.
    *   System auto-marks all **Sundays** as `is_working_day = false`.
4.  **Add Holidays**:
    *   Click Add Holiday.
    *   Set Start Date and End Date.
    *   Enter Title (e.g., "Christmas").
    *   Save.
5.  **Activate**: Once saved, this calendar becomes the **Single Source of Truth** for the Syllabus Planner and Timetable modules.

---

## 6. Component Behavior

### Screen 2: Generate Calendar Popup
*   **Fields**:
    *   Session Name (Read-only: 2024-25).
    *   Start Date (Date Picker).
    *   End Date (Date Picker).
*   **Logic**: Creates ~365 rows in the database for the branch based on the selected dates.
*   **Validations**: Start date must be carefully validated against session boundaries.

### Screen 3: Add/Edit Holiday/Event Popup
*   **Fields**:
    *   Start Date (Date Picker).
    *   End Date (Date Picker).
    *   Title (Text Input: e.g., "Independence Day").
    *   Type (Toggle: Event / Holiday / Exam).

### Left Sidebar Panels
*   **Session Info**: Displays total Working days vs Holidays.
*   **School Timing**: Displays Start Time, End Time, Assembly Time, Break Time.
*   **Upcoming Events**: Shows up to 5 sequentially upcoming events fetched dynamically.
*   **Legend**: Color definitions for Event types.

---

## 7. API Integration

| Endpoint | Method | Purpose | Payload |
| :--- | :--- | :--- | :--- |
| `/api/calendar` | GET | Fetch calendar days by session/month | `?session_id=123&month=6` |
| `/api/calendar/generate` | POST | Bulk generate calendar | `{ session_id, start_date, end_date }` |
| `/api/calendar/holiday` | POST | Add or update a holiday | `{ date, name, type }` |
| `/api/calendar/holiday/{id}` | DELETE | Remove holiday, revert to working | None |

---

## 8. Request and Response JSON examples

**Generate Calendar Request:**
```json
{
  "session_id": "uuid-1234",
  "start_date": "2024-04-01",
  "end_date": "2025-03-31"
}
```

**Get Calendar Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid-5678",
      "date": "2024-04-01",
      "is_working_day": true,
      "is_holiday": false,
      "holiday_name": null,
      "day_of_week": 1
    }
  ]
}
```

**Add Holiday Request:**
```json
{
  "start_date": "2024-12-25",
  "end_date": "2024-12-25",
  "title": "Christmas",
  "type": "holiday"
}
```

---

## 9. State Management

*   **Loading State**: Display a skeleton grid while fetching calendar dates. Spinner on 'Generate' or 'Save'.
*   **Success State**: Toast notification upon generating the calendar or successfully adding/removing a holiday. Grid re-renders instantly with new colors.
*   **Empty State**: If no calendar exists for a session, show an illustration with a prompt prompting the user to "Generate Calendar".
*   **Error State**: Red banner or toast message displaying API failure reasons (e.g., "Failed to fetch calendar", "Overlap boundaries").

---

## 10. Validation Rules

*   **Generate Calendar**: `start_date` must precede `end_date`. Dates cannot span more than 366 days.
*   **Add Holiday**: `name` is required (max 100 characters). `date` must fall within the currently generated session bounds.

---

## 11. Error Handling

*   **API Timeouts**: Prompt user to retry the operation.
*   **Generation Failures**: Revert UI state, ensure partial creations aren't misleadingly shown.
*   **Duplicate Holiday**: Warn user if a holiday exists on the date and prompt for overwrite confirmation.

---

## 12. Responsive Behavior

*   **Desktop**: Displays full year grid utilizing available horizontal space or large monthly grids.
*   **Tablet**: Wraps the grid, potentially reducing cell margins. Modals become centered.
*   **Mobile**: Shifts exclusively to Month-by-Month view. Grid cells become touch-friendly targets, legend collapses to abbreviation row.

---

## 13. Edge Cases

1.  **Leap Years**: Calendar generation accurately computes 366 days and maps February 29th appropriately.
2.  **Mid-Session Updates**: Adding a holiday retrospectively does not break historical attendance but triggers a silent background check for the syllabus planner.
3.  **Special Sundays**: Manually toggling a specific Sunday to trigger `is_working_day: true` for compensatory work days.

---

## 14. Acceptance Criteria

*   [ ] Admin can generate a full year calendar in one click without page reload.
*   [ ] Sundays are automatically detected and styled correctly (grey).
*   [ ] Holidays can be added/removed, instantly reflecting red styling in the UI.
*   [ ] Syllabus Planner logic dependency correctly observes real-time holiday maps.
*   [ ] Empty states correctly guide new setup flows.

---

## 15. Frontend Test Cases

| Test ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **TC-FE-CAL-001** | Empty State UI Render | Load page without an active session calendar | Displays "Generate Calendar" button and empty state illustration |
| **TC-FE-CAL-002** | Calendar Generation Loader | Click "Generate Calendar", submit dates | Loading spinner appears during API call, resolves to populated grid |
| **TC-FE-CAL-003** | Auto-Sunday Highlighting | Generate a valid session | Every 7th relative column (Sunday) renders with grey background |
| **TC-FE-CAL-004** | Add Holiday Success | Click grid date -> Fill Modal -> Save | Grid cell turns red; Toast message "Holiday Added" appears |
| **TC-FE-CAL-005** | View Mode Toggle | Switch from Full Year to Month-by-Month | UI collapses cleanly without unmounting data state |
| **TC-FE-CAL-006** | Validation Error Trigger | Try adding holiday without name | Inline error shown below input; Save button blocked |

---
*End of Frontend Document*
