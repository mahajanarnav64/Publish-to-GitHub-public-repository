import { combineReducers } from "@reduxjs/toolkit";
import syllabusPlannerReducer from "./syllabus-planner-slice";

const rootReducer = combineReducers({
  syllabusPlanner: syllabusPlannerReducer,
});

export default rootReducer;

