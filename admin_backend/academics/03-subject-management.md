# Subject Management - Backend Technical Specifications

## 1. Module Overview
The **Subject Management** module is the foundational academic data structure for the HybridERP system. It serves as the master catalog of all subjects (e.g., Mathematics, English, Physics Lab) taught across the institution. Its primary purpose is to define subjects and map them to appropriate classes/grades, enabling downstream mapping.

**Critical Dependencies**:
*   Class Management (determines what subjects classes take)
*   Teacher Allocation (allocates staff to subjects)
*   Timetable (distributes subjects over the week)
*   Exams and Lesson Planners.

## 2. API List

| Endpoint | Method | Description | Roles |
| :--- | :--- | :--- | :--- |
| `/api/v1/subjects` | POST | Create a new Subject mapping to Classes | Admin |
| `/api/v1/subjects` | GET | Retrieve full catalog of subjects | Admin, Teacher |
| `/api/v1/subjects/{id}` | PUT | Update Subject and its Class mapping delta | Admin |
| `/api/v1/subjects/{id}` | DELETE | Soft delete an unused Subject | Admin |

## 3. Request Format

### POST `/api/v1/subjects`
```json
{
  "subject_name": "Mathematics",
  "subject_type": "Theory",
  "description": "Core maths module",
  "class_ids": [
    "uuid-class1",
    "uuid-class2"
  ]
}
```

### PUT `/api/v1/subjects/{id}`
```json
{
  "subject_name": "Physics Lab",
  "subject_type": "Practical",
  "description": "Science Labs",
  "class_ids": [
    "uuid-class1",
    "uuid-class3"
  ]
}
```

## 4. Response Format

