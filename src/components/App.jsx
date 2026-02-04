import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import GameList from './GameList.js';
import HelpBar from './HelpBar.js';
import { setReplayGame, setLiveGame } from '../features/games.js';
import Game from './Game.js';
import useKey from '../hooks/useKey.js';
import Standings from './Standings.js';

const SCHEDULE = 'schedule';
const STANDINGS = 'standings';
const GAME = 'game';

function App({ replayId }) {
  const [view, setView] = useState(SCHEDULE);
  const dispatch = useDispatch();

  useKey('c', () => {
    setView(SCHEDULE);
    dispatch(setLiveGame(null));
  }, { key: 'C', label: 'Schedule' });
  useKey('s', () => setView(STANDINGS), { key: 'S', label: 'Standings'});

  const handleGameSelect = (game) => {
    dispatch(setLiveGame(game.gamePk));
    setView(GAME);
  };

  useEffect(() => {
    if (replayId) {
      dispatch(setReplayGame(replayId))
        .unwrap()
        .then(() => setView(GAME))
        .catch(() => setView(SCHEDULE));
    }
  }, [replayId]);
  
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

App.propTypes = {
  replayId: PropTypes.string,
};

export default App;
