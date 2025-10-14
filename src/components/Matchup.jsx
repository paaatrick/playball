import React from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentPlay, selectBoxscore, selectTeams, selectPlayers } from '../features/games.js';

const getPlayerStats = (boxscore, teams, id) => {
  const key = 'ID' + id;
  const homePlayers = boxscore.home.players;
  if (homePlayers[key]) {
    return {
      team: teams.home,
      player: homePlayers[key],
    };
  }
  return {
    team: teams.away,
    player: boxscore.away.players[key],
  };
};

function Matchup() {
  const boxscore = useSelector(selectBoxscore);
  const currentPlay = useSelector(selectCurrentPlay);
  const teams = useSelector(selectTeams);
  const players = useSelector(selectPlayers);

  const pitcherId = currentPlay.matchup?.pitcher?.id;
  const batterId = currentPlay.matchup?.batter?.id;

  const {team: pitchTeam, player: pitcher} = getPlayerStats(boxscore, teams, pitcherId);
  const {team: batTeam, player: batter} = getPlayerStats(boxscore, teams, batterId);

  // Get pitcher handedness from gameData.players
  const pitcherInfo = players?.['ID' + pitcherId];
  const pitchHand = pitcherInfo?.pitchHand?.code; // "L" or "R"
  const pitchHandDisplay = pitchHand ? `${pitchHand}HP` : '';

  const display = `${pitchTeam.abbreviation} Pitching: ` +
    `{bold}${pitcher.person.fullName}{/bold} ${pitchHandDisplay} ${pitcher.stats.pitching.inningsPitched} IP, ${pitcher.stats.pitching.pitchesThrown || 0} P, ${pitcher.seasonStats.pitching.era} ERA\n` +
    `${batTeam.abbreviation} At Bat:   ` +
    `{bold}${batter.person.fullName}{/bold} ${batter.stats.batting.hits}-${batter.stats.batting.atBats}, ${batter.seasonStats.batting.avg} AVG, ${batter.seasonStats.batting.homeRuns} HR`;

  return (
    <box tags content={display} wrap={false} />
  );
}

export default Matchup;