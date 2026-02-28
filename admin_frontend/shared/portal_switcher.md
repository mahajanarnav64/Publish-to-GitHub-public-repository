# Portal Switcher - Component Documentation

## Feature Overview
The **Portal Switcher** is a high-level UI component that allows multi-role users (e.g., an Admin who is also a Teacher) to toggle between their respective functional environments. 

This ensures:
- **Focus**: Users only see modules relevant to their current task.
- **Security**: Access is strictly filtered based on the active portal context.
- **Workflow Efficiency**: Quick switching without re-authentication.

## UI Component
The component is implemented as a **Segmented Control** located in the Dashboard Header.

### Design Specs:
- **Style**: Modern Pastel ERP Theme.
- **Colors**: 
  - Active: Blue-600 (`#2563eb`) with white text and subtle shadow.
  - Inactive: Slate-400 text on Slate-100 background.
- **Interaction**: Transition animations for background color and shadow.

### UI Example:
`[ Admin Portal ] ⇄ [ Teacher Portal ]`

## User Flow
1. User logs in.
2. System identifies `allowedPortals` from user profile.
3. If user has > 1 portal, Switcher appears in header.
4. User clicks a portal button.
5. System triggers `POST /api/portal/switch`.
6. Frontend updates `activePortal` state and refreshes navigation.
7. Workspace reloads with portal-specific modules.

## State Management
- **Persistence**: `localStorage.getItem('activePortal')`
- **Memory**: Alpine.js `activePortal` property.
- **Context**: Backend Session `activePortal` field.

## API Integration
### Switch Portal
`POST /api/portal/switch`

**Request:**
```json
{
  "portal": "teacher"
}
```

**Response:**
```json
{
  "success": true,
  "activePortal": "teacher"
}
```

## Edge Cases
- **Single Role User**: The switcher is hidden if `allowedPortals.length <= 1`.
- **Unauthorized Switch**: Backend rejects switch request if user lacks permission for target portal (403 Forbidden).
- **Session Timeout**: Portal context is restored from persistent storage on re-login if session is active.

## Acceptance Criteria
- [ ] Toggle is visible in dashboard header for multi-role users.
- [ ] Modules filter instantly when portal is switched.
- [ ] Active portal persists across page refreshes.
- [ ] Unauthorized access to a portal is blocked by backend.

## Frontend Test Cases

| Test ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **TC-PS-001** | Visibility Check | Login as Admin | Portal Toggle is visible in header. |
| **TC-PS-002** | Switching Flow | Click "Teacher Portal" | Navigation updates, Teacher Dashboard loads. |
| **TC-PS-003** | Filter Verification | Switch to Teacher Portal | HR and Finance modules should be hidden. |
| **TC-PS-004** | Persistence Check | Switch to Teacher -> Refresh Page | System remains in Teacher Portal. |
| **TC-PS-005** | Role Constraint | Login as strict Teacher | Portal Toggle is hidden. |
