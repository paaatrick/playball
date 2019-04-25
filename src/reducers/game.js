import { handleActions } from 'redux-actions';
import { fromJS, Map } from 'immutable';

import { REQUEST_GAME, RECIEVE_GAME, SET_SELECTED_GAME } from '../actions/types';

const DEFAULT_STATE = fromJS({
  loading: false,
  error: null,
  selectedId: null,
  games: {},
});

const convertPath = path => (
  path
    .substring(1)
    .split('/')
    .map(p => {
      const asNum = parseInt(p, 10);
      if (!isNaN(asNum)) {
        return asNum;
      }
      return p;
    })
);

export default handleActions({
  [REQUEST_GAME]: state => state.set('loading', true),
  [RECIEVE_GAME]: {
    next: (state, action) => {
      let games = state.get('games');
      const selectedId = state.get('selectedId');
      let game = games.get(selectedId) || Map();
      if (Array.isArray(action.payload)) {
        game = game.withMutations(mutableData => {
          action.payload.forEach(obj => obj.diff.forEach(diff => {
            const path = convertPath(diff.path);
            switch (diff.op) {
            case 'replace':
            case 'add':
              mutableData.setIn(path, fromJS(diff.value));
              break;
              
            case 'remove':
              mutableData.deleteIn(path);
              break;
  
            case 'move': {
              const fromPath = convertPath(diff.from);
              const fromValue = game.getIn(fromPath);
              mutableData.setIn(path, fromValue);
              mutableData.deleteIn(fromPath);
              break;
            }}
          }));
        });
      } else {
        game = fromJS(action.payload);
      }
      games = games.set(selectedId, game);
      return state
        .set('loading', false)
        .set('error', null)
        .set('games', games);
    },
    throw: (state, action) => (
      state
        .set('loading', false)
        .set('error', action.payload)
    )
  },
  [SET_SELECTED_GAME]: (state, action) => state.set('selectedId', action.payload),
}, DEFAULT_STATE);
