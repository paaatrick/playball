import React from 'react';
import { render } from 'react-blessed';
import { Provider } from 'react-redux';
import raf from 'raf';

import screen from './screen.js';
import store from './store/index.js';
import log from './logger.js';

import App from './components/App.js';

raf.polyfill();

process.on('uncaughtException', function(error) {
  log.error('UNCAUGHT EXCEPTION\n' + JSON.stringify(error) + '\n' + error.stack);
});

render(
  <Provider store={store}>
    <App />
  </Provider>, 
  screen
);
