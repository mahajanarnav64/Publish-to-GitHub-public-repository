# Fee Collection & Receipts - Frontend Specification

## 1. Feature Overview
Admin can:
- Record offline payments (Cash, UPI, Cheque)
- Apply manual discounts from predefined categories
- View detailed receipt history per student
- Download or print payment receipts
- Monitor real-time status (Pending vs Fully Paid)

## 2. Page Overview
The Fee Collection module is designed as a high-density, dual-pane interface to minimize navigation.
- **Left Column (45%):** Student Directory with master search and filters (Class, Section).
- **Right Column (55%):** Detail Panel featuring two primary tabs: **Collect Fee** and **Receipt History**.

## 3. UI Components

| Component | Type | Description |
|-----------|------|-------------|
| Student Directory | Master List | Lists students with real-time pending dues badges. |
| Status Card | Indicator | Dynamic card showing "Pending Dues" (Red) or "Fully Paid" (Green). |
| Dynamic Payment Form | Form | Grid layout for Amount, Date, and Discount Category. |
| Net Payable Badge | Display | Real-time calculation showing `Net Amount = Amount - Discount`. |
| Receipt History Table | Data Table | Lists past transactions with "Net Paid" calculations and "Discount Applied" tags. |
| Receipt Preview Modal | Modal | Professional breakdown of Total, Discount, and Net Amount. |

## 4. Layout Structure

- **Student Directory (Left):**
  - Search bar (Name/Reg No)
  - Filters (Class, Section)
  - Student cards showing name, ID, and dues status.
- **Detail Panel (Right):**
  - **Header Info Card:** Student summary (Name, ID, Class, Section) and financial overview (Total Fee, Paid, Pending).
  - **Tabs:**
    - **Collect Fee:** Payment form with mode selection and reference input.
    - **Receipt History:** Chronological table of past payments.

## 5. User Flow
1. **Selection:** Admin selects a student from the Directory.
2. **Review:** Detail panel loads student stats. If `pendingAmount === 0`, it shows "Fully Paid" state.
3. **Form Entry:** Admin enters `Paying Amount`.
4. **Discount:** Optional selection of a discount category (Percentage or Fixed). Net amount is calculated instantly.
5. **Mode:** Select payment mode (Cash/UPI/Cheque). Reference number required for non-cash.
6. **Execution:** Admin clicks "Complete Payment".
7. **Confirmation:** Success toast appears + Receipt Modal opens for printing/downloading.

## 6. Logic & Calculations
- **Status Check:** `x-show="student.pendingAmount === 0"` triggers "Fully Paid" UI.
- **Net Amount Calculation:** 
  ```javascript
  Net Amount To Pay = Payment Amount - Calculated Discount
  ```
- **Discount Logic:** Percentage discounts are capped at the payment amount. Fixed discounts are capped at the payment amount if higher.

## 7. API Integration

| API | Method | Purpose |
|-----|--------|---------|
| `/api/students/fee-summary` | GET | Retrieve student dues and record list. |
| `/api/fee-payments` | POST | Record a new payment with amount, mode, and discount ID. |
| `/api/receipts/{id}` | GET | Fetch receipt details for preview/download. |

## 8. Request & Response JSON Examples

**Request Example (POST):**
```json
{
  "student_id": "STU123",
  "amount": 5000,
  "discount_id": "disc_001",
  "payment_mode": "UPI",
  "reference": "TXN982341",
  "date": "2026-02-25"
}
```

**Response Example (Success):**
```json
{
  "status": "success",
  "receipt": {
    "no": "RCPT-2026-001",
    "total_amount": 5000,
    "discount_amount": 500,
    "net_amount": 4500,
    "date": "25/02/2026"
  }
}
```

## 9. State Management
- `activeTab`: Switches between `collect` and `receipts`.
- `studentData`: Holds active student's billing profile.
- `justPaid`: Boolean to toggle "Payment Successful" header in modal vs standard "Preview".

## 10. Validation Rules
- **Payment Amount:** Required, must be > 0 and ≤ Remaining Dues.
- **Reference Number:** Required if mode is `UPI` or `Cheque`.
- **Selected Discount:** Must be an active category.

## 11. Acceptance Criteria
- [ ] Student list shows accurate pending dues badges.
- [ ] Detail panel correctly identifies "Fully Paid" students.
- [ ] Clicking student auto-fills payment amount with their total pending dues.
- [ ] Applying a discount correctly updates the "Net Amount To Pay" indicator.
- [ ] Receipt history table shows the net paid amount (After Discount).
- [ ] Download button triggers the browser print/save dialog.

## 12. Frontend Test Cases

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| TC-F-01 | Fully Paid State | Select student with 0 dues. | Detail panel shows green "Fully Paid" status; Form is hidden. |
| TC-F-02 | Discount Calculation | Enter 1000, select 10% discount. | "Net Amount To Pay" shows 900. |
| TC-F-03 | Mode Validation | Select UPI, leave reference empty, try submit. | Button disabled or error shown: "Reference required". |
| TC-F-04 | Receipt History Logic | Complete payment with discount. | Table entry shows "Net Paid" correctly and a "Discount Applied" tag. |
| TC-F-05 | Responsive Grid | View on tablet size. | 3-column inputs (Amount/Date/Discount) stack correctly. |
