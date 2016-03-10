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

function fetch(self) {
  return Q.all([
    utils.getJson(self.urlRoot + '/game_events.json'),
    utils.getJson(self.urlRoot + '/plays.json'),
  ]);
}

function loop(self) {
  fetch(self)
    .spread(function(events, plays) {
      var status = plays.game.status;
      switch (status) {
        case 'Preview':
        case 'Pre-Game':
          var until = self.startTime.diff(moment());
          var timeout = until < 0 ? 30000 : until;
          setTimeout(loop, timeout, self);
          break;
        case 'Warmup':
        case 'Delayed':
        case 'Delayed Start':
          setTimeout(loop, 30 * 1000, self);
          break;
        case 'In Progress':
        case 'Replay':
        case 'Review':
        case 'Manager Challenge':
          setTimeout(loop, 10 * 1000, self);
          break;
      }
      self.emit(status);
    })
    .done();
}
