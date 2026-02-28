# Fee Structure Setup - Frontend Specification

## 1. Feature Overview
The Fee Structure Setup module allows administrators to create and manage academic fee configurations on a Class or Batch level. It handles definition of fee heads (admission, tuition, annual, etc.), setup of installment plans (with dynamic due dates and amounts), and basic late fee grace periods and penalties. This is Phase 1 (Basic – Admin Only), meaning there is no online payment gateway or student-side visibility at this stage.

## 2. Page Overview
- **Page Name:** Fee Structure Setup
- **Access:** Admin Only
- **Purpose:** Provide a centralized dashboard to view, filter, create, and manage fee structures. Includes a complex dynamic form (Add/Edit) to build structured fee plans.

## 3. UI Components

| Component | Description |
|-----------|-------------|
| **Page Header** | Displays page title, breadcrumb, and "Create Fee Structure" action button. |
| **Filter Bar** | Dropdowns to filter list by Academic Session, Class / Batch, and Status (Active/Inactive). |
| **List View Table** | Displays existing fee structures with key summary details and row-level actions. |
| **Create/Edit Modal** | Comprehensive multi-section form to capture basic details, fee heads, installment configuration, and late fees. |
| **Dynamic Fee Heads Section**| Section in the form allowing users to dynamically add/remove rows for various fee types (One-time/Recurring). |
| **Installment Generator** | Inputs for total installments with auto-generation of rows for dates, amounts, and overrides. |

## 4. Layout Structure
- **Global:** Uses standard dashboard layout (Left narrow sidebar, top header, main content area).
- **Main Area:** 
  - Top Section: Title & "Create Fee Structure" Button.
  - Middle Section: Filter controls in a card.
  - Bottom Section: Data Table inside a card.
- **Modal View:** 
  - Header: "Create Fee Structure"
  - Body: Scrollable area with logical groupings (Basic Details -> Fee Heads -> Installments -> Late Fee Rules)
  - Footer: Action buttons sticky at the bottom (`Save Draft`, `Save & Activate`, `Cancel`).

## 5. User Flow
1. **View List:** Admin navigates to Finance > Fee Structure. Sees the List View Table.
2. **Filter:** Admin can filter by Session or Class to find existing structures.
3. **Create:** Admin clicks "+ Create Fee Structure" opening the modal.
4. **Fill Basic Details:** Selects Session, Class, names the structure, chooses applicability (All Students, New Admissions, or Returning Students), and sets effective date.
5. **Add Fee Heads:** Clicks "Add Fee Head". Selects the Fee Head Name from a pre-defined dropdown (Populated from pre-created Fee Heads master), fills out amount, mandatory flag, type. Validates total amount dynamically.
6. **Configure Installments:** Sets number of installments. System auto-splits total amount. Admin can manually adjust dates and amounts (must equal total amount).
7. **Set Late Fees:** Defines grace days and fixed amount.
8. **Save:** Clicks "Save Draft" or "Save & Activate".
9. **Post-Save:** The modal closes and lists refresh showing the new entry.

## 8. Request & Response JSON Examples

**Create Request Payload:**
```json
{
  "academicSessionId": "sess-uuid-1",
  "classId": "cls-uuid-1",
  "structureName": "Class 10 Primary Fees",
  "effectiveDate": "2025-04-01",
  "status": "active",
  "feeHeads": [
    { "headName": "Tuition Fee", "amount": 20000, "mandatory": true, "type": "recurring" },
    { "headName": "Admission Fee", "amount": 5000, "mandatory": true, "type": "one-time" }
  ],
  "installments": [
    { "installmentName": "Inst 1", "dueDate": "2025-04-10", "amount": 10000 },
    { "installmentName": "Inst 2", "dueDate": "2025-08-10", "amount": 15000 }
  ],
  "lateFeeRules": { "graceDays": 5, "lateFeeAmount": 200 }
}
```

## 9. State Management
- **Loading State:** Skeleton loaders in the table. Spinner in the "Save" buttons during API calls.
- **Success State:** Toast notification indicating successful creation/update. Modal closes.
- **Empty State:** Illustrated empty state in the table area when no fee structures match filters or have been created.
- **Error State:** Red toast notifications for API failures. Inline red error messages below offending fields (e.g., mismatching installment totals).

## 10. Validation Rules
- **Name:** Required, max 100 characters.
- **Amounts:** Must be positive numbers.
- **Mathematical Integrity:** `SUM(FeeHead Amounts) MUST EQUAL SUM(Installment Amounts)`.
- **Dates:** Installment due dates must be logically ordered and within the bounds of the Academic Session.

## 11. Error Handling
- Invalid or incomplete form submissions block the `Save & Activate` action and highlight empty fields.
- 409 Conflict from API (e.g., "Active structure already exists for this class") triggers a modal dialogue/alert warning the user.

## 12. Responsive Behavior
- Filters break into multiple rows or a wrapped flexbox on smaller screens.
- Table scrolls horizontally on smaller viewports.
- The Modal scales to 95% screen width on mobile, and standard width (e.g., max-w-4xl) on desktop. The complex tables inside the modal convert to stacked cards on narrow screens.

## 13. Edge Cases
- **Zero installments**: If a fee is entirely one-time, total installments can be '1' due immediately.
- **Changing active structure mid-session**: Frontend should warn the user that modifying active structures assigns risk to generated fee bills.
- **Floating point values**: Handled and rounded to nearest logical currency unit (usually 0 decimal places for standard school fees, or 2 max).
- **Leap year due date handling**: Validated seamlessly through native date pickers.
- **Duplicate fee head name**: Frontend input ensures uniqueness of head names per structure by disabling already selected options or rejecting save.
- **Partial structure saved as draft**: Saves with bypass on total validations.

## 14. Acceptance Criteria
- [ ] Admin can create a fee structure and define nested fee heads.
- [ ] Installment totals are dynamically validated against the sum of fee heads.
- [ ] Structure can be successfully saved in a 'Draft' state.
- [ ] Only one active structure per class per session is allowed.
- [ ] The List view accurately reflects total amounts and number of installments.
- [ ] Edit action is disabled if students are already assigned (future control).
- [ ] Clone action correctly populates the modal with data from an existing structure, leaving `Academic Session` blank/ready for update.

## 15. Frontend Test Cases

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| UI-FIN-01 | Create Base Form Load | Navigate to Finance > Fee Structure Setup -> Click Create | Modal opens empty, default state applied. |
| UI-FIN-02 | Installment Math Validation | 1. Add fee heads totaling 1000.<br>2. Add 2 installments of 400 each.<br>3. Click Save & Activate. | Error highlights stating "Installment total (800) does not match Fee Heads total (1000)". Form blocked. |
| UI-FIN-03 | Save as Draft Bypasses Math | 1. Repeat step 2 above.<br>2. Click Save Draft. | Form logic saves the draft via API successfully without math error blocking. |
| UI-FIN-04 | Table Filtering | Select "Active" from Status filter drop-down. | Table refreshes showing only Active fee structures. |
| UI-FIN-05 | Auto-split Installments | Set total fee to 5000. Enter '5' in total installments field. | 5 rows instantly created in Installment config section, each with amount 1000. |
