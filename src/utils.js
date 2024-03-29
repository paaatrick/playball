import { get } from './config.js';

const FAVORITES = get('favorites');

export function teamFavoriteStar(team) {
  const style = get('color.favorite-star') + '-fg'
  if (FAVORITES.includes(team.abbreviation)) {
    return `{${style}}★{/${style}} `;
  }
  return '';
}
