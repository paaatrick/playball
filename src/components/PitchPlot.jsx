import React from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentPlay, selectLineScore } from '../features/games.js';
import { get } from '../config.js';

// Strike zone dimensions (in feet)
const ZONE_WIDTH = 1.416; // 17 inches
const ZONE_MIN_X = -0.708;
const ZONE_MAX_X = 0.708;

// Terminal grid dimensions
const GRID_WIDTH = 29;
const GRID_HEIGHT = 15;

function PitchPlot() {
  const currentPlay = useSelector(selectCurrentPlay);
  const linescore = useSelector(selectLineScore);
  const playEvents = currentPlay?.playEvents || [];

  // Get strike zone boundaries for current batter
  const strikeZoneTop = currentPlay?.matchup?.splits?.batter?.strikeZoneTop || 3.5;
  const strikeZoneBottom = currentPlay?.matchup?.splits?.batter?.strikeZoneBottom || 1.5;

  // Create grid
  const grid = Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(' '));

  // Draw strike zone box (16 chars wide x 11 chars tall for proper aspect ratio)
  // Real strike zone: 17" wide x ~24" tall (1:1.41 ratio)
  // Terminal chars are ~1:2 (w:h), so we need 16x11 to look correct
  const zoneLeft = 7;
  const zoneRight = 22;  // 7 + 15 = 22 (16 chars wide including borders)
  const zoneTop = 2;
  const zoneBottom = 12;  // 2 + 10 = 12 (11 chars tall including borders)

  // Top and bottom borders
  for (let x = zoneLeft; x <= zoneRight; x++) {
    grid[zoneTop][x] = '─';
    grid[zoneBottom][x] = '─';
  }

  // Left and right borders
  for (let y = zoneTop; y <= zoneBottom; y++) {
    grid[y][zoneLeft] = '│';
    grid[y][zoneRight] = '│';
  }

  // Corners
  grid[zoneTop][zoneLeft] = '┌';
  grid[zoneTop][zoneRight] = '┐';
  grid[zoneBottom][zoneLeft] = '└';
  grid[zoneBottom][zoneRight] = '┘';

  // Middle lines to create 3x3 grid
  const midX1 = zoneLeft + Math.floor((zoneRight - zoneLeft) / 3);
  const midX2 = zoneLeft + Math.floor(2 * (zoneRight - zoneLeft) / 3);
  const midY1 = zoneTop + Math.floor((zoneBottom - zoneTop) / 3);
  const midY2 = zoneTop + Math.floor(2 * (zoneBottom - zoneTop) / 3);

  // Vertical middle lines
  for (let y = zoneTop + 1; y < zoneBottom; y++) {
    grid[y][midX1] = '┊';
    grid[y][midX2] = '┊';
  }

  // Horizontal middle lines
  for (let x = zoneLeft + 1; x < zoneRight; x++) {
    if (grid[midY1][x] === '┊') {
      grid[midY1][x] = '┼';
      grid[midY2][x] = '┼';
    } else {
      grid[midY1][x] = '┈';
      grid[midY2][x] = '┈';
    }
  }

  // Map pitch coordinates to grid position
  const mapToGrid = (pX, pZ) => {
    // Expand view beyond strike zone (2x wider, slightly taller)
    const viewMinX = ZONE_MIN_X * 2;
    const viewMaxX = ZONE_MAX_X * 2;
    const viewMinZ = strikeZoneBottom - 1;
    const viewMaxZ = strikeZoneTop + 1;

    const x = Math.floor(((pX - viewMinX) / (viewMaxX - viewMinX)) * GRID_WIDTH);
    const y = Math.floor(((viewMaxZ - pZ) / (viewMaxZ - viewMinZ)) * GRID_HEIGHT);

    return {
      x: Math.max(0, Math.min(GRID_WIDTH - 1, x)),
      y: Math.max(0, Math.min(GRID_HEIGHT - 1, y))
    };
  };

  // Get color for pitch based on result
  const getPitchColor = (event) => {
    const desc = event.details?.description?.toLowerCase() || '';

    if (event.details?.isInPlay) {
      return get('color.in-play-no-out');
    } else if (desc.includes('ball') || desc.includes('pitchout')) {
      return get('color.ball');
    } else if (desc.includes('called strike') || desc.includes('swinging strike') || desc.includes('foul')) {
      return get('color.strike');
    }

    return 'white';
  };

  // Plot pitches
  const pitches = playEvents.filter(e => e.isPitch && e.pitchData?.coordinates);
  pitches.forEach((pitch, index) => {
    const coords = pitch.pitchData.coordinates;
    if (coords.pX !== undefined && coords.pZ !== undefined) {
      const pos = mapToGrid(coords.pX, coords.pZ);
      const pitchNum = (index + 1) % 10; // Use single digit
      const color = getPitchColor(pitch);

      // Always place pitch, even if it overlays borders/corners
      grid[pos.y][pos.x] = `{${color}-fg}${pitchNum}{/}`;
    }
  });

  // Convert grid to string
  const content = grid.map(row => row.map(cell => {
    // If cell is already tagged, return as-is
    if (typeof cell === 'string' && cell.includes('{')) {
      return cell;
    }
    return cell;
  }).join('')).join('\n');

  return (
    <box
      content={content}
      tags
      top={0}
      left={0}
      width='100%'
      height={GRID_HEIGHT + 2}
      align='center'
    />
  );
}

export default PitchPlot;
