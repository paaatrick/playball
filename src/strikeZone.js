import { get } from './config.js';

// The width of home plate, which is the zone Gameday draws
const ZONE_WIDTH_FT = 17 / 12;

// Pitches are plotted in a grid with a one cell ring around it. The ring only
// ever holds the indicators for pitches that landed outside the grid.
const PLOT_WIDTH = 11;
const PLOT_HEIGHT = 9;
export const GRID_WIDTH = PLOT_WIDTH + 2;
export const GRID_HEIGHT = PLOT_HEIGHT + 2;

const PLOT_LEFT = 1;
const PLOT_RIGHT = GRID_WIDTH - 2;
const PLOT_TOP = 1;
const PLOT_BOTTOM = GRID_HEIGHT - 2;

// The zone is drawn on the cells a pitch on its edge plots to, so that the
// drawing and the pitches can't drift apart
const ZONE_COL_LEFT = 3;
const ZONE_COL_RIGHT = 9;
const ZONE_ROW_TOP = 3;
const ZONE_ROW_BOTTOM = 7;
const CENTER_COL = (ZONE_COL_LEFT + ZONE_COL_RIGHT) / 2;
const CENTER_ROW = (ZONE_ROW_TOP + ZONE_ROW_BOTTOM) / 2;
const HALF_ZONE_COLS = (ZONE_COL_RIGHT - ZONE_COL_LEFT) / 2;
const HALF_ZONE_ROWS = (ZONE_ROW_BOTTOM - ZONE_ROW_TOP) / 2;

const PAD_CHAR = '·';
const ARROWS = {
  '0,-1': '▲', '0,1': '▼', '-1,0': '◀', '1,0': '▶',
  '-1,-1': '◤', '1,-1': '◥', '-1,1': '◣', '1,1': '◢',
};

function clamp(value, low, high) {
  return Math.max(low, Math.min(high, value));
}

export function getPitchEvents(playEvents) {
  return (playEvents || []).filter(event => event.isPitch);
}

/**
 * The cell a pitch is plotted in. A pitch that landed outside the grid is
 * plotted on the edge of it, along with an arrow in the ring beyond saying
 * that it was further out than it looks.
 * @param {object} pitch a pitch play event
 * @returns {?object} the cell, or null if the pitch wasn't located
 */
export function getPitchCell(pitch) {
  const { strikeZoneTop, strikeZoneBottom, coordinates } = pitch.pitchData || {};
  if (strikeZoneTop == null || strikeZoneBottom == null
      || coordinates?.pX == null || coordinates?.pZ == null) {
    return null;
  }
  const zoneHeight = strikeZoneTop - strikeZoneBottom;
  if (zoneHeight <= 0) {
    return null;
  }
  const zoneMiddle = (strikeZoneTop + strikeZoneBottom) / 2;
  // pX and pZ are in feet, measured from the middle of the plate and the
  // ground. Scaled by the half zone, an edge of the zone is at exactly 1.
  const col = Math.round(
    CENTER_COL + (coordinates.pX / (ZONE_WIDTH_FT / 2)) * HALF_ZONE_COLS
  );
  const row = Math.round(
    CENTER_ROW - ((coordinates.pZ - zoneMiddle) / (zoneHeight / 2)) * HALF_ZONE_ROWS
  );

  const plotCol = clamp(col, PLOT_LEFT, PLOT_RIGHT);
  const plotRow = clamp(row, PLOT_TOP, PLOT_BOTTOM);
  const beyondX = Math.sign(col - plotCol);
  const beyondY = Math.sign(row - plotRow);
  return {
    col: plotCol,
    row: plotRow,
    arrow: beyondX || beyondY ? ARROWS[`${beyondX},${beyondY}`] : null,
    arrowCol: beyondX < 0 ? 0 : beyondX > 0 ? GRID_WIDTH - 1 : plotCol,
    arrowRow: beyondY < 0 ? 0 : beyondY > 0 ? GRID_HEIGHT - 1 : plotRow,
  };
}

/**
 * The character a pitch is marked with, in both the zone and the pitch list.
 * Pitches past the ninth carry on into letters so that a marker is always one
 * character wide.
 */
export function getPitchMarker(pitch, index = 0) {
  const number = pitch.pitchNumber ?? index + 1;
  if (number <= 9) {
    return String(number);
  }
  if (number <= 35) {
    return String.fromCharCode('a'.charCodeAt(0) + number - 10);
  }
  return '*';
}

export function getPitchColor(pitch) {
  const details = pitch.details || {};
  if (details.isInPlay) {
    return get('color.in-play-no-out');
  }
  if (details.isStrike) {
    return get('color.strike');
  }
  if (details.isBall) {
    return get('color.ball');
  }
  return get('color.other-event');
}

function makeBaseGrid() {
  const grid = Array.from({ length: GRID_HEIGHT }, () => Array(GRID_WIDTH).fill(' '));
  for (let row = PLOT_TOP; row <= PLOT_BOTTOM; row++) {
    for (let col = PLOT_LEFT; col <= PLOT_RIGHT; col++) {
      grid[row][col] = PAD_CHAR;
    }
  }
  for (let row = ZONE_ROW_TOP; row <= ZONE_ROW_BOTTOM; row++) {
    for (let col = ZONE_COL_LEFT; col <= ZONE_COL_RIGHT; col++) {
      grid[row][col] = ' ';
    }
  }
  for (let col = ZONE_COL_LEFT + 1; col < ZONE_COL_RIGHT; col++) {
    grid[ZONE_ROW_TOP][col] = '─';
    grid[ZONE_ROW_BOTTOM][col] = '─';
  }
  for (let row = ZONE_ROW_TOP + 1; row < ZONE_ROW_BOTTOM; row++) {
    grid[row][ZONE_COL_LEFT] = '│';
    grid[row][ZONE_COL_RIGHT] = '│';
  }
  grid[ZONE_ROW_TOP][ZONE_COL_LEFT] = '┌';
  grid[ZONE_ROW_TOP][ZONE_COL_RIGHT] = '┐';
  grid[ZONE_ROW_BOTTOM][ZONE_COL_LEFT] = '└';
  grid[ZONE_ROW_BOTTOM][ZONE_COL_RIGHT] = '┘';
  return grid;
}

/**
 * Draw the strike zone with the at bat's pitches on it, one line per row. The
 * cells are spread out horizontally because terminal cells are about twice as
 * tall as they are wide.
 * @param {object[]} playEvents the current play's events
 * @returns {string[]} the lines, with blessed tags for the pitch colors
 */
export function getStrikeZoneRows(playEvents) {
  const grid = makeBaseGrid();
  getPitchEvents(playEvents).forEach((pitch, index) => {
    const cell = getPitchCell(pitch);
    if (!cell) {
      return;
    }
    const color = getPitchColor(pitch);
    if (cell.arrow) {
      grid[cell.arrowRow][cell.arrowCol] = `{${color}-fg}${cell.arrow}{/}`;
    }
    grid[cell.row][cell.col] = `{${color}-fg}{bold}${getPitchMarker(pitch, index)}{/bold}{/}`;
  });
  return grid.map(row => row.join(' '));
}
