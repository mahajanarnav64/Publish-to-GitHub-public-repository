import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Static mock data for now – replace with real API integration later.
// Class list with syllabus summary per subject
const mockClassesWithSyllabus = [
  {
    id: 1,
    className: "Class 10",
    section: "A",
    classTeacher: "Mr. Rajesh Kumar",
    students: 42,
    overallProgress: 65,
    updatedAt: "27 Aug, 2025",
    status: "Active",
    subjects: [
      {
        id: 101,
        name: "Mathematics",
        teacher: "Mr. Rajesh Kumar",
        progress: 43,
        chapters: 6,
        completed: "2/6",
        startDate: "15 Apr, 2024",
      },
      {
        id: 102,
        name: "Science",
        teacher: "Ms. Priya Sharma",
        progress: 47,
        chapters: 5,
        completed: "1/5",
        startDate: "18 Apr, 2024",
      },
      {
        id: 103,
        name: "English",
        teacher: "Mr. S.N. Gupta",
        progress: 85,
        chapters: 4,
        completed: "3/4",
        startDate: "12 Apr, 2024",
      },
    ],
  },
  {
    id: 2,
    className: "Class 9",
    section: "B",
    classTeacher: "Ms. Anjali Singh",
    students: 38,
    overallProgress: 40,
    updatedAt: "29 Aug, 2025",
    status: "Active",
    subjects: [
      {
        id: 201,
        name: "Mathematics",
        teacher: "Mr. Amit Verma",
        progress: 30,
        chapters: 8,
        completed: "1/8",
        startDate: "10 Apr, 2024",
      },
      {
        id: 202,
        name: "History",
        teacher: "Mr. Vikram Roy",
        progress: 50,
        chapters: 6,
        completed: "3/6",
        startDate: "20 Apr, 2024",
      },
    ],
  },
  {
    id: 3,
    className: "Class 12",
    section: "C",
    classTeacher: "Mr. Vikram Roy",
    students: 30,
    overallProgress: 15,
    updatedAt: "22 Aug, 2025",
    status: "Active",
    subjects: [
      {
        id: 301,
        name: "Physics",
        teacher: "Mr. S. Sharma",
        progress: 10,
        chapters: 12,
        completed: "1/12",
        startDate: "05 Apr, 2024",
      },
      {
        id: 302,
        name: "Chemistry",
        teacher: "Ms. L. Paul",
        progress: 20,
        chapters: 10,
        completed: "2/10",
        startDate: "08 Apr, 2024",
      },
    ],
  },
];

// Teacher chapter/ topic detail (used in detail view)
const mockTeacherChapters = [
  {
    id: 1,
    name: "Real Numbers",
    days: 5,
    actualDays: 7,
    startDate: "01 Mar 2026",
    endDate: "07 Mar 2026",
    isOnTime: false,
    onTimeStatus: "DELAYED",
    teacher: "Mr. Satish Sharma",
    status: "Completed",
    progress: 100,
    reason:
      "Delayed due to additional concept clarity sessions and lab work.",
    topics: [
      {
        id: 101,
        name: "Euclid’s Division Lemma",
        estimatedDays: 2,
        actualDays: 2,
        startDate: "01 Mar 2026",
        endDate: "02 Mar 2026",
        teacher: "Mr. Satish Sharma",
        status: "Completed",
        isOnTime: true,
        onTimeStatus: "ON TIME",
        reason: "",
      },
      {
        id: 102,
        name: "The Fundamental Theorem of Arithmetic",
        estimatedDays: 3,
        actualDays: 5,
        startDate: "03 Mar 2026",
        endDate: "07 Mar 2026",
        teacher: "Mr. Satish Sharma",
        status: "Completed",
        isOnTime: false,
        onTimeStatus: "DELAYED",
        reason: "Delayed by 2 days due to 2 days of Teacher Leave.",
      },
    ],
  },
  {
    id: 2,
    name: "Polynomials",
    days: 6,
    actualDays: 7,
    startDate: "08 Mar 2026",
    endDate: "14 Mar 2026",
    isOnTime: false,
    onTimeStatus: "DELAYED",
    teacher: "Mr. Satish Sharma",
    status: "Completed",
    progress: 100,
    reason: "Running slightly behind because Chapter 1 required revision.",
    topics: [
      {
        id: 201,
        name: "Geometrical Meaning of the Zeroes",
        estimatedDays: 4,
        actualDays: 5,
        startDate: "08 Mar 2026",
        endDate: "12 Mar 2026",
        teacher: "Mr. Satish Sharma",
        status: "Completed",
        isOnTime: false,
        onTimeStatus: "DELAYED",
        reason: "Extended by 1 day due to public holiday on 10 Mar 2026.",
      },
      {
        id: 202,
        name: "Relationship between Zeroes and Coefficients",
        estimatedDays: 2,
        actualDays: 2,
        startDate: "13 Mar 2026",
        endDate: "14 Mar 2026",
        teacher: "Mr. Satish Sharma",
        status: "Completed",
        isOnTime: true,
        onTimeStatus: "ON TIME",
        reason: "",
      },
    ],
  },
  {
    id: 3,
    name: "Pair of Linear Equations",
    days: 4,
    actualDays: 3,
    startDate: "15 Mar 2026",
    endDate: "17 Mar 2026",
    isOnTime: true,
    onTimeStatus: "EARLY",
    teacher: "Mr. Satish Sharma",
    status: "Completed",
    progress: 100,
    reason: "Completed 1 day early due to fast student pacing.",
    topics: [
      {
        id: 301,
        name: "Graphical Method of Solution",
        estimatedDays: 2,
        actualDays: 2,
        startDate: "15 Mar 2026",
        endDate: "16 Mar 2026",
        teacher: "Mr. Satish Sharma",
        status: "Completed",
        isOnTime: true,
        onTimeStatus: "ON TIME",
        reason: "",
      },
      {
        id: 302,
        name: "Algebraic Methods of Solving",
        estimatedDays: 2,
        actualDays: 1,
        startDate: "17 Mar 2026",
        endDate: "17 Mar 2026",
        teacher: "Mr. Satish Sharma",
        status: "Completed",
        isOnTime: true,
        onTimeStatus: "EARLY",
        reason: "Finished early.",
      },
    ],
  },
  {
    id: 4,
    name: "Quadratic Equations",
    days: 5,
    actualDays: null,
    startDate: "18 Mar 2026",
    endDate: "22 Mar 2026",
    isOnTime: true,
    onTimeStatus: "ON TIME",
    teacher: "Mr. Satish Sharma",
    status: "In Progress",
    progress: 40,
    reason: "",
    topics: [
      {
        id: 401,
        name: "Standard form of a quadratic equation",
        estimatedDays: 2,
        actualDays: 2,
        startDate: "18 Mar 2026",
        endDate: "19 Mar 2026",
        teacher: "Mr. Satish Sharma",
        status: "Completed",
        isOnTime: true,
        onTimeStatus: "ON TIME",
        reason: "",
      },
      {
        id: 402,
        name: "Solution of a quadratic equation by factorization",
        estimatedDays: 3,
        actualDays: null,
        startDate: "20 Mar 2026",
        endDate: "22 Mar 2026",
        teacher: "Mr. Satish Sharma",
        status: "In Progress",
        isOnTime: true,
        onTimeStatus: "ON TIME",
        reason: "",
      },
    ],
  }
];

