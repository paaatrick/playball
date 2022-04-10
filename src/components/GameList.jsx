import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { add, format } from 'date-fns';
import { fetchSchedule, selectData, selectLoading } from '../features/schedule'

import screen from '../screen';
import style from '../style';
import Grid from './Grid';
import useKey from '../hooks/useKey';

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
      content[0] = detailedState
    } else {
      content[0] = game.linescore.inningState + ' ' + game.linescore.currentInningOrdinal;
      if (detailedState !== 'In Progress') {
        content[0] += ' | ' + detailedState;
      }
    }
    if (game.linescore) {
        content[0] = content[0].padEnd(20) + ' H  R  E';
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
      content[0] = content[0].padEnd(20) + ' H  R  E';
      content[1] += game.linescore.teams.away.runs.toString().padStart(2) + 
        game.linescore.teams.away.hits.toString().padStart(3) + 
        game.linescore.teams.away.errors.toString().padStart(3);
      content[2] += game.linescore.teams.home.runs.toString().padStart(2) + 
        game.linescore.teams.home.hits.toString().padStart(3) + 
        game.linescore.teams.home.errors.toString().padStart(3);
    }
    break;
  }
  return content.map(s => ' ' + s).join('\n');
};

function GameList({ onGameSelect }) {
  const dispatch = useDispatch()
  const schedule = useSelector(selectData)
  const loading = useSelector(selectLoading)
  const timerRef = useRef(null)
  const [date, setDate] = useState(new Date())

  useEffect(() => {
    dispatch(fetchSchedule(date))
    timerRef.current = setInterval(() => dispatch(fetchSchedule(date)), 30000)
    return () => clearInterval(timerRef.current)
  }, [date])

  useKey('p', useCallback(() => setDate(prev => add(prev, { days: -1 })), []), { key: 'P', label: 'Prev Day' })
  useKey('n', useCallback(() => setDate(prev => add(prev, { days: 1 })), []), { key: 'N', label: 'Next Day' })
  useKey('t', useCallback(() => setDate(new Date()), []), { key: 'T', label: 'Today' })

  const handleGameSelect = (idx) => {
    const selected = schedule.dates[0].games[idx];
    onGameSelect(selected);
  }

  const messageStyle = {
    left: 0,
    top: 0,
    height: '100%',
    width: '100%',
    align: 'center',
    valign: 'middle',
  };

  if (!schedule && loading) {
    return <box {...messageStyle} content='Loading...' />;
  }

  if (schedule && !schedule.dates.length) {
    return <box {...messageStyle} content='No games today' />;
  }

  return (
    <element>
      <box top={0} left={0} width='100%' height={1} align='center' valign='middle' style={{ bg: 'white', fg: 'black' }} content={format(date, 'PPPP')}></box>
      <element top={2} left={0} width='100%' height='100%-2'>
        <Grid 
          items={schedule && schedule.dates.length > 0 ? schedule.dates[0].games.map(formatGame) : []}
          itemHeight={5}
          itemMinWidth={34}
          onSelect={handleGameSelect}
        />
      </element>
    </element>
  )
}

GameList.propTypes = {
  onGameSelect: PropTypes.func,
};

export default GameList;