import React from 'react';
import {useSelector} from 'react-redux';
import {selectBoxscore, selectPlayers} from '../features/games.js';
import Table from './Table.js';

function getBatterRows(boxscoreTeam, players) {
  const batters = Object.values(boxscoreTeam.players)
    .filter(player => player.battingOrder !== undefined)
    .sort((a, b) => parseInt(a.battingOrder) - parseInt(b.battingOrder));
  const batterNames = batters.map(batter => {
    const name = players[`ID${batter.person.id}`].boxscoreName;
    const positions = batter.allPositions?.map(pos => pos.abbreviation).join('-');
    const prefix = batter.gameStatus?.isSubstitute ? ' ' : '';
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

function getPitcherRows(boxscoreTeam, players) {
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

function BoxScore({ ...props }) {
  const boxscore = useSelector(selectBoxscore);
  const players = useSelector(selectPlayers);

  const batterHeader = ['Batters', 'AB', 'R', 'H', 'RBI', 'BB', 'K', 'AVG', 'OPS'];
  const batterWidths = ['auto', 4, 4, 4, 4, 4, 4, 6, 6];
  const awayBatterRows = getBatterRows(boxscore.away, players);
  const homeBatterRows = getBatterRows(boxscore.home, players);

  const pitcherHeader = ['Pitchers', 'IP', 'H', 'R', 'ER', 'BB', 'K', 'HR', 'ERA'];
  const pitcherWidths = ['auto', 5, 4, 4, 4, 4, 4, 4, 6];
  const pitcherStart = Math.max(awayBatterRows.length, homeBatterRows.length) + 2;
  const awayPitcherRows = getPitcherRows(boxscore.away, players);
  const homePitcherRows = getPitcherRows(boxscore.home, players);

  return (
    <element {...props}>
      <Table
        top={0}
        left={0}
        width='50%-1'
        headers={batterHeader}
        widths={batterWidths}
        rows={awayBatterRows}
      />
      <Table
        top={0}
        left='50%+1'
        width='50%-1'
        headers={batterHeader}
        widths={batterWidths}
        rows={homeBatterRows}
      />
      <Table
        top={pitcherStart}
        left={0}
        width='50%-1'
        headers={pitcherHeader}
        widths={pitcherWidths}
        rows={awayPitcherRows}
      />
      <Table
        top={pitcherStart}
        left='50%+1'
        width='50%-1'
        headers={pitcherHeader}
        widths={pitcherWidths}
        rows={homePitcherRows}
      />
    </element>
  );
}

export default BoxScore;
