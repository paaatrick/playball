const Game = require('../lib/game');
const sprintf = require('sprintf-js').sprintf;
const utils = require('./utils');

module.exports = {
  games: games,
}

function games() {
  var today = new Date();
  var urlBase = sprintf('http://gd.mlb.com/components/game/mlb/' +
    'year_%d/month_%02d/day_%02d/',
    today.getFullYear(), today.getMonth() + 1, today.getDate());
  var masterScoreboardUrl = urlBase + 'master_scoreboard.xml';

  return utils.getXml(masterScoreboardUrl)
    .then(games => utils.asArray(games.game).map(g => new Game(g)));
};
