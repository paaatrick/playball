import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { format, isSameDay } from 'date-fns';

import { get } from '../config.js';
import { selectTeams, selectVenue, selectStartTime, selectBoxscore, selectProbablePitchers, selectGameStatus } from '../features/games.js';
import { resetTitle, setTitle } from '../screen.js';

const formatPitcherName = (pitcher) => {
  let display = pitcher.person.fullName;
  const number = pitcher.jerseyNumber;
  if (number) {
    display += `, #${number}`;
  }
  return display;
};

const formatTeam = (teams, probables, boxscore, homeAway) => {
  const pitcherId = probables[homeAway]?.id;
  const pitcher = boxscore[homeAway].players['ID' + pitcherId];
  let lines = [
    teams[homeAway].teamName,
    `(${teams[homeAway].record.wins}-${teams[homeAway].record.losses})`,
  ];
  if (pitcher) {
    lines = lines.concat([
      '',
      formatPitcherName(pitcher),
      `${pitcher.seasonStats?.pitching?.wins}-${pitcher.seasonStats?.pitching?.losses}`,
      `${pitcher.seasonStats?.pitching?.era} ERA ${pitcher.seasonStats?.pitching?.strikeOuts} K`,
    ]);
  } else {
    lines = lines.concat(['TBD']);
  }
  return lines;
};

function PreviewGame() {
  const boxscore = useSelector(selectBoxscore);
  const probables = useSelector(selectProbablePitchers);
  const startTime = useSelector(selectStartTime);
  const status = useSelector(selectGameStatus);
  const teams = useSelector(selectTeams);
  const venue = useSelector(selectVenue);
  const away = formatTeam(teams, probables, boxscore, 'away');
  const home = formatTeam(teams, probables, boxscore, 'home');
  const formattedStart = status.startTimeTBD ? 'Start time TBD' : format(new Date(startTime), 'MMMM d, yyy p');

  useEffect(() => {
    if (get('title')) {
      const home = teams.home.abbreviation;
      const away = teams.away.abbreviation;

      // Only show the date if it's not today.
      const startDate = new Date(startTime);
      const today = new Date();
      let start = format(startDate, 'p');
      if (!isSameDay(startDate, today)) {
        start = `${format(startDate, 'MMMM d, yyy')} ${start}`;
      }

      setTitle(`${away} - ${home} @ ${start}`);

      return () => {
        resetTitle();
      };
    }
  }, [get, resetTitle, setTitle, startTime, teams]);

  return (
    <element>
      <element height='60%'>
        <box content={away.join('\n')} width='33%-1' top='50%' align='center' />
        <box content={`\nvs.\n\n${formattedStart}\n${venue.name}\n${venue.location.city}, ${venue.location.stateAbbrev}`} width='33%-1' left='33%' top='50%' align='center' />
        <box content={home.join('\n')} width='34%' top='50%' left='66%' align='center' />
      </element>
    </element>
  );
}

export default PreviewGame;