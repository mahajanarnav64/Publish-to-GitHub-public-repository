# Sidebar (Navigation) - Backend Documentation

## 1. Overview
The Sidebar (Navigation) is not just a UI element but the enforce of **Role-Based Access Control (RBAC)**. The backend must return only the modules and sub-modules that the logged-in user is authorized to access.

**Key Principle:** The frontend should never hide menus using CSS alone; the backend must not send unauthorized menu items in the API response.

---

## 2. API Endpoints

### 2.1 Get User Navigation
**Endpoint:** `GET /api/navigation/sidebar`

**Description:** Returns the hierarchical menu structure for the current user based on their Role and Permissions.

**Headers:**
*   `Authorization`: `Bearer <token>`

**Response Structure:**
```json
{
  "modules": [
    {
      "id": "dashboard",
      "label": "Dashboard",
      "icon": "fa-solid fa-gauge-high",
      "link": "/dashboard",
      "hasSubMenu": false
    },
    {
      "id": "admissions",
      "label": "Admissions",
      "icon": "fa-solid fa-user-plus",
      "hasSubMenu": true,
      "subMenu": [
        { "id": "enquiries", "label": "Enquiries", "link": "/admissions/enquiries" },
        { "id": "applications", "label": "Applications", "link": "/admissions/applications" },
        // ... filtered based on permission
      ]
    },
    // ... other modules
  ]
}
```

---

## 3. Database Schema (RBAC)

### 3.1 `Modules` Collection
Defines all available system features.
```json
{
  "_id": "module_finance",
  "name": "Finance & Accounting",
  "key": "finance",
  "icon": "fa-solid fa-coins",
  "order": 8,
  "subModules": [
    { "key": "fee_management", "name": "Fee Management", "route": "/finance/fees" },
    { "key": "expense_management", "name": "Expense Management", "route": "/finance/expenses" }
  ]
}
```

### 3.2 `Modules` Collection (Compliance Example)
```json
{
  "_id": "module_compliance",
  "name": "Compliance & Documentation",
  "key": "compliance",
  "icon": "fa-solid fa-file-shield",
  "order": 13,
  "subModules": [
    { "key": "student_docs", "name": "Student Documents", "route": "/compliance/student-docs" },
    { "key": "expiry_tracking", "name": "Expiry Tracking", "route": "/compliance/expiry" }
  ]
}
```

### 3.3 `Roles` Collection
Maps roles to allowed `module_keys` and `sub_module_keys`.
```json
{
  "_id": "role_accountant",
  "name": "Accountant",
  "permissions": {
    "modules": ["dashboard", "finance", "reports"], // Only these 3 main modules
    "subModules": [
      "finance.fee_management",
      "finance.expense_management",
      "reports.financial_reports"
    ]
  }
}
```

---

## 4. Business Logic

### 4.1 Menu Filtering Logic
1.  Fetch full list of `Modules` from DB (cached in Redis).
2.  Fetch `Role` of current user.
3.  Filter `Modules` array:
    *   Include Module if `module.key` exists in `User.Role.permissions.modules`.
    *   Filter `subModules` array: Include SubModule if `subModule.key` exists in `User.Role.permissions.subModules`.
4.  Return final filtered tree.

### 4.2 Caching Strategy
*   **Cache Key:** `nav_structure_${roleId}`
*   **TTL:** 1 hour (invalidate on Role Update).
*   Reason: Navigation structure rarely changes per role.

---

## 5. Acceptance Criteria

*   [ ] **Security**: API must strictly exclude any menu item the user doesn't have permission for.
*   [ ] **Performance**: Menu response time < 50ms (served from Redis).
*   [ ] **Dynamic**: If a Super Admin enables a new feature (e.g., "Library") for a role, it should appear in the menu on next login.

## 6. Test Cases

*   **TC-NAV-001**: Login as "Teacher" -> Verify "Finance" module is NOT present in response.
*   **TC-NAV-002**: Login as "Super Admin" -> Verify all 14 modules are present (including Compliance).

### 6.1 Comprehensive Risk Assessment
*   **Security Misconfiguration Risk**:
    *   *Risk*: If a role's permissions are cached incorrectly, a user might access unauthorized modules or be denied access to critical ones.
    *   *Mitigation*: Invalidate cache immediately on Role Update. Implement unit tests for permission logic.
*   **Performance Bottleneck**:
    *   *Risk*: Fetching modules from DB on every request can slow down the initial load or navigation API dramatically if not cached.
    *   *Mitigation*: Use Redis caching as outlined.

### 6.2 Data Rules & Formatting
*   **Module Keys**: Use `snake_case` (e.g., `fee_management`). Unique across the system.
*   **Icons**: FontAwesome 6 class strings (e.g., `fa-solid fa-user`).
*   **Routes**: Must be valid, relative paths starting with `/`.

### 6.3 Edge Cases & Handling
*   **No Permissions Assigned**: If a user has a role but `permissions` array is empty, return an empty `modules` array (or a default "Dashboard" only if applicable).
*   **Role Deleted**: If a user's role is deleted while they are logged in, next API call should fail or default to a basic guest role.
*   **Module Disabled System-wide**: If a module (e.g., "Library") is globally disabled, it must disappear from *all* users' menus regardless of their individual role permissions.

### 6.4 Additional Comprehensive Test Cases
*   **TC-BE-NAV-004**: System-wide disable of "Library" -> User with "Librarian" role logs in -> "Library" module is ABSENT.
*   **TC-BE-NAV-005**: User assigned multiple roles (if supported) -> Union of permissions is returned.
*   **TC-BE-NAV-006**: Invalid Token -> `GET /navigation/sidebar` returns 401 Unauthorized.
