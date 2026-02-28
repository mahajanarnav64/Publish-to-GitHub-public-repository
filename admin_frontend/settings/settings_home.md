# Settings Module Frontend

## Feature Overview
The Settings module acts as a Configuration Hub, providing organized access to various administrative settings across Academic, Finance, Student, HR, and System domains.

## Page Overview
The Settings Home page presents a card-based grid layout, displaying five primary configuration areas:
1. Academic Settings
2. Finance Settings
3. Student Settings
4. HR Settings
5. System Settings

## UI Components
| Component | Description |
|-----------|-------------|
| Settings Section | Main `<section id="settings-home-page">` handling layout. |
| Configuration Cards | Reusable UI panels displaying an icon, title, description, and action button. |
| Open Button | Call to action within the card to navigate to the specific settings page. |

## Layout Structure
Responsive CSS grid enforcing:
- **Desktop:** grid-cols-4 (In our 5 card case, the 5th wraps or adjusts neatly, adjusting to max 4 per row)
- **Tablet:** grid-cols-2
- **Mobile:** grid-cols-1

The layout resides within the secondary navigation area context of the existing `index.html`.

## User Flow
1. User clicks the "Settings" icon in the narrow side rail sidebar.
2. The UI hides the dashboard view and displays the `<section id="settings-home-page">`.
3. User views the 5 available configuration areas as cards.
4. User clicks on a specific card (or its button) to navigate to that specific configuration module.

## Navigation Behavior
- AlpineJS state modification (`currentModule = 'settings'`) opens the Settings tab structure horizontally.
- The Settings home section is displayed when the module is `settings` and `activeTab` is `overview`.
- Clicking a card triggers Alpine actions or JS functions (e.g. `showPage('academic-settings-page')` or setting state).

## State Management
- `currentModule` state in Alpine drives sidebar active state and main content visibility.
- `activeTab` state manages sub-tabs within the Settings module.
- Cards navigate deeper into the settings structure.

## Responsive Behavior
- **Grid breakpoints:** `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`
- **Flexbox adjustments:** Icons and texts scale or adjust margin according to the viewport size to maintain readability.

## Acceptance Criteria
- [ ] Settings icon exists in the sidebar (hidden for teachers).
- [ ] Clicking Settings changes view to Settings Home.
- [ ] 5 distinct cards exist showing appropriate titles and descriptions.
- [ ] Cards adhere to the pastel ERP theme visually.
- [ ] Hover states elevate the cards.
- [ ] Authorized Admin/Super Admin access only.

## Frontend Test Cases
| Test Case ID | Scenario | Expected Outcome |
|--------------|----------|------------------|
| UI-SET-01 | Click Settings in Sidebar | Settings Home `<section>` is displayed. |
| UI-SET-02 | Verify Teacher Role Access | Settings sidebar item is hidden and inaccessible. |
| UI-SET-03 | Responsive Grid Scale Desktop | Displays cards in up to 4 columns. |
| UI-SET-04 | Responsive Grid Scale Mobile | Displays cards vertically stacked (1 column). |
| UI-SET-05 | Hover on Card | Card elevation/shadow increases visually. |
| UI-SET-06 | Click on Academic Card | Navigates or trigers view change to Academic settings. |
