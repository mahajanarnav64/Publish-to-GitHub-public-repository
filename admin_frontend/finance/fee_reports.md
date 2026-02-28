# Fee Reports - Frontend Specification

## 1. Feature Overview
Admin can monitor financial health through comprehensive fee reports. High-level KPIs summarize the collection status, while details allow for auditing individual student transactions.

## 2. Page Overview
An analytical view with real-time aggregation based on filters.
- **Top Bar:** Summary KPIs (Total, Collected, Pending).
- **Control Bar:** Multi-filter system (Session, Class, Date Range).
- **Main Section:** Interactive report table with drill-down capabilities.

## 3. UI Components

| Component | Type | Description |
|-----------|------|-------------|
| Summary Cards | KPI Cards | Large indicators for Total Fee, Collected Fee, and Pending Fee. |
| Filter Group | Form | Inputs for Session, Class, and Start/End Date range. |
| Student Report Table | Data Table | Summary of each student's financial standing. |
| Export Actions | Buttons | High-visibility buttons for Excel and PDF exports. |
| Student Detail Panel | Slide-over | Deep-dive into a student's payment history (Receipts) without leaving report page. |

## 4. Layout Structure

- **KPI Section:** 3-column row with shadow-bordered cards.
- **Table Columns:**
  - **Student Name:** With ID in small mono font.
  - **Class:** Combined Class & Section.
  - **Total Fee:** Bold gray text.
  - **Paid:** Bold emerald text.
  - **Pending:** Status capsule (Red for `>0`, Green "Cleared" for `===0`).

## 5. User Flow
1. **Entry:** Admin navigates to Fee Reports. Default filters (Current Session, All Classes) load immediately.
2. **Analysis:** Admin filters by specific Class or adjusts the Date Range to see recent collections.
3. **Drill-down:** Clicking a student row opens a right-side slide-over panel showing full transaction details (receipts, dates, modes).
4. **Export:** Admin clicks Excel/PDF to download the filtered view.

## 6. Logic & Highlights
- **Dynamic Status Badge:** 
  ```html
  <span x-show="student.pending > 0">₹ [Amount]</span>
  <span x-show="student.pending === 0">Cleared</span>
  ```
- **Filter-Triggered Aggregation:** Changing Class or Date Range automatically updates the top Summary Cards to reflect the filtered set.

## 7. API Integration

| API | Method | Purpose |
|-----|--------|---------|
| `/api/reports/fee-summary` | GET | Fetch metrics for Total, Paid, Pending. |
| `/api/reports/fee-transactions` | GET | List filtered student records. |
| `/api/reports/export` | POST | Generate and stream report file (Excel/PDF). |

## 8. Request & Response JSON Examples

**Response Example (Transaction Object):**
```json
{
  "id": "STU001",
  "name": "Rahul Sharma",
  "class": "Class 11",
  "section": "A",
  "totalFee": 50000,
  "paid": 30000,
  "pending": 20000
}
```

## 9. State Management
- `feeReports.showDetail`: Toggles the side panel.
- `feeReports.selectedStudent`: Object containing the student being inspected.

## 10. Acceptance Criteria
- [ ] Summary cards update in real-time when filters change.
- [ ] Students with zero dues show a green "Cleared" status vs a red amount for debtors.
- [ ] Slide-over panel displays the student's complete receipt history correctly.
- [ ] Export buttons trigger the correct background process.

## 11. Frontend Test Cases

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| FR-TC-01 | Debt Filter | View students with pending > 0. | Table shows red dues badges. |
| FR-TC-02 | Cleared Status | Select a student known to have paid fully. | Dues column displays green "Cleared" badge. |
| FR-TC-03 | Detail Inspection | Click any student row. | Right panel slides out with list of previous receipts. |
| FR-TC-04 | Export Flow | Apply filters and click Excel. | Browser initiates download of a .xlsx file. |
| FR-TC-05 | Zero Results | Search for a non-existent student name. | Table shows "No Data Found" illustration. |
