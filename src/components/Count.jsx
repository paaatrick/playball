import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import { selectLineScore } from '../features/games';

const formatCount = (count, total) => '● '.repeat(count) + '○ '.repeat(total - count);

function Count({align}) {
  const linescore = useSelector(selectLineScore);
  const content = 
    `B: {green-fg}${formatCount(linescore.balls, 4)}{/green-fg}\n` + 
    `S: {red-fg}${formatCount(linescore.strikes, 3)}{/red-fg}\n` + 
    `O: {red-fg}${formatCount(linescore.outs, 3)}{/red-fg}`;
  return (
    <box align={align} content={content} tags />
  );
};

Count.propTypes = {
  align: PropTypes.oneOf(['left', 'center', 'right']),
};

export default Count;