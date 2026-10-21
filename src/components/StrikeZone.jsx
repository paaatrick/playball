import React from 'react';
import { useSelector } from 'react-redux';

import { selectCurrentPlay } from '../features/games.js';
import { getStrikeZoneRows } from '../strikeZone.js';

function StrikeZone() {
  const currentPlay = useSelector(selectCurrentPlay);
  const rows = getStrikeZoneRows(currentPlay?.playEvents);
  return <box content={rows.join('\n')} tags wrap={false} />;
}

export default StrikeZone;
