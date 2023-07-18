import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import { get } from '../config.js';
import { selectLineScore } from '../features/games.js';

const formatCount = (count, total) => '● '.repeat(count) + '○ '.repeat(total - count);

function Count({align}) {
  const linescore = useSelector(selectLineScore);
  const content = 
    `B: {${get('color.ball')}-fg}${formatCount(linescore.balls, 4)}{/}\n` + 
    `S: {${get('color.strike')}-fg}${formatCount(linescore.strikes, 3)}{/}\n` + 
    `O: {${get('color.out')}-fg}${formatCount(linescore.outs, 3)}{/}`;
  return (
    <box align={align} content={content} tags />
  );
}

Count.propTypes = {
  align: PropTypes.oneOf(['left', 'center', 'right']),
};

export default Count;