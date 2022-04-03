import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import GameList from './GameList';
import HelpBar from './HelpBar';
import { selectSelectedId, setSelectedId } from '../features/games';
import Game from './Game';


function App({ onKeyPress }) {
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
  onKeyPress: PropTypes.func,
};

export default App;
