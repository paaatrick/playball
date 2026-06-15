import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { selectLineScore, selectTeams, selectReview, selectAbsChallenges, selectGameStatus } from '../features/games.js';

// Visual gap separating the R/H/E block from the challenge columns.
const CHALLENGE_GAP = '      ';

// Renders a run of glyphs from [count, glyph] segments, e.g. ●●○.
const glyphs = (...segments) =>
  segments.map(([count, glyph]) => glyph.repeat(Math.max(0, count))).join('');

// ● = remaining, ○ = used (replay challenges expose no success/fail outcome).
const reviewCircles = (c) => glyphs([c.remaining, '●'], [c.used, '○']);

// ● = remaining, ○ = used successfully, × = used and lost.
const absCircles = (c) =>
  glyphs([c.remaining, '●'], [c.usedSuccessful, '○'], [c.usedFailed, '×']);

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
  const review = useSelector(selectReview);
  const absChallenges = useSelector(selectAbsChallenges);
  const status = useSelector(selectGameStatus);

  // A finished game can still be rendered by LiveGame (which doesn't pass
  // `final`), so derive game-over from status rather than trusting the prop.
  const isOver = final || status?.abstractGameCode === 'F';

  const currentInning = linescore.currentInning;
  if (!currentInning) {
    return '';
  }

  const totalInnings = Math.max(currentInning, 9);
  const home = teams.home.abbreviation;
  const away = teams.away.abbreviation;
  const teamNameLength = 3;

  // Build only the challenge columns whose data is present (and only while the
  // game is live — they're not meaningful once it's final). Each column's width
  // is fixed across all three rows so the grid stays aligned under `align`.
  const columns = [];
  if (!isOver && review?.away && review?.home) {
    columns.push({ header: 'C', away: reviewCircles(review.away), home: reviewCircles(review.home) });
  }
  if (!isOver && absChallenges?.away && absChallenges?.home) {
    columns.push({ header: 'ABS', away: absCircles(absChallenges.away), home: absCircles(absChallenges.home) });
  }
  columns.forEach(col => {
    col.width = Math.max(col.header.length, col.away.length, col.home.length);
  });

  const challengeSegment = (rowKey) =>
    columns.length === 0
      ? ''
      : CHALLENGE_GAP + columns.map(col => col[rowKey].padEnd(col.width)).join(' ');

  const str = ''.padEnd(teamNameLength) + Array.from(Array(totalInnings).keys()).map(i => (i + 1).toString().padStart(2)).join(' ') + '   {bold}R{/bold}  H  E' + challengeSegment('header') + '\n' +
    away.padEnd(teamNameLength) + getTeamLine(linescore, totalInnings, 'away', final) + challengeSegment('away') + '\n' +
    home.padEnd(teamNameLength) + getTeamLine(linescore, totalInnings, 'home', final) + challengeSegment('home');
  return (
    <box align={align} content={str} tags wrap={false} />
  );
}

LineScore.propTypes = {
  align: PropTypes.oneOf(['left', 'center', 'right']), 
  final: PropTypes.bool,
};

export default LineScore;
