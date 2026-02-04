import React from 'react';
import { Provider } from 'react-redux';
import raf from 'raf';

import screen from './screen.js';
import store from './store/index.js';
import log from './logger.js';

import App from './components/App.js';

export default async function startInterface(options) {
  raf.polyfill();

  process.on('uncaughtException', function(error) {
    log.error('UNCAUGHT EXCEPTION\n' + JSON.stringify(error) + '\n' + error.stack);
  });

  // Must be imported dynamically because the import seems to have
  // side effects that block other CLI commands from exiting
  const reactBlessed = await import('react-blessed');
  reactBlessed.render(
    <Provider store={store}>
      <App replayId={options.replay} />
    </Provider>, 
    screen()
  );
}
