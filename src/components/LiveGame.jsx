import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

import Count from './Count.js';
import Bases from './Bases.js';
import LineScore from './LineScore.js';
import Matchup from './Matchup.js';
import AtBat from './AtBat.js';
import AllPlays from './AllPlays.js';
import InningDisplay from './InningDisplay.js';

import { get } from '../config.js';
import { selectGameStatus, selectLineScore, selectTeams } from '../features/games.js';
import { resetTitle, setTitle } from '../screen.js';

function LiveGame()  {
  const gameStatus = useSelector(selectGameStatus);
  const linescore = useSelector(selectLineScore);
  const teams = useSelector(selectTeams);

  useEffect(() => {
    if (get('title')) {
      const homeRuns = linescore.teams['home'].runs;
      const awayRuns = linescore.teams['away'].runs;
      const home = teams.home.abbreviation;
      const away = teams.away.abbreviation;

      let inning = '';
      if (gameStatus.detailedState === 'Postponed') {
        inning = 'PPD';
      } else if (gameStatus.detailedState === 'Cancelled') {
        inning = 'C';
      } else if (gameStatus.detailedState === 'Final') {
        inning = 'F';
      } else if (gameStatus.detailedState !== 'Pre-Game' && gameStatus.detailedState !== 'Warmup') {
        const currentInning = linescore.currentInning;
        if (currentInning) {
          const upDown = linescore.isTopInning ? '▲' : '▼';
          inning = ` ${upDown} ${currentInning}`;
        }
      }

      setTitle(`${away} ${awayRuns} - ${home} ${homeRuns}${inning}`);

      return () => {
        resetTitle();
      };
    }
  }, [gameStatus, get, linescore, resetTitle, setTitle, teams]);

  return (
    <element>
      <element top={0} left={1} width='100%-1' height={3}>
        <element left={0} width={2}>
          <InningDisplay />
        </element>
        <element left={5} width='25%-5'>
          <Count />
        </element>
        <element left='25%+1' width='25%'>
          <Bases />
        </element>
        <element left='50%+2' width='50%-2'>
          <LineScore />
        </element>
      </element>
      <line orientation='horizontal' type='line' top={3} width='100%' />
      <element top={4} left={1}>
        <element width='50%-1'>
          <element top={0} height={2}>
            <Matchup />
          </element>
          <element top={3}>
            <AtBat />
          </element>
        </element>
        <line orientation='vertical' type='line' left='50%' />
        <element left='50%+2' width='50%-2'>
          <AllPlays />
        </element>
      </element>
    </element>
  );
}

export default LiveGame;