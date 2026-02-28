# Academic Calendar - Backend Specifications

## 1. Module Overview

The **Academic Calendar** module provides the foundational time-tracking matrix for the ERP platform. It dictates the configuration of Working Days, Sundays, and specific Holidays per session. Since the system supports Multi-Branch operations, each tenant branch operates on an isolated calendar schema. This module acts as the core dependency for logic across modules such as Syllabus Planners, Exam scheduling, and Teacher validation.

---

## 2. API List

| Endpoint | Method | Description | Roles |
| :--- | :--- | :--- | :--- |
| `/api/v1/calendar/generate` | POST | Bulk inserts 365 rows for a session and configures Sundays | Admin, Branch Admin |
| `/api/v1/calendar` | GET | Fetches all specific dates and their flags (is_working_day) | Admin, Teacher, Student |
| `/api/v1/calendar/holiday` | POST | Marks an existing date or a range of dates as a Holiday/Exam/Event | Admin, Branch Admin |
| `/api/v1/calendar/holiday/{id}` | DELETE | Removes the holiday flag, reverting to default logic | Admin, Branch Admin |

---

## 3. Request Format

### POST `/api/v1/calendar/generate`
```json
{
  "branch_id": "uuid-1111",
  "session_id": "uuid-2222",
  "start_date": "2024-04-01",
  "end_date": "2025-03-31"
}
```

### POST `/api/v1/calendar/holiday`
```json
{
  "start_date": "2024-12-25",
  "end_date": "2024-12-25",
  "title": "Christmas",
  "type": "holiday"
}
```

---

## 4. Response Format

