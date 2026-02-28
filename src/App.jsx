import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SyllabusPlanner from "./pages/home/admin-home/academics/syllabus-planner";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/academics/syllabus-planner" replace />} />
      <Route path="/admin/academics/syllabus-planner" element={<SyllabusPlanner />} />
    </Routes>
  );
};

export default App;
