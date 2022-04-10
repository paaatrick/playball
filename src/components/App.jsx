import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import GameList from './GameList';
import HelpBar from './HelpBar';
import { setSelectedId } from '../features/games';
import Game from './Game';
import useKey from '../hooks/useKey';
import Standings from './Standings';

const SCHEDULE = 'schedule';
const STANDINGS = 'standings';
const GAME = 'game';

function App() {
  const [view, setView] = useState(SCHEDULE);
  const dispatch = useDispatch();

  useKey('c', () => {
    setView(SCHEDULE);
    dispatch(setSelectedId(null));
  }, { key: 'C', label: 'Schedule' });
  useKey('s', () => setView(STANDINGS), { key: 'S', label: 'Standings'});

  const handleGameSelect = (game) => {
    dispatch(setSelectedId(game.gamePk));
    setView(GAME);
  };
  
  return (
    <element>
      <element top={0} left={0} height='100%-1'>
        {view === STANDINGS && <Standings />}
        {view === SCHEDULE && <GameList onGameSelect={handleGameSelect} />}
        {view === GAME && <Game />}
      </element>
      <element top='100%-1' left={0} height={1}>
        <HelpBar />
      </element>
    </element>
  );
}

export default App;
