import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { selectAllPlays, selectTeams } from '../selectors/game';

import style from '../style';

class AllPlays extends React.Component {
  render() {
    const { plays, teams } = this.props;
    let inning = '';
    const lines = [];
    plays && plays.reverse().forEach(play => {
      const playInning = play.getIn(['about', 'halfInning']) + ' ' + play.getIn(['about', 'inning']);
      if (playInning !== inning) {
        inning = playInning;
        lines.push(`{yellow-fg}[${inning.toUpperCase()}]{/yellow-fg}`);
      }
      if (play.getIn(['about', 'isComplete'])) {
        let line = `[${play.getIn(['result', 'event'])}] ${play.getIn(['result', 'description'])}`;
        if (play.getIn(['about', 'hasOut'])) {
          line += `{bold}${play.getIn(['count', 'outs'])} out{/bold}`;
        }
        if (play.getIn(['about', 'isScoringPlay'])) {
          line += '{bold}{white-bg}{black-fg} ' + 
            `${teams.getIn(['away', 'abbreviation'])} ${play.getIn(['result', 'awayScore'])} - ` +
            `${teams.getIn(['home', 'abbreviation'])} ${play.getIn(['result', 'homeScore'])}` + 
            ' {/black-fg}{/white-bg}{/bold}';
        }
        lines.push(line);
      }
      play.get('playEvents') && play.get('playEvents').reverse().forEach(event => {
        if (event.get('type') === 'action') {
          let line = '';
          if (event.getIn(['details', 'event'])) {
            line += `[${event.getIn(['details', 'event'])}] `;
          }
          line += event.getIn(['details', 'description']);
          if (event.get('isScoringPlay')) {
            line += '{white-bg}{black-fg}{bold}' +
              `${teams.getIn(['away', 'abbreviation'])} ${event.getIn(['details', 'awayScore'])} - ` + 
              `${teams.getIn(['home', 'abbreviation'])} ${event.getIn(['details', 'homeScore'])}` + 
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
}

AllPlays.propTypes = {
  plays: PropTypes.object,
  teams: PropTypes.object,
};

const mapStateToProps = state => ({
  plays: selectAllPlays(state),
  teams: selectTeams(state),
});

export default connect(mapStateToProps)(AllPlays);