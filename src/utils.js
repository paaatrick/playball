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
 * Break text into lines that fit a given width, indenting every line after
 * the first. Words longer than the width are split across lines.
 * @param {string} text
 * @param {number} width
 * @param {number} indent number of spaces to prefix continuation lines with
 * @returns {string[]} the wrapped lines
 */
export function wrapText(text, width, indent = 0) {
  if (width <= 0) {
    return [text];
  }
  const pad = ' '.repeat(Math.min(indent, width - 1));
  const lines = [];
  let line = '';
  text.split(/\s+/).filter(word => word.length > 0).forEach(word => {
    if (line === '') {
      line = (lines.length === 0 ? '' : pad) + word;
    } else if (line.length + 1 + word.length <= width) {
      line += ' ' + word;
    } else {
      lines.push(line);
      line = pad + word;
    }
    while (line.length > width) {
      lines.push(line.slice(0, width));
      line = pad + line.slice(width);
    }
  });
  if (line !== '') {
    lines.push(line);
  }
  return lines;
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
