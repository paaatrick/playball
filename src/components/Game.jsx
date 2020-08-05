import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { selectGame, selectSelectedId, selectFullUpdateRequired } from '../selectors/game';
import { fetchGame } from '../actions/game';

import PreviewGame from './PreviewGame';
import LiveGame from './LiveGame';
import FinishedGame from './FinishedGame';

class Game extends React.Component {
  componentDidMount() {
    this.updateGameData();
  }

  componentDidUpdate(prevProps) {
    if (this.props.id !== prevProps.id) {
      this.updateGameData();
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  updateGameData() {
    const { fetchGame, game, id, fullUpdateRequired } = this.props;
    const start = fullUpdateRequired ? null : (game && game.getIn(['metaData', 'timeStamp']));
    fetchGame(id, start)
      .then(() => {
        const wait = ((game && game.getIn(['metaData', 'wait'])) || 10) * 1000;
        this.timer = setTimeout(this.updateGameData.bind(this), wait);
      });    
  }

  render() {
    const { game } = this.props;
    if (!game || game.isEmpty()) { 
      return <element />;
    }
    let Wrapped = null;
    switch (game.getIn(['gameData', 'status', 'abstractGameCode'])) {
    case 'P':
      Wrapped = PreviewGame;
      break;
    case 'L':
      Wrapped = LiveGame;
      break;
    case 'F':
      Wrapped = FinishedGame;
      break;
    }
    return (
      <element><Wrapped /></element>
    );
  }
}

Game.propTypes = {
  fetchGame: PropTypes.func,
  game: PropTypes.object,
  id: PropTypes.number,
  fullUpdateRequired: PropTypes.bool,
};

const mapStateToProps = state => ({
  game: selectGame(state),
  fullUpdateRequired: selectFullUpdateRequired(state),
  id: selectSelectedId(state),
});

const mapDispatchToProps = {
  fetchGame
};

export default connect(mapStateToProps, mapDispatchToProps)(Game);