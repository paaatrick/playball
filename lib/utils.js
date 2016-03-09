var sprintf = require('sprintf-js').sprintf;

module.exports = {
  ordinal: ordinal,
  ensureArray: ensureArray,
};

function ordinal(num) {
  var rem = num % 10;

  if (rem === 1 && num !== 11) {
    return num + 'st';
  }

  if (rem === 2 && num !== 12) {
    return num + 'nd';
  }

  if (rem === 3 && num !== 13) {
    return num + 'rd';
  }

  return num + 'th';
}

function ensureArray(object, field) {
  if (!(object[field] instanceof Array)) {
    object[field] = [object[field]];
  }
}
