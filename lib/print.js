var chalk = require('chalk');
var Q = require('q');
var readline = require('readline');
var sprintf = require('sprintf-js').sprintf;

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
  info: print.bind(null, null, false),
  h1: print.bind(null, chalk.bold.green, false),
  h2: print.bind(null, chalk.cyan, false),
  h3: print.bind(null, chalk.yellow, false),
  warn: print.bind(null, chalk.red, false),
  pre: print.bind(null, null, true),

  error: function() {
    console.log(chalk.bold.red(sprintf.apply(null, arguments)));
  },

  question: function(text) {
    var rl = readline.createInterface(process.stdin, process.stdout);
    var deferred = Q.defer();
    rl.question(chalk.green('?') + ' ' + text + ' ', function(answer) {
      rl.close();
      deferred.resolve(answer);
    });
    return deferred.promise;
  },
};
