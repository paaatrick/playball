import assert from 'assert';

import {
  getBatterRows,
  getBoxScoreLayout,
  getGameInfoLines,
  getPitcherRows,
  getTeamInfoLines,
  wrapText
} from '../src/boxScore.js';

assert.deepStrictEqual(wrapText('one two three', 20), ['one two three']);
assert.deepStrictEqual(wrapText('one two three', 7), ['one two', 'three']);
assert.deepStrictEqual(wrapText('one two three', 7, 2), ['one two', '  three']);
assert.deepStrictEqual(wrapText('one   two', 20), ['one two']);
assert.deepStrictEqual(wrapText('', 20), []);
// A word too long for the width is split rather than dropped
assert.deepStrictEqual(wrapText('a bbbbbbbb', 4, 1), ['a', ' bbb', ' bbb', ' bb']);
// An unmeasurable width is left alone rather than looping forever
assert.deepStrictEqual(wrapText('one two', 0), ['one two']);
assert.ok(wrapText('one two three four five', 9, 4).every(line => line.length <= 9));

const battingStats = (stats = {}) => ({
  stats: {
    batting: {
      atBats: 0, runs: 0, hits: 0, rbi: 0, baseOnBalls: 0, strikeOuts: 0, ...stats
    }
  },
  seasonStats: {batting: {avg: '.250', ops: '.700'}},
});
const batter = (id, order, positions, options = {}) => ({
  person: {id},
  battingOrder: order,
  allPositions: positions.map(abbreviation => ({abbreviation})),
  ...battingStats(options.stats),
  ...(options.substitute ? {gameStatus: {isSubstitute: true}} : {}),
});
const pitcher = (id, options = {}) => ({
  person: {id},
  stats: {
    pitching: {
      inningsPitched: '1.0',
      hits: 0,
      runs: 0,
      earnedRuns: 0,
      baseOnBalls: 0,
      strikeOuts: 0,
      homeRuns: 0,
      ...options,
    }
  },
  seasonStats: {pitching: {era: '3.00'}},
});
const teamStats = {
  batting: {atBats: 4, runs: 1, hits: 2, rbi: 1, baseOnBalls: 0, strikeOuts: 1},
  pitching: {
    inningsPitched: '9.0',
    hits: 2,
    runs: 1,
    earnedRuns: 1,
    baseOnBalls: 0,
    strikeOuts: 1,
    homeRuns: 0,
  },
};
const players = {
  ID1: {boxscoreName: 'Starter'},
  ID2: {boxscoreName: 'Pinch'},
  ID3: {boxscoreName: 'Late'},
  ID4: {boxscoreName: 'Pitcher'},
};
const team = (overrides = {}) => ({
  players: {
    ID1: batter(1, '100', ['LF']),
    ID2: batter(2, '101', ['PH'], {substitute: true}),
    ID3: batter(3, '200', ['SS']),
    ID4: pitcher(4),
  },
  pitchers: [4],
  teamStats,
  ...overrides,
});

// A substitute is labelled with the note that says who they hit for, and only
// a substitute in the same lineup spot is a candidate
const rows = getBatterRows(team({
  note: [{label: 'a', value: 'Struck out for Starter in the 8th.'}]
}), players);
assert.deepStrictEqual(rows.map(row => row[0]), [
  'Starter (LF)',
  'a-Pinch (PH)',
  'Late (SS)',
  'Totals',
]);
assert.deepStrictEqual(
  getBatterRows(team({
    note: [{label: 'a', value: 'Struck out for Late in the 8th.'}]
  }), players).map(row => row[0]),
  ['Starter (LF)', ' Pinch (PH)', 'Late (SS)', 'Totals']
);
// Notes that don't name a batter in the lineup are left unmatched
assert.deepStrictEqual(
  getBatterRows(team({
    note: [{label: 'a', value: 'Struck out for Nobody in the 8th.'}]
  }), players).map(row => row[0]),
  ['Starter (LF)', ' Pinch (PH)', 'Late (SS)', 'Totals']
);
assert.deepStrictEqual(
  getBatterRows(team(), players).map(row => row[0]),
  ['Starter (LF)', ' Pinch (PH)', 'Late (SS)', 'Totals']
);

