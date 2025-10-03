import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

import LineScore from './LineScore.js';

import { get } from '../config.js';
import { selectLineScore, selectTeams, selectDecisions, selectBoxscore, selectGameStatus } from '../features/games.js';
import { resetTitle, setTitle } from '../screen.js';

const getPlayer = (id, boxscore) => {
  const homePlayer = boxscore.home?.players?.['ID' + id];
  if (homePlayer !== undefined) {
    return homePlayer;
  }
  return boxscore.away?.players['ID' + id];
};

const formatDecisions = (decisions, boxscore) => {
  if (!decisions) {
    return '';
  }
  const content = [];
  const winner = decisions.winner;
  if (winner) {
    const pitcher = getPlayer(winner.id, boxscore);
    content.push(`Win:  ${pitcher.person.fullName} (${pitcher.seasonStats?.pitching?.wins}-${pitcher.seasonStats?.pitching?.losses})`);
  }
  const loser = decisions.loser;
  if (loser) {
    const pitcher = getPlayer(loser.id, boxscore);
    content.push(`Loss: ${pitcher.person.fullName} (${pitcher.seasonStats?.pitching?.wins}-${pitcher.seasonStats?.pitching?.losses})`);
  }
  const save = decisions.save;
  if (save) {
    const pitcher = getPlayer(save.id, boxscore);
    content.push(`Save: ${pitcher.person.fullName} (${pitcher.seasonStats?.pitching.saves})`);
  }
  return content.join('\n');
};

const formatScore = (status, linescore) => {
  let display = '';
  if (status.detailedState === 'Postponed') {
    display = status.detailedState;
    if (status.reason) {
      display += '\n' + status.reason;
    }
  } else {
    display = `\n${linescore.teams.away.runs} - ${linescore.teams.home.runs}`;
  }
  return display;
};

function FinishedGame() {
  const boxscore = useSelector(selectBoxscore);
  const decisions = useSelector(selectDecisions);
  const linescore = useSelector(selectLineScore);
  const status = useSelector(selectGameStatus);
  const teams = useSelector(selectTeams);

  useEffect(() => {
    if (get('title')) {
      const homeRuns = linescore.teams['home'].runs;
      const awayRuns = linescore.teams['away'].runs;
      const home = teams.home.abbreviation;
      const away = teams.away.abbreviation;

      setTitle(`${away} ${awayRuns} - ${home} ${homeRuns} F`);

      return () => {
        resetTitle();
      };
    }
  }, [get, linescore, resetTitle, setTitle, teams]);

  const awayTeam = `${teams.away.teamName}\n(${teams.away.record.wins}-${teams.away.record.losses})`;
  const homeTeam = `${teams.home.teamName}\n(${teams.home.record.wins}-${teams.home.record.losses})`;
  return (
    <element>
      <element height='60%'>
        <box content={awayTeam} width='33%-1' top='50%' align='center' />
        <box content={formatScore(status, linescore)} width='33%-1' left='33%' top='50%' align='center' />
        <box content={homeTeam} width='34%' top='50%' left='66%' align='center' />
      </element>
      <element top='60%+1' height={3}>
        <LineScore align='center' final />
      </element>
      <element top='60%+5' left='50%-20'>
        <box content={formatDecisions(decisions, boxscore)} />
      </element>
    </element>
  );
}

export default FinishedGame;