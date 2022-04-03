import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { fetchSchedule, selectData, selectLoading } from '../features/schedule'

import style from '../style';

const formatGame = game => {
  const startTime = format(new Date(game.gameDate), 'p');
  const start = (game.doubleHeader === 'Y' && game.gameNumber > 1) ? 
    'Game ' + game.gameNumber :
    startTime;
  const teamName = (team) => `${team.team.teamName} (${team.leagueRecord.wins}-${team.leagueRecord.losses})`;
  let content = `${start.padStart(8)}  ${teamName(game.teams.away)} at ${teamName(game.teams.home)}`;
  const gameState = game.status.abstractGameCode;
  const detailedState = game.status.detailedState;
  switch (gameState) {
  case 'P':
    break;
  case 'L':
    if (detailedState !== 'In Progress') {
      content += ' | ' + detailedState;
    }
    if (game.linescore) {
      content += ' | ' + 
        game.linescore.inningState + ' ' + game.linescore.currentInningOrdinal + ' | ' +
        game.teams.away.team.abbreviation + ' ' + game.linescore.teams.away.runs + ' - ' + 
        game.teams.home.team.abbreviation + ' ' + game.linescore.teams.home.runs;
    }
    break;
  case 'F':
    content += ' | ' + detailedState;
    if (game.status.reason) {
      content += ' | ' + game.status.reason;
    }
    if (game.linescore) {
      content += ' | ' +
        game.teams.away.team.abbreviation + ' ' + game.linescore.teams.away.runs + ' - ' + 
        game.teams.home.team.abbreviation + ' ' + game.linescore.teams.home.runs;
    }
    break;
  }
  return content;
};

function GameList({ onGameSelect }) {
  const dispatch = useDispatch()
  const schedule = useSelector(selectData)
  const loading = useSelector(selectLoading)

  useEffect(() => {
    dispatch(fetchSchedule())
  }, [])

  const handleGameSelect = (item, idx) => {
    const selected = schedule.dates[0].games[idx];
    onGameSelect(selected);
  }

  const messageStyle = {
    left: 'center',
    top: 'center',
    height: '80%',
    width: '80%',
    border: {type: 'line'},
    align: 'center',
    valign: 'middle',
  };

  if (loading) {
    return <box {...messageStyle} content='Loading...' />;
  }

  if (schedule && !schedule.dates.length) {
    return <box {...messageStyle} content='No games today' />;
  }

  return (
    <list left='center'
      top='center'
      width='80%'
      height='80%'
      keys
      vi
      focused
      border={{type: 'line'}}
      label=' Select a game '
      scrollbar={style.scrollbar}
      style={style.list}
      items={schedule && schedule.dates.length > 0 ? schedule.dates[0].games.map(formatGame) : []}
      onSelect={handleGameSelect}
    />
  );
}

GameList.propTypes = {
  onGameSelect: PropTypes.func,
};

export default GameList;