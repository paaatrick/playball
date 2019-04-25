import { createActions } from 'redux-actions';
import axios from 'axios';

import { REQUEST_GAME, RECIEVE_GAME, SET_SELECTED_GAME } from './types';

const {
  requestGame,
  recieveGame,
  setSelectedGame
} = createActions({}, 
  REQUEST_GAME,
  RECIEVE_GAME,
  SET_SELECTED_GAME
);

export const fetchGame = (id, startTimecode) => dispatch => {
  const diffParams = startTimecode ? `/diffPatch?startTimecode=${startTimecode}` : '';
  const url = `https://statsapi.mlb.com/api/v1.1/game/${id}/feed/live${diffParams}`;
  dispatch(requestGame());
  return axios.get(url)
    .then(response => dispatch(recieveGame(response.data)))
    .catch(error => dispatch(recieveGame(new Error(error))));
};

export { setSelectedGame };
