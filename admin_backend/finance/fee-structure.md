# Fee Structure Setup - Backend Specification

## 1. Module Overview
The Fee Structure Setup module allows administrators to configure class or batch-wise fee structures without online payment integrations or student portal views (Phase 1). This backend service handles validation, data persistence, clone operations for academic session transitions, and enforces rules like "no duplicate active fee structures."

## 2. API List

| Endpoint | Method | Description | Role |
|----------|--------|-------------|------|
| `/api/fee-structures` | GET | List fee structures (Paginated & Filterable) | Admin |
| `/api/fee-structures` | POST | Create a new fee structure (Draft or Active) | Admin |
| `/api/fee-structures/{id}` | PUT | Update a fee structure (Allows full payload update) | Admin |
| `/api/fee-structures/{id}/clone` | POST | Clone an existing structure for a new session/class | Admin |
| `/api/fee-structures/{id}/status` | PATCH | Update status of a structure (e.g., Active/Deactivate) | Admin |

## 3. Request Format

**POST `/api/fee-structures`**
```json
{
  "branch_id": "uuid-1234",
  "academic_session_id": "sess-uuid",
  "class_id": "class-uuid",
  "structure_name": "Class 10 Primary",
  "status": "active",
  "fee_heads": [
    { "fee_head_master_id": "fh-master-uuid", "amount": 20000, "mandatory": true, "type": "recurring" }
  ],
  "installments": [
    { "installment_name": "Inst 1", "due_date": "2025-04-10", "amount": 10000, "late_fee_grace_days": 5, "late_fee_amount": 200 },
    { "installment_name": "Inst 2", "due_date": "2025-08-10", "amount": 10000, "late_fee_grace_days": 5, "late_fee_amount": 200 }
  ]
}
```

## 4. Response Format

**Success (201 Created):**
```json
{
  "success": true,
  "message": "Fee structure created successfully.",
  "data": {
    "id": "fs-uuid-8899",
    "structure_name": "Class 10 Primary",
    "total_amount": 20000,
    "status": "active"
  }
}
```

## 5. Database Tables Used

### Table: `fee_structures`
| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary Key |
| `branch_id` | UUID | Foreign Key -> `branches(id)` |
| `academic_session_id` | UUID | Foreign Key -> `academic_sessions(id)` |
| `class_id` | UUID | Foreign Key -> `classes(id)` |
| `structure_name` | VARCHAR | User defined name |
| `student_type` | ENUM | `All Students`, `New Admissions`, `Returning Students` |
| `total_amount` | DECIMAL | Auto-calculated total from heads |
| `status` | ENUM | `draft`, `active`, `inactive` |
| `created_by` | UUID | Admin user ID |
| `created_at` | TIMESTAMP | Creation meta |

### Table: `fee_heads`
| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary Key |
| `fee_structure_id`| UUID | Foreign Key -> `fee_structures(id)` |
| `fee_head_master_id` | UUID | Foreign Key -> `fee_heads_master(id)` (Provides name like Tuition) |
| `amount` | DECIMAL | Amount applied |
| `mandatory` | BOOLEAN | Is this a core fee? |
| `type` | ENUM | `one-time` or `recurring` |

### Table: `fee_installments`
| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary Key |
| `fee_structure_id`| UUID | Foreign Key -> `fee_structures(id)` |
| `installment_name`| VARCHAR | e.g. Q1, Installment 1 |
| `due_date` | DATE | Must fall within academic session boundaries |
| `amount` | DECIMAL | Sum of all inputs must equal `total_amount` |
| `late_fee_grace_days`| INT | Number of days before late fee applies. Defaults to 0/empty. |
| `late_fee_amount` | DECIMAL| Flat penalty applied. Defaults to 0/empty. |

