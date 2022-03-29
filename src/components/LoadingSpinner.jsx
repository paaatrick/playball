import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { selectLoading } from '../features/schedule';

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
  const [frame, setFrame] = useState(0)
  const [animating, setAnimating] = useState(false)
  const timerRef = useRef(null)
  const scheduleLoading = useSelector(selectLoading)
  const gameLoading = false

  const increment = () => {
    setFrame(prevFrame => (prevFrame + 1) % frames.length);
  }

  const doUpdate = () => {
    if (!animating && (gameLoading || scheduleLoading)) {
      setAnimating(true)
      increment();
      timerRef.current = setInterval(increment, 50);
    }
    if (!gameLoading && !scheduleLoading && frame === 0) {
      setAnimating(false)
      clearInterval(timerRef.current);
    }
  }

  useEffect(() => {
    doUpdate()
  }, [gameLoading, scheduleLoading, frame])

  return <box content={animating ? frames[frame] : ' '} />;
}

LoadingSpinner.propTypes = { };

export default LoadingSpinner;