import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { selectAllPlays, selectTeams } from '../features/games.js';

import { get } from '../config.js';
import style from '../style/index.js';


function getPlayResultColor(play) {
  const lastPlay = play.playEvents[play.playEvents.length - 1]?.details;
  if (!lastPlay) {
    return get('color.other-event');
  } else if (lastPlay.isBall) {
    return get('color.walk');
  } else if (lastPlay.isStrike) {
    return get('color.strike-out');
  } else if (lastPlay.isInPlay && !play.about.hasOut) {
    return get('color.in-play-no-out');
  } else {
    return get('color.in-play-out');
  }
}

function formatOut(out) {
  return ` {bold}${out} out${out > 1 ? 's' : ''}{/}`;
}


function AllPlays({ reverse, scoringOnly }) {
  const plays = useSelector(selectAllPlays);
  const teams = useSelector(selectTeams);

  const formatScoreDetail = (scoreObj) => (
    ` {bold}{${get('color.in-play-runs-bg')}-bg}{${get('color.in-play-runs-fg')}-fg} ` + 
    `${teams.away.abbreviation} ${scoreObj.awayScore} - ` +
    `${teams.home.abbreviation} ${scoreObj.homeScore}` + 
    ' {/}'
  );

  const playsByInning = {};
  plays?.forEach((play) => {
    const playInning = play.about.halfInning + ' ' + play.about.inning;

    play.playEvents?.forEach((event) => {
      if (event.type === 'action') {
        if (scoringOnly && !event.details.isScoringPlay) {
          return;
        }
        if (event.details.eventType === 'batter_timeout' || event.details.eventType === 'mound_visit') {
          return;
        }
        let line = '';
        if (event.details.event) {
          line += `{${get('color.other-event')}-fg}[${event.details.event}]{/} `;
        }
        line += event.details.description;
        if (event.details.isOut) {
          line += formatOut(event.count?.outs);
        }
        if (event.isScoringPlay || event.details.isScoringPlay) {
          line += formatScoreDetail(event.details);
        }
        if (!(playInning in playsByInning)) {
          playsByInning[playInning] = [];
        }
        playsByInning[playInning].push(line);
      }
    });

    if (play.about.isComplete && (!scoringOnly || play.about.isScoringPlay)) {
      const color = getPlayResultColor(play);
      let line = `{${color}-fg}[${play.result.event}]{/} ${play.result.description}`;
      if (play.about.hasOut) {
        const lastOut = play.playEvents[play.playEvents.length - 1].count.outs;
        if (lastOut !== play.count.outs) {
          line += formatOut(play.count.outs);
        }
      }
      if (play.about.isScoringPlay) {
        line += formatScoreDetail(play.result);
      }
      if (!(playInning in playsByInning)) {
        playsByInning[playInning] = [];
      }
      playsByInning[playInning].push(line);
    }
  });

  const lines = [];
  const inningKeys = Object.keys(playsByInning);
  if (reverse) {
    inningKeys.reverse();
  }
  inningKeys.forEach(inning => {
    if (lines.length > 0) {
      lines.push('');
    }
    lines.push(`{bold}[${inning.toUpperCase()}]{/}`);
    if (reverse) {
      lines.push(...playsByInning[inning].slice().reverse());
    } else {
      lines.push(...playsByInning[inning]);
    }
  });

  if (lines.length === 0) {
    if (scoringOnly) {
      lines.push('No scoring plays yet');
    } else {
      lines.push('No plays yet');
    }
  }

  return (
    <box
      content={lines.join('\n')}
      focused 
      mouse 
      keys 
      vi
      scrollable 
      scrollbar={style.scrollbar} 
      alwaysScroll 
      tags
    />
  );
}

AllPlays.propTypes = {
  reverse: PropTypes.bool,
  scoringOnly: PropTypes.bool,
};

export default AllPlays;