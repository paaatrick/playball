import React from 'react';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import { selectTeams, selectVenue, selectStartTime, selectBoxscore, selectProbablePitchers, selectGameStatus } from '../features/games';

const formatPitcherName = (pitcher) => {
  let display = pitcher.person.fullName;
  const number = pitcher.jerseyNumber;
  if (number) {
    display += `, #${number}`;
  }
  return display;
};

const formatTeam = (teams, probables, boxscore, homeAway) => {
  const pitcherId = probables[homeAway].id;
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
  return (
    <element>
      <element height='60%'>
        <box content={away.join('\n')} width='33%-1' top='50%' align='center' />
        <box content={`\nvs.\n\n${formattedStart}\n${venue.name}\n${venue.location.city}, ${venue.location.stateAbbrev}`} width='33%-1' left='33%' top='50%' align='center' />
        <box content={home.join('\n')} width='34%' top='50%' left='66%' align='center' />
      </element>
    </element>
  );
};

export default PreviewGame;