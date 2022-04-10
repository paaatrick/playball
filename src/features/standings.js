import axios from 'axios';
import { createAsyncThunk, createSlice, createSelector } from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  error: null,
  data: null,
};

const SEASON = new Date().getFullYear();

export const fetchStandings = createAsyncThunk(
  'standings/fetch',
  async () => {
    const url = `https://statsapi.mlb.com/api/v1/standings?leagueId=103,104&season=${SEASON}&standingsTypes=regularSeason&hydrate=division,team`;
    const response = await axios.get(url);
    return response.data;
  }
);
  
export const standingsSlice = createSlice({
  name: 'standings',
  initialState,
  reducers: { },
  extraReducers: (builder) => {
    builder.addCase(fetchStandings.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchStandings.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
      state.error = null;
    });
    builder.addCase(fetchStandings.rejected, (state, action) => {
      state.loading = false;
      state.data = null;
      state.error = action.error;
    });
  }
});
  
const standingsSelector = state => state.standings;
  
export const selectLoading = createSelector(
  standingsSelector,
  standings => standings.loading
);
    
export const selectError = createSelector(
  standingsSelector,
  standings => standings.error
);
      
export const selectData = createSelector(
  standingsSelector,
  standings => standings.data
);
       
export default standingsSlice.reducer;
        