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
  } else if (lastPlay.isInPlay && lastPlay.description.indexOf(', out') < 0) {
    return 'blue';
  } else {
    return 'white';
  }
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
  plays && plays.slice().reverse().forEach(play => {
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
        line += ` {bold}${play.count.outs} out{/bold}`;
      }
      if (play.about.isScoringPlay) {
        line += formatScoreDetail(play.result);
      }
      lines.push(line);
    }

    play.playEvents && play.playEvents.slice().reverse().forEach(event => {
      if (event.type === 'action') {
        let line = '';
        if (event.details.event) {
          line += `[${event.details.event}] `;
        }
        line += event.details.description;
        if (event.isScoringPlay) {
          line += formatScoreDetail(event.details);
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