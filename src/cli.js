/* eslint no-console: 0 */
import { Command } from 'commander';
import updateNotifier from 'update-notifier';

import * as config from './config.js';
import main from './main.js';
import pkg from './package.js';

const program = new Command();
const notifier = updateNotifier({
  pkg, 
  updateCheckInterval: 1000 * 60 * 60 * 24 * 7  // 1 week
});

program
  .name(pkg.name)
  .description(pkg.description)
  .version(pkg.version)
  .action(main)
  .hook('postAction', () => notifier.notify({
    isGlobal: true,
  }));

program.command('config')
  .description('Set or get configration values')
  .argument('[key]')
  .argument('[value]')
  .option('--unset', 'Unset configuration value')
  .action((key, value, options) => {
    if (options.unset) {
      config.unset(key);
      return;
    }
    if (!key) {
      for (const [key, value] of Object.entries(config.getAll())) {
        console.log(`${key} = ${value}`);
      }
    } else if (!value) {
      console.log(config.get(key));
    } else {
      config.set(key, value);
    }
  });


program.parse();
