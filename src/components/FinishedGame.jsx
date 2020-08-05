import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { selectLineScore, selectTeams, selectDecisions, selectBoxscore, selectGameStatus } from '../selectors/game';
import LineScore from './LineScore';

const getPlayer = (id, boxscore) => {
  const homePlayer = boxscore.getIn(['home', 'players', 'ID' + id]);
  if (homePlayer !== undefined) {
    return homePlayer;
  }
  return boxscore.getIn(['away', 'players', 'ID' + id]);
};

const formatDecisions = (decisions, boxscore) => {
  if (!decisions) {
    return '';
  }
  const content = [];
  const winner = decisions.get('winner');
  if (winner) {
    const pitcher = getPlayer(winner.get('id'), boxscore);
    content.push(`Win:  ${pitcher.getIn(['person', 'fullName'])} (${pitcher.getIn(['seasonStats', 'pitching', 'wins'])}-${pitcher.getIn(['seasonStats', 'pitching', 'losses'])})`);
  }
  const loser = decisions.get('loser');
  if (loser) {
    const pitcher = getPlayer(loser.get('id'), boxscore);
    content.push(`Loss: ${pitcher.getIn(['person', 'fullName'])} (${pitcher.getIn(['seasonStats', 'pitching', 'wins'])}-${pitcher.getIn(['seasonStats', 'pitching', 'losses'])})`);
  }
  const save = decisions.get('save');
  if (save) {
    const pitcher = getPlayer(save.get('id'), boxscore);
    content.push(`Save: ${pitcher.getIn(['person', 'fullName'])} (${pitcher.getIn(['seasonStats', 'pitching', 'saves'])})`);
  }
  return content.join('\n');
};

const formatScore = (status, linescore) => {
  let display = '';
  if (status.get('detailedState') === 'Postponed') {
    display = status.get('detailedState');
    if (status.get('reason')) {
      display += '\n' + status.get('reason');
    }
  } else {
    display = `\n${linescore.getIn(['teams', 'away', 'runs'])} - ${linescore.getIn(['teams', 'home', 'runs'])}`;
  }
  return display;
};

const FinishedGame = ({boxscore, decisions, linescore, status, teams}) => {
  const awayTeam = `${teams.getIn(['away', 'teamName'])}\n(${teams.getIn(['away', 'record', 'wins'])}-${teams.getIn(['away', 'record', 'losses'])})`;
  const homeTeam = `${teams.getIn(['home', 'teamName'])}\n(${teams.getIn(['home', 'record', 'wins'])}-${teams.getIn(['home', 'record', 'losses'])})`;
  return (
    <element>
      <element height='60%'>
        <box content={awayTeam} width='33%-1' top='50%' align='center' />
        <box content={formatScore(status, linescore)} width='33%-1' left='33%' top='50%' align='center' />
        <box content={homeTeam} width='34%' top='50%' left='66%' align='center' />
      </element>
      <element top='60%+1' height={3}>
        <LineScore align='center' final />
      </element>
      <element top='60%+5' left='50%-20'>
        <box content={formatDecisions(decisions, boxscore)} />
      </element>
    </element>
  );
};

FinishedGame.propTypes = {
  boxscore: PropTypes.object,
  decisions: PropTypes.object,
  linescore: PropTypes.object,
  status: PropTypes.object,
  teams: PropTypes.object,
};

const mapStateToProps = state => ({
  boxscore: selectBoxscore(state),
  decisions: selectDecisions(state),
  linescore: selectLineScore(state),
  status: selectGameStatus(state),
  teams: selectTeams(state),
});

export default connect(mapStateToProps)(FinishedGame);