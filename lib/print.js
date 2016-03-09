var chalk = require('chalk');
var Q = require('q');
var readline = require('readline');
var sprintf = require('sprintf-js').sprintf;

function timestamp() {
  return chalk.dim('[' + new Date().toLocaleString() + ']');
}

function print(style) {
  var message = sprintf.apply(null, Array.prototype.slice.call(arguments, 1));
  if (style) {
    message = style(message);
  }

  console.log(timestamp() + ' ' + message);
}

module.exports = {
  info: print.bind(null, null),
  h1: print.bind(null, chalk.bold.green),
  h2: print.bind(null, chalk.cyan),
  h3: print.bind(null, chalk.yellow),
  warn: print.bind(null, chalk.red),

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
