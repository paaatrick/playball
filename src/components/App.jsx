import React from 'react';
import PropTypes from 'prop-types';
import GameList from './GameList';
// import Game from './Game';
import HelpBar from './HelpBar';
// import fs from 'fs';

// import { setSelectedGame } from '../actions/game';
// import { selectGame, selectSelectedId } from '../selectors/game';

// import winston from 'winston';

function App() {
  // componentDidMount() {
  //   const { onKeyPress, setSelectedGame } = this.props;
  //   onKeyPress(['l'], () => setSelectedGame(null));
  //   onKeyPress(['C-d'], () => {
  //     const { selectedGame, game } = this.props;
  //     fs.writeFileSync(
  //       selectedGame + '_' + Date.now() + '.json',
  //       JSON.stringify(game, null, 2)
  //     );
  //   });
  // }
  
  return (
    <element>
      <element top={0} left={0} height='100%-1'>
        <GameList onGameSelect={() => {}} />
      </element>
      <element top='100%-1' left={0} height={1}>
        <HelpBar />
      </element>
    </element>
  );
}

App.propTypes = {
  debug: PropTypes.func,
  onKeyPress: PropTypes.func,
  selectedGame: PropTypes.number,
  setSelectedGame: PropTypes.func,
  game: PropTypes.object,
};

export default App;
