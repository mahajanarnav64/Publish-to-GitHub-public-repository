# Subject Master Frontend Specification

## Feature Overview
Provides interface for managing Subject Master configurations under Academic Settings. Restricted to Admins.

## Page Overview
- Resides as a section in `frontend/index.html` with `id="subject-master-page"`.
- Activated when `activeTab === 'subject_master'`.
- Standard ERP view, data grids with inline actions.

## UI Components
| Component | Function |
| - | - |
| Header | Back button to Academic Settings home, title, create action. |
| Filters | Interactive filters for data attributes, toggle status search. |
| Data Grid | Tabular presentation of Subject Master records. |
| Add/Edit Modal | Form for creating or mutating Subject Master. |
| Status Toggle | Quick toggling between Active/Inactive states. |

## Layout Structure
Follows the centralized layout logic inherited from `settings_home.md`, displaying inside the main container element with predefined padding and styling.

## User Flow
1. User navigates to Academic Settings -> Clicks Subject Master card.
2. The Subject Master page is rendered.
3. User creates, views, updates, or toggles states for Subject Master.
4. Back navigation returns them to the Academic Settings listing.

## Component Behavior
- Lists dynamically pull data on initialization.
- Forms provide real-time validation feedback.
- Success/failure prompts utilizing unified toast components.

## API Integration
| Endpoint | Method | Action |
| - | - | - |
| `/api/subject_master` | GET | Fetch list |
| `/api/subject_master` | POST | Create record |
| `/api/subject_master/{id}` | PUT | Update record |
| `/api/subject_master/{id}/status` | PATCH | Update status |

## Request JSON Example
```json
{
  "name": "Example Payload for Subject Master",
  "status": "Active"
}
```

## Response JSON Example
```json
{
  "success": true,
  "data": { "id": 1, "status": "Active" }
}
```

## State Management
Leverages Alpine.js state scopes bounded around `currentModule` and `activeTab` variables managing visibility. Local data managed in respective `x-data` functions (if applicable).

## Validation Rules
- Required fields must be provided before form submission.
- Uniqueness enforced on names corresponding to active branches.

## Error Handling
- Network errors visually render warning toasts.
- Specific `4xx` map into field-level validation indicators.

## Responsive Behavior
- Layout adapts smoothly across device breakpoints according to core Tailwind standards.
- Data grids overflow gracefully with internal horizontal scrolling.

## Edge Cases
- Session expiration during creation limits.
- Unauthorized (non-Admin) manual DOM modifications block API operations.

## Acceptance Criteria
- User can navigate to Subject Master via module card.
- User can view, add, and modify items smoothly.
- Validation checks trigger appropriately.
- Unauthorized users cannot view or utilize forms.

## Frontend Test Cases
| TC ID | Scenario | Expected Outcome |
| - | - | - |
| FE_AS_subject_master_01 | Verify form prevents empty submission | Form blocks with error |
| FE_AS_subject_master_02 | Ensure successful fetch loads grid | Grid populated |
| FE_AS_subject_master_03 | Test Back button behavior | Returns to `activeTab = 'academic'` |

