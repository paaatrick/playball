import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import {format} from 'date-fns';

import {get} from '../config.js';
import {formatExceptionalGameStatus, getAnnouncedGameTime} from '../gameStatus.js';
import {resetTitle, setTitle} from '../screen.js';

const teamName = (team, fallback) => team?.name || team?.teamName || team?.abbreviation || fallback;

function StatusGame({game}) {
  const status = game.gameData?.status || {};
  const teams = game.gameData?.teams || {};
  const away = teamName(teams.away, 'Away');
  const home = teamName(teams.home, 'Home');
  const statusText = formatExceptionalGameStatus(status);
  const announcedTime = getAnnouncedGameTime(game);
  const timeText = announcedTime
    ? `\nAnnounced time: ${format(new Date(announcedTime), 'MMMM d, yyy p')}`
    : '';

  useEffect(() => {
    if (get('title')) {
      const awayTitle = teams.away?.abbreviation || away;
      const homeTitle = teams.home?.abbreviation || home;
      setTitle(`${awayTitle} - ${homeTitle} | ${statusText}`);
      return () => resetTitle();
    }
  }, [away, home, statusText, teams]);

  return (
    <element height='60%'>
      <box content={away} width='33%-1' top='50%' align='center' />
      <box content={`\nvs.\n\n${statusText}${timeText}`} width='33%-1' left='33%' top='50%' align='center' />
      <box content={home} width='34%' top='50%' left='66%' align='center' />
    </element>
  );
}

StatusGame.propTypes = {
  game: PropTypes.object.isRequired,
};

export default StatusGame;
