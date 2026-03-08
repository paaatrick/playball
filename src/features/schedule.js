import axios from 'axios';
import reduxjsToolkit from '@reduxjs/toolkit';
const { createAsyncThunk, createSlice, createSelector } = reduxjsToolkit;
import {add, format} from 'date-fns';
import { getSportId } from '../utils.js';

const initialState = {
  scheduleDate: new Date(),
  loading: false,
  error: null,
  data: null,
};

export const fetchSchedule = createAsyncThunk(
  'schedule/fetch',
  async (date) => {
    const dateStr = format(date, 'MM/dd/yyyy');
    const sportId = getSportId();
    const response = await axios.get(`http://statsapi.mlb.com/api/v1/schedule?sportId=${sportId}&hydrate=team,linescore&date=${dateStr}`);
    return response.data;
  }
);

export const scheduleSlice = createSlice({
  name: 'schedule',
  initialState,
  reducers: {
    nextDay(state) {
      state.scheduleDate = add(state.scheduleDate, { days: 1 });
    },
    prevDay(state) {
      state.scheduleDate = add(state.scheduleDate, { days: -1 });
    },
    setDate(state, action) {
      state.scheduleDate = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchSchedule.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchSchedule.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
      state.error = null;
    });
    builder.addCase(fetchSchedule.rejected, (state, action) => {
      state.loading = false;
      state.data = null;
      state.error = action.error;
    });
  }
});

const scheduleSelector = state => state.schedule;

export const selectLoading = createSelector(
  scheduleSelector,
  schedule => schedule.loading
);

export const selectError = createSelector(
  scheduleSelector,
  schedule => schedule.error
);

export const selectData = createSelector(
  scheduleSelector,
  schedule => schedule.data
);

export const selectScheduleDate = createSelector(
  scheduleSelector,
  schedule => schedule.scheduleDate
);

export const { nextDay, prevDay, setDate } = scheduleSlice.actions;

export default scheduleSlice.reducer;
