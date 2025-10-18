import React from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentPlay, selectLineScore, selectPlayers } from '../features/games.js';
import { get } from '../config.js';

// Strike zone dimensions (in feet)
const ZONE_WIDTH = 1.416; // 17 inches
const ZONE_MIN_X = -0.708;
const ZONE_MAX_X = 0.708;

// Terminal grid dimensions
const GRID_WIDTH = 29;
const GRID_HEIGHT = 15;

// Bresenham's line algorithm - returns array of {x, y} points between two coordinates
const getLinePoints = (start, end) => {
  const points = [];
  let x0 = start.x;
  let y0 = start.y;
  const x1 = end.x;
  const y1 = end.y;
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  while (true) {
    points.push({ x: x0, y: y0 });
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x0 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y0 += sy;
    }
  }

  return points;
};

function PitchPlot() {
  const currentPlay = useSelector(selectCurrentPlay);
  const linescore = useSelector(selectLineScore);
  const players = useSelector(selectPlayers);
  const playEvents = currentPlay?.playEvents || [];

  // Get strike zone boundaries for current batter
  const strikeZoneTop = currentPlay?.matchup?.splits?.batter?.strikeZoneTop || 3.5;
  const strikeZoneBottom = currentPlay?.matchup?.splits?.batter?.strikeZoneBottom || 1.5;

  // Get batter handedness
  const batterId = currentPlay?.matchup?.batter?.id;
  const batterInfo = players?.['ID' + batterId];
  const batSide = batterInfo?.batSide?.code; // "L" or "R"

  // Create grid
  const grid = Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(' '));

  // Draw strike zone box (14 chars wide x 10 chars tall for proper aspect ratio)
  // Real strike zone: 17" wide x ~24" tall (ratio 0.708)
  // Terminal chars are ~1:2 (w:h), so 14x10 → 1.4÷2 = 0.7 (almost perfect!)
  // Perfect 3x3 grid: 12 interior cols ÷ 3 = 4,4,4 and 9 interior rows ÷ 3 = 3,3,3
  const zoneLeft = 8;
  const zoneRight = 21;  // 8 + 13 = 21 (14 chars wide including borders)
  const zoneTop = 2;
  const zoneBottom = 11;  // 2 + 9 = 11 (10 chars tall including borders)

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
  // With 12 interior cols and 9 interior rows, divide evenly: 4+4+4 and 3+3+3
  // Adjusted midX2 to +9 to account for character rendering at left edge
  const midX1 = zoneLeft + 4;  // First vertical divider at column 4
  const midX2 = zoneLeft + 9;  // Second vertical divider at column 9 (adjusted for visual centering)
  const midY1 = zoneTop + 3;   // First horizontal divider at row 3
  const midY2 = zoneTop + 6;   // Second horizontal divider at row 6

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

  // Add batter handedness indicator
  // View: catcher's perspective looking out (same as MLB Gameday)
  // Position: vertically centered next to strike zone, letter outside arrow
  const batterIndicatorY = Math.floor((zoneTop + zoneBottom) / 2);
  if (batSide === 'R') {
    // Right-handed batter stands on LEFT side: R▶[zone]
    grid[batterIndicatorY][zoneLeft - 3] = '{cyan-fg}R{/}';
    grid[batterIndicatorY][zoneLeft - 2] = '{cyan-fg}▶{/}';
  } else if (batSide === 'L') {
    // Left-handed batter stands on RIGHT side: [zone]◀L
    grid[batterIndicatorY][zoneRight + 2] = '{cyan-fg}◀{/}';
    grid[batterIndicatorY][zoneRight + 3] = '{cyan-fg}L{/}';
  }

  // Project 3D release point to catcher's perspective (2D viewing plane)
  const projectToCatcherView = (x0, y0, z0) => {
    const CATCHER_EYE_HEIGHT = 3.0; // feet (typical crouch position)
    const VIEWING_PLANE_DISTANCE = 5.0; // feet behind home plate

    // Perspective scale factor: objects farther away appear smaller/closer to center
    const scale = VIEWING_PLANE_DISTANCE / (y0 + VIEWING_PLANE_DISTANCE);

    return {
      x: x0 * scale,
      z: z0 * scale + CATCHER_EYE_HEIGHT * (1 - scale)
    };
  };

  // Map pitch coordinates to grid position
  const mapToGrid = (pX, pZ) => {
    // Define view area (extends beyond strike zone to show balls)
    const viewMinX = ZONE_MIN_X * 2;  // 2x wider horizontally
    const viewMaxX = ZONE_MAX_X * 2;
    const viewMinZ = strikeZoneBottom - 1;  // 1 foot below zone
    const viewMaxZ = strikeZoneTop + 1;     // 1 foot above zone

    // Calculate position within view (0 to 1)
    const xRatio = (pX - viewMinX) / (viewMaxX - viewMinX);
    const yRatio = (viewMaxZ - pZ) / (viewMaxZ - viewMinZ);  // Inverted: higher pZ = lower y

    // Map to grid coordinates
    const x = Math.floor(xRatio * GRID_WIDTH);
    const y = Math.floor(yRatio * GRID_HEIGHT);

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

  // Draw trajectory line from release point to most recent pitch
  const pitches = playEvents.filter(e => e.isPitch && e.pitchData?.coordinates);
  if (pitches.length > 0) {
    const recentPitch = pitches[pitches.length - 1];
    const coords = recentPitch.pitchData?.coordinates;

    if (coords?.x0 !== undefined && coords?.y0 !== undefined && coords?.z0 !== undefined && coords?.pX !== undefined && coords?.pZ !== undefined) {
      // Project release point from 3D space to catcher's 2D perspective
      const projectedRelease = projectToCatcherView(coords.x0, coords.y0, coords.z0);
      const releasePos = mapToGrid(projectedRelease.x, projectedRelease.z);
      const pitchPos = mapToGrid(coords.pX, coords.pZ);

      // Draw dotted line from release point to pitch location
      const linePoints = getLinePoints(releasePos, pitchPos);
      linePoints.forEach(point => {
        // Only draw in empty cells (don't overwrite strike zone structure)
        if (grid[point.y][point.x] === ' ') {
          grid[point.y][point.x] = '{white-fg}·{/}';
        }
      });
    }
  }

  // Plot pitches
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
