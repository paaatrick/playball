import React from 'react';
import { useSelector } from 'react-redux';

import { get } from '../config.js';
import { selectCurrentPlay } from '../features/games.js';

const ZONE_WIDTH_FT = 17 / 12;

const GRID_W = 11;
const GRID_H = 9;
const ZONE_COL_LEFT = 2;
const ZONE_COL_RIGHT = 8;
const ZONE_ROW_TOP = 2;
const ZONE_ROW_BOT = 6;

const PAD_CHAR = '·';

function clamp(value, lo, hi) {
  return Math.max(lo, Math.min(hi, value));
}

function pitchCell(pitch) {
  const { strikeZoneTop, strikeZoneBottom, coordinates } = pitch.pitchData;
  if (
    strikeZoneTop == null ||
    strikeZoneBottom == null ||
    coordinates?.pX == null ||
    coordinates?.pZ == null
  ) {
    return null;
  }
  const midZ = (strikeZoneTop + strikeZoneBottom) / 2;
  const zoneH = strikeZoneTop - strikeZoneBottom;
  if (zoneH <= 0) {
    return null;
  }
  const col = Math.round(5 + (coordinates.pX / ZONE_WIDTH_FT) * 6);
  const row = Math.round(4 - ((coordinates.pZ - midZ) / zoneH) * 4);
  return [clamp(col, 0, GRID_W - 1), clamp(row, 0, GRID_H - 1)];
}

function pitchColor(pitch) {
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

function pitchMarker(index) {
  if (index < 9) {
    return String(index + 1);
  }
  return String.fromCharCode('a'.charCodeAt(0) + index - 9);
}

function makeBaseGrid() {
  const grid = Array.from({ length: GRID_H }, () => Array(GRID_W).fill(PAD_CHAR));
  for (let r = ZONE_ROW_TOP; r <= ZONE_ROW_BOT; r++) {
    for (let c = ZONE_COL_LEFT; c <= ZONE_COL_RIGHT; c++) {
      grid[r][c] = ' ';
    }
  }
  for (let c = ZONE_COL_LEFT + 1; c <= ZONE_COL_RIGHT - 1; c++) {
    grid[ZONE_ROW_TOP][c] = '─';
    grid[ZONE_ROW_BOT][c] = '─';
  }
  for (let r = ZONE_ROW_TOP + 1; r <= ZONE_ROW_BOT - 1; r++) {
    grid[r][ZONE_COL_LEFT] = '│';
    grid[r][ZONE_COL_RIGHT] = '│';
  }
  grid[ZONE_ROW_TOP][ZONE_COL_LEFT] = '┌';
  grid[ZONE_ROW_TOP][ZONE_COL_RIGHT] = '┐';
  grid[ZONE_ROW_BOT][ZONE_COL_LEFT] = '└';
  grid[ZONE_ROW_BOT][ZONE_COL_RIGHT] = '┘';
  return grid;
}

function renderGrid(pitches) {
  const grid = makeBaseGrid();
  pitches.forEach((pitch, index) => {
    const cell = pitchCell(pitch);
    if (!cell) {
      return;
    }
    const [col, row] = cell;
    const color = pitchColor(pitch);
    grid[row][col] = `{${color}-fg}{bold}${pitchMarker(index)}{/bold}{/}`;
  });
  return grid.map(row => ' ' + row.join(' ')).join('\n');
}

function StrikeZone() {
  const currentPlay = useSelector(selectCurrentPlay);
  const pitches = (currentPlay?.playEvents || []).filter(
    e => e.isPitch && e.pitchData?.coordinates
  );
  const content = renderGrid(pitches);
  return <box content={content} tags wrap={false} />;
}

export default StrikeZone;
