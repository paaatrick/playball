import { handleActions } from 'redux-actions';
import { fromJS } from 'immutable';

import { REQUEST_SCHEDULE, RECIEVE_SCHEDULE } from '../actions/types';

const DEFAULT_STATE = fromJS({
  loading: false,
  error: null,
  data: null,
});

export default handleActions({
  [REQUEST_SCHEDULE]: state => state.set('loading', true),
  [RECIEVE_SCHEDULE]: {
    next: (state, action) => {
      return state
        .set('loading', false)
        .set('error', null)
        .set('data', action.payload);
    },
    throw: (state, action) => (
      state
        .set('loading', false)
        .set('error', action.payload)
        .set('data', null)
    )
  }
}, DEFAULT_STATE);
