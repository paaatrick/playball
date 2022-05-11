import React from 'react';
import { useSelector } from 'react-redux';
import { selectAllPlays, selectTeams } from '../features/games';

import style from '../style';


function getPlayResultColor(play) {
  const lastPlay = play.playEvents[play.playEvents.length - 1].details;
  if (lastPlay.isBall) {
    return 'green';
  } else if (lastPlay.isStrike) {
    return 'red';
  } else if (lastPlay.isInPlay && !play.about.hasOut) {
    return 'blue';
  } else {
    return 'white';
  }
}

function formatOut(out) {
  return ` {bold}${out} out{/bold}`;
}


function AllPlays() {
  const plays = useSelector(selectAllPlays);
  const teams = useSelector(selectTeams);

  const formatScoreDetail = (scoreObj) => (
    ' {bold}{white-bg}{black-fg} ' + 
    `${teams.away.abbreviation} ${scoreObj.awayScore} - ` +
    `${teams.home.abbreviation} ${scoreObj.homeScore}` + 
    ' {/black-fg}{/white-bg}{/bold}'
  );

  let inning = '';
  const lines = [];
  plays && plays.slice().reverse().forEach((play, playIdx, plays) => {
    let lastPlay;
    if (playIdx > 0) {
      lastPlay = plays[playIdx - 1];
    }
    const playInning = play.about.halfInning + ' ' + play.about.inning;
    if (playInning !== inning) {
      inning = playInning;
      if (lines.length > 0) {
        lines.push('');
      }
      lines.push(`{bold}[${inning.toUpperCase()}]{/bold}`);
    }

    if (play.about.isComplete) {
      const color = getPlayResultColor(play);
      let line = `{${color}-fg}[${play.result.event}]{/${color}-fg} ${play.result.description}`;
      if (play.about.hasOut) {
        line += formatOut(play.count.outs);
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
          line += `[${event.details.event}] `;
        }
        line += event.details.description;
        if (event.isScoringPlay || event.details.isScoringPlay) {
          line += formatScoreDetail(event.details);
        }
        const currentOut = event.count?.outs;
        let prevOut = lastPlay ? lastPlay.count.outs : 0;
        if (eventIdx > 0) {
          prevOut = events[eventIdx - 1].count?.outs;
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

export default AllPlays;