import React from 'react';
import { render } from 'react-blessed';
import { Provider } from 'react-redux';
import raf from 'raf';

import screen from './screen';
import store from './store';
import log from './logger';

import App from './components/App';

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
