import React from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentPlay } from '../features/games.js';
import { get } from '../config.js';

import style from '../style/index.js';

function AtBat({ focused = false }) {
  const currentPlay = useSelector(selectCurrentPlay);
  const playEvents = currentPlay.playEvents;
  const playResult = currentPlay.about.isComplete ? currentPlay.result.description : '';

  // Filter pitches with coordinates (same as PitchPlot)
  const pitches = playEvents ? playEvents.filter(e => e.isPitch && e.pitchData?.coordinates) : [];

  // Helper to get pitch number matching PitchPlot logic
  const getPitchNumber = (event) => {
    const pitchIndex = pitches.findIndex(p => p === event);
    if (pitchIndex === -1) return null; // No coordinates
    return (pitchIndex + 1) % 10; // Same as PitchPlot
  };

  // Get color for pitch based on result (same as PitchPlot)
  const getPitchColor = (event) => {
    const desc = event.details?.description?.toLowerCase() || '';

    if (event.details?.isInPlay) {
      return get('color.in-play-no-out');
    } else if (desc.includes('ball') || desc.includes('pitchout')) {
      return get('color.ball');
    } else if (desc.includes('called strike') || desc.includes('swinging strike') || desc.includes('foul')) {
      return get('color.strike');
    }

    return 'white';
  };

  let content = '';
  if (playResult) {
    content += `${playResult}\n\n`;
  }
  if (playEvents && playEvents.length) {
    content += playEvents.slice().reverse().map(event => {
      let line = '';
      if (event.isPitch) {
        line = `[${event.details.description}] `;
        if (event.pitchData?.startSpeed) {
          line += `${event.pitchData.startSpeed} MPH `;
        }
        if (event.details?.type?.description) {
          line += event.details.type.description;
        }

        // Add pitch number with color coding (for all pitches with coordinates)
        const pitchNum = getPitchNumber(event);
        if (pitchNum !== null) {
          const color = getPitchColor(event);
          if (event.details?.isInPlay) {
            // In-play: just show colored pitch number (no count)
            line += `{|} {${color}-fg}(${pitchNum}){/}`;
          } else {
            // Not in-play: show colored pitch number + count
            line += `{|} {${color}-fg}(${pitchNum}){/} ${event.count.balls}-${event.count.strikes}`;
          }
        } else if (!event.details?.isInPlay) {
          // No coordinates, not in-play: just show count
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
    <box
      content={content}
      tags
      focused={focused}
      mouse
      keys
      vi
      scrollable
      scrollbar={style.scrollbar}
      alwaysScroll
    />
  );
}

export default AtBat;