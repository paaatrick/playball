import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import logger from '../logger'

import { fetchGame, selectGame, selectSelectedId, selectFullUpdateRequired } from '../features/games';

import PreviewGame from './PreviewGame';
import LiveGame from './LiveGame';
import FinishedGame from './FinishedGame';

function Game() {
  const dispatch = useDispatch()
  const game = useSelector(selectGame)
  const fullUpdateRequired = useSelector(selectFullUpdateRequired)
  const id = useSelector(selectSelectedId)
  const timerRef = useRef(null)
  const timestampRef = useRef()
  timestampRef.current = fullUpdateRequired ? null : game?.metaData?.timeStamp

  const updateGameData = () => {
    dispatch(fetchGame({id, start: timestampRef.current}))
      .unwrap()
      .then((result) => {
        const wait = ((result && result.metaData?.wait) || 10) * 1000;
        timerRef.current = setTimeout(updateGameData, wait);
      });
  }

  useEffect(() => {
    updateGameData()
    return () => {
      clearTimeout(timerRef.current)
    }
  }, [id])

  if (!game) { 
    return <element />;
  }

  let Wrapped = null;
  switch (game.gameData?.status?.abstractGameCode) {
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
    <element>{JSON.stringify(game)}</element>
  );
}

Game.propTypes = { };

export default Game;
