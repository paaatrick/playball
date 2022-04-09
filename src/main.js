import React from 'react';
import { render } from 'react-blessed';
import { Provider } from 'react-redux';
import raf from 'raf';

import screen from './screen';
import store from './store';

import App from './components/App';

raf.polyfill();

process.on('uncaughtException', function(error) {
  console.error(error);
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
