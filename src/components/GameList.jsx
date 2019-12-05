import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import moment from 'moment';
import { selectLoading, selectError, selectData } from '../selectors/schedule';
import { fetchSchedule } from '../actions/schedule';

import style from '../style';

const formatGame = game => {
  const start = moment(game.gameDate)
    .format('LT')
    .padStart(8);
  const teamName = (team) => `${team.team.teamName} (${team.leagueRecord.wins}-${team.leagueRecord.losses})`;
  let content = `${start}  ${teamName(game.teams.away)} at ${teamName(game.teams.home)}`;
  const gameState = game.status.abstractGameCode;
  const detailedState = game.status.detailedState;
  switch (gameState) {
  case 'P':
    break;
  case 'L':
    if (detailedState !== 'In Progress') {
      content += ' | ' + detailedState;
    }
    if (game.linescore) {
      content += ' | ' + 
        game.linescore.inningState + ' ' + game.linescore.currentInningOrdinal + ' | ' +
        game.teams.away.team.abbreviation + ' ' + game.linescore.teams.away.runs + ' - ' + 
        game.teams.home.team.abbreviation + ' ' + game.linescore.teams.home.runs;
    }
    break;
  case 'F':
    content += ' | ' + detailedState;
    if (game.status.reason) {
      content += ' | ' + game.status.reason;
    }
    if (game.linescore) {
      content += ' | ' +
        game.teams.away.team.abbreviation + ' ' + game.linescore.teams.away.runs + ' - ' + 
        game.teams.home.team.abbreviation + ' ' + game.linescore.teams.home.runs;
    }
    break;
  }
  return content;
};

class GameList extends React.Component {
  constructor(props) {
    super(props);
    this.handleGameSelect = this.handleGameSelect.bind(this);
  }

  componentDidMount() {
    this.props.fetchSchedule();
  }

  handleGameSelect(item, idx) {
    const { onGameSelect, schedule } = this.props;
    const selected = schedule.dates[0].games[idx];
    onGameSelect(selected);
  }

  render() {
    const { loading, schedule } = this.props;
    const messageStyle = {
      left: 'center',
      top: 'center',
      height: '80%',
      width: '80%',
      border: {type: 'line'},
      align: 'center',
      valign: 'middle',
    };

    if (loading) {
      return <box {...messageStyle} content='Loading...' />;
    }

    if (schedule && !schedule.dates.length) {
      return <box {...messageStyle} content='No games today' />;
    }

    return (
      <list left='center'
        top='center'
        width='80%'
        height='80%'
        keys
        vi
        focused
        border={{type: 'line'}}
        label=' Select a game '
        scrollbar={style.scrollbar}
        style={style.list}
        items={schedule && schedule.dates.length > 0 ? schedule.dates[0].games.map(formatGame) : []}
        onSelect={this.handleGameSelect}
      />
    );
  }
}

GameList.propTypes = {
  error: PropTypes.object,
  fetchSchedule: PropTypes.func,
  loading: PropTypes.bool,
  onGameSelect: PropTypes.func,
  schedule: PropTypes.object,
};

const mapStateToProps = state => ({
  loading: selectLoading(state),
  error: selectError(state),
  schedule: selectData(state),
});

const mapDispatchToProps = {
  fetchSchedule
};

export default connect(mapStateToProps, mapDispatchToProps)(GameList);