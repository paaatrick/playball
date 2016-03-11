var events = require('events');
var moment = require('moment-timezone');
var Q = require('q');
var util = require('util');
var utils = require('./utils');

module.exports = Game;

function Game(game) {
  if (!(this instanceof Game)) { return new Game(game); }

  events.EventEmitter.call(this);

  this.urlRoot = 'http://www.mlb.com/gdcross' + game.game_data_directory;

  // Assuming the start is always given in eastern time
  var startString = game.time_date + game.ampm;
  var eastern = moment.tz(startString, 'YYYY/MM/DD h:mma', 'America/New_York');
  this.startTime = eastern.tz(moment.tz.guess());

  this.disp = game.away_name_abbrev + ' @ ' + game.home_name_abbrev + ' - ';
  this.disp += this.startTime.format('h:mm A');
  if (game.status) {
    var status = game.status.status;
    if (status !== 'Preview' && status !== 'Pre-Game') {
      this.disp += ' - ' + status;
      if (status === 'In Progress') {
        this.disp += ' ' + game.status.inning_state + ' ' + game.status.inning;
      }
    }
  }
}

util.inherits(Game, events.EventEmitter);

Game.prototype.start = function() {
  loop(this);
};

var timeouts = {
  preview: untilStart,
  preGame: untilStart,
  warmup: 30000,
  delayed: 30000,
  delayedStart: 30000,
  inProgress: 10000,
  replay: 10000,
  review: 10000,
  managerChallenge: 10000,
};

var inningState = {};

function untilStart(self) {
  var until = self.startTime.diff(moment());
  return until < 0 ? 30000 : until;
}

function loop(self) {
  Q.all([
    utils.getJson(self.urlRoot + '/game_events.json'),
    utils.getJson(self.urlRoot + '/plays.json'),
  ])
  .spread(function(events, plays) {
    var status = utils.camelCase(plays.game.status);

    if (status === 'inProgress') {
      if (inningState.num !== plays.game.inning ||
          inningState.side !== plays.game.inning_state) {
        inningState = {num: plays.game.inning, side: plays.game.inning_state};
        self.emit('inning', inningState);
      }
    } else {
      self.emit(status);
    }

    var timeout = timeouts[status];
    if (timeout) {
      if (typeof timeout === 'function') {
        timeout = timeout(self);
      }
      setTimeout(loop, timeout, self);
    }
  })
  .done();
}
