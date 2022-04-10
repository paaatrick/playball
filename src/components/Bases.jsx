import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { selectLineScore } from '../features/games';

const formatBase = (offense, base) => (base in offense) ? '{yellow-fg}◆{/yellow-fg}' : '◇';

function Bases({align}) {
  const { offense } = useSelector(selectLineScore);
  const content = 
    `  ${formatBase(offense, 'second')}\n` + 
    `${formatBase(offense, 'third')}   ${formatBase(offense, 'first')}`;
  return (
    <box align={align} content={content} tags />
  );
}

Bases.propTypes = {
  align: PropTypes.oneOf(['left', 'center', 'right']),
};

export default Bases;