## 6. Business Logic (Step-by-step)
**When creating a fee structure:**
1. **Validate Foreign Keys:** Validate `branch_id`, `academic_session_id`, `class_id` exist.
2. **Uniqueness Check:** Ensure no duplicate **active** fee structure for the exact same `class_id` and `academic_session_id`.
3. **Logic Verification:** 
   - Calculate total dynamic amount from `fee_heads`.
   - Calculate total amount from `fee_installments`.
   - Validate `SUM(fee_heads.amount) == SUM(fee_installments.amount)`.
   - If user saves as `draft`, bypass mathematical equality. If `active`, throw 400 Bad Request on mismatch.
4. **Dates Check:** Ensure `due_date` items logically fall throughout the academic session. Handle Leap year valid date logic natively via timestamp parsing.
5. **Persistence:** Use DB transactions to save `fee_structures`, `fee_heads`, and `fee_installments` concurrently or rollback entirely on failure.

## 7. Validation Rules
- `structure_name`: Required, string, max length 100.
- `fee_heads.amount`: Cannot be negative.
- `installments.amount`: Cannot be negative.
- `status`: Must be `active`, `inactive`, or `draft`.

## 8. Authentication and Authorization
- **Role Control:** Only users with `Admin` roles can execute POST/PUT/PATCH/DELETE actions.
- **Tenant Control:** `branch_id` derived automatically from the JWT or validated against the authenticated User's permitted branches. Prevent cross-session or cross-branch editing.

## 9. Error Handling
- **400 Bad Request:** Structural validation fails (e.g. installment sums mismatch).
- **401 Unauthorized:** Invalid token.
- **403 Forbidden:** Valid auth, but lacks `Admin` privileges or accessed cross-branch records.
- **409 Conflict:** Attempting to set a structure to `active` when a structure for that class already exists as `active`.
- **422 Unprocessable Entity:** Required fields missing.
- **500 Internal Server Error:** Database transaction faults (rollbacks needed).

## 10. Performance Requirements
- **Structure creation:** Must resolve (write all tables via transaction) in `< 300ms`.
- **Pagination:** Index List APIs. Default to 20 items per page.
- **Indexes:** Ensure database index mapping exists on `(branch_id, academic_session_id, class_id)` combination.

## 11. Security Requirements
- **Branch-level isolation (SaaS Multi-tenancy):** Never expose or modify records outside the admin's permitted branch context.
- **Future Proofing Locks:** Prevent editing the configuration details of an `active` structure once students have been assigned (to be enforced via relation checks in the next phase).
- **Audit Logging:** Maintain a system or trigger log for `created_by` and `updated_by` state modifications.

## 12. Edge Cases
- **Duplicate fee head name:** Ensure a structure cannot declare multiple fee heads with the exact same literal string mapping (e.g. two "Admission Fees"). Return 400.
- **Zero installment scenario:** Some fee structures are 1-time full payments upfront. An installment count of 1 is valid.
- **Changing active structure mid-session:** Allowed initially but must log a warning. (Future control: block if actively billed).

## 13. Backend Test Cases

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| API-FIN-01 | Create Draft | Submit payload with matching header/installments but pass `status: draft`. | Returns 201 Created. Associated DB records generated. |
| API-FIN-02 | Unbalanced Math Rejection | Submit JSON where `feeHead.amount` = 5000, `installments.amount` = 4500. Set `status: active`. | Returns `400 Bad Request` with message "Installment total does not match Fee Heads". |
| API-FIN-03 | Duplicate Active Guard | 1. Create structure for Class-A = Active.<br>2. Submit identical payload for Class-A as Active. | Second request returns `409 Conflict`. |
| API-FIN-04 | Valid Clone | Hit POST `/api/fee-structures/uuid-8899/clone`. Pass `new_session_id: sess-y`. | Creates duplicate graph structure, linked to new session, in `draft` mode. |
| API-FIN-05 | Branch Isolation | User from Branch A attempts PUT request with UUID belonging to Branch B. | Returns `403 Forbidden` or `404 Not Found`. |
