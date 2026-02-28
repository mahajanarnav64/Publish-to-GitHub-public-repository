# Settings Module Frontend

## Architecture Overview
The frontend architecture relies on a Single Page Application (SPA)-like approach encapsulated in `index.html`. Using AlpineJS for state (`currentModule`, `activeTab`) and TailwindCSS for responsive grid rendering, the UI remains compact.

## Card-Based Navigation
The settings are driven by visually appealing cards summarizing five configuration domains (Academic, Finance, Student, HR, System).
- Hover effects rely on CSS transitions modifying box-shadow elevation (`hover:shadow-md`).
- Each card incorporates an action-button or on-click handler (`@click`) triggering a state or screen adjustment to view the respective setup page.  
- The layout is managed efficiently with Tailwind grid utilities spanning `1` column on mobiles, `2` on tablets, and dynamically flowing up to `4` per row horizontally otherwise.
