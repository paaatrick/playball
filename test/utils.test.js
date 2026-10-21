import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {formatHitData, gameHasFavoriteTeam} from '../src/utils.js';

function makeGame(away, home) {
  return {
    teams: {
      away: {team: {abbreviation: away}},
      home: {team: {abbreviation: home}}
    }
  };
}

describe('gameHasFavoriteTeam', () => {
  it('returns false when no team is favorited', () => {
    const game = makeGame('NYY', 'BOS');
    assert.strictEqual(gameHasFavoriteTeam(game, []), false);
  });

  it('returns true when the away team is favorited', () => {
    const game = makeGame('NYY', 'BOS');
    assert.strictEqual(gameHasFavoriteTeam(game, ['NYY']), true);
  });

  it('returns true when the home team is favorited', () => {
    const game = makeGame('NYY', 'BOS');
    assert.strictEqual(gameHasFavoriteTeam(game, ['BOS']), true);
  });

  it('returns false when favorites contains other teams only', () => {
    const game = makeGame('NYY', 'BOS');
    assert.strictEqual(gameHasFavoriteTeam(game, ['CHC', 'CIN']), false);
  });

  it('does exact matching, not substring matching, on team abbreviations', () => {
    // 'NY' is a substring of 'NYY' but is not itself a valid team abbreviation.
    // Under the old (buggy) behavior where favorites was a comma-joined string,
    // String.prototype.includes would have matched this via substring search.
    // With favorites as a real array, Array.prototype.includes must require an
    // exact element match and must NOT match here.
    const game = makeGame('NYY', 'BOS');
    assert.strictEqual(gameHasFavoriteTeam(game, ['NY']), false);
  });
});

describe('formatHitData', () => {
  it('formats speed, angle, and distance', () => {
    assert.strictEqual(
      formatHitData({launchSpeed: 102.6, launchAngle: 8, totalDistance: 145}),
      '102.6 MPH, 8° LA, 145 ft'
    );
  });

  it('rounds angle and distance but keeps speed precision', () => {
    assert.strictEqual(
      formatHitData({launchSpeed: 88.3, launchAngle: 39.4, totalDistance: 283.6}),
      '88.3 MPH, 39° LA, 284 ft'
    );
  });

  it('skips the distance when it is missing', () => {
    assert.strictEqual(
      formatHitData({launchSpeed: 21.3, launchAngle: -30}),
      '21.3 MPH, -30° LA'
    );
  });

  it('returns an empty string for untracked balls', () => {
    assert.strictEqual(formatHitData({trajectory: 'ground_ball'}), '');
    assert.strictEqual(formatHitData(undefined), '');
    assert.strictEqual(formatHitData(null), '');
  });
});
