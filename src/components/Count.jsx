import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { selectGame } from '../selectors/game';

const formatCount = (count, total) => '● '.repeat(count) + '○ '.repeat(total - count);

const Count = ({align, game}) => {
  const linescore = game.getIn(['liveData', 'linescore']);
  const content = 
    `B: {green-fg}${formatCount(linescore.get('balls'), 4)}{/green-fg}\n` + 
    `S: {red-fg}${formatCount(linescore.get('strikes'), 3)}{/red-fg}\n` + 
    `O: {red-fg}${formatCount(linescore.get('outs'), 3)}{/red-fg}`;
  return (
    <box align={align} content={content} tags />
  );
};

Count.propTypes = {
  align: PropTypes.string, 
  game: PropTypes.object,  
};

const mapStateToProps = state => ({
  game: selectGame(state),
});

export default connect(mapStateToProps)(Count);