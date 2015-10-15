var request = require('request');
var sprintf = require('sprintf-js').sprintf;

var Game = require('./game');
var utils = require('./utils');

module.exports = GameDay;

function GameDay() {
  this.masterScoreboardUrl = utils.gamedayUrlRoot() + 'master_scoreboard.json';
  this.games = [];
}

GameDay.prototype.getGameList = function(callback) {
  request(this.masterScoreboardUrl, function(error, response, body) {
    if (error || response.statusCode >= 400) {
      return callback(true, null);
    }

    var json = JSON.parse(body);
    utils.ensureArray(json.data.games, 'game');
    this.games = json.data.games.game.filter(function(g) {
      var terminal = [
        'Final',
        'Game Over',
        'Completed Early',
        'Suspended',
        'Postponed',
        'Forfeit',
        'Cancelled',
      ];
      return g.status && terminal.indexOf(g.status.status) < 0;
    });

    var displayNames = this.games.map(formatGame);
    callback(null, displayNames);
  }.bind(this));
};

GameDay.prototype.getGame = function(idx) {
  return new Game(this.games[idx].gameday);
};

function formatGame(game) {
  utils.ensureArray(game.game_media, 'media');
  var startString = game.game_media.media[0].start;

  var startTime = new Date(startString);
  var hours = (startTime.getHours() + 11) % 12 + 1; // 24 hr -> 12 hr
  return sprintf('%s (%d-%d) @ %s (%d-%d) - %d:%02d %s',
      game.away_name_abbrev, game.away_win, game.away_loss,
      game.home_name_abbrev, game.home_win, game.home_loss,
      hours, startTime.getMinutes(), startTime.getHours() > 11 ? 'PM' : 'AM');
}
