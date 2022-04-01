import { configureStore } from '@reduxjs/toolkit'

import schedule from '../features/schedule'
import games from '../features/games'

export default configureStore({
  reducer: {
    schedule,
    games
  }
});
