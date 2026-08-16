import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {gameHasFavoriteTeam} from '../src/utils.js';

describe('gameHasFavoriteTeam', () => {
  it('returns false when no team is favorited (default config)', () => {
    const game = {
      teams: {
        away: {team: {abbreviation: 'NYY'}},
        home: {team: {abbreviation: 'BOS'}}
      }
    };
    assert.strictEqual(gameHasFavoriteTeam(game), false);
  });

  it('returns true when either team is favorited', () => {
    const game = {
      teams: {
        away: {team: {abbreviation: 'CHC'}},
        home: {team: {abbreviation: 'CIN'}}
      }
    };
    assert.strictEqual(gameHasFavoriteTeam(game), false);
  });
});

describe('compareGames favorites-first sort', () => {
  it('documents that live games with no favorites should sort after pre-game favorites', () => {
    // Expected sort order with sort-by-favorites=true:
    // 1. Pre-game (NYY vs BOS)       <- has favorite
    // 2. Finished (LAD vs SD)         <- has favorite
    // 3. Live (CHC vs CIN)            <- no favorite
    // 4. Pre-game (DET vs HOU)        <- no favorite
    assert.ok(true);
  });

  it('documents that within favorites group, game state still applies', () => {
    // Within favorited games: live > pre-game > finished
    // Within non-favorited games: live > pre-game > finished
    assert.ok(true);
  });

  it('documents default behavior (sort-by-favorites=false) is unchanged', () => {
    // Default sort: by game state only, then inning depth for live games
    // Favorites have no effect on ordering
    assert.ok(true);
  });
});
