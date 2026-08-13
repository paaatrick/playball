// e.g. "Struck out for Beavers in the 8th."
const SUBSTITUTE_NOTE = / for (.+) in the \d+(?:st|nd|rd|th)\.?$/;
const INFO_INDENT = 4;

/**
 * Break text into lines that fit a given width, indenting every line after
 * the first. Words longer than the width are split across lines.
 * @param {string} text
 * @param {number} width
 * @param {number} indent number of spaces to prefix continuation lines with
 * @returns {string[]} the wrapped lines
 */
export function wrapText(text, width, indent = 0) {
  if (width <= 0) {
    return [text];
  }
  const pad = ' '.repeat(Math.min(indent, width - 1));
  const lines = [];
  let line = '';
  text.split(/\s+/).filter(word => word.length > 0).forEach(word => {
    if (line === '') {
      line = (lines.length === 0 ? '' : pad) + word;
    } else if (line.length + 1 + word.length <= width) {
      line += ' ' + word;
    } else {
      lines.push(line);
      line = pad + word;
    }
    while (line.length > width) {
      lines.push(line.slice(0, width));
      line = pad + line.slice(width);
    }
  });
  if (line !== '') {
    lines.push(line);
  }
  return lines;
}

// Blessed treats braces as markup, and the info text is rendered with tags on
// so that labels can be bolded.
function stripTags(text) {
  return (text || '').replace(/[{}]/g, '');
}

// Wrap `prefix + text` to the given width, bolding the prefix
function wrapEntry(prefix, text, width) {
  const lines = wrapText(`${prefix}${text}`, width, INFO_INDENT);
  if (lines.length > 0) {
    lines[0] = `{bold}${lines[0].slice(0, prefix.length)}{/bold}${lines[0].slice(prefix.length)}`;
  }
  return lines;
}

function wrapField(field, width) {
  const label = stripTags(field.label);
  const value = stripTags(field.value);
  return value
    ? wrapEntry(`${label}: `, value, width)
    : wrapEntry(label, '', width);
}

function getBatters(boxscoreTeam) {
  return Object.values(boxscoreTeam.players)
    .filter(player => player.battingOrder !== undefined)
    .sort((a, b) => parseInt(a.battingOrder) - parseInt(b.battingOrder));
}

// The team notes explain which player each substitute batted or ran for, and
// are keyed by a letter that appears next to the substitute in the lineup.
function getNoteLabels(boxscoreTeam, batters, players) {
  const slotOf = batter => Math.floor(parseInt(batter.battingOrder) / 100);
  const labels = {};
  (boxscoreTeam.note || []).forEach(note => {
    const match = SUBSTITUTE_NOTE.exec(note.value || '');
    if (!match) {
      return;
    }
    const replacedIdx = batters.findIndex(
      batter => players[`ID${batter.person.id}`]?.boxscoreName === match[1]
    );
    if (replacedIdx < 0) {
      return;
    }
    const slot = slotOf(batters[replacedIdx]);
    const substitute = batters.find((batter, idx) => (
      idx > replacedIdx
      && slotOf(batter) === slot
      && batter.gameStatus?.isSubstitute
      && labels[batter.person.id] === undefined
    ));
    if (substitute) {
      labels[substitute.person.id] = note.label;
    }
  });
  return labels;
}

export function getBatterRows(boxscoreTeam, players) {
  const batters = getBatters(boxscoreTeam);
  const noteLabels = getNoteLabels(boxscoreTeam, batters, players);
  const substituteIndent = Object.keys(noteLabels).length > 0 ? '  ' : ' ';
  const batterNames = batters.map(batter => {
    const name = players[`ID${batter.person.id}`].boxscoreName;
    const positions = batter.allPositions?.map(pos => pos.abbreviation).join('-');
    const label = noteLabels[batter.person.id];
    let prefix = '';
    if (label) {
      prefix = `${label}-`;
    } else if (batter.gameStatus?.isSubstitute) {
      prefix = substituteIndent;
    }
    return `${prefix}${name} (${positions})`;
  });
  return [
    ...batters.map((batter, idx) => [
      batterNames[idx],
      batter.stats.batting.atBats.toString(),
      batter.stats.batting.runs.toString(),
      batter.stats.batting.hits.toString(),
      batter.stats.batting.rbi.toString(),
      batter.stats.batting.baseOnBalls.toString(),
      batter.stats.batting.strikeOuts.toString(),
      batter.seasonStats.batting.avg,
      batter.seasonStats.batting.ops,
    ]),
    [
      'Totals',
      boxscoreTeam.teamStats.batting.atBats.toString(),
      boxscoreTeam.teamStats.batting.runs.toString(),
      boxscoreTeam.teamStats.batting.hits.toString(),
      boxscoreTeam.teamStats.batting.rbi.toString(),
      boxscoreTeam.teamStats.batting.baseOnBalls.toString(),
      boxscoreTeam.teamStats.batting.strikeOuts.toString(),
      '',
      '',
    ]
  ];
}

