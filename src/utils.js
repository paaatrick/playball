import { get } from './config.js';

export function formatTeamName(team) {
  const favorites = get('favorites');
  let name = team.teamName;
  if (favorites.includes(team.abbreviation)) {
    name = '★ ' + name;
  }
  return name;
}