# Discount Categories - Frontend Specification

## 1. Feature Overview
Admin can:
- Create Discount Category
- Edit Discount Category
- Activate / Deactivate Category
- View list of categories

These discount categories are reusable templates (e.g., Sibling Discount, Staff Child Discount) that act as Phase 1 configurations (No automation, No eligibility rules, No approval workflow). 

## 1.1 Cross-Module Integration
- **Fee Collection:** Active discounts are listed in the manual Fee Collection view.
- **Reporting:** Discounts are tracked in student payment history and reported in net collection summaries.
- **Rules:** When a discount is selected during payment, the system calculates the `Net Payable Amount` in real-time.


## 2. Page Overview
- **Page Name:** Discount Categories
- **Primary Action:** `+ Add Discount Category` Button located in the header.

## 3. UI Components

| Component | Type | Description |
|-----------|------|-------------|
| Add Button | Primary Action | CTA triggering the creation modal. |
| Discount Category Table | Data Grid | Displays created categories. |
| Add/Edit Modal | Form Modal | Flyout/Dialog form logic containing fields. |
| Status Toggle | Switch | Enables or disables an active discount. |
| Edit Button | Action Icon | Allows administrators to alter existing rows. |

## 4. Layout Structure
- **Global:** Follows established pastel ERP design pattern. Blue/gray cards and headers.
- **Top Section:**
  - Page Title "Discount Categories"
  - `+ Add Discount Category` Button
- **Main Section:**
  - Discount Categories Table displaying:
    - Discount Name
    - Discount Type (`Percentage` / `Fixed`)
    - Discount Value
    - Status (`Active` / `Inactive`)
    - Created Date
    - Action Menu (Edit, Toggle Status)

## 5. User Flow
1. **List View:** Admin opens the Discount Categories page.
2. **Action Trigger:** Admin clicks `+ Add Category`.
3. **Form Entry:** Admin enters the name, chooses type (Percentage / Fixed), and determines the value and status.
4. **Action Submit:** Admin saves the new configuration.
5. **Results:** Category newly appears in the active table list.

## 6. Component Behavior
- **Add/Edit Modal fields:**
  - `Discount Name` (required string)
  - `Discount Type` dropdown options: `Percentage (%)` or `Fixed Amount (₹)`
  - `Discount Value` (required number)
  - `Description` (optional text field)
  - `Status` toggle

## 7. API Integration

| API | Method | Purpose |
|-----|--------|---------|
| `/api/discount-categories` | GET | List configured categories |
| `/api/discount-categories` | POST | Create a new category |
| `/api/discount-categories/{id}` | PUT | Edit a matching category |
| `/api/discount-categories/{id}/status` | PATCH | Status switch |

## 8. Request & Response JSON Examples

**Request Example (POST):**
```json
{
  "name": "Sibling Discount",
  "type": "percentage",
  "value": 10,
  "description": "10% sibling discount"
}
```

**Response Example:**
```json
{
  "id": "disc_001",
  "name": "Sibling Discount",
  "type": "percentage",
  "value": 10,
  "status": "active"
}
```

## 9. State Management
- `loading`: State rendered during submission (disables button) or initial GET (skeleton screen).
- `success`: State displaying green toast notification for successful operations.
- `empty`: Illustrated UI displayed if the data array length is `0`.
- `error`: Toasts for generic failures, red inline messages under offending form rules.

## 10. Validation Rules
- **Name**: Required field.
- **Value**: Required positive numeric.
- **Percentage Context**: If type is `Percentage`, value input cannot exceed `100`.

## 11. Error Handling
- **Duplicate category**: Notified if the API rejects identical names.
- **Invalid value**: Notified if negative or out-of-range bounds are manually attempted.

## 12. Responsive Behavior
- **Desktop**: Full structured data table view. Modal opens as centered dialog.
- **Mobile**: Table transforms into stacked list cards. Modals transition to full screen slide-up panels.

## 13. Edge Cases
- **Duplicate name conflict**: The API will block uniqueness breaches and form re-displays issue.
- **Inactive category usage**: Future controls in Student Discount application logic should not expose inactive configurations in select menus.

## 14. Acceptance Criteria
- [ ] Admin can successfully create a new category (saving fixed and percentage options).
- [ ] Admin can retrieve previously configured data in the list view table.
- [ ] Admin can launch the modal to successfully edit existing rows.
- [ ] Admin can toggle or deactivate a category preventing future usage.

## 15. Frontend Test Cases

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| UI-DISC-01 | Create Valid Category | Open Add Category modal, enter "Early Bird", type "Fixed", value 1000, save. | Successfully created and shown in table. |
| UI-DISC-02 | Percentage Rule | Change type to "Percentage", enter Value `150`. | Save disabled or shows error inline `Max 100%`. |
| UI-DISC-03 | Empty Input Rejection | Leave Name and Value empty, attempt Save. | Required indicator blocks save. |
| UI-DISC-04 | Status Toggle | Click Toggle status button on active entry. | Turns category `Inactive`. |
