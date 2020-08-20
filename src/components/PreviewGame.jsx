import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { selectTeams, selectVenue, selectStartTime, selectBoxscore, selectProbablePitchers, selectGameStatus } from '../selectors/game';

const formatPitcherName = (pitcher) => {
  let display = pitcher.getIn(['person', 'fullName']);
  const number = pitcher.get('jerseyNumber');
  if (number) {
    display += `, #${number}`;
  }
  return display;
};

const formatTeam = (teams, probables, boxscore, homeAway) => {
  const pitcherId = probables.getIn([homeAway, 'id']);
  const pitcher = boxscore.getIn([homeAway, 'players', 'ID' + pitcherId]);
  let lines = [
    teams.getIn([homeAway, 'teamName']),
    `(${teams.getIn([homeAway, 'record', 'wins'])}-${teams.getIn([homeAway, 'record', 'losses'])})`,
  ];
  if (pitcher) {
    lines = lines.concat([
      '',
      formatPitcherName(pitcher),
      `${pitcher.getIn(['seasonStats', 'pitching', 'wins'])}-${pitcher.getIn(['seasonStats', 'pitching', 'losses'])}`,
      `${pitcher.getIn(['seasonStats', 'pitching', 'era'])} ERA ${pitcher.getIn(['seasonStats', 'pitching', 'strikeOuts'])} K`,
    ]);
  }
  return lines;
};

const PreviewGame = ({boxscore, probables, startTime, status, teams, venue}) => {
  const away = formatTeam(teams, probables, boxscore, 'away');
  const home = formatTeam(teams, probables, boxscore, 'home');
  const formattedStart = status.get('startTimeTBD') ? 
    'Start time TBD' : 
    moment(startTime).format('LLL');
  return (
    <element>
      <element height='60%'>
        <box content={away.join('\n')} width='33%-1' top='50%' align='center' />
        <box content={`\nvs.\n\n${formattedStart}\n${venue.get('name')}\n${venue.getIn(['location', 'city'])}, ${venue.getIn(['location', 'stateAbbrev'])}`} width='33%-1' left='33%' top='50%' align='center' />
        <box content={home.join('\n')} width='34%' top='50%' left='66%' align='center' />
      </element>
    </element>
  );
};

PreviewGame.propTypes = {
  boxscore: PropTypes.object,
  probables: PropTypes.object,
  startTime: PropTypes.string,
  status: PropTypes.object,
  teams: PropTypes.object,
  venue: PropTypes.object,
};

const mapStateToProps = state => ({
  boxscore: selectBoxscore(state),
  probables: selectProbablePitchers(state),
  startTime: selectStartTime(state),
  status: selectGameStatus(state),
  teams: selectTeams(state),
  venue: selectVenue(state),
});

export default connect(mapStateToProps)(PreviewGame);