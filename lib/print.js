const chalk = require('chalk');
const Q = require('q');
const readline = require('readline');
const sprintf = require('sprintf-js').sprintf;

function timestamp() {
  return chalk.dim('[' + new Date().toLocaleString() + ']');
}

function print(style, keepSpaces) {
  var message = sprintf.apply(null, Array.prototype.slice.call(arguments, 2));
  if (!keepSpaces) {
    message = message.replace(/\s+/g, ' ');
  }
  if (style) {
    message = style(message);
  }

  console.log(timestamp() + ' ' + message);
}

module.exports = {
  info: print.bind(undefined, null, false),
  h1: print.bind(undefined, chalk.bold.green, false),
  h2: print.bind(undefined, chalk.cyan, false),
  h3: print.bind(undefined, chalk.yellow, false),
  warn: print.bind(undefined, chalk.red, false),
  pre: print.bind(undefined, null, true),

  error: function() {
    console.log(chalk.bold.red(sprintf.apply(undefined, arguments)));
  },

  question: function(text) {
    var rl = readline.createInterface(process.stdin, process.stdout);
    var deferred = Q.defer();
    rl.question(chalk.green('?') + ' ' + text + ' ', (answer) => {
      rl.close();
      deferred.resolve(answer);
    });
    return deferred.promise;
  },
};
