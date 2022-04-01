import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import GameList from './GameList';
// import Game from './Game';
import HelpBar from './HelpBar';
import { selectSelectedId, setSelectedId } from '../features/games';
import Game from './Game';
// import fs from 'fs';

// import { setSelectedGame } from '../actions/game';
// import { selectGame, selectSelectedId } from '../selectors/game';

// import winston from 'winston';

function App({ onKeyPress }) {
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
  const dispatch = useDispatch()
  const selectedGameId = useSelector(selectSelectedId)

  useEffect(() => {
    onKeyPress(['l'], () => dispatch(setSelectedId(null)))
  }, [])
  
  return (
    <element>
      <element top={0} left={0} height='100%-1'>
        { selectedGameId ? <Game /> : <GameList onGameSelect={game => dispatch(setSelectedId(game.gamePk))} /> }
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
};

export default App;
