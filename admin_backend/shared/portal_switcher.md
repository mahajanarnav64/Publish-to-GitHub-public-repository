# Portal Management - Backend Documentation

## Module Overview
The backend manages the user's active portal context to ensure that data served through APIs is relevant and secure. While RBAC (Role-Based Access Control) defines what a user *can* do, the Portal Context defines what the user is *currently* doing.

## Database Update

### Table: `users`
Add the following field to the `users` table:

| Field Name | Data Type | Description |
| :--- | :--- | :--- |
| `allowedPortals` | ARRAY[STRING] | e.g. `["admin", "teacher"]` |

## API List

### 1. Switch Portal
`POST /api/portal/switch`

**Request Format:**
```json
{
  "portal": "teacher"
}
```

**Response Format:**
```json
{
  "success": true,
  "activePortal": "teacher"
}
```

## Business Logic
1. **Validation**: Check if the requested portal exists in the user's `allowedPortals` list.
2. **Session Update**: Update the `activePortal` field in the user's session or JWT state.
3. **Context Persistence**: The system must remember the `activePortal` even after a page refresh (typically stored in session/JWT).

## Security Rules
- **Access Control**: Users attempting to switch to a portal they are not authorized for must receive a **403 Forbidden** response.
- **API Filtering**: Modules (like `/api/dashboard`) must check both `userRole` and `activePortal` before returning data.
- **Middleware**: Use `validatePortalAccess` middleware for all portal-specific routes.

## Validation Rules
- `portal` must be one of: `["admin", "teacher"]`.
- `userId` must have a valid session to perform the switch.

## Test Cases

| Test ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **TC-BE-PS-001** | Authorized Switch | POST `/api/portal/switch` with `{ "portal": "teacher" }` | 200 OK, `activePortal: "teacher"` |
| **TC-BE-PS-002** | Unauthorized Switch | POST `/api/portal/switch` with `{ "portal": "admin" }` (User is strict Teacher) | 403 Forbidden |
| **TC-BE-PS-003** | Invalid Portal | POST `/api/portal/switch` with `{ "portal": "superadmin" }` | 400 Bad Request |
| **TC-BE-PS-004** | Session Integrity | Perform Switch -> Get Session Data | Verify `activePortal` is correctly updated in session. |
