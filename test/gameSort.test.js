import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
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

describe('makeCompareGames favorites-first sort', () => {
  it('sorts a full matrix of favorite/non-favorite x live/pre-game/finished games', () => {
    // Favorites: NYY, LAD
    const liveFav = makeGame('liveFav', 'L', 'NYY', 'BOS', {currentInning: 5, isTopInning: false});
    const preGameFav = makeGame('preGameFav', 'P', 'LAD', 'SD');
    const finishedFav = makeGame('finishedFav', 'F', 'NYY', 'CIN');
    const liveNoFav = makeGame('liveNoFav', 'L', 'CHC', 'MIL', {currentInning: 3, isTopInning: true});
    const preGameNoFav = makeGame('preGameNoFav', 'P', 'DET', 'HOU');
    const finishedNoFav = makeGame('finishedNoFav', 'F', 'SEA', 'TEX');

    const favorites = ['NYY', 'LAD'];
    const compare = makeCompareGames({sortByFavorites: true, favorites});

    // Adversarial input order: not sorted, not reversed.
    const shuffled = [
      preGameNoFav,
      finishedFav,
      liveNoFav,
      liveFav,
      finishedNoFav,
      preGameFav
    ];

    const order = shuffled.sort(compare).map(g => g.id);
    assert.deepStrictEqual(order, [
      'liveFav',
      'preGameFav',
      'finishedFav',
      'liveNoFav',
      'preGameNoFav',
      'finishedNoFav'
    ]);
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

  it('breaks ties between live games by inning depth', () => {
    const earlyInning = makeGame('early', 'L', 'DET', 'HOU', {currentInning: 2});
    const midInning = makeGame('mid', 'L', 'SEA', 'TEX', {currentInning: 5});
    const lateInning = makeGame('late', 'L', 'NYY', 'BOS', {currentInning: 8});
    const compare = makeCompareGames();
    // Adversarial input order: not sorted, not reversed.
    const order = [midInning, lateInning, earlyInning].sort(compare).map(g => g.id);
    assert.deepStrictEqual(order, ['late', 'mid', 'early']);
  });

  it('breaks ties between two live games in the same inning by top/bottom half', () => {
    // Same inning number: the bottom half is further along than the top half,
    // so it should sort first (consistent with "deepest game first").
    const topOfInning = makeGame('top', 'L', 'DET', 'HOU', {currentInning: 5, isTopInning: true});
    const bottomOfInning = makeGame('bottom', 'L', 'NYY', 'BOS', {currentInning: 5, isTopInning: false});
    const compare = makeCompareGames();
    const order = [topOfInning, bottomOfInning].sort(compare).map(g => g.id);
    assert.deepStrictEqual(order, ['bottom', 'top']);
  });
});
