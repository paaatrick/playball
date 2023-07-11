import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectLoading as selectScheduleLoading } from '../features/schedule.js';
import { selectLoading as gamesLoading } from '../features/games.js';

const frames = [
  '⠋',
  '⠙',
  '⠹',
  '⠸',
  '⠼',
  '⠴',
  '⠦',
  '⠧',
  '⠇',
  '⠏'
];

function LoadingSpinner() { 
  const [frame, setFrame] = useState(0);
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef(null);
  const scheduleLoading = useSelector(selectScheduleLoading);
  const gameLoading = useSelector(gamesLoading);

  const increment = () => {
    setFrame(prevFrame => (prevFrame + 1) % frames.length);
  };

  const doUpdate = () => {
    if (!animating && (gameLoading || scheduleLoading)) {
      setAnimating(true);
      increment();
      timerRef.current = setInterval(increment, 50);
    }
    if (!gameLoading && !scheduleLoading && frame === 0) {
      setAnimating(false);
      clearInterval(timerRef.current);
    }
  };

  useEffect(() => {
    doUpdate();
  }, [gameLoading, scheduleLoading, frame]);

  return <box content={animating ? frames[frame] : ' '} />;
}

export default LoadingSpinner;