import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import GameList from './GameList';
import HelpBar from './HelpBar';
import { selectSelectedId, setSelectedId } from '../features/games';
import Game from './Game';
import useKey from '../hooks/useKey';


function App() {
  const dispatch = useDispatch()
  const selectedGameId = useSelector(selectSelectedId)

  useKey('c', () => dispatch(setSelectedId(null)), { key: 'C', label: 'Schedule' });
  
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

export default App;
