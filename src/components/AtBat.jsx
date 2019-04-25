import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { selectCurrentPlay } from '../selectors/game';

const AtBat = ({currentPlay}) => {
  const playEvents = currentPlay.get('playEvents');
  const playResult = currentPlay.getIn(['about', 'isComplete']) ? 
    currentPlay.getIn(['result', 'description']) : '';
  const content = playEvents && playEvents.map(event => {
    let line = '';
    if (event.get('isPitch')) {
      line = `[${event.getIn(['details', 'description'])}] `;
      if (event.hasIn(['pitchData', 'startSpeed'])) {
        line += `${event.getIn(['pitchData', 'startSpeed'])} MPH `;
      }
      line += event.getIn(['details', 'type', 'description']);
      if (!event.getIn(['details', 'isInPlay'])) {
        line += `{|} ${event.getIn(['count', 'balls'])}-${event.getIn(['count', 'strikes'])}`;
      }
    } else {
      if (event.getIn(['details', 'event'])) {
        line += `[${event.getIn(['details', 'event'])}] `;
      }
      line += event.getIn(['details', 'description']);
    }
    return line;
  }).join('\n') + `\n\n${playResult}`;
  return (
    <box content={content} tags />
  );
};

AtBat.propTypes = {
  boxscore: PropTypes.object,
  currentPlay: PropTypes.object,
};

const mapStateToProps = state => ({
  currentPlay: selectCurrentPlay(state),
});

export default connect(mapStateToProps)(AtBat);