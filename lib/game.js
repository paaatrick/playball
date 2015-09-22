var events = require('events');
var request = require('request');
var util = require('util');
var xml2js = require('xml2js');

var utils = require('./utils');

module.exports = Game;

function Game(id) {
  events.EventEmitter.call(this);

  this.id = id;

  this.urlRoot = utils.gamedayUrlRoot() + 'gid_' + this.id + '/';
  this.playsUrl = this.urlRoot + 'plays.json?live';
  this.linescoreUrl = this.urlRoot + 'linescore.json?live';

  this.xmlParser = new xml2js.Parser();

  function inGame() {
    this.getPlayData(function(err, playData) {
      if (err) { return; }

      if (playData.data.game.status !== 'In Progress') {
        this.start();
      }

      this.emitStatus(err, playData);
    });
  }

  function waitUntilStart(game) {
    var until = new Date(game.game_media.media.start) - new Date();
    var timeout = until < 0 ? 30000 : until;
    setTimeout(this.start.bind(this), timeout);
  }

  function wait() {
    setTimeout(this.start.bind(this), 30 * 1000);
  }

  function waitInGame() {
    setTimeout(inGame.bind(this), 10 * 1000);
  }

  this.on('Preview', waitUntilStart);
  this.on('Pre-Game', waitUntilStart);

  this.on('Warmup', wait);
  this.on('Delayed', wait);
  this.on('Delayed Start', wait);

  this.on('In Progress', waitInGame);
  this.on('Replay', waitInGame);
  this.on('Review', waitInGame);
  this.on('Manager Challenge', waitInGame);

  // Nothing specific to do with these -- we don't need to schedule another
  // update. Clients might want to pick these up.
  // 'Final', 'Game Over', 'Completed Early', 'Suspended', 'Postponed',
  // 'Forfeit', 'Cancelled'
}

util.inherits(Game, events.EventEmitter);

Game.prototype.emitStatus = function(err, data) {
  if (err) { return; }

  this.emit(data.data.game.status, data.data.game);
};

Game.prototype.start = function() {
  this.getGameData(this.emitStatus);
};

Game.prototype.getGameData = function(callback) {
  request(this.linescoreUrl, function(error, response, body) {
    if (error || response.statusCode >= 400) {
      return callback.call(this, true, null);
    }

    callback.call(this, null, JSON.parse(body));
  }.bind(this));
};

Game.prototype.getPlayData = function(callback) {
  request(this.playsUrl, function(error, response, body) {
    if (error || response.statusCode >= 300) {
      return callback.call(this, true, null);
    }

    callback.call(this, null, JSON.parse(body));
  }.bind(this));
};

Game.prototype.getInningData = function(inning, callback) {
  // not available as json, booooooo....
  var url = this.urlRoot + 'inning/inning_' + inning + '.xml?live';
  request(url, function(error, response, body) {
    if (error || response.statusCode >= 400) {
      return callback.call(this, true, null);
    }

    this.xmlParser.parseString(body, function(err, result) {
      if (error) {
        return callback.call(this, true, null);
      }

      callback.call(this, null, result.inning);
    }.bind(this));
  }.bind(this));
};
