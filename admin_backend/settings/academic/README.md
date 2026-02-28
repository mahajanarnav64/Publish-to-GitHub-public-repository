# Academic Settings Backend Architecture

## Overview
This directory contains backend specifications for the Academic Settings master configuration APIs.

## Master Data Structure
The academic settings form the core master data for the ERP system:
1. **Academic Session**: Controls the active term boundary dates.
2. **Class Master**: Primary tier of student grouping.
3. **Stream Master**: Specialized curriculums (Medical, Commerce, etc.) tied to Classes.
4. **Section Master**: Granular divisions of students inside a Class/Stream.
5. **Subject Master**: Curriculum entities mapped to Class/Streams.
6. **Teacher Allocation**: Associations bridging Teachers with Subjects and Classes/Sections.

## Database Relationships
- `stream_master` belongs to `class_master` via `class_id`.
- `section_master` belongs to `class_master` (`class_id`) and optionally `stream_master` (`stream_id`).
- `subject_master` belongs to `class_master` (`class_id`) and optionally `stream_master` (`stream_id`).
- `teacher_allocation` links `teacher_id` with `class_id`, `section_id`, `subject_id`, and optionally `stream_id`.
- All tables have a `branch_id` indicating multi-tenant isolation.
- All tables contain standard `status` flags ('Active', 'Inactive').

## Shared API Architecture
Every entity supports at minimum:
- `GET /api/{module}` (Read list)
- `POST /api/{module}` (Create new)
- `PUT /api/{module}/{id}` (Full update)
- `PATCH /api/{module}/{id}/status` (Toggle status)

## Authorization Requirements
Strictly limited to users with `Admin` or `Super Admin` roles. Requests by `Teacher` must yield 403 Forbidden.
