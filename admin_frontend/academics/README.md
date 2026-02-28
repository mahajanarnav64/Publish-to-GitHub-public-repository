# Academics Module - Frontend Documentation

This directory contains the user interface, functional flow, and frontend specifications for the Academics features of the HybridERP system.
The documents have been written conforming to strict, production-level standards suitable for immediate handover to Frontend Developers and QA Engineers.

## Modules

### 1. Class & Section Management
*   **File**: `01-class-section.md`
*   **Description**: Definition of the interface managing classes, sections, and structural taxonomy, natively handling multi-section tags within a single flow.

### 2. Timetable Management
*   **File**: `02-timetable.md`
*   **Description**: Advanced scheduling workspace utilizing a geometric 2D grid structure linked to right-hand drawer overlays. Includes active teacher overlap tracking and multi-period merging logic visually on canvas.

### 3. Subject Management
*   **File**: `03-subject-management.md`
*   **Description**: Interface defining the active subject repository. Handles fuzzy searches, robust data-table renderings, and many-to-many class mapping selectors.

### 4. Syllabus Planner & Tracker
*   **File**: `04-syllabus-planner.md`
*   **Description**: Dual-layer module serving Admin Master Planners (creating structure and predicting timeframe logic) alongside Teacher Tracking interfaces (executing timelines against specific start/end timestamps).

### 5. Academic Calendar
*   **File**: `05-academic-calendar.md`
*   **Description**: Base timeframe structure interface calculating standard weekends against institution-specific Holidays. Acts as the Single Source of Truth for logical timing dependencies.

## Usage Defaults
*   All frontend components default to Mobile-First responsive CSS frameworks (Tailwind CSS standard).
*   Any Date or Time processing implicitly forces formatting to user-local timezone output from ISO-8601 strings.
