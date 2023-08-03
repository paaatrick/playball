import { get } from './config.js';

const FAVORITES = get('favorites');

export function teamFavoriteStar(team) {
  if (FAVORITES.includes(team.abbreviation)) {
    return `{${get('color.favorite-star')}-fg}★{/} `;
  }
  return '';
}
