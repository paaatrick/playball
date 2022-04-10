import { configureStore } from '@reduxjs/toolkit';

import schedule from '../features/schedule';
import games from '../features/games';
import keys from '../features/keys';

export default configureStore({
  reducer: {
    schedule,
    games,
    keys,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false
  })
});
