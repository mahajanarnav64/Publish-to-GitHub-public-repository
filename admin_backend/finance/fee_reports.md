# Fee Reports - Backend Specification

## 1. Module Overview
The Fee Reports module aggregates data from payments, structures, and student records to provide a real-time financial overview of the institution.

## 2. API List

| API | Method | Purpose |
|-----|--------|---------|
| `/api/fee-reports/summary` | GET | Aggregated counters: Total Expected, Total Collected, Total Discounted, Total Pending. |
| `/api/fee-reports/class-wise` | GET | Breakdowns by class and section. |
| `/api/fee-reports/student-wise` | GET | Student-level balances and high-level history. |
| `/api/fee-reports/date-wise` | GET | Collection metrics within specific date bounds. |

## 3. Request Format Example
```http
GET /api/fee-reports/summary?session_id=UUID&class_id=optional_UUID&start_date=2026-01-01&end_date=2026-02-28
```

## 4. Response Format Example
```json
{
  "total_expected": 1000000,
  "total_collected": 750000,
  "total_discounted": 50000,
  "total_pending": 200000,
  "collection_efficiency": "75%"
}
```

## 5. Business Logic & Calculations
- **Total Expected:** Sum of all applied fee structures for the filtered students.
- **Total Collected:** `SUM(net_amount)` from `fee_payments`.
- **Total Discounted:** `SUM(discount_amount)` from `fee_payments`.
- **Net Pending:** `Total Expected - (Total Collected + Total Discounted)`.
- **Student Status:**
  - If `Pending <= 0`, status is `Cleared`.
  - Otherwise, status is `Pending`.

## 6. Query Optimization
- Use **Sum Aggregations** on the `net_amount` and `discount_amount` columns.
- Ensure indexes exist on:
  - `branch_id`
  - `session_id`
  - `student_id`
  - `payment_date`

## 7. Security & Isolation
- **Branch Lockdown:** All queries MUST inject `WHERE branch_id = :current_admin_branch`.
- **Data Privacy:** Mask sensitive payment reference numbers in general summaries, only show in student-specific drill-downs.

## 8. Backend Test Cases

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| BE-REP-01 | Collection Accuracy | Record 5000 payment (4500 cash + 500 discount). Check Summary. | Collected increases by 4500, Discounted by 500. |
| BE-REP-02 | Date Filtering | Query report for a date with zero payments. | Summary returns 0 for collection/discounted fields. |
| BE-REP-03 | Cleared Toggle | Fetch report for student with 0 dues. | `status` field in response must be "Cleared". |
| BE-REP-04 | Branch Leakage | Attempt to query summary using a session ID from another branch. | 403 Forbidden or 404 depending on session scope. |
