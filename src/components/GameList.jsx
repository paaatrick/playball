import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { add, format } from 'date-fns';
import { fetchSchedule, selectData, selectLoading } from '../features/schedule.js';

import Grid from './Grid.js';
import useKey from '../hooks/useKey.js';

const formatGame = game => {
  const startTime = format(new Date(game.gameDate), 'p');
  const start = (game.doubleHeader === 'Y' && game.gameNumber > 1) ? 
    'Game ' + game.gameNumber :
    startTime;
  const teamName = (team) => `${team.team.teamName} (${team.leagueRecord.wins}-${team.leagueRecord.losses})`.padEnd(20);
  let content = [start, teamName(game.teams.away), teamName(game.teams.home)];
  const gameState = game.status.abstractGameCode;
  const detailedState = game.status.detailedState;
  switch (gameState) {
  case 'P':
    break;
  case 'L':
    if (detailedState === 'Warmup') {
      content[0] = detailedState;
    } else {
      content[0] = game.linescore.inningState + ' ' + game.linescore.currentInningOrdinal;
      if (detailedState !== 'In Progress') {
        content[0] += ' | ' + detailedState;
      }
    }
    if (game.linescore) {
      content[0] = content[0].padEnd(20) + ' R  H  E';
      content[1] += game.linescore.teams.away.runs.toString().padStart(2) + 
          game.linescore.teams.away.hits.toString().padStart(3) + 
          game.linescore.teams.away.errors.toString().padStart(3);
      content[2] += game.linescore.teams.home.runs.toString().padStart(2) + 
          game.linescore.teams.home.hits.toString().padStart(3) + 
          game.linescore.teams.home.errors.toString().padStart(3);
    }
    break;
  case 'F':
    content[0] = detailedState;
    if (game.status.reason) {
      content[0] += ' | ' + game.status.reason;
    }
    if (game.linescore) {
      if (game.linescore.currentInning !== game.scheduledInnings) {
        content[0] += '/' + game.linescore.currentInning;
      }
      content[0] = content[0].padEnd(20) + ' R  H  E';
      content[1] += game.linescore.teams.away.runs.toString().padStart(2) + 
        game.linescore.teams.away.hits.toString().padStart(3) + 
        game.linescore.teams.away.errors.toString().padStart(3);
      content[2] += game.linescore.teams.home.runs.toString().padStart(2) + 
        game.linescore.teams.home.hits.toString().padStart(3) + 
        game.linescore.teams.home.errors.toString().padStart(3);
      if (game.teams.away.isWinner) {
        content[1] = `{bold}${content[1]}{/bold}`;
      }
      if (game.teams.home.isWinner) {
        content[2] = `{bold}${content[2]}{/bold}`;
      }
    }
    break;
  }
  return content.map(s => ' ' + s).join('\n');
};

const GAME_STATE_ORDER = {
  L: 0,
  P: 1,
  F: 2,
};
function compareGameState(a, b) {
  return GAME_STATE_ORDER[a.status.abstractGameCode] - GAME_STATE_ORDER[b.status.abstractGameCode];
}

function compareGameInnings(a, b) {
  const inningCompare = b.linescore.currentInning - a.linescore.currentInning;
  if (inningCompare !== 0) {
    return inningCompare;
  }
  if (a.isTopInning && !b.isTopInning) {
    return -1;
  }
  if (b.isTopInning && !a.isTopInning) {
    return 1;
  }
  return 0;
}

function compareGames(a, b) {
  const stateCompare = compareGameState(a, b);
  if (stateCompare !== 0) {
    return stateCompare;
  }

  if (a.status.abstractGameCode === 'L') {
    const inningCompare = compareGameInnings(a, b);
    if (inningCompare !== 0) {
      return inningCompare;
    }
  }

  return 0;
}

function GameList({ onGameSelect }) {
  const dispatch = useDispatch();
  const schedule = useSelector(selectData);
  const loading = useSelector(selectLoading);
  const timerRef = useRef(null);
  const [date, setDate] = useState(new Date());
  let games = [];
  if (schedule && schedule.dates.length > 0) {
    games = schedule.dates[0].games.slice().sort(compareGames);
  }

  useEffect(() => {
    dispatch(fetchSchedule(date));
    timerRef.current = setInterval(() => dispatch(fetchSchedule(date)), 30000);
    return () => clearInterval(timerRef.current);
  }, [date]);

  useKey('p', useCallback(() => setDate(prev => add(prev, { days: -1 })), []), { key: 'P', label: 'Prev Day' });
  useKey('n', useCallback(() => setDate(prev => add(prev, { days: 1 })), []), { key: 'N', label: 'Next Day' });
  useKey('t', useCallback(() => setDate(new Date()), []), { key: 'T', label: 'Today' });

  const handleGameSelect = (idx) => {
    const selected = games[idx];
    onGameSelect(selected);
  };

  const messageStyle = {
    left: 0,
    top: 0,
    height: '100%',
    width: '100%',
    align: 'center',
    valign: 'middle',
  };

  return (
    <element>
      <box top={0} left={0} width='100%' height={1} align='center' valign='middle' style={{ bg: 'white', fg: 'black' }} content={format(date, 'PPPP')}></box>
      <element top={2} left={0} width='100%' height='100%-2'>
        {(!schedule && loading) && <box {...messageStyle} content='Loading...' />}
        {(schedule && games.length === 0) && <box {...messageStyle} content='No games today' />}
        {(schedule && games.length > 0) && (
          <Grid 
            items={games.map(formatGame)}
            itemHeight={5}
            itemMinWidth={34}
            onSelect={handleGameSelect}
          />
        )}
      </element>
    </element>
  );
}

GameList.propTypes = {
  onGameSelect: PropTypes.func,
};

export default GameList;