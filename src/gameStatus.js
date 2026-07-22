import {format, isSameDay} from 'date-fns';

const DELAYED = /^delayed(?: start)?(?:\b|$)/i;
const IN_GAME_DELAY = /^in progress\s*-\s*delay(?:ed)?(?:\b|$)/i;
const CANCELLED = /^cancel(?:l)?ed(?:\b|$)/i;
const POSTPONED = /^postponed(?:\b|$)/i;

const matches = (value, pattern) => typeof value === 'string' && pattern.test(value.trim());

export function getExceptionalGameState(status = {}) {
  const states = [status.detailedState, status.abstractGameState];

  if (status.codedGameState === 'C') {
    return 'cancelled';
  }
  if (status.codedGameState === 'D') {
    return 'postponed';
  }
  if (states.some(state => matches(state, CANCELLED))) {
    return 'cancelled';
  }
  if (states.some(state => matches(state, POSTPONED))) {
    return 'postponed';
  }
  if (states.some(state => matches(state, DELAYED) || matches(state, IN_GAME_DELAY))) {
    return 'delayed';
  }
  return null;
}

export function formatExceptionalGameStatus(status = {}) {
  const state = getExceptionalGameState(status);
  if (!state) {
    return null;
  }

  const detailedState = status.detailedState?.trim();
  const statePattern = state === 'delayed'
    ? [DELAYED, IN_GAME_DELAY]
    : [state === 'cancelled' ? CANCELLED : POSTPONED];
  const fallback = state === 'delayed'
    ? 'Delayed'
    : state.charAt(0).toUpperCase() + state.slice(1);
  let text = detailedState && statePattern.some(pattern => matches(detailedState, pattern))
    ? detailedState
    : fallback;
  const reason = status.reason?.trim();
  if (reason && !text.toLowerCase().includes(reason.toLowerCase())) {
    text += ' | ' + reason;
  }
  return text;
}

export function getAnnouncedGameTime(game = {}) {
  return game.resumeDate
    || game.rescheduleDate
    || game.gameData?.datetime?.resumeDateTime
    || game.gameData?.datetime?.rescheduleDateTime
    || null;
}

export function formatAnnouncedGameTime(game = {}, scheduleDate) {
  const announcedTime = getAnnouncedGameTime(game);
  if (!announcedTime) {
    return null;
  }

  const announcedDate = new Date(announcedTime);
  const timeFormat = scheduleDate && isSameDay(announcedDate, scheduleDate) ? 'p' : 'MMM d p';
  return format(announcedDate, timeFormat);
}
