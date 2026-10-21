import React from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentPlay } from '../features/games.js';
import { getPitchColor, getPitchEvents, getPitchMarker } from '../strikeZone.js';

function AtBat() {
  const currentPlay = useSelector(selectCurrentPlay);
  const playEvents = currentPlay.playEvents;
  const playResult = currentPlay.about.isComplete ? currentPlay.result.description : '';

  // Each pitch is marked the same way it is in the strike zone, so that the
  // two can be read against each other
  const markers = new Map();
  getPitchEvents(playEvents).forEach((pitch, index) => {
    const marker = getPitchMarker(pitch, index);
    markers.set(pitch, `{${getPitchColor(pitch)}-fg}{bold}${marker}{/bold}{/} `);
  });

  function formatEventReview(event, idx, allEvents) {
    let reviewDetails = undefined;
    if (event.reviewDetails) {
      // If the event has review details, we can use them directly
      reviewDetails = event.reviewDetails;
    } else {
      // If the event doesn't have review details, check if this is the last pitch event and then
      // check the current play's review details
      if (event.isPitch && allEvents.slice(0, idx).every((e) => !e.isPitch)) {
        reviewDetails = currentPlay.reviewDetails;
      }
    }
    if (reviewDetails) {
      if (reviewDetails.inProgress) {
        return ' - Challenged';
      } else if (reviewDetails.isOverturned !== undefined) {
        return reviewDetails.isOverturned ? ' - Overturned' : ' - Upheld';
      }
    }
    return '';
  }

  let content = '';
  if (playResult) {
    content += `${playResult}\n\n`;
  } 
  if (playEvents && playEvents.length) {
    content += playEvents.slice().reverse().map((event, idx, allEvents) => {
      let line = markers.get(event) || '  ';
      if (event.isPitch) {
        line += `[${event.details.description}${formatEventReview(event, idx, allEvents)}] `;
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
    }).join('\n');
  }
  return (
    <box content={content} tags />
  );
}

export default AtBat;
