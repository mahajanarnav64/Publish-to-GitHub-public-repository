# Finance Module Frontend

## Module Overview

The frontend for the Finance module is designed entirely within the core layout of the SaaS ERP system. It aims for high visual density and ease-of-use for educational institution admins.

## Core Feature: Fee Collection & Receipt List

This is the primary operational screen for admins managing offline payments. It's built inside the central `index.html` structure of the finance folder rather than routing to a dedicated HTML file.

### Frontend UI Structure

The page (`#fee-collection-receipt-page`) uses a streamlined layout aimed at fast, single-screen operations.

#### Split Layout Behavior
*   **Desktop View (Split Screen)**: Uses a `60% / 40%` split layout. 
    *   **Left Panel (60%)**: Dedicated to Fee Collection. Includes a Student Search input, a summary card of dues, and the payment form. Painted in a pastel blue theme.
    *   **Right Panel (40%)**: Dedicated to the Receipt List. Displays recent/past receipts in a tabular format, painted in a pastel green theme.
*   **Mobile View (Stacked)**: Gracefully degrades to a stacked responsive approach to maintain readability on smaller screens.

### Design Aesthetics
*   Colors use a pastel ERP theme (Pastel Blue for collection, Pastel Green for receipts, Pastel Red for pending amounts).
*   Follows modern SaaS ERP clean design rules (tight padding, unified card shadows, highly legible fonts).

### API Integration
*   The frontend consumes backend REST APIs to seamlessly load summary data (`GET /api/student-fee-summary/{id}`) and post payments (`POST /api/fee-payments`). It handles distinct states: Loading, Error, Success, and Empty.

For full layout schemas and test cases, please read:
[Fee Collection & Receipts Docs](./fee_collection_and_receipts.md)

## Fee Reports Module
A modern, single-page UI built within the `index.html` file designed specifically for administrative assessment of school finances.

**Key Features:**
*   Provides an interactive filter panel (Session, Class, Date).
*   Dynamic Summary Cards evaluating Total Fees, Collected padding, and pending dues using Pastel theme indicators.
*   Data tables explicitly mapping payment histories with PDF and Excel export features.

[Fee Reports Docs](./fee_reports.md)

## Discount Categories

This frontend module is housed inside the main `index.html` structure of the finance module. It enables Administrators to create reusable discount templates.

**Key Features:**
* Modals enabling quick creation of Fixed Amount or Percentage discount identifiers.
* Easy on/off toggle statuses for specific discount campaigns.
* Pastel-themed, dense data grid layout optimized for quick operations.

[Discount Categories Docs](./discount_categories.md)
