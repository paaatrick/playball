import axios from 'axios'
import { createAsyncThunk, createSlice, createSelector } from '@reduxjs/toolkit'

const initialState = {
  loading: false,
  error: null,
  data: null,
}

const date = new Date().toLocaleDateString();

export const fetchSchedule = createAsyncThunk(
  'schedule/fetch',
  async () => {
    const response = await axios.get(`http://statsapi.mlb.com/api/v1/schedule?sportId=1&hydrate=team,linescore&startDate=${date}&endDate=${date}`)
    return response.data
  }
)

export const scheduleSlice = createSlice({
  name: 'schedule',
  initialState,
  reducers: { },
  extraReducers: (builder) => {
    builder.addCase(fetchSchedule.pending, (state) => {
      state.loading = true
    })
    builder.addCase(fetchSchedule.fulfilled, (state, action) => {
      state.loading = false
      state.data = action.payload
      state.error = null
    })
    builder.addCase(fetchSchedule.rejected, (state, action) => {
      state.loading = false
      state.data = null
      state.error = action.error
    })
  }
})

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


export default scheduleSlice.reducer
