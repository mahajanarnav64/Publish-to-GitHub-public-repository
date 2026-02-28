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
      },
      {
        id: 102,
        name: "Science",
        teacher: "Ms. Priya Sharma",
        progress: 47,
        chapters: 5,
        completed: "1/5",
      },
      {
        id: 103,
        name: "English",
        teacher: "Mr. S.N. Gupta",
        progress: 85,
        chapters: 4,
        completed: "3/4",
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
      },
      {
        id: 202,
        name: "History",
        teacher: "Mr. Vikram Roy",
        progress: 50,
        chapters: 6,
        completed: "3/6",
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
      },
      {
        id: 302,
        name: "Chemistry",
        teacher: "Ms. L. Paul",
        progress: 20,
        chapters: 10,
        completed: "2/10",
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
    status: "Completed",
    progress: 100,
    reason:
      "Completed earlier than planned as students were already familiar with the basics.",
    topics: [
      {
        id: 101,
        name: "Euclid’s Division Lemma",
        status: "Completed",
        isOnTime: false,
        reason: "Topic finished 1 day late due to extra doubt sessions.",
      },
      {
        id: 102,
        name: "The Fundamental Theorem of Arithmetic",
        status: "Completed",
        isOnTime: true,
        reason: "",
      },
    ],
  },
  {
    id: 2,
    name: "Polynomials",
    days: 6,
    status: "In Progress",
    progress: 50,
    reason: "Running slightly behind because Chapter 1 required revision.",
    topics: [
      {
        id: 201,
        name: "Geometrical Meaning of the Zeroes",
        status: "Completed",
        isOnTime: true,
        reason: "Completed exactly on the planned date.",
      },
      {
        id: 202,
        name: "Relationship between Zeroes and Coefficients",
        status: "Pending",
        isOnTime: true,
        reason: "",
      },
    ],
  },
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

