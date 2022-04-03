import React from 'react';
import { useSelector } from 'react-redux';
import { selectAllPlays, selectTeams } from '../features/games';

import style from '../style';

function AllPlays() {
  const plays = useSelector(selectAllPlays);
  const teams = useSelector(selectTeams);

  let inning = '';
  const lines = [];
  plays && plays.slice().reverse().forEach(play => {
    const playInning = play.about.halfInning + ' ' + play.about.inning;
    if (playInning !== inning) {
      inning = playInning;
      lines.push(`{yellow-fg}[${inning.toUpperCase()}]{/yellow-fg}`);
    }
    if (play.about.isComplete) {
      let line = `[${play.result.event}] ${play.result.description}`;
      if (play.about.hasOut) {
        line += ` {bold}${play.count.outs} out{/bold}`;
      }
      if (play.about.isScoringPlay) {
        line += ' {bold}{white-bg}{black-fg} ' + 
          `${teams.away.abbreviation} ${play.result.awayScore} - ` +
          `${teams.home.abbreviation} ${play.result.homeScore}` + 
          ' {/black-fg}{/white-bg}{/bold}';
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
          line += ' {white-bg}{black-fg}{bold}' +
            `${teams.away.abbreviation} ${event.details.awayScore} - ` + 
            `${teams.home.abbreviation} ${event.details.homeScore}` + 
            '{/bold}{/black-fg}{/white-bg}';
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