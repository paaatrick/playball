import React from 'react';
import blessed from 'blessed';
import { render } from 'react-blessed';
import { Provider } from 'react-redux';
import raf from 'raf';

import store from './store';
import log from './logger';

import App from './components/App';

raf.polyfill();

const screen = blessed.screen({
  autoPadding: true,
  debug: true,
  smartCSR: true,
  title: 'Playball!',
  handleUncaughtExceptions: false,
});

screen.key(['escape', 'q', 'C-c'], () => {
  return process.exit(0);
});

process.on('uncaughtException', function(error) {
  log.error(error);
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
