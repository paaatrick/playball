var Game = require('../lib/game');
var sprintf = require('sprintf-js').sprintf;
var utils = require('./utils');

module.exports.games = function() {
  var today = new Date();
  var urlBase = sprintf('http://mlb.mlb.com/gdcross/components/game/mlb/' +
    'year_%d/month_%02d/day_%02d/',
    today.getFullYear(), today.getMonth() + 1, today.getDate());
  var masterScoreboardUrl = urlBase + 'master_scoreboard.json';

  function getGameList(data) {
    utils.ensureArray(data.games, 'game');
    return data.games.game.map(function(g) { return new Game(g); });
  }

  return utils.getJson(masterScoreboardUrl)
    .then(getGameList);
};