assert.deepStrictEqual(
  getPitcherRows(team({
    players: {...team().players, ID4: {...pitcher(4), stats: {pitching: {
      ...pitcher(4).stats.pitching, note: '(W, 1-0)'
    }}}}
  }), players).map(row => row[0]),
  ['Pitcher (W, 1-0)', 'Totals']
);

// Each section is titled, its labels are bolded, and long values wrap with an
// indent so they read as one entry
const infoLines = getTeamInfoLines({
  note: [{label: 'a', value: 'Struck out for Starter in the 8th.'}],
  info: [
    {title: 'BATTING', fieldList: [
      {label: '2B', value: 'Starter (4, Pitcher).'},
      {label: 'HR', value: 'Late (12, 9th inning off Pitcher, 0 on, 1 out).'},
    ]},
    {title: 'FIELDING', fieldList: [{label: 'E', value: 'Late (3, throw).'}]},
  ],
}, 40);
assert.deepStrictEqual(infoLines, [
  '{bold}a-{/bold}Struck out for Starter in the 8th.',
  '',
  '{bold}BATTING{/bold}',
  '{bold}2B: {/bold}Starter (4, Pitcher).',
  '{bold}HR: {/bold}Late (12, 9th inning off Pitcher, 0',
  '    on, 1 out).',
  '',
  '{bold}FIELDING{/bold}',
  '{bold}E: {/bold}Late (3, throw).',
]);
assert.deepStrictEqual(getTeamInfoLines({}, 40), []);
// Braces would be read as markup by blessed, so they're dropped
assert.deepStrictEqual(
  getTeamInfoLines({info: [{title: 'BATTING', fieldList: [{label: '2B', value: 'A {b}'}]}]}, 40),
  ['{bold}BATTING{/bold}', '{bold}2B: {/bold}A b']
);

assert.deepStrictEqual(
  getGameInfoLines(['Pitcher pitched to 2 batters in the 7th.'], [
    {label: 'WP', value: 'Pitcher.'},
    {label: 'August 12, 2026'},
  ], 60),
  [
    'Pitcher pitched to 2 batters in the 7th.',
    '',
    '{bold}WP: {/bold}Pitcher.',
    '{bold}August 12, 2026{/bold}',
  ]
);
assert.deepStrictEqual(getGameInfoLines([], [], 60), []);
assert.deepStrictEqual(
  getGameInfoLines(['Pitcher pitched to 2 batters in the 7th.'], [], 60),
  ['Pitcher pitched to 2 batters in the 7th.']
);

// Sections stack without overlapping, whichever team's is taller
const layout = getBoxScoreLayout({
  boxscore: {
    away: team({info: [{title: 'BATTING', fieldList: [{label: '2B', value: 'Starter (4).'}]}]}),
    home: team(),
  },
  players,
  gameInfo: [{label: 'WP', value: 'Pitcher.'}],
  pitchingNotes: [],
  width: 80,
});
assert.strictEqual(layout.away.batterRows.length, 4);
assert.strictEqual(layout.home.infoLines.length, 0);
assert.strictEqual(layout.teamInfoTop, layout.away.batterRows.length + 2);
assert.ok(layout.pitcherTop >= layout.teamInfoTop + layout.away.infoLines.length);
assert.ok(layout.gameInfoTop >= layout.pitcherTop + layout.away.pitcherRows.length + 1);
assert.deepStrictEqual(layout.gameInfoLines, ['{bold}WP: {/bold}Pitcher.']);

// With no info at all the pitching lines follow the batting lines directly,
// the way they did before the details were added
const bare = getBoxScoreLayout({
  boxscore: {away: team(), home: team()},
  players,
  gameInfo: [],
  pitchingNotes: [],
  width: 80,
});
assert.strictEqual(bare.pitcherTop, bare.teamInfoTop);
assert.deepStrictEqual(bare.gameInfoLines, []);

console.log('Box score tests passed');
