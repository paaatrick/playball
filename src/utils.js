import { get } from './config.js';

const FAVORITES = get('favorites');

export function teamFavoriteStar(team) {
  const style = get('color.favorite-star') + '-fg';
  if (FAVORITES.includes(team.abbreviation)) {
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
