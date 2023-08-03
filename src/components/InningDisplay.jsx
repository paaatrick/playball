import React from 'react';
import { useSelector } from 'react-redux';

import { selectLineScore } from '../features/games.js';

function InningDisplay() {
  const linescore = useSelector(selectLineScore);
  const content = [
    linescore.isTopInning ? '▲' : '',
    linescore.currentInning,
    linescore.isTopInning ? '' : '▼'
  ].join('\n');

  return (
    <box content={content} align='right' />
  );
}

export default InningDisplay;
