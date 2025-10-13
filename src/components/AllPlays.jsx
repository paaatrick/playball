import React from 'react';
import { useSelector } from 'react-redux';
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
  return ` {bold}${out} out{/}`;
}


function AllPlays({ focused = true }) {
  const plays = useSelector(selectAllPlays);
  const teams = useSelector(selectTeams);

  const formatScoreDetail = (scoreObj) => (
    ` {bold}{${get('color.in-play-runs-bg')}-bg}{${get('color.in-play-runs-fg')}-fg} ` + 
    `${teams.away.abbreviation} ${scoreObj.awayScore} - ` +
    `${teams.home.abbreviation} ${scoreObj.homeScore}` + 
    ' {/}'
  );

  let inning = '';
  const lines = [];
  plays && plays.slice().reverse().forEach((play, playIdx, plays) => {
    let lastPlay;
    if (playIdx < plays.length - 1) {
      lastPlay = plays[playIdx + 1];
    }
    const playInning = play.about.halfInning + ' ' + play.about.inning;
    if (playInning !== inning) {
      inning = playInning;
      if (lines.length > 0) {
        lines.push('');
      }
      lines.push(`{bold}[${inning.toUpperCase()}]{/}`);
    }

    if (play.about.isComplete) {
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
      lines.push(line);
    }

    play.playEvents && play.playEvents.slice().reverse().forEach((event, eventIdx, events) => {
      if (event.type === 'action') {
        let line = '';
        if (event.details.event) {
          line += `{${get('color.other-event')}-fg}[${event.details.event}]{/} `;
        }
        line += event.details.description;
        if (event.isScoringPlay || event.details.isScoringPlay) {
          line += formatScoreDetail(event.details);
        }
        const currentOut = event.count?.outs;
        let prevOut = lastPlay ? lastPlay.count.outs : 0;
        if (eventIdx < events.length - 1) {
          prevOut = events[eventIdx + 1].count?.outs;
        }
        if (currentOut > prevOut) {
          line += formatOut(currentOut);
        }
        lines.push(line);
      }
    });
  });
  return (
    <box
      content={lines.join('\n')}
      focused={focused}
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

export default AllPlays;