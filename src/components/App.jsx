import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import GameList from './GameList';
import Game from './Game';
import HelpBar from './HelpBar';

import { setSelectedGame } from '../actions/game';
import { selectSelectedId } from '../selectors/game';

import winston from 'winston';

class App extends React.Component {
  componentDidMount() {
    const { onKeyPress, setSelectedGame } = this.props;
    onKeyPress(['l'], () => setSelectedGame(null));
  }

  componentDidCatch(error, info) {
    winston.error(error);
    winston.error(JSON.stringify(info, null, 2));
  }
  
  render() {
    const { selectedGame, setSelectedGame } = this.props;
    try {
      return (
        <element>
          <element top={0} left={0} height='100%-1'>
            {selectedGame ? 
              <Game /> : 
              <GameList onGameSelect={game => setSelectedGame(game.gamePk)} />
            }
          </element>
          <element top='100%-1' left={0} height={1}>
            <HelpBar />
          </element>
        </element>
      );
    } catch (error) {
      this.props.debug(error);
    }
  }
}

App.propTypes = {
  debug: PropTypes.func,
  onKeyPress: PropTypes.func,
  selectedGame: PropTypes.number,
  setSelectedGame: PropTypes.func,
};

const mapStateToProps = state => ({
  selectedGame: selectSelectedId(state)
});

const mapDispatchToProps = {
  setSelectedGame
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