### GET `/api/v1/subjects`
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid-sub1",
      "subject_name": "Mathematics",
      "subject_type": "Theory",
      "description": "Core maths module",
      "status": true,
      "classes": [
        {
          "id": "uuid-class1",
          "name": "Class V"
        },
        {
          "id": "uuid-class2",
          "name": "Class VI"
        }
      ]
    }
  ]
}
```

## 5. Database Tables Used

### `subjects` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, Default: gen_random_uuid() | Unique Subject ID |
| `branch_id` | UUID | FK -> branches.id, NOT NULL | Tenant Isolation |
| `subject_name` | VARCHAR(100) | NOT NULL | Name of the subject (e.g., "Mathematics") |
| `subject_type` | VARCHAR(20) | NOT NULL, DEFAULT 'Theory' | Enum: 'Theory', 'Practical', 'Activity' |
| `description` | TEXT | NULL | Optional description |
| `status` | BOOLEAN | DEFAULT TRUE | Active/Inactive status |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |
| `deleted_at` | TIMESTAMPTZ | NULL | Soft delete timestamp |

**Indexes**:
*   `idx_subjects_branch_id`: `ON subjects(branch_id)`
*   `idx_subjects_name`: `ON subjects(lower(subject_name))` (for duplicate checks)

### `class_subjects` Table (Pivot)
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, Default: gen_random_uuid() | Unique Mapping ID |
| `branch_id` | UUID | FK -> branches.id, NOT NULL | Tenant Isolation |
| `class_id` | UUID | FK -> classes.id, NOT NULL | Class Reference |
| `subject_id` | UUID | FK -> subjects.id, NOT NULL | Subject Reference |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Indexes**:
*   `idx_class_subjects_lookup`: `UNIQUE ON class_subjects(class_id, subject_id)` (Composite Constraint)

## 6. Business Logic (Step-by-Step)

### `createSubject`
1.  **Validation**: Validate inputs. `subject_name` is required. `class_ids` array must not be empty.
2.  **Duplicate Check**: Execute query `SELECT COUNT(*) FROM subjects WHERE LOWER(subject_name) = ? AND branch_id = ? AND deleted_at IS NULL`.
3.  **Transaction Start**: Begin DB transaction.
4.  **Insert Subject**: Push base subject metadata to `subjects`. Retrieve generated `id`.
5.  **Insert Pivot**: Map over `class_ids`. Insert `{ subject_id, class_id, branch_id }` rows into `class_subjects`.
6.  **Commit**: Commit the transaction securely.

### `updateSubject`
1.  **Validation**: Fetch existing subject to enforce branch ownership.
2.  **Diff Computations**: Compare incoming `class_ids` with existing ones.
    *   **New Mappings**: Insert directly into `class_subjects`.
    *   **Removed Mappings**: Check `timetable_slots` to see if the subject is actively scheduled in the removed classes. If yes, block update logic and throw `409 Conflict`. If safe, delete the pivot row mapping.

### `deleteSubject` (Soft Delete)
1.  **Checks**: Verify if `timetable_slots` or `exam_papers` contain references to `subject_id`.
2.  **Execute**: If usages exist -> Throw `409 Conflict`. Else -> Set `deleted_at = NOW()`.

## 7. Validation Rules
1.  **Duplicate Name**: Case-insensitive uniqueness enforced functionally during the `create` operations scoped exactly by the `branch_id`.
2.  **Orphan Check**: User is forced to map the subject to at least 1 class on creation.
3.  **Cross-Branch Access**: All DB lookup clauses must inject `AND branch_id = ?`.

## 8. Authentication and Authorization
*   **Write Access**: (`create`, `update`, `delete`) Heavily restricted natively to `@Authorized('admin', 'academic_admin')`
*   **Read Access**: (`list`) Open to `@Authorized('teacher', 'admin', 'student')` to retrieve lookup tables.
*   **Tenant Mapping**: Injected via JWT Context representing `branch_id`.

## 9. Error Handling (Status Codes)
*   `400 Bad Request`: Empty `class_ids` array; Request body invalid structure.
*   `401 Unauthorized`: Invalid Token Payload.
*   `403 Forbidden`: Teacher attempting to delete a Subject.
*   `404 Not Found`: Attempting to edit a nonexistent Subject UUID.
*   `409 Conflict`: 
    *   `SUB_001`: Subject name already exists in this branch.
    *   `SUB_002`: Cannot delete or modify mappings for a subject currently configured inside a Class Timetable.

## 10. Performance Requirements
*   **Reads**: Fetching the full subject list must execute a single performant `JOIN` mapping classes beneath each subject record. Target query execution time < `40ms`.
*   **Writes**: Class-Subject mappings must happen via bulk transactional `INSERT` strings to minimize round trips per mapped class.

## 11. Security Requirements
*   **Isolation**: No branch should ever retrieve or modify another branch's Subject data. All SQL mutations must append the implicit tenant check (`branch_id`).
*   **SQL Injections**: Strictly parameterize bulk pivot loops array statements.

## 12. Edge Cases
1.  **Mapping to Inactive Classes**: Currently allowed via DB logic (classes may be pre-created). The Frontend should flag warning logic.
2.  **Changing Subject Type**: Switching from `Theory` -> `Practical`. The system persists the update, but this may cause implicit warnings in the timetable generator if practicals require contiguous slots.

## 13. Backend Test Cases

| Test ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **TC-BE-SUB-001** | Create Subject Successfully | POST valid payload mapping 2 classes | `201 Created`. `subjects` and 2 pivot rows generated. |
| **TC-BE-SUB-002** | Prevent Duplicate Name | POST exactly replicated `subject_name` payload twice | Return `409 Conflict` containing `SUB_001` error. |
| **TC-BE-SUB-003** | Update with Pivot Change | PUT a new class mapping array | Database successfully computes difference, adds new class mapping pivot without duplicating existing one. |
| **TC-BE-SUB-004** | Block Timetable Deletion | DELETE Subject mapped into timetable slots | API blocks returning `409 Conflict` evaluating `timetable_slots` join. |
| **TC-BE-SUB-005** | Unauthorized Operations | DELETE Subject request via Teacher UUID | Native API `403 Forbidden` response. |

---
*End of Backend Document*
