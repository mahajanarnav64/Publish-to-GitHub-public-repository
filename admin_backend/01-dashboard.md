# Education ERP Dashboard - Backend Documentation

## 1. Overview
The Dashboard API is designed to support a **Global Filter Context**. Every endpoint accepts standard query parameters for date ranges, academic sessions, and branches to ensure consistent data reporting across all 5 sections.

---

## 2. API Design & Endpoints

### 2.1 Global Filter Parameters
All dashboard endpoints accept the following optional query parameters:
*   `startDate` (ISO Date): Start of the selected range.
*   `endDate` (ISO Date): End of the selected range.
*   `academicSessionId` (String): ID of the session (e.g., "2025-26").
*   `branchId` (String): For multi-branch setups (Super Admin).
*   `compare` (Boolean): If true, returns `previousPeriod` data for trend indicators.

### 2.2 Section 1: Financial Health
**Endpoint:** `GET /api/dashboard/financial-health`

**Response Structure:**
```json
{
  "kpis": {
    "totalCollected": { "value": 1500000, "trend": 5.2 }, // 5.2% increase
    "pendingFees": { "value": 450000, "trend": -2.1 },
    "overdueAmount": { "value": 120000, "isCritical": true },
    "collectionPercentage": 76.5
  },
  "chartData": {
    "type": "line",
    "labels": ["Mon", "Tue", "Wed", "Thu", "Fri"],
    "datasets": [
      { "label": "Fees Collected", "data": [20k, 45k, 30k, 50k, 40k] }
    ]
  }
}
```

### 2.3 Section 2: Admissions & Growth
**Endpoint:** `GET /api/dashboard/admissions`

**Response Structure:**
```json
{
  "kpis": {
    "activeStudents": { "value": 1250, "trend": 1.5 },
    "newAdmissions": { "value": 45, "trend": 10.0 },
    "enquiries": { "value": 120, "trend": -5.0 },
    "conversionRate": 37.5
  },
  "chartData": {
    "type": "bar",
    "labels": ["Class 1", "Class 2", "Class 3", ...],
    "datasets": [
      { "label": "Student Count", "data": [40, 42, 38, ...] }
    ]
  }
}
```

### 2.4 Section 3: Academic Control
**Endpoint:** `GET /api/dashboard/academic`

**Response Structure:**
```json
{
  "kpis": {
    "studentAttendance": { "value": 92.5, "isLow": false },
    "absenteesArray": 15, // Count of students absent 3+ days
    "teacherAttendance": 96.0,
    "syllabusCompletion": 45.0
  },
  "infoCards": {
    "upcomingExams": [
      { "name": "Mid-Term", "class": "10-A", "date": "2026-03-15" }
    ],
    "lastExam": {
      "name": "Unit Test 2",
      "published": true
    }
  }
}
```

### 2.5 Section 4: Engagement
**Endpoint:** `GET /api/dashboard/engagement`

**Response Structure:**
```json
{
  "ptm": { "scheduled": 2, "upcomingDate": "2026-02-20" },
  "events": { "count": 4, "nextEvent": "Science Fair" },
  "birthdays": { "count": 3, "ids": ["stu_01", "stu_02"] },
  "notices": { "sent": 1500 }
}
```

### 2.6 Section 5: Risk & Attention
**Endpoint:** `GET /api/dashboard/risks`

**Response Structure:**
```json
{
  "feeRisks": [
    { "class": "10-A", "dueAmount": 50000, "action": "remind" }
  ],
  "attendanceRisks": [
    { "class": "8-B", "percentage": 72.0, "action": "report" }
  ],
  "disciplineOpen": 3,
  "pendingLeaves": 4,
  "complaints": 1
}
```

---

### 2.7 Section: Teacher Dashboard
**Endpoint:** `GET /api/dashboard/teacher`
**Focus:** Operational daily tasks for a specific teacher.