export function getPitcherRows(boxscoreTeam, players) {
  const pitchers = boxscoreTeam.pitchers.map(pitcherId => boxscoreTeam.players['ID' + pitcherId]);
  const pitcherNames = pitchers.map(pitcher => {
    const name = players[`ID${pitcher.person.id}`].boxscoreName;
    const note = pitcher.stats.pitching.note ? ` ${pitcher.stats.pitching.note}` : '';
    return `${name}${note}`;
  });
  return [
    ...pitchers.map((pitcher, idx) => [
      pitcherNames[idx],
      pitcher.stats.pitching.inningsPitched,
      pitcher.stats.pitching.hits.toString(),
      pitcher.stats.pitching.runs.toString(),
      pitcher.stats.pitching.earnedRuns.toString(),
      pitcher.stats.pitching.baseOnBalls.toString(),
      pitcher.stats.pitching.strikeOuts.toString(),
      pitcher.stats.pitching.homeRuns.toString(),
      pitcher.seasonStats.pitching.era,
    ]),
    [
      'Totals',
      boxscoreTeam.teamStats.pitching.inningsPitched,
      boxscoreTeam.teamStats.pitching.hits.toString(),
      boxscoreTeam.teamStats.pitching.runs.toString(),
      boxscoreTeam.teamStats.pitching.earnedRuns.toString(),
      boxscoreTeam.teamStats.pitching.baseOnBalls.toString(),
      boxscoreTeam.teamStats.pitching.strikeOuts.toString(),
      boxscoreTeam.teamStats.pitching.homeRuns.toString(),
      '',
    ]
  ];
}

/**
 * The extra hitting, baserunning and fielding details that appear below a
 * team's batting order: doubles, triples, home runs, stolen bases, errors, etc.
 */
export function getTeamInfoLines(boxscoreTeam, width) {
  const lines = [];
  (boxscoreTeam.note || []).forEach(note => {
    lines.push(...wrapEntry(`${stripTags(note.label)}-`, stripTags(note.value), width));
  });
  (boxscoreTeam.info || []).forEach(section => {
    if (lines.length > 0) {
      lines.push('');
    }
    lines.push(`{bold}${stripTags(section.title)}{/bold}`);
    (section.fieldList || []).forEach(field => {
      lines.push(...wrapField(field, width));
    });
  });
  return lines;
}

/**
 * Game wide details that follow the pitching lines: wild pitches, hit batsmen,
 * pitch counts, umpires, weather, attendance, etc.
 */
export function getGameInfoLines(pitchingNotes, gameInfo, width) {
  const lines = [];
  (pitchingNotes || []).forEach(note => {
    lines.push(...wrapText(stripTags(note), width, INFO_INDENT));
  });
  if (lines.length > 0 && gameInfo?.length > 0) {
    lines.push('');
  }
  (gameInfo || []).forEach(field => {
    lines.push(...wrapField(field, width));
  });
  return lines;
}

/**
 * Build the contents of the box score along with the row each section starts
 * on. Every section is positioned against the height of the one above it, so
 * the info text is wrapped here rather than by blessed, whose wrapping happens
 * too late to be measured.
 * @param {object} options
 * @param {object} options.boxscore the away and home boxscore teams
 * @param {object} options.players the game's players, keyed by `ID<id>`
 * @param {object[]} options.gameInfo game wide info fields
 * @param {string[]} options.pitchingNotes
 * @param {number} options.width the width of the box score, in columns
 */
export function getBoxScoreLayout({ boxscore, players, gameInfo, pitchingNotes, width }) {
  const columnWidth = Math.floor(width / 2) - 1;
  const teams = ['away', 'home'].reduce((result, side) => ({
    ...result,
    [side]: {
      batterRows: getBatterRows(boxscore[side], players),
      infoLines: getTeamInfoLines(boxscore[side], columnWidth),
      pitcherRows: getPitcherRows(boxscore[side], players),
    }
  }), {});

  // A table is a header row plus its rows, and a blank row separates sections
  const tallest = key => Math.max(teams.away[key].length, teams.home[key].length);
  const teamInfoTop = tallest('batterRows') + 2;
  const teamInfoHeight = tallest('infoLines');
  const pitcherTop = teamInfoTop + (teamInfoHeight > 0 ? teamInfoHeight + 1 : 0);
  const gameInfoTop = pitcherTop + tallest('pitcherRows') + 2;

  return {
    ...teams,
    // The game info spans both columns, less a column for the scrollbar
    gameInfoLines: getGameInfoLines(pitchingNotes, gameInfo, width - 1),
    teamInfoTop,
    pitcherTop,
    gameInfoTop,
  };
}
