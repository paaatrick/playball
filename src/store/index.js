import { configureStore } from '@reduxjs/toolkit'

import schedule from '../features/schedule'

export default configureStore({
  reducer: {
    schedule
  }
});