export const fetchSyllabusClasses = createAsyncThunk(
  "syllabusPlanner/fetchSyllabusClasses",
  async (_, { rejectWithValue }) => {
    try {
      // Mocking async behavior for now
      return {
        classes: mockClassesWithSyllabus,
      };
    } catch (error) {
      return rejectWithValue("Failed to load syllabus classes");
    }
  },
);

export const fetchSyllabusDetail = createAsyncThunk(
  "syllabusPlanner/fetchSyllabusDetail",
  async (subjectId, { rejectWithValue }) => {
    try {
      // In future, filter based on subjectId; for now, return shared mock data
      return {
        subjectId,
        chapters: mockTeacherChapters,
      };
    } catch (error) {
      return rejectWithValue("Failed to load syllabus detail");
    }
  },
);

const syllabusPlannerSlice = createSlice({
  name: "syllabusPlanner",
  initialState: {
    classes: [],
    detailChapters: [],
    loadingList: false,
    loadingDetail: false,
    errorList: null,
    errorDetail: null,
  },
  reducers: {
    clearSyllabusDetail: (state) => {
      state.detailChapters = [];
      state.errorDetail = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Class list
      .addCase(fetchSyllabusClasses.pending, (state) => {
        state.loadingList = true;
        state.errorList = null;
      })
      .addCase(fetchSyllabusClasses.fulfilled, (state, action) => {
        state.classes = action.payload.classes || [];
        state.loadingList = false;
      })
      .addCase(fetchSyllabusClasses.rejected, (state, action) => {
        state.errorList = action.payload || action.error.message;
        state.loadingList = false;
      })
      // Detail view
      .addCase(fetchSyllabusDetail.pending, (state) => {
        state.loadingDetail = true;
        state.errorDetail = null;
      })
      .addCase(fetchSyllabusDetail.fulfilled, (state, action) => {
        state.detailChapters = action.payload.chapters || [];
        state.loadingDetail = false;
      })
      .addCase(fetchSyllabusDetail.rejected, (state, action) => {
        state.errorDetail = action.payload || action.error.message;
        state.loadingDetail = false;
      });
  },
});

export const { clearSyllabusDetail } = syllabusPlannerSlice.actions;

// Selectors
export const selectSyllabusClasses = (state) => state.syllabusPlanner.classes;
export const selectSyllabusListLoading = (state) =>
  state.syllabusPlanner.loadingList;
export const selectSyllabusListError = (state) =>
  state.syllabusPlanner.errorList;

export const selectSyllabusDetailChapters = (state) =>
  state.syllabusPlanner.detailChapters;
export const selectSyllabusDetailLoading = (state) =>
  state.syllabusPlanner.loadingDetail;
export const selectSyllabusDetailError = (state) =>
  state.syllabusPlanner.errorDetail;

export default syllabusPlannerSlice.reducer;

