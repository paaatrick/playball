import { get } from './config.js';

/**
 * Check if a game involves any favorited team.
 * @param {object} game
 * @param {string[]} favorites - favorited team abbreviations
 */
export function gameHasFavoriteTeam(game, favorites) {
  return favorites.includes(game.teams.away.team.abbreviation) ||
         favorites.includes(game.teams.home.team.abbreviation);
}

export function teamFavoriteStar(team) {
  const style = get('color.favorite-star') + '-fg';
  if (get('favorites').includes(team.abbreviation)) {
    return `{${style}}★{/${style}} `;
  }
  return '';
}

/**
 * Get the sport ID for API calls
 * @returns {string} '51' for WBC, '1' for MLB
 */
export function getSportId() {
  return getSport() === 'wbc' ? '51' : '1';
}

/**
 * Get the current sport setting
 * @returns {string} 'mlb' or 'wbc'
 */
export function getSport() {
  return get('sport')?.toLowerCase() || 'mlb';
}
