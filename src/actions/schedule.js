import { createActions } from 'redux-actions';
import axios from 'axios';

import { REQUEST_SCHEDULE, RECIEVE_SCHEDULE } from './types';

const {
  requestSchedule,
  recieveSchedule
} = createActions({}, 
  REQUEST_SCHEDULE,
  RECIEVE_SCHEDULE
);

export const fetchSchedule = () => dispatch => {
  dispatch(requestSchedule());
  return axios.get('http://statsapi.mlb.com/api/v1/schedule?sportId=1&hydrate=team,linescore')
    .then(response => dispatch(recieveSchedule(response.data)))
    .catch(error => dispatch(recieveSchedule(new Error(error))));
};
