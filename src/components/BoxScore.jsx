import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import {getBoxScoreLayout} from '../boxScore.js';
import {
  selectBoxscore,
  selectGameInfo,
  selectPitchingNotes,
  selectPlayers,
} from '../features/games.js';
import getScreen from '../screen.js';
import style from '../style/index.js';
import Table from './Table.js';

function InfoBox({ lines, ...rest }) {
  if (lines.length === 0) {
    return null;
  }
  return (
    <box
      {...rest}
      height={lines.length}
      wrap={false}
      tags
      content={lines.join('\n')}
    />
  );
}

InfoBox.propTypes = {
  lines: PropTypes.arrayOf(PropTypes.string).isRequired,
};

function BoxScore({ ...props }) {
  const boxscore = useSelector(selectBoxscore);
  const players = useSelector(selectPlayers);
  const gameInfo = useSelector(selectGameInfo);
  const pitchingNotes = useSelector(selectPitchingNotes);

  // The layout depends on how the info text wraps, which depends on how wide
  // the box score ends up being
  const containerRef = useRef(null);
  const [width, setWidth] = useState(() => getScreen().width);
  const measure = useCallback(() => {
    const measured = containerRef.current?.width;
    if (measured > 0) {
      setWidth(measured);
    }
  }, []);
  useEffect(measure);
  useEffect(() => {
    const screen = getScreen();
    screen.on('resize', measure);
    return () => screen.removeListener('resize', measure);
  }, [measure]);

  const {
    away,
    home,
    gameInfoLines,
    teamInfoTop,
    pitcherTop,
    gameInfoTop,
  } = getBoxScoreLayout({ boxscore, players, gameInfo, pitchingNotes, width });

  const batterHeader = ['Batters', 'AB', 'R', 'H', 'RBI', 'BB', 'K', 'AVG', 'OPS'];
  const batterWidths = ['auto', 4, 4, 4, 4, 4, 4, 6, 6];
  const pitcherHeader = ['Pitchers', 'IP', 'H', 'R', 'ER', 'BB', 'K', 'HR', 'ERA'];
  const pitcherWidths = ['auto', 5, 4, 4, 4, 4, 4, 4, 6];

  return (
    <element
      {...props}
      ref={containerRef}
      focused
      mouse
      keys
      vi
      scrollable
      scrollbar={style.scrollbar}
      alwaysScroll
    >
      <Table
        top={0}
        left={0}
        width='50%-1'
        headers={batterHeader}
        widths={batterWidths}
        rows={away.batterRows}
      />
      <Table
        top={0}
        left='50%+1'
        width='50%-1'
        headers={batterHeader}
        widths={batterWidths}
        rows={home.batterRows}
      />
      <InfoBox
        top={teamInfoTop}
        left={0}
        width='50%-1'
        lines={away.infoLines}
      />
      <InfoBox
        top={teamInfoTop}
        left='50%+1'
        width='50%-1'
        lines={home.infoLines}
      />
      <Table
        top={pitcherTop}
        left={0}
        width='50%-1'
        headers={pitcherHeader}
        widths={pitcherWidths}
        rows={away.pitcherRows}
      />
      <Table
        top={pitcherTop}
        left='50%+1'
        width='50%-1'
        headers={pitcherHeader}
        widths={pitcherWidths}
        rows={home.pitcherRows}
      />
      <InfoBox
        top={gameInfoTop}
        left={0}
        width='100%-1'
        lines={gameInfoLines}
      />
    </element>
  );
}

export default BoxScore;
