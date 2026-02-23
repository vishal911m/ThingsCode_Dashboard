import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import moment from 'moment';
import toast from 'react-hot-toast';

const BASE_URL = "https://thingscode-dashboard.onrender.com/api/v1"


interface JobsState {
  todayJobs: any[];
  monthlyJobs: any[];
  selectedDate: Date,
  loading: boolean;
}


const initialState: JobsState = {
  todayJobs: [],
  monthlyJobs: [],
  selectedDate: moment().startOf("day").toDate(),
  loading: false,
};

/* ================================
   FETCH TODAY JOBS (existing)
================================ */
export const fetchTodayJobs = createAsyncThunk(
  "jobs/fetchToday",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE_URL}/jobs/today`, {
        withCredentials: true,
      });
      return res.data;
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to fetch today's jobs"
      );
      return rejectWithValue("Failed");
    }
  }
);

/* ================================
   FETCH JOBS BY DATE (new)
================================ */
export const fetchJobsByDate = createAsyncThunk(
  "jobs/fetchByDate",
  async (date: Date, { rejectWithValue }) => {
    try {
      const formatted = moment(date).format("YYYY-MM-DD");

      const res = await axios.get(
        `${BASE_URL}/jobs/by-date?date=${formatted}`,
        { withCredentials: true }
      );

      return res.data;
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to fetch jobs"
      );
      return rejectWithValue("Failed");
    }
  }
);

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
    },

    addLiveJob: (state, action) => {
      const newJob = action.payload;

      const jobDate = moment(newJob.createdAt).startOf("day");
      const selected = moment(state.selectedDate).startOf("day");

      if (jobDate.isSame(selected)) {
        state.todayJobs.unshift(newJob);
    }
  },

    resetJobsState: (state) => {
      state.todayJobs = [];
      state.monthlyJobs = [];
      state.selectedDate = moment().startOf("day").toDate();
    },
  },

  extraReducers: (builder) => {
    builder

    /* ===== fetchTodayJobs ===== */
      .addCase(fetchTodayJobs.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchTodayJobs.fulfilled, (state, action) => {
        state.loading = false
        state.todayJobs = action.payload
      })
      .addCase(fetchTodayJobs.rejected, (state) => {
        state.loading = false;
      })

      /* ===== fetchJobsByDate ===== */
      .addCase(fetchJobsByDate.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchJobsByDate.fulfilled, (state, action) => {
        state.loading = false;
        state.todayJobs = action.payload;
      })
      .addCase(fetchJobsByDate.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const {
  setSelectedDate,
  addLiveJob,
  resetJobsState,
} = jobsSlice.actions;

export default jobsSlice.reducer
