import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { selectGame } from '../selectors/game';

const formatBase = (offense, base) => offense.has(base) ? '{yellow-fg}◆{/yellow-fg}' : '◇';

const Bases = ({align, game}) => {
  const offense = game.getIn(['liveData', 'linescore', 'offense']);
  const content = 
    `  ${formatBase(offense, 'second')}\n` + 
    `${formatBase(offense, 'third')}   ${formatBase(offense, 'first')}`;
  return (
    <box align={align} content={content} tags />
  );
};

Bases.propTypes = {
  align: PropTypes.string, 
  game: PropTypes.object,  
};

const mapStateToProps = state => ({
  game: selectGame(state),
});

export default connect(mapStateToProps)(Bases);