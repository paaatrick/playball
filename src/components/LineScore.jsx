import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { selectLineScore, selectTeams } from '../selectors/game';

const getRuns = (inning, homeAway, isFinal) => {
  const runs = inning.getIn([homeAway, 'runs']);
  if (runs !== undefined) {
    return runs;
  }
  return isFinal ? 'X' : '';
};

const getTeamLine = (linescore, totalInnings, homeAway, final) => (
  linescore.get('innings')
    .map(inning => getRuns(inning, homeAway, final))
    .map(r => r.toString().padStart(2))
    .join(' ')
    .padEnd(totalInnings * 3) + 
  '{bold}' + 
  linescore.getIn(['teams', homeAway, 'runs']).toString().padStart(3) + '{/bold}' +
  linescore.getIn(['teams', homeAway, 'hits']).toString().padStart(3) + 
  linescore.getIn(['teams', homeAway, 'errors']).toString().padStart(3)   
);

class LineScore extends React.Component {
  render() {
    const { align, final, linescore, teams } = this.props;
    const currentInning = linescore.get('currentInning');
    if (!currentInning) {
      return '';
    }
    const totalInnings = Math.max(currentInning, 9);
    const home = teams.getIn(['home', 'abbreviation']);
    const away = teams.getIn(['away', 'abbreviation']);
    const teamNameLength = 3;
    let str = ''.padEnd(teamNameLength) + Array.from(Array(totalInnings).keys()).map(i => (i + 1).toString().padStart(2)).join(' ') + '   {bold}R{/bold}  H  E\n' + 
      away.padEnd(teamNameLength) + getTeamLine(linescore, totalInnings, 'away', final) + '\n' +
      home.padEnd(teamNameLength) + getTeamLine(linescore, totalInnings, 'home', final);
    return (
      <box align={align} content={str} tags wrap={false} />
    );
  }
}

LineScore.propTypes = {
  align: PropTypes.string, 
  final: PropTypes.bool,
  linescore: PropTypes.object,
  teams: PropTypes.object,
};

const mapStateToProps = state => ({
  linescore: selectLineScore(state),
  teams: selectTeams(state),
});

export default connect(mapStateToProps)(LineScore);
