import axios from 'axios';
import { createAsyncThunk, createSlice, createSelector } from '@reduxjs/toolkit';
import jsonpatch from 'json-patch';

const initialState = {
  loading: false,
  fullUpdateRequired: false,
  error: null,
  selectedId: null,
  games: {},
};

export const fetchGame = createAsyncThunk(
  'games/fetch',
  async ({id, start}) => {
    const diffParams = start ? `/diffPatch?startTimecode=${start}` : '';
    const url = `https://statsapi.mlb.com/api/v1.1/game/${id}/feed/live${diffParams}`;
    const response = await axios.get(url);
    return response.data;
  }
);

export const gamesSlice = createSlice({
  name: 'games',
  initialState,
  reducers: { 
    setSelectedId(state, action) {
      state.selectedId = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchGame.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchGame.fulfilled, (state, action) => {
      const id = state.selectedId;
      let game = state.games[id];
      let patchError = false;
      if (Array.isArray(action.payload)) {
        action.payload.forEach(obj => {
          if (patchError) {
            return;
          }
          try {
            jsonpatch.apply(game || {}, obj.diff);
          } catch (e) {
            patchError = true;
            return;
          }
        });
      } else {
        game = action.payload;
      }
      if (patchError) {
        state.fullUpdateRequired = true;
      } else {
        state.fullUpdateRequired = false;
        state.error = null;
        state.games[id] = game;
      }
      state.loading = false;
    });
    builder.addCase(fetchGame.rejected, (state, action) => {
      state.fullUpdateRequired = true;
      state.loading = false;
      state.error = action.error;
    });
  }
});

export const { setSelectedId } = gamesSlice.actions;

const gamesRoot = state => state.games;

export const selectLoading = createSelector(
  gamesRoot,
  root => root.loading
);

export const selectError = createSelector(
  gamesRoot,
  root => root.error
);

export const selectFullUpdateRequired = createSelector(
  gamesRoot,
  root => root.fullUpdateRequired
);

export const selectSelectedId = createSelector(
  gamesRoot,
  root => root.selectedId
);

export const selectGame = createSelector(
  [gamesRoot, selectSelectedId],
  (root, id) => root.games[id]
);

const selectLiveData = createSelector(
  selectGame,
  game => game.liveData
);

const selectPlays = createSelector(
  selectLiveData,
  data => data.plays
);

export const selectCurrentPlay = createSelector(
  selectPlays,
  plays => plays.currentPlay
);

export const selectAllPlays = createSelector(
  selectPlays,
  plays => plays.allPlays
);

export const selectBoxscore = createSelector(
  selectLiveData,
  data => data.boxscore?.teams
);

export const selectLineScore = createSelector(
  selectLiveData,
  data => data.linescore
);

export const selectDecisions = createSelector(
  selectLiveData,
  data => data.decisions
);

const selectGameData = createSelector(
  selectGame,
  game => game.gameData
);

export const selectGameStatus = createSelector(
  selectGameData,
  game => game.status
);

export const selectTeams = createSelector(
  selectGameData,
  gameData => gameData.teams
);

export const selectVenue = createSelector(
  selectGameData,
  gameData => gameData.venue
);

export const selectStartTime = createSelector(
  selectGameData,
  gameData => gameData.datetime?.dateTime
);

export const selectProbablePitchers = createSelector(
  selectGameData,
  gameData => gameData.probablePitchers
);

export default gamesSlice.reducer;
