import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import {
  selectBoxscore,
  selectGameInfo,
  selectPitchingNotes,
  selectPlayers,
} from '../features/games.js';
import getScreen from '../screen.js';
import style from '../style/index.js';
import {wrapText} from '../utils.js';
import Table from './Table.js';

// e.g. "Struck out for Beavers in the 8th."
const SUBSTITUTE_NOTE = / for (.+) in the \d+(?:st|nd|rd|th)\.?$/;
const INFO_INDENT = 4;

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

function getBatterRows(boxscoreTeam, players) {
  const batters = Object.values(boxscoreTeam.players)
    .filter(player => player.battingOrder !== undefined)
    .sort((a, b) => parseInt(a.battingOrder) - parseInt(b.battingOrder));
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

// The extra hitting, baserunning and fielding details that appear below a
// team's batting order: doubles, triples, home runs, stolen bases, errors, etc.
function getTeamInfoLines(boxscoreTeam, width) {
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

// Game wide details that follow the pitching lines: wild pitches, hit
// batsmen, pitch counts, umpires, weather, attendance, etc.
function getGameInfoLines(pitchingNotes, gameInfo, width) {
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

function InfoBox({ lines, ...rest }) {
  if (lines.length === 0) {
    return null;
  }
  return (
    <box
      {...rest}
      height={lines.length}
      wrap={false}
      tags
      content={lines.join('\n')}
    />
  );
}

InfoBox.propTypes = {
  lines: PropTypes.arrayOf(PropTypes.string).isRequired,
};

function BoxScore({ ...props }) {
  const boxscore = useSelector(selectBoxscore);
  const players = useSelector(selectPlayers);
  const gameInfo = useSelector(selectGameInfo);
  const pitchingNotes = useSelector(selectPitchingNotes);

  // The info sections are wrapped by hand so that the height of each one is
  // known, which is what everything below it gets positioned against.
  const containerRef = useRef(null);
  const [width, setWidth] = useState(() => getScreen().width);
  const measure = useCallback(() => {
    const measured = containerRef.current?.width;
    if (measured > 0) {
      setWidth(measured);
    }
  }, []);
  useEffect(measure);
  useEffect(() => {
    const screen = getScreen();
    screen.on('resize', measure);
    return () => screen.removeListener('resize', measure);
  }, [measure]);
  const columnWidth = Math.floor(width / 2) - 1;

  const batterHeader = ['Batters', 'AB', 'R', 'H', 'RBI', 'BB', 'K', 'AVG', 'OPS'];
  const batterWidths = ['auto', 4, 4, 4, 4, 4, 4, 6, 6];
  const awayBatterRows = getBatterRows(boxscore.away, players);
  const homeBatterRows = getBatterRows(boxscore.home, players);

  const teamInfoStart = Math.max(awayBatterRows.length, homeBatterRows.length) + 2;
  const awayInfoLines = getTeamInfoLines(boxscore.away, columnWidth);
  const homeInfoLines = getTeamInfoLines(boxscore.home, columnWidth);
  const teamInfoHeight = Math.max(awayInfoLines.length, homeInfoLines.length);

  const pitcherHeader = ['Pitchers', 'IP', 'H', 'R', 'ER', 'BB', 'K', 'HR', 'ERA'];
  const pitcherWidths = ['auto', 5, 4, 4, 4, 4, 4, 4, 6];
  const pitcherStart = teamInfoStart + (teamInfoHeight > 0 ? teamInfoHeight + 1 : 0);
  const awayPitcherRows = getPitcherRows(boxscore.away, players);
  const homePitcherRows = getPitcherRows(boxscore.home, players);

  const gameInfoStart = pitcherStart
    + Math.max(awayPitcherRows.length, homePitcherRows.length) + 2;
  const gameInfoLines = getGameInfoLines(pitchingNotes, gameInfo, width - 1);

  return (
    <element
      {...props}
      ref={containerRef}
      focused
      mouse
      keys
      vi
      scrollable
      scrollbar={style.scrollbar}
      alwaysScroll
    >
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
      <InfoBox
        top={teamInfoStart}
        left={0}
        width='50%-1'
        lines={awayInfoLines}
      />
      <InfoBox
        top={teamInfoStart}
        left='50%+1'
        width='50%-1'
        lines={homeInfoLines}
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
      <InfoBox
        top={gameInfoStart}
        left={0}
        width='100%-1'
        lines={gameInfoLines}
      />
    </element>
  );
}

export default BoxScore;
