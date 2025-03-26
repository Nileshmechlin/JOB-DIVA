import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { linkedInAPI } from '../../services/api';
import { JobState, JobFormData} from '../../types/job.types';

const initialState: JobState = {
  loading: false,
  error: null,
  success: false,
  linkedInStatus: {
    isConnected: false,
    linkedInId: null,
    name: null
  }
};

export const postJob = createAsyncThunk(
  'jobs/postJob',
  async (jobData: JobFormData) => {
    const response = await linkedInAPI.postJob(jobData);
    return response.data;
  }
);

export const getLinkedInStatus = createAsyncThunk(
  'jobs/getLinkedInStatus',
  async () => {
    const response = await linkedInAPI.getStatus();
    return response.data;
  }
);

export const connectLinkedIn = createAsyncThunk(
  'jobs/connectLinkedIn',
  async () => {
    const response = await linkedInAPI.connect();
    return response.data;
  }
);

const jobSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    resetJobState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Post job cases
      .addCase(postJob.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(postJob.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(postJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to post job';
      })
      // LinkedIn status cases
      .addCase(getLinkedInStatus.fulfilled, (state, action) => {
        state.linkedInStatus = action.payload;
      })
      .addCase(getLinkedInStatus.rejected, (state) => {
        state.linkedInStatus = {
          isConnected: false,
          linkedInId: null,
          name: null
        };
      });
  }
});

export const { resetJobState } = jobSlice.actions;
export default jobSlice.reducer;