# Frontend Documentation - Education ERP

## Overview
This directory contains detailed specifications, UI/UX designs, and component logic for the React-based frontend application. The design philosophy prioritizes a "Premium & Dynamic" aesthetic with strict grid layouts.

## 🛠 Tech Stack
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (with custom design tokens for the premium look)
- **State Management**: React Context / Redux Toolkit (for global filters)
- **Data Fetching**: Axios / SWR (for caching dashboard metrics)
- **Charts**: Chart.js or Recharts

## 📂 Documentation Modules

### 1. [Dashboard](./01-dashboard.md)
The central command center of the ERP.
- **Layout**: 5 Vertical Sections (Financial, Admissions, Academic, Engagement, Risks).
- **Features**: Global Sticky Header (Date/Branch filters), Interactive Charts.
- **Key Requirement**: Strict 4-column grid for KPIs.
- **Teacher Dashboard**:
  - **Layout**: Vertical Widget Feed (KPIs, Timetable, Tasks).
  - **Features**: Class-wise Syllabus Progress, Tasks To Do.

### 2. [Sidebar Navigation](./02-sidebar-navigation.md)
The primary navigation structure.
- **Modules**: 13 Main Modules (Admin, Admissions, Finance, etc.).
- **Behavior**: Collapsible Accordion, Role-Based Visibility.

### 3. [Portal Architecture](./shared/portal_switcher.md)
Guidelines for the dual-portal system.
- **Admin Portal**: 5-section command center.
- **Teacher Portal**: Widget-based execution feed.
- **Portal Switcher**: Header component for quick context switching.

## 🎨 Design Guidelines
- **Color Palette**: Deep Blues (Primary), Vibrant Gradients (Accents), Clean Whites/Grays (Backgrounds).
- **Typography**: Inter / Roboto (Modern Sans-serif).
- **Spacing**: Consistent 8px/16px/24px grid system.
