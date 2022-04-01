import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { selectCurrentPlay } from '../features/games';

function AtBat() {
  const currentPlay = useSelector(selectCurrentPlay);
  const playEvents = currentPlay.playEvents;
  const playResult = currentPlay.about.isComplete ? currentPlay.result.description : '';
  const content = playEvents && playEvents.map(event => {
    let line = '';
    if (event.isPitch) {
      line = `[${event.details.description}] `;
      if (event.pitchData?.startSpeed) {
        line += `${event.pitchData.startSpeed} MPH `;
      }
      if (event.details?.type?.description) {
        line += event.details.type.description;
      }
      if (!event.details?.isInPlay) {
        line += `{|} ${event.count.balls}-${event.count.strikes}`;
      }
    } else {
      if (event.details?.event) {
        line += `[${event.details.event}] `;
      }
      line += event.details.description;
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

export default AtBat;