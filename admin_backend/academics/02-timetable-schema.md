# Timetable Management - Backend Specifications

## 1. Module Overview
The **Timetable Module** is the core scheduling engine of the ERP system. It manages the temporal allocation of academic resources (Teachers, Subjects, Rooms) to Student Groups (Classes/Sections).
It utilizes a 2-Step Architecture: Separation of concerns between the *Structure* (Schedule Container) and the *Content* (Period Assignment). The backend acts as the authoritative source of truth for conflict resolution (e.g., Teacher A cannot be in two classes at 09:00 AM).

## 2. API List

| Endpoint | Method | Description | Roles |
| :--- | :--- | :--- | :--- |
| `/api/v1/schedules` | POST | Create the container framing structure | Admin |
| `/api/v1/schedules` | GET | List configured schedule containers | Admin, Teacher |
| `/api/v1/periods` | POST | Commit a specific slot assignment | Admin |
| `/api/v1/schedules/{id}/periods`| GET | Returns a structured grid matrix of assignments | Admin, Teacher, Student |
| `/api/v1/periods/{id}` | DELETE | Remove an assignment slot block | Admin |

## 3. Request Format

### POST `/api/v1/schedules`
```json
{
  "class_id": "uuid-classA",
  "section_id": "uuid-section1",
  "academic_session_id": "uuid-sess2024",
  "month": "January",
  "start_time": "08:00:00",
  "end_time": "14:00:00",
  "total_periods": 8,
  "period_duration_mins": 40
}
```

### POST `/api/v1/periods`
```json
{
  "schedule_id": "uuid-container1",
  "day_of_week": "Monday",
  "period_number": 3,
  "subject_id": "uuid-mathSub",
  "teacher_id": "uuid-teacherDave",
  "is_consecutive": false
}
```

## 4. Response Format

### GET `/api/v1/schedules/{id}/periods`
```json
{
  "status": "success",
  "data": {
    "schedule_id": "uuid-container1",
    "periods": [
      {
        "id": "uuid-periodA",
        "day_of_week": "Monday",
        "period_number": 3,
        "start_time": "09:40:00",
        "end_time": "10:20:00",
        "subject_name": "Mathematics",
        "teacher_name": "Dave Smith",
        "is_break": false
      }
    ]
  }
}
```

## 5. Database Tables Used

### `schedules` Table (Container)
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Unique Identifier |
| `branch_id` | UUID | NOT NULL, FK | Multi-tenancy isolation |
| `academic_session_id` | UUID | NOT NULL, FK | Academic Year link |
| `class_id` | UUID | NOT NULL, FK | Parent Class |
| `section_id` | UUID | NOT NULL, FK | Parent Section |
| `month` | VARCHAR(20) | NOT NULL | e.g., "January" |
| `start_time` | TIME | NOT NULL | School start time |
| `end_time` | TIME | NOT NULL | School end time |
| `total_periods` | INT | NOT NULL | e.g., 8 |
| `period_duration` | INT | NOT NULL | Duration in minutes |

### `schedule_periods` Table (Assignments)
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Unique Identifier |
| `schedule_id` | UUID | NOT NULL, FK | Parent Container |
| `day_of_week` | ENUM | NOT NULL | 'Monday'... |
| `period_number` | INT | NOT NULL | 1-indexed (1, 2, 3...) |
| `start_time` | TIME | NOT NULL | Computed interval |
| `end_time` | TIME | NOT NULL | Computed interval |
| `subject_id` | UUID | NOT NULL, FK | |
| `teacher_id` | UUID | NOT NULL, FK | Primary Teacher |
| `is_break` | BOOLEAN | DEFAULT FALSE | |
| `is_consecutive` | BOOLEAN | DEFAULT FALSE | For merging blocks |

## 6. Business Logic (Step-by-Step)

### `createPeriodAssignment`
1.  **Container Parsing**: Fetch parent `schedules` row via `schedule_id`. Verify `start_time` and `period_duration` to compute exact `start_time` and `end_time` for the specified `period_number`.
2.  **Conflict Validation**: Query `schedule_periods` where `teacher_id=? AND day_of_week=?` tracking overlapping computed timestamps across ALL containers in the branch. If a clash exists, throw `409 Conflict`.
3.  **Insert Statement**: Execute `INSERT` mapping the teacher, subject, schedule logic, and specific computed timeframe block.

## 7. Validation Rules
1.  **Strict Isolation**: All foreign keys (`class_id`, `subject_id`, `teacher_id`) MUST natively belong to the same `branch_id` as the container.
2.  **Unique Period Matrix**: A `(schedule_id, day_of_week, period_number)` tuple must remain strictly unique.
3.  **No Double Booking**: A `teacher_id` cannot be assigned to two different overlapping `schedule_periods` natively locking double bookings across sections.

## 8. Authentication and Authorization
*   **Write Operations** (`POST`, `PUT`, `DELETE`): Strongly scoped to `@Authorized('admin', 'academic_coord')`.
*   **Read Access**: Fully open to Teachers and Students (filtering specifically for their own Contextually mapped Class or User arrays).

## 9. Error Handling (Status Codes)
*   `400 Bad Request`: Payload missing mandatory bounding parameters (`total_periods`).
*   `401 Unauthorized`: Token malformed or absent.
*   `403 Forbidden`: Teacher attempting to mutate assignments or container structs.
*   `409 Conflict`: Teacher conflict constraint violation during `POST /periods`. Example payload: "Teacher Dave Smith is actively teaching Class 4-B".

## 10. Performance Requirements
*   **Grid Rendering**: `GET /api/v1/schedules/{id}/periods` merges substantial joins to compute the visual table. Latency bounds firmly demand resolving the mapping within < 80ms using appropriate PostgreSQL `idx_periods_conflict` indexing.

## 11. Security Requirements
*   **Multi-Branch Mapping**: Tenant isolation necessitates that every API route appends strictly to a single `branch_id` bound implicitly by the session context rather than arbitrary user payloads to prevent cross-contamination.

## 12. Edge Cases
*   **Replication Loop**: Backend must allow a distinct `/api/v1/schedules/replicate` endpoint to seamlessly iterate container configurations into subsequent `month` bounds without duplicating granular period payload assignments intuitively spanning terms.

## 13. Backend Test Cases

| Test ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **TC-BE-TT-001** | Create Container Logic | Submit `POST /schedules` missing End Time. | Output math natively structures the configuration safely throwing no errors. |
| **TC-BE-TT-002** | Deep Double Booking Trap | Insert Teacher A to Mon/P1. Insert Teacher A to Mon/P1 (Different Section). | Operation violently throws `409` conflict logic halting insert correctly mapping overlapping logic bounds. |
| **TC-BE-TT-003** | Orphan Shielding Strategy | Soft Delete a Container via `DELETE`. Fetch `periods`. | Controller immediately 404s rejecting lookup traversing into the broken structure cascade. |
| **TC-BE-TT-004** | Role Boundary Tests | Connect via Teacher JWT. Submit `POST /periods`. | Rejects operation immediately via `403 Forbidden` preserving administrative write dominance. |

---
*End of Backend Document*
