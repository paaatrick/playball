import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { selectLineScore, selectTeams } from '../features/games.js';

const getRuns = (inning, homeAway, isFinal) => {
  const runs = inning[homeAway].runs;
  if (runs !== undefined) {
    return runs;
  }
  return isFinal ? 'X' : '';
};

const getTeamLine = (linescore, totalInnings, homeAway, final) => (
  linescore.innings
    .map(inning => getRuns(inning, homeAway, final))
    .map(r => r.toString().padStart(2))
    .join(' ')
    .padEnd(totalInnings * 3) + 
  '{bold}' + 
  linescore.teams[homeAway].runs.toString().padStart(3) + '{/bold}' +
  linescore.teams[homeAway].hits.toString().padStart(3) + 
  linescore.teams[homeAway].errors.toString().padStart(3)   
);

function LineScore({ align, final }) {
  const linescore = useSelector(selectLineScore);
  const teams = useSelector(selectTeams);

  const currentInning = linescore.currentInning;
  if (!currentInning) {
    return '';
  }

  const totalInnings = Math.max(currentInning, 9);
  const home = teams.home.abbreviation;
  const away = teams.away.abbreviation;
  const teamNameLength = 3;
  let str = ''.padEnd(teamNameLength) + Array.from(Array(totalInnings).keys()).map(i => (i + 1).toString().padStart(2)).join(' ') + '   {bold}R{/bold}  H  E\n' + 
    away.padEnd(teamNameLength) + getTeamLine(linescore, totalInnings, 'away', final) + '\n' +
    home.padEnd(teamNameLength) + getTeamLine(linescore, totalInnings, 'home', final);
  return (
    <box align={align} content={str} tags wrap={false} />
  );
}

LineScore.propTypes = {
  align: PropTypes.oneOf(['left', 'center', 'right']), 
  final: PropTypes.bool,
};

export default LineScore;
