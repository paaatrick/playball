var http = require('q-io/http');
var sprintf = require('sprintf-js').sprintf;
var utils = require('./utils');

module.exports.games = function() {
  var today = new Date();
  var urlBase = sprintf('http://mlb.mlb.com/gdcross/components/game/mlb/' +
    'year_%d/month_%02d/day_%02d/',
    today.getFullYear(), today.getMonth() + 1, today.getDate());
  var masterScoreboardUrl = urlBase + 'master_scoreboard.json';

  function getBody(response) {
    if (response.status >= 400) {
      throw new Exception(response.status);
    }

    return response.body.read();
  }

  function getGameList(body) {
    var json = JSON.parse(body);

    utils.ensureArray(json.data.games, 'game');
    return json.data.games.game;
  }

  return http.request(masterScoreboardUrl)
    .then(getBody)
    .then(getGameList);
};
