# Academic Settings Frontend Architecture

## Overview
This directory contains frontend specifications for the Academic Settings module.

## UI Architecture
- Rendered conditionally in `frontend/index.html` based on `currentModule === 'settings'` and corresponding `activeTab`.
- **Academic Settings Home Page** displays cards for each master configuration module.
- Clicking a card updates `activeTab` to render the specific module section within `index.html` avoiding full page reloads.

## Module Navigation
- **State Management**: Uses Alpine.js `activeTab` state for navigation inside `index.html`.
- `activeTab === 'academic'`: Shows Academic Settings Home Page.
- `activeTab === 'academic_session'`: Shows Academic Session Page.
- `activeTab === 'class_master'`: Shows Class Master Page.
- `activeTab === 'stream_master'`: Shows Stream Master Page.
- `activeTab === 'section_master'`: Shows Section Master Page.
- `activeTab === 'subject_master'`: Shows Subject Master Page.
- `activeTab === 'teacher_allocation'`: Shows Teacher Allocation Page.

## Authorization
Restricted to Admin and Super Admin. Teachers are explicitly prevented from viewing settings via UI conditional checks (`x-show="userRole !== 'teacher'"`).
