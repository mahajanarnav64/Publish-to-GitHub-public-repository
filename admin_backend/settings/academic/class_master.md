# Class Master Backend Specification

## Module Overview
API handlers for maintaining the Class Master table for Academic Settings. Requires Admin/Super Admin authorization.

## API List
| Method | Endpoint | Description |
| - | - | - |
| GET | `/api/class_master` | Retrieve all items |
| POST | `/api/class_master` | Create new item |
| PUT | `/api/class_master/{id}` | Fully update item |
| PATCH | `/api/class_master/{id}/status` | Toggle status |

## Request Format
Standard JSON payload based on respective database fields.

## Response Format
Standard JSON envelope with `success`, `message`, and `data` parameters.

## Database Table Structure
Table name: `class_master`
Fields:
```text
id
branch_id
class_name
status
created_at
```

## Business Logic
- Maintain cross-tier referential integrity against parent masters.
- Do not allow deletion; favor status change to 'Inactive' (Soft delete logic if specified).

## Validation Rules
- Mandatory fields cannot be null or empty.
- `Class Master` uniqueness within `branch_id`.
- `status` must adhere to `Active` / `Inactive` enums.

## Authentication and Authorization
- Valid active bearer token required.
- User `role` string must strictly be evaluated. `teacher` denied. Only `admin` or `super admin` allowed.

## Error Handling
- `400 Bad Request`: Schema validation failures.
- `401 Unauthorized`: Missing/invalid token.
- `403 Forbidden`: Role constraints breached.
- `404 Not Found`: Referencing invalid ID for mutation.

## Performance Requirements
- Target query resolutions <100ms.
- Sub-fields and relational lookups adequately indexed inside databases.

## Security Requirements
- Parameterized queries to mitigate SQL injection.
- Validate contextual `branch_id` of user.

## Edge Cases
- Interleaved parallel creation attempts handled via constraints without exceptions.

## Backend Test Cases
| TC ID | Scenario | Expected Outcome |
| - | - | - |
| BE_AS_class_master_01 | Unauthorized `teacher` request | Returns 403 Forbidden |
| BE_AS_class_master_02 | Duplicate name insertion | Returns 400 Bad Request |
| BE_AS_class_master_03 | Valid item creation | Returns 201 Created |

