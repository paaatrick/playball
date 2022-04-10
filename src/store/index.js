import { configureStore } from '@reduxjs/toolkit';

import schedule from '../features/schedule';
import games from '../features/games';
import keys from '../features/keys';
import standings from '../features/standings';

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
