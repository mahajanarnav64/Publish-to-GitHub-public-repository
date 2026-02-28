# Discount Categories Setup - Backend Specification

## 1. Module Overview
Discount categories define reusable discount types. They allow Administrators to formulate logic-less labels that carry a specific discount rule (either a fixed amount or a percentage). These categories are primarily used in the Student Discount module where they can be manually applied to specific students' fee collections. This represents Phase 1 (Basic Manual application only). 

## 2. API List

| API | Method | Purpose |
|-----|--------|---------|
| `/api/discount-categories` | GET | Retrieve listing of all discount categories |
| `/api/discount-categories` | POST | Create a new discount category |
| `/api/discount-categories/{id}` | PUT | Update an existing discount category |
| `/api/discount-categories/{id}/status` | PATCH | Toggle the active/inactive status of the category |

## 3. Request Format

**POST `/api/discount-categories`**
```json
{
  "name": "Sibling Discount",
  "type": "percentage",
  "value": 10,
  "description": "10% sibling discount"
}
```

## 4. Response Format

**Success (201 Created):**
Returns the created category object.
```json
{
  "success": true,
  "data": {
    "id": "disc-uuid-001",
    "name": "Sibling Discount",
    "type": "percentage",
    "value": 10,
    "description": "10% sibling discount",
    "status": "active",
    "created_at": "2026-02-25T13:00:00Z"
  }
}
```

## 5. Database Table

### Table: `discount_categories`
| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary Key |
| `branch_id` | UUID | Foreign Key -> `branches(id)` |
| `name` | VARCHAR | User defined name (e.g., Sibling Discount) |
| `type` | ENUM | `percentage` or `fixed` |
| `value` | DECIMAL | Amount or Percentage integer |
| `description` | TEXT | Optional details |
| `status` | ENUM | `active` or `inactive` |
| `created_by` | UUID | Admin user ID who created it |
| `created_at` | TIMESTAMP | Creation meta |
| `updated_at` | TIMESTAMP | Update meta |

## 6. Business Logic
1. **Validate Admin:** Confirm user making the request has Admin privileges.
2. **Validate unique name:** Ensure the `name` does not conflict with an existing category within the same `branch_id`.
3. **Validate value range:** If `type` is `percentage`, `value` cannot exceed 100.
4. **Save category:** Insert the record transactionally into the `discount_categories` table.

## 6.1 Cross-Module Integration Logic
- **Payment Processing:** When `/api/finance/fee-payments` is called with a `discount_id`, the backend must fetch this category to verify it is `Active`.
- **Reporting:** Reports must join with this table to provide breakdowns of discounts by category name (e.g., "Total Sibling Discounts: ₹50,000").


## 7. Validation Rules
- `name`: Required, max 100 characters.
- `type`: Required, enum (`percentage`, `fixed`).
- `value`: Required, must be a positive number.
- `Percentage` ≤ 100 limit rule.

## 8. Authentication and Authorization
- **Admin only:** Ensure API endpoints enforce administrative rights.

## 9. Error Handling
- **400 Bad Request:** Form validation errors (e.g., missing name or percentage > 100).
- **401 Unauthorized:** Invalid session token.
- **403 Forbidden:** Unauthorized roles accessing the endpoint.
- **409 Conflict:** Attempting to create a category duplicate name.
- **500 Internal Server Error:** Database connectivity failures or transaction errors.

## 10. Performance Requirements
- Response time for List/Read/Write APIs must be `< 200ms`.

## 11. Security Requirements
- **Branch isolation mandatory:** Users should strictly only be able to view and manage categories attached to their authenticated `branch_id`. Multi-tenancy integrity must hold.

## 12. Edge Cases
- **Duplicate name:** Triggers 409 Conflict early before attempting transaction.
- **Invalid value:** Negative values or > 100 for percentages trigger 400 Bad Request immediately.

## 13. Backend Test Cases

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| API-DISC-01 | Create Valid Category | POST `/api/discount-categories` with valid JSON payload. | Returns 201 Created and new object. |
| API-DISC-02 | Reject > 100% | POST payload with `type`: `percentage` and `value`: `150`. | Returns 400 Validation Error. |
| API-DISC-03 | Reject Duplicate Name | Try creating two categories with the name "Covid Grant". | Second request 409 Conflict. |
| API-DISC-04 | Branch Isolation | Admin from Branch A tries fetching categories. | Response lists exclusively Branch A data. |
