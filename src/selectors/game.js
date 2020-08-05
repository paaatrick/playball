import { createSelector } from 'reselect';

const gameRoot = state => state.game;

export const selectLoading = createSelector(
  gameRoot,
  root => root.get('loading')
);

export const selectError = createSelector(
  gameRoot,
  root => root.get('error')
);

export const selectFullUpdateRequired = createSelector(
  gameRoot,
  root => root.get('fullUpdateRequired')
);

export const selectSelectedId = createSelector(
  gameRoot,
  root => root.get('selectedId')
);

export const selectGame = createSelector(
  [gameRoot, selectSelectedId],
  (root, id) => root.getIn(['games', id])
);

const selectLiveData = createSelector(
  selectGame,
  game => game.get('liveData')
);

const selectPlays = createSelector(
  selectLiveData,
  data => data.get('plays')
);

export const selectCurrentPlay = createSelector(
  selectPlays,
  plays => plays.get('currentPlay')
);

export const selectAllPlays = createSelector(
  selectPlays,
  plays => plays.get('allPlays')
);

export const selectBoxscore = createSelector(
  selectLiveData,
  data => data.getIn(['boxscore', 'teams'])
);

export const selectLineScore = createSelector(
  selectLiveData,
  data => data.get('linescore')
);

export const selectDecisions = createSelector(
  selectLiveData,
  data => data.get('decisions')
);

const selectGameData = createSelector(
  selectGame,
  game => game.get('gameData')
);

export const selectTeams = createSelector(
  selectGameData,
  gameData => gameData.get('teams')
);

export const selectVenue = createSelector(
  selectGameData,
  gameData => gameData.get('venue')
);

export const selectStartTime = createSelector(
  selectGameData,
  gameData => gameData.getIn(['datetime', 'dateTime'])
);

export const selectProbablePitchers = createSelector(
  selectGameData,
  gameData => gameData.get('probablePitchers')
);