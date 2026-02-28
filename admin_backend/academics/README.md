# Academics Module - Backend Specifications

This directory contains the database schemas, API architecture, and business logic frameworks powering the Academics system. All documentation follows strict, production-level specifications configured for backend microservice or monolithic deployment.

## Schemas & Specifications

### 1. Class & Section Schema
*   **File**: `01-class-schema.md`
*   **Description**: Establishes the `classes` and `sections` DB entities tracking aggregate stats dynamically and enforcing session restrictions.

### 2. Timetable Architecture
*   **File**: `02-timetable-schema.md`
*   **Description**: Outlines the 2-step DB relations between macro Timetable Containers (`schedules`) and slot-level granularity (`schedule_periods`). Emphasizes real-time conflict query checks across teacher contexts.

### 3. Subject Management
*   **File**: `03-subject-management.md`
*   **Description**: Catalog of all taught subjects mapped to grades. Deeply leverages Many-to-Many logic (`class_subjects`) with robust constraints avoiding orphan entities when bound to Timetable references.

### 4. Syllabus Planner & Tracker
*   **File**: `04-syllabus-planner.md`
*   **Description**: Highly mathematical DB structures supporting Admin definitions mapped structurally down to individual teacher-state interactions (`started_at`, `completed_at` computations).

### 5. Academic Calendar
*   **File**: `05-academic-calendar.md`
*   **Description**: Bulk generated matrix representing the 365 days in an operational session identifying Working, Sunday, or explicit Holiday status. Master reference table driving Syllabus duration mathematical projections natively entirely server-side.

## Key Principles
*   **Tenant Isolation**: All database retrievals and mutations enforce the implicit injection of `branch_id` bounded to the JWT layer payload.
*   **Soft Deletion**: No Academic entity row is hard-dropped; all entities explicitly utilize `deleted_at` markers preserving dependent relational history.
*   **Strict Dependency Validation**: Operations returning `422 Unprocessable Entity` or `409 Conflict` dynamically trace dependencies preventing users from arbitrarily gutting schema associations that rely dynamically on downstream execution files.
