var events = require('events');
var moment = require('moment-timezone');
var Q = require('q');
var util = require('util');
var utils = require('./utils');
var XML = require('pixl-xml');

module.exports = Game;

function Game(game) {
  if (!(this instanceof Game)) { return new Game(game); }

  events.EventEmitter.call(this);

  this.teams = {
    away: {
      id: game.away_team_id,
      city: game.away_team_city,
      name: game.away_team_name,
      code: game.away_code,
      abbrev: game.away_name_abbrev,
      home_away: 'away',
    },
    home: {
      id: game.home_team_id,
      city: game.home_team_city,
      name: game.home_team_name,
      code: game.home_code,
      abbrev: game.home_name_abbrev,
      home_away: 'home',
    },
  };

  this.urlRoot = 'http://www.mlb.com/gdcross' + game.game_data_directory;

  // Assuming the start is always given in eastern time
  var startString = game.time_date + game.ampm;
  var eastern = moment.tz(startString, 'YYYY/MM/DD h:mma', 'America/New_York');
  this.startTime = eastern.tz(moment.tz.guess());

  this.disp = this.teams.away.abbrev + ' @ ' + this.teams.home.abbrev + ' - ';
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

  this.players = {};
}

util.inherits(Game, events.EventEmitter);

Game.prototype.start = function() {
  utils.getXml(this.urlRoot + '/players.xml')
    .then(parsePlayers.bind(undefined, this))
    .then(loop.bind(undefined, this));
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
    utils.getXml(self.urlRoot + '/inning/inning_all.xml'),
    utils.getXml(self.urlRoot + '/plays.xml'),
  ])
  .spread(function(events, plays) {
    var status = utils.camelCase(plays.status);

    if (status === 'inProgress') {
      handleInProgress(self, events, plays);
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

function parsePlayers(self, game) {
  game.team.forEach(function(team) {
    team.player.forEach(function(player) {
      self.players[player.id] = player;
    });
  });
}

var lastAtbatNum = 0;
var lastAtbatEvent = 0;
var lastActionEvent = 0;
function handleInProgress(self, events, plays) {
  var idx = plays.inning - 1;
  var side = plays.inning_state.toLowerCase();
  var inning;
  if (events.inning[idx] && events.inning[idx][side]) {
    inning = events.inning[idx][side];
  }

  if (plays.atbat && plays.atbat.num != lastAtbatNum) {
    lastAtbatNum = plays.atbat.num;
    if (inning && inning.atbat) {
      var atbats = XML.alwaysArray(inning.atbat);
      atbats.forEach(function(a) {
        if (a.event_num > lastAtbatEvent) {
          lastAtbatEvent = a.event_num;
          console.log(a.des);
        }
      });
    }
    console.log('Now batting ' + plays.players.batter.boxname + ', ' +
      plays.players.batter.avg + 'AVG');
  }

  if (inning && inning.action) {
    var actions = XML.alwaysArray(inning.action);
    actions.forEach(function(a) {
      if (a.event_num > lastActionEvent) {
        lastActionEvent = a.event_num;
        console.log(a.event + ': ' + a.des);
      }
    });
  }
}
