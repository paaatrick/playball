import assert from 'assert';

import {
  formatAnnouncedGameTime,
  formatExceptionalGameStatus,
  getAnnouncedGameTime,
  getExceptionalGameState
} from '../src/gameStatus.js';
import {compareGameInnings} from '../src/gameSort.js';

assert.strictEqual(getExceptionalGameState({detailedState: 'Delayed Start'}), 'delayed');
assert.strictEqual(getExceptionalGameState({detailedState: 'Delayed: Rain'}), 'delayed');
assert.strictEqual(getExceptionalGameState({detailedState: 'Delayed Start: Rain'}), 'delayed');
assert.strictEqual(getExceptionalGameState({detailedState: 'In Progress - Delay'}), 'delayed');
assert.strictEqual(getExceptionalGameState({detailedState: 'In Progress - Delay: Rain'}), 'delayed');
assert.strictEqual(getExceptionalGameState({detailedState: 'Cancelled: Rain'}), 'cancelled');
assert.strictEqual(getExceptionalGameState({detailedState: 'Postponed: Rain'}), 'postponed');
assert.strictEqual(getExceptionalGameState({codedGameState: 'C'}), 'cancelled');
assert.strictEqual(getExceptionalGameState({codedGameState: 'D'}), 'postponed');
assert.strictEqual(
  getExceptionalGameState({codedGameState: 'C', detailedState: 'Delayed Start'}),
  'cancelled'
);
assert.strictEqual(
  getExceptionalGameState({codedGameState: 'D', detailedState: 'In Progress - Delay'}),
  'postponed'
);

assert.strictEqual(
  formatExceptionalGameStatus({detailedState: 'Delayed Start: Rain', reason: 'Rain'}),
  'Delayed Start: Rain'
);
assert.strictEqual(
  formatExceptionalGameStatus({detailedState: 'Delayed Start', reason: 'Rain'}),
  'Delayed Start | Rain'
);
assert.strictEqual(
  formatExceptionalGameStatus({codedGameState: 'C', reason: 'Rain'}),
  'Cancelled | Rain'
);

assert.strictEqual(getAnnouncedGameTime({gameDate: '2026-07-22T23:10:00Z'}), null);
assert.strictEqual(getAnnouncedGameTime({
  gameData: {
    datetime: {dateTime: '2026-07-22T23:10:00Z'},
    gameInfo: {firstPitch: '2026-07-22T23:15:00Z'}
  }
}), null);
assert.strictEqual(
  getAnnouncedGameTime({resumeDate: '2026-07-23T00:10:00Z'}),
  '2026-07-23T00:10:00Z'
);
assert.strictEqual(
  getAnnouncedGameTime({rescheduleDate: '2026-07-24T23:10:00Z'}),
  '2026-07-24T23:10:00Z'
);
assert.strictEqual(
  getAnnouncedGameTime({gameData: {datetime: {resumeDateTime: '2026-07-23T00:30:00Z'}}}),
  '2026-07-23T00:30:00Z'
);
assert.strictEqual(
  getAnnouncedGameTime({gameData: {datetime: {rescheduleDateTime: '2026-07-24T23:10:00Z'}}}),
  '2026-07-24T23:10:00Z'
);
const announcedDate = new Date(2026, 6, 24, 19, 10);
assert.strictEqual(
  formatAnnouncedGameTime({rescheduleDate: announcedDate.toISOString()}),
  'Jul 24 7:10 PM'
);
const scheduleDate = new Date(2026, 6, 22, 12);
const sameDayAnnouncedDate = new Date(2026, 6, 22, 14, 5);
assert.strictEqual(
  formatAnnouncedGameTime({resumeDate: sameDayAnnouncedDate.toISOString()}, scheduleDate),
  '2:05 PM'
);
const nextDayAnnouncedDate = new Date(2026, 6, 23, 13, 5);
assert.strictEqual(
  formatAnnouncedGameTime({rescheduleDate: nextDayAnnouncedDate.toISOString()}, scheduleDate),
  'Jul 23 1:05 PM'
);

assert.strictEqual(getExceptionalGameState({detailedState: 'In Progress'}), null);
assert.strictEqual(formatExceptionalGameStatus({detailedState: 'Final'}), null);

const delayedWithoutLineScore = {
  name: 'delayed',
  status: {abstractGameCode: 'L', detailedState: 'In Progress - Delay'}
};
const inningOneGame = {name: 'inning 1', linescore: {currentInning: 1}};
const inningThreeGame = {name: 'inning 3', linescore: {currentInning: 3}};
const inningFiveGame = {name: 'inning 5', linescore: {currentInning: 5}};
assert.strictEqual(compareGameInnings(delayedWithoutLineScore, {...delayedWithoutLineScore}), 0);
assert.strictEqual(compareGameInnings(delayedWithoutLineScore, inningThreeGame), 1);
assert.strictEqual(compareGameInnings(inningThreeGame, delayedWithoutLineScore), -1);
assert.deepStrictEqual(
  [inningOneGame, delayedWithoutLineScore, inningFiveGame].sort(compareGameInnings).map(game => game.name),
  ['inning 5', 'inning 1', 'delayed']
);

console.log('Game status regression tests passed');
