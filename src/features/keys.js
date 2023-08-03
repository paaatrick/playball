import reduxjsToolkit from '@reduxjs/toolkit';
const { createSlice } = reduxjsToolkit;
import screen from '../screen.js';

export const keysSlice = createSlice({
  name: 'keys',
  initialState: [{ key: 'Q', label: 'Quit' }],
  reducers: {
    addKeyListener: {
      reducer: (state, action) => {
        if (action.payload) {
          state.push(action.payload);
        }
      },
      prepare: (key, listener, help) => {
        screen().key(key, listener);
        return { payload: help };
      }
    },
    removeKeyListener: {
      reducer: (state, action) => {
        if (action.payload) {
          const idx = state.findIndex(item => item.key === action.payload.key);
          if (idx >= 0) {
            state.splice(idx, 1);
          }
        }
      },
      prepare: (key, listener, help) => {
        screen().unkey(key, listener);
        return { payload: help };
      }
    }
  }
});

export const { addKeyListener, removeKeyListener } = keysSlice.actions;

export default keysSlice.reducer;
