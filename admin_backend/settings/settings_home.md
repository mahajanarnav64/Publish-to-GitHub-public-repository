# Settings Module Backend

## Module Overview
The Settings Backend handles configuration logic across Academic, Finance, Student, HR, and System domains. It exposes APIs for fetching and modifying system preferences and master data logic.

## Access Control Logic
- **Admin/Super Admin:** Complete read/write access to all settings tabs and configurations.
- **Teacher/Staff:** No access to configuration (unless localized permissions explicitly grant it in HR or System modules).
- Verified via authentication middleware or JWT token claims checking the user's role on each protected API route.

## API Architecture (General)
- Base Route: `/api/v1/settings`
- Endpoints:
  - `GET /` : Returns a list of modules the user is authorized to configure.
  - `PUT /:module/:key` : Update a specific setting for a module.

## Authorization Rules
Only user IDs mapping to a "Super Admin" or "Admin" group are allowed by the configuration endpoints to read or modify settings arrays and structures.

## Security Requirements
- Tokens must bear a valid, unexpired Admin signature.
- Payload sanitization on configuration objects.
- Rate limiting on modification actions.
- Audit logging: Every setting modification must be recorded with Timestamp, UserID, Old Value, and New Value representing the change.

## Backend Test Cases
| Test Case ID | Path | Role | Expected Result |
|--------------|------|------|-----------------|
| BE-SET-01 | `GET /api/v1/settings` | Admin | 200 OK, Returns configuration listing. |
| BE-SET-02 | `GET /api/v1/settings` | Teacher | 403 Forbidden |
| BE-SET-03 | `PUT /api/v1/settings/academic` | Admin/Valid Payload | 200 OK |
| BE-SET-04 | `PUT /api/v1/settings/academic` | Admin/Incomplete Payload | 400 Bad Request |
| BE-SET-05 | System Settings Audit Log | Admin Action | DB Row accurately represents the update. |
