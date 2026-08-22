import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {gameHasFavoriteTeam} from '../src/utils.js';
import {makeCompareGames} from '../src/gameSort.js';

function makeGame(id, abstractGameCode, away, home, linescore) {
  const game = {
    id,
    status: {abstractGameCode},
    teams: {
      away: {team: {abbreviation: away}},
      home: {team: {abbreviation: home}}
    }
  };
  if (linescore) {
    game.linescore = linescore;
  }
  return game;
}

describe('gameHasFavoriteTeam', () => {
  it('returns false when no team is favorited', () => {
    const game = makeGame('g', 'P', 'NYY', 'BOS');
    assert.strictEqual(gameHasFavoriteTeam(game, []), false);
  });

  it('returns true when the away team is favorited', () => {
    const game = makeGame('g', 'P', 'NYY', 'BOS');
    assert.strictEqual(gameHasFavoriteTeam(game, ['NYY']), true);
  });

  it('returns true when the home team is favorited', () => {
    const game = makeGame('g', 'P', 'NYY', 'BOS');
    assert.strictEqual(gameHasFavoriteTeam(game, ['BOS']), true);
  });

  it('returns false when favorites contains other teams only', () => {
    const game = makeGame('g', 'P', 'NYY', 'BOS');
    assert.strictEqual(gameHasFavoriteTeam(game, ['CHC', 'CIN']), false);
  });
});

describe('makeCompareGames favorites-first sort', () => {
  it('sorts a favorite-team game ahead of a non-favorite game, regardless of game state', () => {
    const preGameFav = makeGame('preGameFav', 'P', 'NYY', 'BOS');
    const liveNoFav = makeGame('liveNoFav', 'L', 'CHC', 'CIN');
    const compare = makeCompareGames({sortByFavorites: true, favorites: ['NYY']});
    const order = [liveNoFav, preGameFav].sort(compare).map(g => g.id);
    assert.deepStrictEqual(order, ['preGameFav', 'liveNoFav']);
  });

  it('orders by game state within the favorites group (live > pre-game > finished)', () => {
    const liveFav = makeGame('liveFav', 'L', 'NYY', 'BOS');
    const preGameFav = makeGame('preGameFav', 'P', 'LAD', 'SD');
    const finishedFav = makeGame('finishedFav', 'F', 'CHC', 'CIN');
    const favorites = ['NYY', 'LAD', 'CHC'];
    const compare = makeCompareGames({sortByFavorites: true, favorites});
    const order = [finishedFav, liveFav, preGameFav].sort(compare).map(g => g.id);
    assert.deepStrictEqual(order, ['liveFav', 'preGameFav', 'finishedFav']);
  });

  it('ignores favorites when sortByFavorites is false, ordering by game state only', () => {
    const liveNoFav = makeGame('liveNoFav', 'L', 'DET', 'HOU');
    const preGameFav = makeGame('preGameFav', 'P', 'NYY', 'BOS');
    const compare = makeCompareGames({sortByFavorites: false, favorites: ['NYY']});
    const order = [preGameFav, liveNoFav].sort(compare).map(g => g.id);
    assert.deepStrictEqual(order, ['liveNoFav', 'preGameFav']);
  });

  it('defaults to sortByFavorites off and no favorites when called with no options', () => {
    const liveGame = makeGame('live', 'L', 'DET', 'HOU');
    const preGameFav = makeGame('preGameFav', 'P', 'NYY', 'BOS');
    const compare = makeCompareGames();
    const order = [preGameFav, liveGame].sort(compare).map(g => g.id);
    assert.deepStrictEqual(order, ['live', 'preGameFav']);
  });

  it('breaks ties between two live games by inning depth', () => {
    const earlyInning = makeGame('early', 'L', 'DET', 'HOU', {currentInning: 2});
    const lateInning = makeGame('late', 'L', 'NYY', 'BOS', {currentInning: 8});
    const compare = makeCompareGames();
    const order = [earlyInning, lateInning].sort(compare).map(g => g.id);
    assert.deepStrictEqual(order, ['late', 'early']);
  });
});
