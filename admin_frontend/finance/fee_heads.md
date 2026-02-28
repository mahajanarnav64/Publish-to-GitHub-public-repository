# Frontend Specification

## 1. Feature Overview
Fee Heads are reusable fee components used in Fee Structure Setup (e.g., Admission Fee, Tuition Fee, Annual Fee, Exam Fee, Transport Fee).
This module is Phase 1 (Basic – Admin Only), providing administrators with a centralized control panel to manage these components.

Admin can:
- Create Fee Head
- Edit Fee Head
- Activate / Deactivate Fee Head
- View Fee Head List
- Search Fee Heads

---

## 2. Page Overview
- **Page Name:** Fee Heads
- **Primary Button:** `+ Add Fee Head`
- **Purpose:** Page displays a comprehensive list of Fee Heads available for use in the system.

---

## 3. UI Components (Table)

| Component | Type | Description |
|-----------|------|-------------|
| **Add Fee Head Button** | Button | Primary action to slide out or popup a creation modal. |
| **Fee Head List Table** | Data Table | Grid showing all existing fee heads. |
| **Search Input** | Text Field | Filter table rows dynamically based on the fee head name. |
| **Add/Edit Modal** | Dialog Modal | Form overlay to capture or edit fee head details. |
| **Status Toggle** | Toggle Switch | Quick action to turn a fee head active or inactive. |
| **Edit Button** | Action Icon | Triggers the Edit Modal populated with the selected head's data. |

---

## 4. Layout Structure

- **Top Section:**
  - Page Title (`Fee Heads Master`)
  - Add Fee Head Button

- **Middle Section:**
  - Search Bar
  - Status Filter Dropdown

- **Main Section:**
  - Fee Heads Table

**Columns:**
| Fee Head Name | Type | Description | Status | Created Date | Action |

---

## 5. User Flow
1. Admin opens Fee Heads page.
2. Admin clicks Add Fee Head.
3. Admin fills form fields (Name, Type, Description).
4. Admin clicks Save.
5. System creates Fee Head.
6. Fee Head appears in the list.
7. Fee Head becomes available in Fee Structure Setup dropdowns.

---

## 6. Component Behavior

**Add/Edit Modal fields:**
- **Fee Head Name:** (required) Text input.
- **Fee Type dropdown:** 
  - `One-time`
  - `Recurring`
- **Description:** (optional) Textarea.
- **Status:** Toggle switch (Active/Inactive).

**Buttons:**
- Save
- Cancel

---

## 7. API Integration (Table)

| API | Method | Purpose |
|-----|--------|---------|
| `/api/fee-heads` | GET | List Fee Heads |
| `/api/fee-heads` | POST | Create Fee Head |
| `/api/fee-heads/{id}` | PUT | Update Fee Head |
| `/api/fee-heads/{id}/status` | PATCH | Activate/Deactivate Fee Head |

---

## 8. Request JSON Example

**POST `/api/fee-heads`**
```json
{
  "name": "Admission Fee",
  "type": "one-time",
  "description": "One time admission fee"
}
```

---

## 9. Response JSON Example

```json
{
  "id": "fh_001",
  "name": "Admission Fee",
  "type": "one-time",
  "status": "active",
  "created_at": "2026-01-01T10:00:00Z"
}
```

---

## 10. State Management

- **Loading State:** Show skeleton loader or spinner while fetching the list.
- **Success State:** Show updated list and a floating toast notification (e.g., "Fee Head created successfully").
- **Empty State:** Show "No Fee Heads Found" illustration/message when the list or search yields 0 results.
- **Error State:** Show exact red error message inline in the form or via toast depending on error type.

---

## 11. Validation Rules
- **Name:** Fee Head Name is required.
- **Uniqueness:** Fee Head Name unique (case-insensitive checks).
- **Length:** Max length 100 characters.

---

## 12. Error Handling
- **Duplicate name error:** Halt save, display "This Fee Head name already exists".
- **Network error:** Standard offline indicator handling.
- **Server error:** Show generic fallback ("An error occurred while saving the Fee Head").

---

## 13. Responsive Behavior
- **Desktop:** Standard table view with wide rows.
- **Mobile:** Table breaks down into a stacked Card view where each row becomes a block. Modals span 90%+ viewport width.

---

## 14. Edge Cases
- **Duplicate name:** Handled natively by blocking the save event.
- **Editing inactive fee head:** Allowed, but editing it does not automatically mark it active.
- **Inactive fee head used in structure (future lock):** An active fee structure using an inactive fee head remains valid. The inactive state only prevents *future* fee structures from selecting it.

