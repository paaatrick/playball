import reduxjsToolkit from '@reduxjs/toolkit';
const { configureStore } = reduxjsToolkit;

import schedule from '../features/schedule.js';
import games from '../features/games.js';
import keys from '../features/keys.js';
import standings from '../features/standings.js';

export default configureStore({
  reducer: {
    schedule,
    games,
    keys,
    standings,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false
  })
});
