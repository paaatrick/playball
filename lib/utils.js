var sprintf = require('sprintf-js').sprintf;

module.exports = {
  gamedayUrlRoot: gamedayUrlRoot,
  ordinal: ordinal,
  ensureArray: ensureArray,
};

function gamedayUrlRoot() {
  var today = new Date();
  return sprintf(
      'http://mlb.mlb.com/gdcross/components/game/mlb/year_%d/month_%02d/day_%02d/',
      today.getFullYear(), today.getMonth() + 1, today.getDate());
}

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
