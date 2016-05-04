const _ = require('lodash');
const events = require('events');
const HttpError = require('./http-error');
const inherits = require('util').inherits;
const moment = require('moment-timezone');
const Q = require('q');
const utils = require('./utils');

var lastEmittedEvent = 0;
var lastCompleteAtbatNum = 0;
var currentAtbatNum = 0;
var gameOverAttempts = 0;
var inningInProgress = false;
var atbatInProgress = false;

const handlers = {
  preview: waitUntilStart,
  preGame: waitUntilStart,
  warmup: waitFor(30000),
  delayed: waitFor(30000),
  delayedStart: waitFor(30000),
  inProgress: handleInProgress,
  replay: waitFor(10000),
  review: waitFor(10000),
  managerChallenge: waitFor(10000),
  final: handleGameEnd,
  gameOver: handleGameEnd,
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

  this.disp = this.teams.away.name + ' @ ' + this.teams.home.name + ' - ';
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
    .then(players => parsePlayers(this, players))
    .then(() => loop(this))
    .catch((err) => {
      if (!err instanceof HttpError) {
        throw err;
      }
      var timeout = Math.max(millisToStart(this) - 300000, 10000);
      this.emit('preview');
      setTimeout(() => this.start(), timeout);
    })
    .done();
};

function millisToStart(self) {
  return self.startTime.diff(moment());
}

function waitUntilStart(self, status, events, plays) {
  var until = millisToStart(self);
  var timeout = until < 0 ? 30000 : until;
  self.emit(status, plays);
  setTimeout(loop, timeout, self);
}

function waitFor(self, timeout) {
  return function(self, status, events, plays) {
    self.emit(status, plays);
    setTimeout(loop, timeout, self);
  };
}

function loop(self) {
  Q.all([
    utils.getXml(self.urlRoot + '/inning/inning_all.xml'),
    utils.getXml(self.urlRoot + '/plays.xml'),
  ])
  .spread((events, plays) => {
    var status = _.camelCase(plays.status);
    var handler = handlers[status];
    if (handler && typeof handler === 'function') {
      handler(self, status, events, plays);
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

function getTeam(self, teamId) {
  return _.find(self.teams, {id: teamId});
}

function getPlayer(self, playerId) {
  var player = self.players[playerId];
  player.team = getTeam(self, player.team_id);
  return player;
}

function handleInProgress(self, status, innings, plays) {
  var START_INNING = 0.1;
  var START_ATBAT = 0.01;
  var SCORE_CHANGE = 0.001;
  var END_INNING = 0.0001;

  var events = [];
  var lastParsedEvent = 0;
  var inningData;

  function pushEvent(name, num, data) {
    lastParsedEvent = Math.max(lastParsedEvent, num);
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
      pushEvent('scoreChange', lastParsedEvent + SCORE_CHANGE, self.teams);
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
    ['Top', 'Bottom'].forEach((side) => {
      inningData = {num: inning.num, side: side};
      side = side.toLowerCase();

      if (!inning[side]) { return; }

      if (inning[side].atbat) {
        pushEvent('startInning', lastParsedEvent + START_INNING, inningData);
        inningInProgress = true;
        utils.asArray(inning[side].atbat).forEach((atbat) => {
          var atbatData = {
            batter: getPlayer(self, atbat.batter),
            pitcher: getPlayer(self, atbat.pitcher),
          }
          pushEvent('startAtbat', lastParsedEvent + START_ATBAT, atbatData);
          pushEvent('endAtbat', +atbat.event_num, atbat);
          lastCompleteAtbatNum = Math.max(lastCompleteAtbatNum, +atbat.num);
          checkScore(+atbat.home_team_runs, +atbat.away_team_runs);
          if (lastCompleteAtbatNum >= currentAtbatNum) {
            atbatInProgress = false;
          }
          if (atbat.o === '3') {
            pushEvent('endInning', lastParsedEvent + END_INNING, inningData);
            inningInProgress = false;
          }
          utils.asArray(atbat.pitch).forEach((pitch) => {
            pushEvent('pitch', +pitch.event_num, pitch);
          });
        });
      }

      utils.asArray(inning[side].action).forEach((action) => {
        pushEvent('action', +action.event_num, action);
        checkScore(+action.home_team_runs, +action.away_team_runs);
      });
    });
  });

  if (plays && plays.atbat && +plays.atbat.num !== currentAtbatNum &&
      (lastCompleteAtbatNum === 0 ||
        +plays.atbat.num - lastCompleteAtbatNum < 2)) {
    if (!inningInProgress) {
      inningData = {num: plays.inning, side: plays.inning_state};
      pushEvent('startInning', lastParsedEvent + START_INNING, inningData);
    }
    currentAtbatNum = +plays.atbat.num;
    var atbatData = {
      batter: getPlayer(self, plays.players.batter.pid),
      pitcher: getPlayer(self, plays.players.pitcher.pid),
    }
    atbatData.batter.current = plays.players.batter;
    atbatData.pitcher.current = plays.players.pitcher;
    pushEvent('startAtbat', lastParsedEvent + START_ATBAT, atbatData);
    atbatInProgress = true;
  }

  if (plays && plays.atbat && +plays.atbat.num === currentAtbatNum) {
    utils.asArray(plays.atbat.p).forEach((pitch) => {
      pushEvent('pitch', +pitch.event_num, pitch);
    });
  }

  _(events)
    .sortBy('num')
    .uniqBy('num')
    .filter(notEmitted)
    .forEach(emitEvent);

  setTimeout(loop, 10000, self);
}

function handleGameEnd(self, status, events, plays) {
  if (atbatInProgress && gameOverAttempts < 3) {
    gameOverAttempts += 1;
    handleInProgress(self, status, events, plays);
    return;
  }

  utils.getXml(self.urlRoot + '/linescore.xml')
    .then(linescore => self.emit(status, linescore))
    .done();
}
