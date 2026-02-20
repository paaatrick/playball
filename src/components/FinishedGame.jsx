import React, {useEffect, useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import figlet from 'figlet';

import LineScore from './LineScore.js';

import {get} from '../config.js';
import {
  selectBoxscore,
  selectDecisions,
  selectGameStatus,
  selectLineScore,
  selectSelectedId,
  selectTeams,
  setReplayGame
} from '../features/games.js';
import {resetTitle, setTitle} from '../screen.js';
import useKey from '../hooks/useKey.js';
import BoxScore from './BoxScore.js';
import AllPlays from './AllPlays.js';

const BOX_SCORE = 'BOX_SCORE';
const ALL_PLAYS = 'ALL_PLAYS';
const SCORING_PLAYS = 'SCORING_PLAYS';

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

function FinishedGame() {
  const dispatch = useDispatch();
  const id = useSelector(selectSelectedId);
  const boxscore = useSelector(selectBoxscore);
  const decisions = useSelector(selectDecisions);
  const linescore = useSelector(selectLineScore);
  const status = useSelector(selectGameStatus);
  const teams = useSelector(selectTeams);
  const [view, setView] = React.useState(BOX_SCORE);

  useKey(
    'r',
    () => dispatch(setReplayGame(id)),
    { key: 'R', label: 'Replay' }
  );
  useKey('b', () => setView(BOX_SCORE), { key: 'B', label: 'Box Score' });
  useKey('a', () => setView(ALL_PLAYS), { key: 'A', label: 'All Plays' });
  useKey('p', () => setView(SCORING_PLAYS), { key: 'P', label: 'Scoring Plays' });

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

  const bigTextOptions = { font: 'Small Block' };
  const awayTeam = `${teams.away.teamName}\n(${teams.away.record.wins}-${teams.away.record.losses})`;
  const awayRuns = useMemo(() => (
    figlet.textSync(linescore.teams.away.runs, bigTextOptions)
  ), [linescore.teams.away.runs]);
  const homeTeam = `${teams.home.teamName}\n(${teams.home.record.wins}-${teams.home.record.losses})`;
  const homeRuns = useMemo(() => (
    figlet.textSync(linescore.teams.home.runs, bigTextOptions)
  ), [linescore.teams.home.runs]);
  return (
    <element>
      {status.detailedState === 'Postponed' ? (
        <element>
          <box top={1}>status.detailedState</box>
          <box top={2}>{status.reason}</box>
        </element>
      ) : (
        <element top={1}>
          <box
            top={1}
            left={0}
            width='25%'
            content={awayTeam}
            align='right'
          />
          <box
            top={0}
            left='25%'
            width='25%'
            content={awayRuns}
            align='center'
          />
          <box
            top={0}
            left='50%'
            width='25%'
            content={homeRuns}
            align='center'
          />
          <box
            top={1}
            left='75%'
            width='25%'
            content={homeTeam}
            align='left'
          />
          <element
            top={5}
            left={0}
            width='50%-2'
          >
            <LineScore align='right' final />
          </element>
          <element
            top={5}
            left='50%+2'
            width='50%-2'
            align='right'
          >
            <box content={formatDecisions(decisions, boxscore)} />
          </element>
          <element top={9}>
            { view === BOX_SCORE && <BoxScore /> }
            { view === ALL_PLAYS && <AllPlays /> }
            { view === SCORING_PLAYS && <AllPlays scoringOnly /> }
          </element>
        </element>
      )}
    </element>
  );
}

export default FinishedGame;