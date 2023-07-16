/* eslint no-console: 0 */
import { Command } from 'commander';

import * as config from './config.js';
import main from './main.js';
import pkg from './package.js';

const program = new Command();

program
  .name(pkg.name)
  .description(pkg.description)
  .version(pkg.version)
  .action(main);

program.command('config')
  .description('Set or get configration values')
  .argument('[key]')
  .argument('[value]')
  .option('--list', 'List all configuration value')
  .option('--unset', 'Unset configuration value')
  .action((key, value, options) => {
    if (options.list) {
      for (const [key, value] of Object.entries(config.getAll())) {
        console.log(`${key} = ${value}`);
      }
      return;
    }
    if (options.unset) {
      config.unset(key);
      return;
    }
    if (!key) {
      return;
    }
    if (!value) {
      console.log(config.get(key));
    } else {
      config.set(key, value);
    }
  });


program.parse();
