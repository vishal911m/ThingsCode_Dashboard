import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import moment from 'moment';
import toast from 'react-hot-toast';

const BASE_URL = "https://thingscode-dashboard.onrender.com/api/v1"

interface JobsState {
  todayJobs: any[];
  monthlyJobs: any[];
  selectedDate: Date;
  loading: boolean;
  isSimulating: boolean; // Track simulation state
}

const today = new Date();

const initialState: JobsState = {
  todayJobs: [],
  monthlyJobs: [],
  selectedDate: new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  ),
  loading: false,
  isSimulating: false,
};

// Helper function to format date consistently
const formatDateForAPI = (date: Date): string => {
  return moment(date).format('YYYY-MM-DD');
};

/* ================================
   FETCH JOBS BY DATE (with simulation check)
================================ */
export const fetchJobsByDate = createAsyncThunk(
  "jobs/fetchByDate",
  async (date: Date, { dispatch, getState, rejectWithValue }) => {
    try {
      const formattedDate = formatDateForAPI(date);
      const state = getState() as { jobs: JobsState };
      
      // Prevent multiple simultaneous simulations
      if (state.jobs.isSimulating) {
        console.log('⏳ Simulation already in progress, skipping...');
        return [];
      }
      
      const res = await axios.get(
        `${BASE_URL}/jobs/by-date?date=${formattedDate}`,
        { withCredentials: true }
      );

      const jobs = res.data;

      // Check if all job counts are zero
      const totalProduction = jobs.reduce((sum: number, job: any) => sum + (job.jobCount || 0), 0);
      
      if (totalProduction === 0 && !state.jobs.isSimulating) {
        console.log(`🟡 No jobs found for ${formattedDate} — simulating...`);
        
        // Set simulating flag to true
        dispatch(setSimulating(true));
        
        try {
          // Simulate jobs for this date
          await dispatch(simulateJobsForDate(formattedDate)).unwrap();
          
          // Refetch after simulation
          const newRes = await axios.get(
            `${BASE_URL}/jobs/by-date?date=${formattedDate}`,
            { withCredentials: true }
          );
          
          dispatch(setSimulating(false));
          return newRes.data;
        } catch (error) {
          dispatch(setSimulating(false));
          throw error;
        }
      }

      return jobs;
    } catch (err: any) {
      dispatch(setSimulating(false));
      toast.error(err.response?.data?.message || "Failed to fetch jobs");
      return rejectWithValue("Failed");
    }
  },
  {
    condition: (date, { getState }) => {
      const state = getState() as { jobs: JobsState };
      // Don't fetch if already simulating
      return !state.jobs.isSimulating;
    }
  }
);

/* ================================
   SIMULATE JOBS FOR DATE
================================ */
export const simulateJobsForDate = createAsyncThunk(
  "jobs/simulate",
  async (date: string, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/simulate/today`,
        { date },
        { withCredentials: true }
      );

      toast.success(`Fetched jobs for ${date}`);
      return res.data;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to simulate jobs");
      return rejectWithValue("Failed");
    }
  }
);

/* ================================
   FETCH JOBS BY MONTH
================================ */
export const fetchJobsByMonth = createAsyncThunk(
  "jobs/fetchByMonth",
  async ({ year, month }: { year: number; month: number }, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/jobs/by-month?year=${year}&month=${month}`,
        { withCredentials: true }
      );
      return res.data;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch jobs for month");
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

    setSimulating: (state, action) => {
      state.isSimulating = action.payload;
    },

    addLiveJob: (state, action) => {
      const newJob = action.payload;
      const jobDate = moment(newJob.createdAt).startOf("day");
      const selected = moment(state.selectedDate).startOf("day");

      if (jobDate.isSame(selected)) {
        // Check if job already exists to avoid duplicates
        const exists = state.todayJobs.some(job => job._id === newJob._id);
        if (!exists) {
          state.todayJobs = [newJob, ...state.todayJobs];
        }
      }
    },

    resetJobsState: (state) => {
      state.todayJobs = [];
      state.monthlyJobs = [];
      state.selectedDate = new Date();
      state.isSimulating = false;
    },

    setMonthlyJobs: (state, action) => {
      state.monthlyJobs = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      /* ===== fetchJobsByDate ===== */
      .addCase(fetchJobsByDate.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchJobsByDate.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.todayJobs = action.payload;
        }
      })
      .addCase(fetchJobsByDate.rejected, (state) => {
        state.loading = false;
        state.isSimulating = false;
      })

      /* ===== fetchJobsByMonth ===== */
      .addCase(fetchJobsByMonth.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchJobsByMonth.fulfilled, (state, action) => {
        state.loading = false;
        state.monthlyJobs = action.payload;
      })
      .addCase(fetchJobsByMonth.rejected, (state) => {
        state.loading = false;
      })

      /* ===== simulateJobsForDate ===== */
      .addCase(simulateJobsForDate.pending, (state) => {
        state.loading = true;
      })
      .addCase(simulateJobsForDate.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(simulateJobsForDate.rejected, (state) => {
        state.loading = false;
        state.isSimulating = false;
      });
  },
});

export const {
  setSelectedDate,
  addLiveJob,
  resetJobsState,
  setMonthlyJobs,
  setSimulating,
} = jobsSlice.actions;

export default jobsSlice.reducer;