---

## 15. Acceptance Criteria
- [ ] Admin can create a new Fee Head successfully.
- [ ] Admin can edit an existing Fee Head's name, type, and description.
- [ ] Admin can quickly activate/deactivate a Fee Head via a toggle status.
- [ ] Fee Head list populates visible Fee Heads inside the Fee Structure Setup dropdowns correctly.

---

## 16. Frontend Test Cases (Table)

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| UI-FH-01 | Create success | Click Add Fee Head > Enter details > Save | UI closes modal, displays toast, updates table. |
| UI-FH-02 | Required checks | Click Add Fee Head > Leave name blank > Save | Form blocks save, shows 'Name is required' error. |
| UI-FH-03 | Search behavior | Enter 'Admission' in search bar | Table hides rows not containing string 'Admission'. |
| UI-FH-04 | Duplicate name | Add Fee Head > Type existing name > Save | Shows 'Duplicate name error' inline below the field. |
| UI-FH-05 | Status Toggle | Click toggle on a row | Fee Head toggles state between Active/Inactive immediately. |

---
---

# Backend Specification

## 1. Module Overview
Fee Heads are reusable fee components utilized primarily in the Fee Structure Setup process. 
This data is purely branch-specific, enabling multi-tenant franchises to isolate their fee labels. Access to modify this master list is strictly Admin-only.

---

## 2. API List (Table)

| API | Method | Purpose |
|-----|--------|---------|
| `/api/fee-heads` | GET | List Fee Heads |
| `/api/fee-heads` | POST | Create Fee Head |
| `/api/fee-heads/{id}` | PUT | Update Fee Head |
| `/api/fee-heads/{id}/status` | PATCH | Activate/Deactivate |

---

## 3. Request Format

**POST `/api/fee-heads`**

**Fields:**
- `name` (string)
- `type` (one-time / recurring)
- `description` (string optional)

---

## 4. Response Format
Return created object representing the database entry.

---

## 5. Database Table

**Table: `fee_heads_master`** (or `fee_heads`)

**Fields:**
- `id` (UUID, Primary Key)
- `branch_id` (UUID)
- `name` (string)
- `type` (enum: `one-time`, `recurring`)
- `description` (string)
- `status` (enum: `active`, `inactive`)
- `created_by` (UUID)
- `created_at` (timestamp)
- `updated_at` (timestamp)

---

## 6. Business Logic
- **Step 1:** Validate user role is Admin (Reject with 403 Forbidden if not).
- **Step 2:** Validate branch context (Ensure user belongs to the target `branch_id`).
- **Step 3:** Validate unique name (Check DB for identical `name` across the specific `branch_id`).
- **Step 4:** Insert record into DB and retrieve mapped object.
- **Step 5:** Return created object.

---

## 7. Validation Rules
- `name`: Required
- `name`: Unique per branch
- `type`: Must be valid enum (`one-time` OR `recurring`)

---

## 8. Authentication and Authorization
Only users with the `Admin` role are permitted logic execution on these routes. Tenant verification is mandatory on every route via JWT inspection.

---

## 9. Error Handling
- **400**: Validation error (Bad Request)
- **401**: Unauthorized (Bad Token)
- **403**: Forbidden (Non-Admin / Wrong Branch)
- **409**: Duplicate (Entity Already Exists)
- **500**: Server error

---

## 10. Performance Requirements
- **Response time**: `< 200ms` for typical GET/POST queries.
- **Indexes**: Required on:
  - `branch_id`
  - `name`
  - Composite Index on `(branch_id, name)`

---

## 11. Security Requirements
- **Branch-level isolation.**
- Prevent cross-branch access strictly. No Admin in Branch A can create or query fee heads in Branch B.

---

## 12. Edge Cases
- **Duplicate name:** Caught via DB unique constraint or pre-flight query, throwing a clean 409 response.
- **Branch mismatch:** Fails gracefully returning a 403.
- **Invalid type:** Caught by API input validation resulting in 400.

---

## 13. Backend Test Cases (Table)

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| API-FH-01 | Create valid | POST /api/fee-heads with name='Tuition', type='recurring' | 201 Created. Returns ID. |
| API-FH-02 | Duplicate save | Send POST with name='Tuition' again | 409 Conflict. Duplicate warning. |
| API-FH-03 | Schema validate | POST missing 'type' field | 400 Bad Request. Action halted. |
| API-FH-04 | Branch separation| Branch B Admin executes GET | Returns ONLY Branch B fee heads. |
| API-FH-05 | RBAC violation | Parent Account hits POST endpoint | 403 Forbidden. |
