import { handleActions } from 'redux-actions';
import { fromJS, Map } from 'immutable';
import jsonpatch from 'json-patch';

import { REQUEST_GAME, RECIEVE_GAME, SET_SELECTED_GAME } from '../actions/types';

const DEFAULT_STATE = fromJS({
  loading: false,
  fullUpdateRequired: false,
  error: null,
  selectedId: null,
  games: {},
});

export default handleActions({
  [REQUEST_GAME]: state => state.set('loading', true),
  [RECIEVE_GAME]: {
    next: (state, action) => {
      let games = state.get('games');
      const selectedId = state.get('selectedId');
      let game = (games.get(selectedId) || Map()).toJS();
      let patchError = false;
      if (Array.isArray(action.payload)) {
        action.payload.forEach(obj => {
          if (patchError) {
            return;
          }
          try {
            jsonpatch.apply(game, obj.diff);
          } catch (e) {
            patchError = true;
            return;
          }
        });
      } else {
        game = action.payload;
      }
      if (patchError) {
        return state.set('fullUpdateRequired', true);
      }
      games = games.set(selectedId, fromJS(game));
      return state
        .set('loading', false)
        .set('fullUpdateRequired', false)
        .set('error', null)
        .set('games', games);
    },
    throw: (state, action) => (
      state
        .set('loading', false)
        .set('fullUpdateRequired', true)
        .set('error', action.payload)
    )
  },
  [SET_SELECTED_GAME]: (state, action) => state.set('selectedId', action.payload),
}, DEFAULT_STATE);
