# Fee Collection & Receipts - Backend Specification

## 1. Module Overview
Handles the recording of offline fee payments, manual discount application, and receipt generation. This module ensures accurate financial tracking and ledger updates per student.

## 2. API List

| API | Method | Purpose |
|-----|--------|---------|
| `GET /api/finance/students-with-dues` | GET | List students with outstanding fee balances. |
| `GET /api/finance/student-summary/{id}` | GET | Get billing profile, pending dues, and receipt history for a student. |
| `POST /api/finance/fee-payments` | POST | Record a new payment (supports discounts). |
| `GET /api/finance/receipts/{id}` | GET | Fetch detailed receipt data including discount breakdowns. |

## 3. Request Format

**POST `/api/finance/fee-payments`**
```json
{
  "student_id": "STU12345",
  "amount_paid": 5000,
  "payment_mode": "UPI",
  "reference_number": "TXN_99210",
  "payment_date": "2026-02-25",
  "discount_id": "disc_uuid_001",
  "discount_amount": 500
}
```

## 4. Response Format

**Success (201 Created):**
```json
{
  "success": true,
  "receipt_number": "RCPT-2026-0092",
  "payment_id": "pay_uuid_772",
  "net_paid": 4500,
  "status": "success"
}
```

## 5. Database Tables

### Table: `fee_payments`
| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary Key |
| `branch_id` | UUID | Multi-tenancy isolation |
| `student_id` | UUID | Foreign Key -> `students(id)` |
| `amount_paid` | DECIMAL | Gross amount entered before discount |
| `discount_id` | UUID | (Optional) FK -> `discount_categories(id)` |
| `discount_amount`| DECIMAL | Value of discount applied |
| `net_amount` | DECIMAL | Final amount received (`amount_paid - discount_amount`) |
| `payment_mode` | ENUM | `cash`, `upi`, `cheque` |
| `reference_number`| VARCHAR | Required for non-cash payments |
| `payment_date` | DATE | Date transaction occurred |
| `created_by` | UUID | Admin who recorded the payment |

### Table: `fee_receipts`
| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary Key |
| `payment_id` | UUID | FK -> `fee_payments(id)` |
| `receipt_no` | VARCHAR | Unique human-readable number (e.g., RCPT-001) |
| `generated_at` | TIMESTAMP | Auto-filled on creation |

## 6. Business Logic
1. **Validation:** 
   - Verify `student_id` exists and belongs to the same `branch_id`.
   - Ensure `amount_paid` does not exceed the student's current pending dues.
2. **Discount Processing:**
   - If `discount_id` is provided, verify it is `active`.
   - Calculate `net_amount = amount_paid - discount_amount`.
3. **Ledger Update:**
   - Decrement the student's pending balance by `amount_paid` (The discount covers the rest of the due).
   - *Logic Note:* If a student owes ₹1000 and pays ₹900 with a ₹100 discount, the dues should become ₹0.
4. **Transaction:** 
   - Wrap Payment record and Receipt generation in a single DB transaction.

## 7. Validation Rules
- `amount_paid`: Must be > 0.
- `payment_mode`: Must be valid enum.
- `reference_number`: Mandatory if mode is NOT `cash`.
- `discount_amount`: Cannot exceed `amount_paid`.

## 8. Backend Test Cases

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| BE-PAY-01 | Full Payment + Discount | Pay ₹4500 with ₹500 discount for ₹5000 due. | Student dues become 0. Net collection = 4500. |
| BE-PAY-02 | Overpayment Block | Try to pay ₹6000 for ₹5000 due. | 400 Bad Request: "Amount exceeds dues". |
| BE-PAY-03 | Missing Ref Number | Submit UPI payment without `reference_number`. | 400 Bad Request: "Ref number required for UPI". |
| BE-PAY-04 | Inactive Discount | Submit payment with a deactivated `discount_id`. | 400 Bad Request: "Discount category not active". |
