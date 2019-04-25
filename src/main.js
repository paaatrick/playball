import React from 'react';
import blessed from 'blessed';
import { render } from 'react-blessed';
import { Provider } from 'react-redux';

import store from './store';
import './logger';

import App from './components/App';

const screen = blessed.screen({
  autoPadding: true,
  debug: true,
  smartCSR: true,
  title: 'Playball!'
});

screen.key(['escape', 'q', 'C-c'], () => {
  return process.exit(0);
});

render(
  <Provider store={store}>
    <App 
      debug={(message) => screen.debug(message)}
      onKeyPress={(keys, handler) => screen.key(keys, handler)}
    />
  </Provider>, 
  screen
);
