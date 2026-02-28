# Teacher Dashboard Documentation

## 1. Overview
The Teacher Dashboard is an execution-focused interface designed for academic staff. Unlike the data-heavy Admin dashboard, this view prioritizes **daily tasks, schedule management, and classroom operations**.

## 2. Design Philosophy
*   **Simple & Clean**: Minimal distractions. No financial data or complex analytics.
*   **Action-Oriented**: "One-click" access to attendance, lesson planning, and homework review.
*   **Mobile-First**: Fully responsive for teachers using tablets or mobile devices in classrooms.

---

## 3. UI Layout
The dashboard follows a **Vertical Widget Feed** layout:
*   **Top Bar**: 4 KPI Cards (Today's Classes, Pending Attendance, Total Holidays, Overall Syllabus).
*   **Widget 1**: Today's Timetable (List View).
*   **Widget 2**: Split View - Syllabus Progress (Class-wise) & Tasks To Do.
*   **Widget 3**: Circulars & Notices.

---

## 4. Widget Specifications

### 4.1 KPI Cards (Top Row)
*   **Today's Classes**: Count of scheduled classes. Icon: Calendar.
*   **Pending Attendance**: Count of classes where attendance is not marked.
*   **Total Holidays**: Count of holidays in the current month. Icon: Umbrella Beach.
*   **Overall Syllabus**: Average percentage of syllabus completed across all assigned classes. Icon: Book Open.

### 4.2 Today's Timetable
*   **Layout**: List/Table view.
*   **Data**: Time Range | Class Name | Subject | Status Button.
*   **States**: Done, In Progress, Upcoming.

### 4.3 Middle Split Section
#### Left: Syllabus Progress (Class-wise)
*   **Format**: Class-wise progress bars.
*   **Details**: Class Name (e.g., Class 6 A) + Subject (in brackets) + Percentage.
*   **Visual**: Color-coded bars.

#### Right: Tasks To Do
*   **Format**: Interactive Todo List.
*   **Details**: Task Description + Priority Tag.
*   **Interaction**: Checkbox to mark as done.

### 4.4 Notices & Announcements
*   **Layout**: List of recent circulars.
*   **Details**: Title, Date, 'New' Badge for recent items.

---

## 5. API Usage

### 5.1 Fetch Dashboard
`GET /api/dashboard`
*   **Headers**: `Authorization: Bearer <teacher_token>`
*   **Response**:
    ```json
    {
      "role": "teacher",
      "widgets": [
        { "type": "kpi_cards", "data": { "classes": 5, "attendance_pending": 2, "holidays": 4, "syllabus_overall": 68 } },
        { "type": "timetable", "data": [...] },
        { "type": "syllabus_progress", "data": [...] },
        { "type": "tasks_todo", "data": [...] },
        { "type": "notices", "data": [...] }
      ]
    }
    ```

### 5.2 Actions
*   `POST /api/attendance/mark`: Submit attendance for a class.
*   `POST /api/homework/review`: Submit grades/comments.

---

## 6. Database Dependencies
*   **`timetable`**: Source of truth for daily schedule.
*   **`class_sections`**: Maps teachers to classes.
*   **`subjects`**: Subject details.
*   **`attendance_logs`**: Tracks completion status.
*   **`lesson_plans`**: Tracks planning submissions.

---

## 7. Test Cases (Teacher Specific)
*   **TC-TCH-001**: Verify that "Today's Classes" only shows classes where `teacher_id` matches the logged-in user.
*   **TC-TCH-002**: Verify that the "Mark Attendance" button is disabled for future classes (if configured).
*   **TC-TCH-003**: Check that "Pending Tasks" count decreases immediately after completing a task (e.g., marking attendance).
*   **TC-TCH-004**: Ensure notices intended for "All Staff" or "Teachers" are visible, but "Admin Only" notices are hidden.

---

## 8. Acceptance Criteria
*   [ ] Dashboard loads in < 1 second.
*   [ ] No financial information is ever visible.
*   [ ] Mobile view stacks widgets vertically with touch-friendly buttons.
*   [ ] "Current Period" is visually distinct in the timetable.
