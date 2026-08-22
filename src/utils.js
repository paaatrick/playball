import { get } from './config.js';

/**
 * Check if a game involves any favorited team.
 * @param {object} game
 * @param {string[]} [favorites] - favorited team abbreviations; defaults to
 *   the configured favorites when omitted
 */
export function gameHasFavoriteTeam(game, favorites = get('favorites')) {
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
  // ENV override takes precedence
  const envSport = process.env.PLAYBALL_SPORT?.toLowerCase();
  const sport = envSport || get('sport') || 'mlb';

  return sport === 'wbc' ? '51' : '1';
}

/**
 * Get the current sport setting
 * @returns {string} 'mlb' or 'wbc'
 */
export function getSport() {
  const envSport = process.env.PLAYBALL_SPORT?.toLowerCase();
  return envSport || get('sport') || 'mlb';
}
