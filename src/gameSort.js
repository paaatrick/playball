import {gameHasFavoriteTeam} from './utils.js';

export function compareGameInnings(a, b) {
  if (!a.linescore && !b.linescore) {
    return 0;
  }
  if (!a.linescore) {
    return 1;
  }
  if (!b.linescore) {
    return -1;
  }

  const inningCompare = b.linescore.currentInning - a.linescore.currentInning;
  if (inningCompare !== 0) {
    return inningCompare;
  }
  // isTopInning lives on the linescore, not the game itself. Within the same
  // inning number, the bottom half is further along than the top half, so it
  // should sort first to stay consistent with "deepest game first".
  if (a.linescore.isTopInning && !b.linescore.isTopInning) {
    return 1;
  }
  if (b.linescore.isTopInning && !a.linescore.isTopInning) {
    return -1;
  }
  return 0;
}

// live -> pre-game -> finished
const GAME_STATE_ORDER = {
  L: 0,
  P: 1,
  F: 2,
};

function compareGameState(a, b) {
  return GAME_STATE_ORDER[a.status.abstractGameCode] - GAME_STATE_ORDER[b.status.abstractGameCode];
}

/**
 * Build a comparator for sorting the game list.
 * @param {object} [options]
 * @param {boolean} [options.sortByFavorites] - when true, games with at
 *   least one favorited team sort ahead of games without one
 * @param {string[]} [options.favorites] - favorited team abbreviations
 */
export function makeCompareGames({sortByFavorites = false, favorites = []} = {}) {
  return (a, b) => {
    // Favorites-first: games with at least one favorited team sort before non-favorites
    if (sortByFavorites) {
      const aHasFav = gameHasFavoriteTeam(a, favorites);
      const bHasFav = gameHasFavoriteTeam(b, favorites);
      if (aHasFav !== bHasFav) {
        return aHasFav ? -1 : 1;
      }
    }

    // Then by game state: live -> pre-game -> finished
    const stateCompare = compareGameState(a, b);
    if (stateCompare !== 0) {
      return stateCompare;
    }

    // Finally, break ties between two live games by inning depth, so the
    // games furthest along appear first. Only live games have an inning to
    // compare, so pre-game and finished games keep their existing order.
    if (a.status.abstractGameCode === 'L') {
      const inningCompare = compareGameInnings(a, b);
      if (inningCompare !== 0) {
        return inningCompare;
      }
    }

    return 0;
  };
}
