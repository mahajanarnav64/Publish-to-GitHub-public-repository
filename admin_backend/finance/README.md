# Finance Module Backend

## Module Overview

The Finance module backend provides robust REST APIs for fee management operations, primarily serving administrative functions. Currently, the main focus is on the **Fee Collection & Receipt** architecture.

## Architecture & Responsibilities

The system follows a typical layered architecture, including validation, business logic execution (service layer), and database persistence.

### Key Features
*   **Offline Fee Collection**: Record payments in Cash, UPI, Cheque, etc.
*   **Receipt Generation**: Automatically generate formatted receipt records.
*   **Data Integrity**: Ensure payments do not exceed pending amounts and handles multi-branch isolation.

## APIs

For detailed API documentation, see individual feature markdown files. The main endpoints include:
*   `GET /api/student-fee-summary/{student_id}`
*   `POST /api/fee-payments`
*   `GET /api/fee-receipts`

## Database Tables

The core of the database schema for fee collection includes:

### `fee_payments`
Stores the actual payment transactions.
*   `id` (PK)
*   `branch_id` (FK)
*   `student_id` (FK)
*   `amount_paid` (Decimal)
*   `payment_mode` (Enum)
*   `reference_number` (String)
*   `payment_date` (Date)
*   `created_by` (FK)
*   `created_at` (Timestamp)

### `fee_receipts`
Stores generated receipts linked to payments.
*   `id` (PK)
*   `payment_id` (FK)
*   `receipt_number` (String, Unique)
*   `generated_at` (Timestamp)

For full operational details and test cases, please refer to:
[Fee Collection & Receipts Docs](./fee_collection_and_receipts.md)

## Fee Reports

The backend provides comprehensive APIs for tracking financial health and aggregated reports.
It handles database aggregation logic by querying `fee_payments` and `fee_receipts` while enforcing strict branch-isolation rules.

**APIs Used:**
* `GET /api/fee-reports/summary`
* `GET /api/fee-reports/class-wise`
* `GET /api/fee-reports/student-wise`
* `GET /api/fee-reports/date-wise`
* `GET /api/fee-reports/pending-dues`

[Fee Reports Docs](./fee_reports.md)

## Discount Categories

The backend provides the API infrastructure to allow Administrators to create reusable discount categories (e.g., Sibling Discount, Staff Child Discount) that act as Phase 1 configurations. These categories dictate whether a fixed amount or percentage off is applied when manually applying a student fee discount.

**APIs Used:**
* `GET /api/discount-categories`
* `POST /api/discount-categories`
* `PUT /api/discount-categories/{id}`
* `PATCH /api/discount-categories/{id}/status`

[Discount Categories Docs](./discount_categories.md)
