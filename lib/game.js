var events = require('events');
var moment = require('moment-timezone');
var Q = require('q');
var util = require('util');
var utils = require('./utils');
var XML = require('pixl-xml');

var lastEvent = 0;
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

util.inherits(Game, events.EventEmitter);

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

function handleInProgress(self, innings, plays) {
  var events = [];
  var latestEvent = 0;
  var inningData;
  var batterData;

  XML.alwaysArray(innings.inning).forEach(function (inning) {
    ['Top', 'Bottom'].forEach(function (side) {
      inningData = {num: inning.num, side: side};
      side = side.toLowerCase();

      if (!inning[side]) { return; }

      if (inning[side].atbat) {
        latestEvent += 0.1;
        events.push({name: 'startInning', num: latestEvent, data: inningData});
        inningInProgress = true;
        XML.alwaysArray(inning[side].atbat).forEach(function (atbat) {
          latestEvent += 0.01;
          batterData = self.players[atbat.batter];
          events.push({name: 'startAtbat', num: latestEvent, data: batterData});
          events.push({name: 'endAtbat', num: +atbat.event_num, data: atbat});
          latestEvent = Math.max(latestEvent, +atbat.event_num);
          lastCompleteAtbatNum = +atbat.num;
          if (+atbat.home_team_runs !== self.teams.home.runs ||
              +atbat.away_team_runs !== self.teams.away.runs) {
            self.teams.home.runs = +atbat.home_team_runs;
            self.teams.away.runs = +atbat.away_team_runs;
            latestEvent += 0.001;
            events.push({name: 'scoreChange', num: latestEvent, data: self.teams});
          }
          if (lastCompleteAtbatNum === currentAtbatNum) {
            atbatInProgress = false;
          }
          if (atbat.o === "3") {
            latestEvent += 0.1;
            events.push({name: 'endInning', num: latestEvent, data: inningData});
            inningInProgress = false;
          }
          if (atbat.pitch) {
            XML.alwaysArray(atbat.pitch).forEach(function (pitch) {
              events.push({name: 'pitch', num: +pitch.event_num, data: pitch});
              latestEvent = Math.max(latestEvent, +pitch.event_num);
            });
          }
        });
      }

      if (inning[side].action) {
        XML.alwaysArray(inning[side].action).forEach(function (action) {
          events.push({name: 'action', num: +action.event_num, data: action});
          latestEvent = Math.max(latestEvent, +action.event_num);
          if (+action.home_team_runs !== self.teams.home.runs ||
              +action.away_team_runs !== self.teams.away.runs) {
            self.teams.home.runs = +action.home_team_runs;
            self.teams.away.runs = +action.away_team_runs;
            latestEvent += 0.001;
            events.push({name: 'scoreChange', num: latestEvent, data: self.teams});
          }
        });
      }
    });
  });

  events.sort(function(a, b) {
    return a.num - b.num;
  });

  events.forEach(function(e) {
    if (e.num > lastEvent) {
      self.emit(e.name, e.data);
      lastEvent = e.num;
    }
  });

  if (plays.atbat && plays.atbat.num != currentAtbatNum &&
      (lastCompleteAtbatNum === 0 || +plays.atbat.num - lastCompleteAtbatNum < 2)) {
    if (!inningInProgress) {
      lastEvent += 0.1;
      inningData = {num: plays.inning, side: plays.inning_state};
      self.emit('startInning', inningData);
    }
    currentAtbatNum = +plays.atbat.num;
    lastEvent += 0.01;
    batterData = self.players[plays.players.batter.pid];
    batterData.current = plays.players.batter;
    self.emit('startAtbat', batterData);
    atbatInProgress = true;
  }

  if (atbatInProgress && plays.atbat && plays.atbat.p) {
    XML.alwaysArray(plays.atbat.p).forEach(function (pitch) {
      if (pitch.event_num > lastEvent) {
        lastEvent = pitch.event_num;
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
