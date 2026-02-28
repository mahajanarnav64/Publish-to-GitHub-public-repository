# Class & Section Management - Backend Specifications

## 1. Module Overview
The **Class & Section Management** table establishes the master hierarchy of the academic framework. It defines the specific grades (Classes) configured for an Academic Session, which are subsequently split into specific units (Sections). This module enforces strong referential integrity, preventing inadvertent structural deletions when dependent student or scheduling data is attached.

## 2. API List

| Endpoint | Method | Description | Roles |
| :--- | :--- | :--- | :--- |
| `/api/v1/classes` | POST | Create a new class along with defined sections | Admin |
| `/api/v1/classes` | GET | Retrieve list of classes scoped by `academic_session_id` | Admin, Teacher, Student |
| `/api/v1/classes/{id}` | PUT | Update class attributes and specific section map | Admin |
| `/api/v1/classes/{id}` | DELETE | Soft delete the class conditionally | Admin |

## 3. Request Format

### POST `/api/v1/classes`
```json
{
  "name": "Class X",
  "academic_session_id": "uuid-1111",
  "description": "High School Freshman Cohort",
  "status": "Active",
  "sections": ["A", "B", "C"]
}
```

### PUT `/api/v1/classes/{id}`
```json
{
  "name": "Class X",
  "description": "Updated Cohort details",
  "status": "Active",
  "sections": ["A", "B", "C", "D"]
}
```

## 4. Response Format

### GET `/api/v1/classes`
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid-2222",
      "name": "Class X",
      "academic_session_id": "uuid-1111",
      "description": "High School Freshman Cohort",
      "status": "Active",
      "sections_count": 3,
      "total_students": 142,
      "created_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

## 5. Database Tables Used

### `classes` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK, AUTO_INCREMENT | Unique class ID |
| `name` | VARCHAR(255) | NOT NULL | e.g. "Class I", "Grade 10" |
| `branch_id` | UUID | FK -> branches.id, NOT NULL | Tenant Isolation |
| `academic_session_id`| BIGINT | FK -> academic_sessions.id, NOT NULL| Scopes class to a session timeframe |
| `description` | TEXT | NULL | Details/Notes |
| `status` | ENUM | DEFAULT 'Active' | 'Active', 'Inactive' |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| `deleted_at` | TIMESTAMP | NULL | Soft Delete |

**Indexes**:
*   `idx_classes_session`: `ON classes(academic_session_id)`
*   `idx_classes_uniq`: `UNIQUE (name, academic_session_id, branch_id)`

### `sections` Table
*(Note: Exists as a dependent entity to classes)*
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK, AUTO_INCREMENT | Unique section ID |
| `class_id` | BIGINT | FK -> classes.id, NOT NULL | Parent reference |
| `name` | VARCHAR(50) | NOT NULL | e.g. "A", "B" |
| `status` | ENUM | DEFAULT 'Active' | |
| `deleted_at` | TIMESTAMP | NULL | Soft Delete |

## 6. Business Logic (Step-by-Step)

### `createClass`
1.  **Duplicate Check**: Execute `SELECT COUNT(*) WHERE name=? AND academic_session_id=? AND branch_id=?`. Must be 0.
2.  **Transactions**: Begin transaction to ensure atomic execution.
3.  **Create Class**: Insert row into `classes`. Retrieve `id`.
4.  **Create Sections**: Map the `sections` array in the request. Bulk `INSERT INTO sections (class_id, name)` using the generated class id.
5.  **Commit**: Commit the transaction securely.

### `updateClass`
1.  **Retrieve Existing**: Fetch `classes` checking branch and session access.
2.  **Section Delta**: Parse incoming `sections` array against existing DB rows.
    *   **New Items**: Insert new rows into `sections`.
    *   **Removed Items**: Perform `Count` check on `students` table where `section_id=?`. If count > 0, instantly throw `422 Unprocessable Entity` ("Cannot remove section containing students"). If count = 0, soft-delete section.
3.  **Class Row Mutate**: Update standard columns.

### `deleteClass`
1.  **Integrity Validation**: Execute `SELECT COUNT(*) FROM students WHERE class_id=?`.
2.  **Execute**: If count > 0 -> Throw `422 Unprocessable Entity`. Else -> Update `classes` setting `deleted_at = NOW()`. Cascade update `sections` similarly.

## 7. Validation Rules
*   Every `class.name` must be trimmed.
*   Unique composite constraint `(name, academic_session_id, branch_id)` enforces strict uniqueness.
*   Status strictly enumerated to `['Active', 'Inactive']`.

## 8. Authentication and Authorization
*   **Create/Update/Delete**: Strictly limited to Admin roles (`@Authorized('admin', 'academic_admin')`).
*   **Listing/Reading**: Extends read access to downstream modules (`@Authorized('admin', 'teacher')`).

## 9. Error Handling (Status Codes)
*   `400 Bad Request`: Missing mandatory fields (`name`, `academic_session_id`).
*   `401 Unauthorized`: Token missing or malformed.
*   `409 Conflict`: `CLS_001`: Duplicate class name in identical academic session.
*   `422 Unprocessable Entity`: `CLS_002`: Dependent records block deletion (Students existing in sections).

## 10. Performance Requirements
*   **List Aggregation**: `GET /classes` must include `sections_count` and `total_students` aggregated fields computed optimally via `LEFT JOIN` groups with latency < 100ms.

## 11. Security Requirements
*   **Cross-Tenant Scoping**: All database constraints and lookup logic strictly append `AND branch_id = user.branch_id`.

## 12. Edge Cases
*   **Soft Delete Orphan Strategy**: Upon a valid `deleteClass`, all dependent `sections` without enrollment MUST also receive `deleted_at=NOW()` flags traversing the structural tree securely.

## 13. Backend Test Cases

| Test ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **TC-BE-CLS-001** | Create Class Flow | POST `/classes` with 3 sections | `201 Created`. 1 Class row and 3 Section rows created natively. |
| **TC-BE-CLS-002** | Composite Duplicate Check | POST 'Class I' to Active Session twice | Returns `409 Conflict` pointing to duplicate namespace. |
| **TC-BE-CLS-003** | Missing Constraints | POST payload without Session ID | `400 Bad Request`. |
| **TC-BE-CLS-004** | Block Soft Delete | Send `DELETE` matching ID actively mapping 30 students | Intercepted logic executes returning `422 Unprocessable Entity` preventing data loss. |
| **TC-BE-CLS-005** | View Scope | Access `/classes` endpoint via Student JWT | Returns `403 Forbidden` ensuring role alignment. |

---
*End of Backend Document*
