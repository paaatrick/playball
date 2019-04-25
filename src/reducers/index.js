import { combineReducers } from 'redux';

import game from './game';
import schedule from './schedule';

export default combineReducers({
  game,
  schedule,
});
