var _ = require('lodash');
var events = require('events');
var inherits = require('util').inherits;
var moment = require('moment-timezone');
var Q = require('q');
var utils = require('./utils');

var lastEmittedEvent = 0;
var lastCompleteAtbatNum = 0;
var currentAtbatNum = 0;
var inningInProgress = false;
var atbatInProgress = false;
var count = {b: 0, s: 0};
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
      runs: 0,
    },
    home: {
      id: game.home_team_id,
      city: game.home_team_city,
      name: game.home_team_name,
      code: game.home_code,
      abbrev: game.home_name_abbrev,
      home_away: 'home',
      runs: 0,
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

inherits(Game, events.EventEmitter);

Game.prototype.start = function() {
  utils.getXml(this.urlRoot + '/players.xml')
    .then(parsePlayers.bind(undefined, this))
    .then(loop.bind(undefined, this));
};

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
    var status = _.camelCase(plays.status);

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
  self.players = _(game.team)
    .flatMap('player')
    .keyBy('id')
    .value();
}

function handleInProgress(self, innings, plays) {
  var START_INNING = 0.1;
  var START_ATBAT = 0.01;
  var SCORE_CHANGE = 0.001;
  var END_INNING = 0.0001;

  var events = [];
  var latestEvent = 0;
  var inningData;
  var batterData;

  function pushEvent(name, num, data) {
    latestEvent = Math.max(latestEvent, num);
    events.push({
      name: name,
      num: num,
      data: _.cloneDeep(data),
    });
  }

  function checkScore(homeTeamRuns, awayTeamRuns) {
    if (homeTeamRuns > self.teams.home.runs ||
        awayTeamRuns > self.teams.away.runs) {
      self.teams.home.runs = homeTeamRuns;
      self.teams.away.runs = awayTeamRuns;
      pushEvent('scoreChange', latestEvent + SCORE_CHANGE, self.teams);
    }
  }

  function notEmitted(event) {
    return event.num > lastEmittedEvent;
  }

  function emitEvent(event) {
    self.emit(event.name, event.data);
    lastEmittedEvent = event.num;
  }

  utils.asArray(innings.inning).forEach(function(inning) {
    ['Top', 'Bottom'].forEach(function(side) {
      inningData = {num: inning.num, side: side};
      side = side.toLowerCase();

      if (!inning[side]) { return; }

      if (inning[side].atbat) {
        pushEvent('startInning', latestEvent + START_INNING, inningData);
        inningInProgress = true;
        utils.asArray(inning[side].atbat).forEach(function(atbat) {
          batterData = self.players[atbat.batter];
          pushEvent('startAtbat', latestEvent + START_ATBAT, batterData);
          pushEvent('endAtbat', +atbat.event_num, atbat);
          lastCompleteAtbatNum = +atbat.num;
          checkScore(+atbat.home_team_runs, +atbat.away_team_runs);
          if (lastCompleteAtbatNum === currentAtbatNum) {
            atbatInProgress = false;
          }
          if (atbat.o === '3') {
            pushEvent('endInning', latestEvent + END_INNING, inningData);
            inningInProgress = false;
          }
          utils.asArray(atbat.pitch).forEach(function(pitch) {
            pushEvent('pitch', +pitch.event_num, pitch);
          });
        });
      }

      utils.asArray(inning[side].action).forEach(function(action) {
        pushEvent('action', +action.event_num, action);
        checkScore(+action.home_team_runs, +action.away_team_runs);
      });
    });
  });

  _(events)
    .sortBy('num')
    .filter(notEmitted)
    .forEach(emitEvent);

  if (plays.atbat && plays.atbat.num != currentAtbatNum &&
      (lastCompleteAtbatNum === 0 ||
        +plays.atbat.num - lastCompleteAtbatNum < 2)) {
    if (!inningInProgress) {
      lastEmittedEvent += START_INNING;
      inningData = {num: plays.inning, side: plays.inning_state};
      self.emit('startInning', inningData);
    }
    currentAtbatNum = +plays.atbat.num;
    lastEmittedEvent += START_ATBAT;
    batterData = self.players[plays.players.batter.pid];
    batterData.current = plays.players.batter;
    self.emit('startAtbat', batterData);
    atbatInProgress = true;
  }

  if (atbatInProgress && plays.atbat) {
    utils.asArray(plays.atbat.p).forEach(function(pitch) {
      if (pitch.event_num > lastEmittedEvent) {
        lastEmittedEvent = pitch.event_num;
        self.emit('pitch', pitch);
      }
    });
  }
}

function updateCount(pitch) {
  if (pitch.type === 'B') {
    count.b += 1;
  } else if (pitch.type === 'S' && !(pitch.des === 'Foul' && count.s == 2)) {
    count.s += 1;
  }
  pitch.b = count.b;
  pitch.s = count.s;
}

function clearCount() {
  count = {b: 0, s: 0};
}