### GET `/api/v1/calendar` (Success)
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid-3333",
      "branch_id": "uuid-1111",
      "academic_session_id": "uuid-2222",
      "date": "2024-04-01",
      "day_of_week": 1,
      "is_working_day": true,
      "is_holiday": false,
      "holiday_name": null
    }
  ]
}
```

### Generic Error Response
```json
{
  "status": "error",
  "error": {
    "code": "CAL_001",
    "message": "Calendar already exists for this Session."
  }
}
```

---

## 5. Database Tables Used

### `academic_calendar`
Master table for all days in a session. Each branch has its own complete set of days.

| Field | Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, Default: gen_random_uuid() | Unique ID |
| `branch_id` | UUID | FK -> branches.id, NOT NULL | Tenant Isolation |
| `academic_session_id` | UUID | FK -> academic_sessions.id, NOT NULL | e.g. 2024-2025 |
| `date` | DATE | NOT NULL | The specific calendar date |
| `day_of_week` | INT | Check (1-7) | 1=Mon, 7=Sun |
| `is_working_day` | BOOL | Default True | Flips to False for Sun/Holidays |
| `is_holiday` | BOOL | Default False | Explicit Holiday flag |
| `holiday_name` | VARCHAR(255) | Nullable | e.g. "Diwali" |
| `created_at` | TIMESTAMPTZ | Default NOW() | |
| `updated_at` | TIMESTAMPTZ | Default NOW() | |
| `deleted_at` | TIMESTAMPTZ | NULL | Soft Delete |

**Indexes**:
*   `idx_calendar_lookup`: `UNIQUE (branch_id, date)`
*   `idx_calendar_session`: `(branch_id, academic_session_id)`
*   `idx_calendar_holiday`: `(branch_id, is_holiday)`

---

## 6. Business Logic

### Generating the Calendar (Step-by-Step)
1.  **Validation**: Verify `start_date` is strictly before `end_date`. Validate that an `academic_session_id` does not already have calendar entries for that specific `branch_id` to prevent double generation.
2.  **Date Traversal**: Execute a loop incrementing day by day from the `start_date` to `end_date`.
3.  **Property Assignment**:
    *   Compute the `day_of_week` mathematically (1-7).
    *   If the result is `7` (Sunday), default the inserted object to `is_working_day = false`.
    *   Otherwise, default to `true`.
4.  **Bulk Insertion**: Push all calculated 365/366 rows down to the DB in a bulk transaction.
5.  **Commit**: Save references.

### Services: `CalendarService`
*   `getWorkingDaysCount(startDate, endDate)`: Runs `COUNT(*)` where `branch_id=?`, `date` is between conditions, and `is_working_day=true`. Crucial for Syllabus planning projections.
*   `isHoliday(date)`: Confirms if a specific date holds the `is_holiday=true` flag. Validates timetables.

---

## 7. Validation Rules

*   Dates must be received and transmitted in `YYYY-MM-DD` ISO-8601 strings.
*   Generation boundaries cannot exceed strictly 366 rows to prevent unbounded DB insertion loops.
*   A holiday modification strictly requires either the `id` of the row or both the `date` and `branch_id` to reliably identify the record.

---

## 8. Authentication and Authorization

*   **View Access**: Granted globally to any authenticated role (`@Authorized('admin', 'teacher', 'student', 'parent')`). Requires valid JWT.
*   **Write Access**: Strictly locked to Super Admins and Branch Admins (`@Authorized('admin', 'branch_admin')`).
*   **Tenant Isolation**: All DB queries automatically append `WHERE branch_id = user.branch_id`.

---

## 9. Error Handling (Status Codes)

*   `400 Bad Request`: Validation failure (e.g., Dates overlap, missing holiday name).
    *   `CAL_001`: Calendar already exists for this Session.
    *   `CAL_002`: End Date must be after Start Date.
*   `401 Unauthorized`: Invalid or missing token.
*   `403 Forbidden`: Teacher attempting to add a calendar generation request.
*   `404 Not Found`: Attempting to delete a holiday `id` that does not exist.
*   `500 Internal Error`: Bulk transaction failure locking the DB.

---

## 10. Performance Requirements

*   **Bulk Operations**: Generating the calendar must be performed via bulk `INSERT` statements to avoid 365 consecutive round-trips to the DB instance. Operation must complete under `400ms`.
*   **Query Speeds**: Lookup index on `(branch_id, session_id)` ensures retrieving the full 365 response list takes less than `30ms`.

---

## 11. Security Requirements

*   **Tenant Scoping**: Never allow a Branch Admin to inject rows where the `branch_id` payload does not match their JWT encoded `branch_id`.
*   **SQL Injections**: Parameterize bulk query arrays meticulously.
*   **Rate Limiting**: Rate limit generation paths to 5 requests/minute to prevent malicious spanning delays.

---

## 12. Edge Cases

1.  **Multiple Holidays on Identical Dates**: The UI and Database should treat a date atomically. Subsequent POSTs for a holiday on the exact same date should perform an `UPSERT` override.
2.  **Changing Sunday Working Logic**: Handled strictly via direct row update.
3.  **Leap Year Validation**: Postgres `DATE` operations naturally restrict phantom dates like "Feb 29 on non-leap years". Bulk loop scripts must rely on standard `moment`/`date-fns` iterators rather than manually counting +1 values.

---

## 13. Backend Test Cases

| Test ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **TC-BE-CAL-001** | Block Double Genesis | POST to `/generate` twice for same session | Return `400` with `CAL_001` block. Verify 365 rows. |
| **TC-BE-CAL-002** | Sunday Calculation Integrity | Generate year, select all Sundays via API | Response contains `day_of_week: 7` and `is_working_day: false` strictly |
| **TC-BE-CAL-003** | Unauthorized Holiday Write | Attempt to POST holiday using Student JWT Token | Return `403 Forbidden` Exception |
| **TC-BE-CAL-004** | Unique Constraints (Isolation) | Branch B posts identical payload to Branch A | Succeed. Indexes separate rows via `branch_id` |
| **TC-BE-CAL-005** | Service Validation Logic | Hit `getWorkingDaysCount` over a tested span | Returns numeric value correctly omitting generated Sundays/Holidays |

---
*End of Backend Document*