**Note:** For detailed JSON response structures, data logic, and aggregation strategies, please refer to the dedicated documentation: **[Teacher Dashboard Backend](./teacher_dashboard.md)**.

---

## 3. Database Schema Updates (for Risks)

### 3.1 Risk Threshold Configuration
Stored in `SystemSettings` collection to allow admins to define "Risk" levels.
```yaml
fee_risk_threshold: 50000 (currency)
attendance_min_threshold: 75 (percent)
overdue_days_critical: 30 (days)
```

---

## 5. Acceptance Criteria (Backend)
Requirements for the API to be production-ready.

### 5.1 Performance & Scalability
*   [ ] **Latency**: All aggregation endpoints must respond in **< 300ms** (P95) for a dataset of 5,000 active students.
*   [ ] **Concurrency**: Support 100 simultaneous dashboard loads without database lockouts.
*   [ ] **Caching**: Dashboard data should be cached in Redis with a TTL of 5 minutes, invalidated on key write events (fees paid, admission done).

### 5.2 Security & Access
*   [ ] **Authentication**: All endpoints require a valid JWT.
*   [ ] **Authorization**:
    *   `branchId` filter is mandatory for non-SuperAdmin users.
    *   Middleware automatically injects `branchId` from the user's token if not provided by SuperAdmin.

---

## 6. Data Rules & Calculation Logic
Precise logic for calculating dashboard metrics.

### 6.1 Financial Health
*   **Total Fees Collected**: `Sum(FeeReceipts.amount)` where `status = "paid"` and `date` in range.
*   **Pending Fees**: `Sum(FeeInstallments.amount)` where `dueDate < Now` and `status = "pending"`.
*   **Overdue Amount**: Subset of Pending Fees where `dueDate < Now - 30 days`.

### 6.2 Admissions
*   **Active Students**: Count of `Students` where `status = "active"` AND `academicSession = current`.
*   **Conversion Rate**: `(New Admissions / Enquiries Received) * 100`. (Handle division by zero).

### 6.3 Risk Identification
*   **High Pending Fee**: Classes where `Sum(PendingFees)` > Risk Configuration Threshold (default 50k).
*   **Low Attendance**: Classes where `Avg(DailyAttendance)` < Risk Configuration Threshold (default 75%).

---

## 7. Edge Cases & Error Handling

### 7.1 Database Handling
*   **Connection Failure**: Return `503 Service Unavailable`. Do not hang the request.
*   **No Data Found**: Return `200 OK` with zeroed values (e.g., `{ "value": 0 }`) instead of `404 Not Found` for dashboard aggregations.

### 7.2 Invalid Inputs
*   **Invalid Date Range**: If `startDate > endDate`, return `400 Bad Request`.
*   **Future Dates**: If range is in the future, return valid response with `0` values (no data).

---

## 8. Comprehensive Test Cases (Backend)

### 8.1 Unit Tests (Logic)
*   **TC-BE-008**: Validate `calculateConversionRate(admissions, enquiries)` returns `0` if `enquiries` is 0.
*   **TC-BE-009**: Validate `getOverdueFees()` strictly excludes fees due *tomorrow* (boundary test).
*   **TC-BE-010**: Verify that "Teacher Attendance" excludes "Non-Teaching Staff" roles.

### 8.2 Integration Tests (API)
*   **TC-BE-011**: **Happy Path**: Call `/api/dashboard/overview` with valid dates -> returns 200 and JSON structure matches schema.
*   **TC-BE-012**: **Security**: Call API without JWT -> returns **401 Unauthorized**.
*   **TC-BE-013**: **Tenancy**: Login as "Branch A Admin" and request data for "Branch B" -> returns **403 Forbidden** or ignores filter and returns Branch A data.

### 8.3 Performance Tests
*   **TC-BE-014**: Load test `/api/dashboard/financial-health` with 50 concurrent requests. Avg response time should be < 200ms.
*   **TC-BE-015**: Database query plan verification: Ensure `Date` and `BranchId` columns are indexed and used in aggregation queries.
