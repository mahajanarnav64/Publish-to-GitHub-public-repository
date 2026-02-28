# Teacher Dashboard - Backend Documentation

## 1. Overview
This document details the backend logic, API endpoints, and data aggregation strategies specifically for the **Teacher Dashboard**. This dashboard is execution-focused, prioritizing daily tasks and schedule management over analytics.

## 2. API Endpoint

### 2.1 Fetch Dashboard Data
**Endpoint:** `GET /api/dashboard/teacher`
**Access:** Protected (Role: `Teacher`)
**Description:** Aggregates data from multiple sources (Timetable, Attendance, Syllabus, Tasks) into a single payload for the vertical feed.

**Response Structure:**
```json
{
  "kpis": {
    "todaysClasses": 5,           // Count of classes scheduled for today
    "pendingAttendance": 2,       // Count of past classes with unmarked attendance
    "totalHolidays": 4,           // Holidays in the current month
    "overallSyllabus": 68.5       // Weighted average % across all assigned classes
  },
  "timetable": [
    {
      "id": "tt_001",
      "timeRange": "09:00 - 10:00",
      "classSection": "6-A",
      "subject": "Mathematics",
      "status": "done"            // 'done' | 'active' | 'upcoming'
    },
    ...
  ],
  "syllabusProgress": [
    {
      "classSection": "6-A",
      "subject": "Mathematics",
      "percentage": 75,
      "color": "blue"             // Optional: Backend can suggest UI color
    },
    {
      "classSection": "7-B",
      "subject": "Science",
      "percentage": 60,
      "color": "emerald"
    }
  ],
  "tasksToDo": [
    {
      "id": "task_at_7a",
      "type": "attendance",
      "description": "Mark attendance for Class 7 A",
      "priority": "High",
      "link": "/attendance/mark/7a"
    },
    {
      "id": "task_lp_6b",
      "type": "lesson_plan",
      "description": "Complete lesson plan for Class 6 B",
      "priority": "Medium",
      "link": "/academics/lesson-plans"
    }
  ],
  "notices": [
    {
      "id": "not_01",
      "title": "Staff meeting tomorrow at 3:00 PM",
      "date": "18 Feb 2026",
      "isNew": true
    }
  ]
}
```

---

## 3. Data Logic & Aggregation

### 3.1 KPI Calculations
*   **Today's Classes**:
    *   Query `Timetable` collection.
    *   Filter: `teacherId == current_user.id` AND `date == today`.
    *   Count results.
*   **Pending Attendance**:
    *   Query `Timetable` (past dates/times).
    *   Filter: `teacherId == current_user.id` AND `attendanceMarked == false`.
    *   Count results.
*   **Total Holidays**:
    *   Query `AcademicCalendar`.
    *   Filter: `month == current_month` AND `type == 'holiday'`.
    *   Count results.
*   **Overall Syllabus**:
    *   Query `SyllabusTracking`.
    *   Filter: `teacherId == current_user.id`.
    *   Calculate Average of `completionPercentage`.

### 3.2 Timetable Status Logic
*   **Done**: `endTime < currentTime`.
*   **Active**: `startTime <= currentTime <= endTime`.
*   **Upcoming**: `startTime > currentTime`.

### 3.3 Tasks To Do Generation
The backend dynamically generates this list by checking various "Pending" states:
1.  **High Priority**:
    *   **Unmarked Attendance**: For classes ended > 30 mins ago.
2.  **Medium Priority**:
    *   **Lesson Plans**: Missing for classes scheduled in the next 3 days.
    *   **Homework**: Submission deadline passed > 24 hours ago and "Graded" status is false.
3.  **Low Priority**:
    *   **Syllabus Update**: If last update was > 7 days ago.
    *   **Weekly Reports**: If today is Friday/Saturday and report not submitted.

---

## 4. Database Schema Requirements

### 4.1 Collections Impacted
*   **`users`**: To identify `teacherId`.
*   **`timetable`**: Stores schedule and attendance status.
*   **`syllabus_tracking`**: Stores chapter completion per class/subject.
*   **`calendar_events`**: Stores holidays and events.
*   **`notices`**: Stores circulars with target audience (`staff`, `all`).

---

## 5. Performance Considerations
*   **Caching**: The dashboard response should be cached for 5-10 minutes per teacher, invalidated when:
    *   Attendance is marked.
    *   A lesson plan is submitted.
    *   A new notice is published.
*   **Parallel Execution**: Use `Promise.all` to fetch KPIs, Timetable, and Syllabus data concurrently to ensure low latency.
