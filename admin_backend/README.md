# Backend Documentation - Education ERP

## Overview
This directory contains detailed API specifications, database schemas, and business logic for the Node.js backend. The API is designed to be highly modular, performant, and secure.

## 🛠 Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Primary for flexible data), Redis (Caching critical KPIs)
- **Authentication**: JWT (JSON Web Tokens) with Role-Based Access Control (RBAC)

## 📂 Documentation Modules

### 1. [Dashboard API](./01-dashboard.md)
Provides aggregated endpoints for the 5-section dashboard.
- **Key Feature**: Global Filter Context (Date, Branch, Session).
- **Core Endpoints**: 
    - `/api/dashboard/financial-health`
    - `/api/dashboard/admissions`
    - `/api/dashboard/academic`
    - `/api/dashboard/engagement`
    - `/api/dashboard/teacher` (Teacher-specific widgets)

### 2. [Sidebar API](./02-sidebar-navigation.md)
Provides user-specific navigation structure.
- **Key Feature**: Dynamic RBAC (Role-Based Access Control).
- **Core Endpoints**:

### 3. [Teacher Dashboard Backend](./teacher_dashboard.md)
Provides specific logic for the Teacher's operational dashboard.
- **Key Feature**: Daily Task Aggregation & Schedule Management.
- **Core Endpoints**:
    - `/api/dashboard/teacher`
    - `/api/navigation/sidebar` (Returns authorized menu tree)

### 4. [Portal Management Backend](./shared/portal_switcher.md)
Guidelines for handling multiple portal contexts.
- **Key Feature**: Session Portal Context Management.
- **Core Endpoint**: `/api/portal/switch` (Validates and updates active portal).

## 🔒 Security
- **Role-Based Access**: Middleware to ensure only authorized roles (e.g., Admin, Principal) can access sensitive dashboard data.
- **Input Validation**: Joi/Zod validation for all query parameters.

## ⚡ Performance
- **Caching**: Critical KPI endpoints (like Total Students/Staff) use Redis to reduce database load.
- **Indexing**: Database fields used in filtering (`branchId`, `academicSessionId`, `status`) must be indexed.
