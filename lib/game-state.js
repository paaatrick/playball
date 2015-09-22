var sprintf = require('sprintf-js').sprintf;

module.exports = GameState;

function GameState() {
  this.teams = {
    home: {
      name: '',
      record: '',
    },
    away: {
      name: '',
      record: '',
    },
  };
  this.runs = {
    home: 0,
    away: 0,
  };
  this.inningNum = 0;
  this.inningSide = '';
  this.outs = 0;
  this.events = [];
  this.batterId = 0;
  this.batterDisplay = '';
  this.runners = [false, false, false];

  this.batterChanged = false;
  this.runnerChanged = false;

  this.inningDataPending = true;
}

GameState.prototype.getScore = function() {
  return sprintf('%(teams.away.name)s %(runs.away)s - %(teams.home.name)s %(runs.home)s', this);
};

GameState.prototype.pitchingTeam = function() {
  return this.inningSide === 'Top' ? this.teams.home.name : this.teams.away.name;
};

GameState.prototype.battingTeam = function() {
  return this.inningSide === 'Top' ? this.teams.away.name : this.teams.home.name;
};
