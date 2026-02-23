import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import toast from 'react-hot-toast'

const BASE_URL = "https://thingscode-dashboard.onrender.com/api/v1"

/* =====================================================
   THUNKS
===================================================== */

// FETCH
export const fetchMachines = createAsyncThunk(
  "machines/fetchMachines",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE_URL}/tasks/machines`, {
        withCredentials: true,
      });
      return res.data;
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to fetch machines"
      );
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

// CREATE
export const createMachine = createAsyncThunk(
  "machines/createMachine",
  async (machineData: any, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/tasks/machines`,
        machineData,
        { withCredentials: true }
      );

      toast.success("Machine created successfully");

      return res.data;
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to create machine"
      );
      return rejectWithValue(
        err.response?.data?.message || "Create failed"
      );
    }
  }
);

// UPDATE
export const updateMachine = createAsyncThunk(
  "machines/updateMachine",
  async (
    { id, updatedData }: { id: string; updatedData: any },
    { rejectWithValue }
  ) => {
    try {
      const res = await axios.put(
        `${BASE_URL}/tasks/machines/${id}`,
        updatedData,
        { withCredentials: true }
      );

      toast.success("Updated successfully");

      return res.data;
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to update machine"
      );
      return rejectWithValue(
        err.response?.data?.message || "Update failed"
      );
    }
  }
);

// DELETE
export const deleteMachine = createAsyncThunk(
  "machines/deleteMachine",
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`${BASE_URL}/tasks/machines/${id}`, {
        withCredentials: true,
      });

      toast.success("Machine deleted successfully");
      return id;
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to delete machine"
      );
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

/* =====================================================
   SLICE
===================================================== */

interface MachinesState {
  machines: any[];
  activeMachine: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: MachinesState = {
  machines: [],
  activeMachine: null,
  loading: false,
  error: null,
};

const machinesSlice = createSlice({
  name: 'machines',
  initialState,
  reducers: {
    setActiveMachine: (state, action) => {
      state.activeMachine = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      /* ======================
         FETCH
      ====================== */
      .addCase(fetchMachines.pending, (state) => {
        state.loading = true
        state.error = null;
      })
      .addCase(fetchMachines.fulfilled, (state, action) => {
        state.loading = false
        state.machines = action.payload
      })
      .addCase(fetchMachines.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ======================
      // CREATE
      // ======================
      .addCase(createMachine.pending, (state) => {
        state.loading = true;
      })
      .addCase(createMachine.fulfilled, (state, action) => {
        state.loading = false;
        state.machines.push(action.payload);
      })
      .addCase(createMachine.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ======================
      // UPDATE
      // ======================
      .addCase(updateMachine.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateMachine.fulfilled, (state, action) => {
        state.loading = false;

        const index = state.machines.findIndex(
          (m) => m._id === action.payload._id
        );

        if (index !== -1) {
          state.machines[index] = action.payload;
        }
      })
      .addCase(updateMachine.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* ======================
         DELETE
      ====================== */
      .addCase(deleteMachine.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteMachine.fulfilled, (state, action) => {
        state.loading = false;

        state.machines = state.machines.filter(
          (machine: any) => machine._id !== action.payload
        );
      })
      .addCase(deleteMachine.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
})

export const { setActiveMachine } = machinesSlice.actions
export default machinesSlice.reducer
