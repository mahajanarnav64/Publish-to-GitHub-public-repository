# Syllabus Planner & Tracker - Backend Specifications

## 1. Module Overview
The Syllabus module is strictly separated into two distinct roles and interfaces but operates over a unified database schema:
1.  **Syllabus Planner (Admin Only)**: Defines the academic structure (Chapters & Topics) and their planned timeframes.
2.  **Lesson & Syllabus Tracker (Teacher Only)**: The operational layer used to execute the plan, log daily progress, and track completion against benchmarks.

**Hierarchy**: `Academic Session` → `Class` → `Subject` → `Chapter` → `Topic`.

## 2. API List

| Endpoint | Method | Description | Roles |
| :--- | :--- | :--- | :--- |
| `/api/v1/syllabus/planner` | GET | Retrieve full structural plan (Admin context) | Admin |
| `/api/v1/syllabus/planner` | POST | Bulk insert/update Chapters and Topics | Admin |
| `/api/v1/syllabus/tracker` | GET | Retrieve mapped tracker state | Teacher, Admin |
| `/api/v1/syllabus/tracker/start` | POST | Log start timestamp for a specific topic | Teacher |
| `/api/v1/syllabus/tracker/complete`| POST | Log end timestamp and status for a topic | Teacher |

## 3. Request Format

### POST `/api/v1/syllabus/planner`
```json
{
  "class_id": "uuid-111",
  "subject_id": "uuid-222",
  "chapters": [
    {
      "name": "Algebra",
      "planned_duration_days": 5,
      "sequence_order": 1,
      "topics": [
        { "name": "Linear Equations", "planned_duration_days": 3 },
        { "name": "Quadratic Equations", "planned_duration_days": 2 }
      ]
    }
  ]
}
```

### POST `/api/v1/syllabus/tracker/complete`
```json
{
  "topic_id": "uuid-444",
  "status": "Completed",
  "early_completion_feedback": "Skipped basic intro as class already knew it."
}
```

## 4. Response Format

### GET `/api/v1/syllabus/tracker`
```json
{
  "status": "success",
  "data": {
    "chapter_id": "uuid-333",
    "chapter_name": "Algebra",
    "chapter_progress_percentage": 50,
    "performance_status": "On Time",
    "topics": [
      {
        "topic_id": "uuid-444",
        "name": "Linear Equations",
        "status": "Completed",
        "started_at": "2024-04-10T08:00:00Z",
        "completed_at": "2024-04-12T14:00:00Z"
      }
    ]
  }
}
```

## 5. Database Tables Used

### `syllabus_chapters`
*   `id` (UUID): PK
*   `syllabus_plan_id` (UUID): FK
*   `name` (VARCHAR): Chapter title
*   `sequence_order` (INT)
*   `planned_duration_days` (INT): Target days to complete.
*   `start_date` (DATE): Timestamp of first topic start.
*   `completion_date` (DATE): Timestamp of last topic completion.

### `syllabus_topics`
*   `id` (UUID): PK
*   `chapter_id` (UUID): FK
*   `name` (VARCHAR): Topic title
*   `sequence_order` (INT)
*   `status` (ENUM): 'Pending', 'In Progress', 'Completed'.
*   `planned_duration_days` (INT): Specific working days assigned.
*   `started_at` (TIMESTAMP): When teacher clicked "Start".
*   `completed_at` (TIMESTAMP): When teacher clicked "Mark Complete".
*   `early_completion_feedback` (TEXT): Nullable.

## 6. Business Logic (Step-by-Step)

1.  **Duration Validation**: When processing `/planner` POST:
    *   Iterate through each submitted Chapter.
    *   Iterate through its nested Topics and sum the `planned_duration_days`.
    *   If the Topic sum !== Chapter's `planned_duration_days`, throw validation error.
2.  **Tracking Calculation**:
    *   `Chapter Progress = (Completed Topics / Total Topics) * 100` computations occur natively during the GET tracker response mapping.
3.  **Performance Indicator Math**:
    *   Calculated comparing `Actual Duration` vs. `Planned Duration`.
    *   `Actual Duration = (Chapter Completion Date - Chapter Start Date)`.
    *   **On Time**: Actual == Planned (or close enough contextually). Returns "ON TIME". Driven natively into the UI as a **Green** confirmed status.
    *   **Late Completion**: Actual > Planned. Returns "DELAYED". Driven natively into the UI as a **Red** warning status.
    *   **Early Check-in**: Actual < Planned. Returns "EARLY". Driven natively into the UI as a **Red** warning status because pacing anomalies require attention.

## 7. Validation Rules
*   Every topic MUST have a positive integer for `planned_duration_days`.
*   A `topic_id` payload must exist in the database and belong to the authenticated teacher's assigned class/subject.
*   Early completion endpoints enforce `early_completion_feedback` character length > 10 if Actual < Planned.

## 8. Authentication and Authorization
*   **Planner Mutations**: Strictly restricted to `@Authorized('admin')`.
*   **Tracker Mutations**: Specifically isolated to the Teacher UUID matching the Subject mapping array (`@Authorized('teacher')`).
*   **Tenant Isolation**: All database retrievals chain `.where('branch_id', user.branch_id)`.

## 9. Error Handling (Status Codes)
*   `400 Bad Request`: Validation failure (e.g., SYL_001 "Duration mismatch between Chapter and Topics").
*   `401 Unauthorized`: Invalid Token.
*   `403 Forbidden`: Teacher attempting to overwrite Admin chapter frameworks.
*   `404 Not Found`: Tracker topic ID missing.

## 10. Performance Requirements
*   Progress calculation metrics should be aggregated via SQL `GROUP BY` views rather than deep mapping in Node.js to keep Tracker load times under `150ms`.

## 11. Security Requirements
*   Prevent mass-assignment vulnerabilities on `/tracker/complete` ensuring users cannot alter `planned_duration_days` parameters via Tracker endpoints.
*   Isolate tenant data universally using JWT claims.

## 12. Edge Cases
*   **Orphan Topics**: If an admin deletes a Chapter, all nested Topics cascade delete.
*   **Timestamp Skew**: System forces server-side `NOW()` for `started_at` and `completed_at` rather than accepting client-side timestamps to prevent malicious backward/forward logging by teachers.

## 13. Backend Test Cases

| Test ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **TC-BE-SYL-001** | Sub-topic Duration Constraint | POST planner with Chapter=5, Topics=2,4 | Returns `400 Bad Request` with duration mismatch error string |
| **TC-BE-SYL-002** | Topic Start Registration | POST to `/tracker/start` | Topic row updates `status='In Progress'` and `started_at=NOW()` |
| **TC-BE-SYL-003** | Rollup Progress Calculation | Request Tracker with 1 of 2 topics complete | JSON payload returns `chapter_progress_percentage: 50` |
| **TC-BE-SYL-004** | Role Segregation Block | Send POST to `/planner` with Teacher JWT | Returns `403 Forbidden` |
| **TC-BE-SYL-005** | Early Completion Block | Send `/tracker/complete` early without feedback | Returns `400` requesting supplementary string |

---
*End of Backend Document*
