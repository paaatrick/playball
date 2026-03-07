import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStandings, selectData } from '../features/standings.js';
import { teamFavoriteStar, getSport } from '../utils.js';

function formatHeaderRow(record) {
  return record.division.nameShort.padEnd(15) +
    '    W' + 
    '    L' + 
    '    PCT' + 
    '    GB' + 
    '  WCGB' +
    '   L10' +
    ' STRK';
}

function formatTeamRow(record) {
  const lastTen = record.records.splitRecords.find(o => o.type === 'lastTen');
  const star = teamFavoriteStar(record.team);
  return star + 
    record.team.teamName.padEnd(star ? 13 : 15) + 
    record.wins.toString().padStart(5) + 
    record.losses.toString().padStart(5) + 
    record.winningPercentage.padStart(7) + 
    record.gamesBack.padStart(6) + 
    record.wildCardGamesBack.padStart(6) + 
    `${lastTen.wins}-${lastTen.losses}`.padStart(6) + 
    (record.streak?.streakCode || '').padStart(5);
}

function Division({record, top, left, width}) {
  return (
    <box top={top} left={left} height={6} width={width}>
      <box top={0} left={0} height={1} fg='black' bg='white' content={formatHeaderRow(record)} wrap={false} />
      <box top={1} left={0} height={5} content={record.teamRecords.map(formatTeamRow).join('\n')} wrap={false} tags />
    </box>
  );
}
Division.propTypes = {
  record: PropTypes.object,
  top: PropTypes.number,
  left: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

function Standings() {
  const dispatch = useDispatch();
  const standings = useSelector(selectData);
  const sport = getSport();

  useEffect(() => dispatch(fetchStandings()), []);

  if (!standings) {
    return <element />;
  }

  if (sport === 'wbc') {
    // WBC Pool Standings
    if (!standings.records || standings.records.length === 0) {
      return (
        <box top={0} left={0} width='100%' height='100%'>
          <text top={1} left={2}>
            WBC Standings not available during this phase of the tournament.
          </text>
          <text top={3} left={2}>
            Use Schedule view to see games and results.
          </text>
        </box>
      );
    }

    // Render WBC pools (records likely grouped by pool/division)
    const halfPoint = Math.ceil(standings.records.length / 2);
    return (
      <element>
        {standings.records.slice(0, halfPoint).map((pool, idx) => (
          <Division
            top={idx * 7}
            left={0}
            width='50%-1'
            key={pool.division?.id || idx}
            record={pool}
          />
        ))}
        {standings.records.slice(halfPoint).map((pool, idx) => (
          <Division
            top={idx * 7}
            left='50%+1'
            width='50%-1'
            key={pool.division?.id || (idx + halfPoint)}
            record={pool}
          />
        ))}
      </element>
    );
  }

  // MLB AL/NL Standings (existing logic)
  return (
    <element>
      {standings.records.filter(record => record.league.id === 103).map((record, idx) => (
        <Division
          top={idx * 7}
          left={0}
          width='50%-1'
          key={record.division.id}
          record={record}
        />
      ))}
      {standings.records.filter(record => record.league.id === 104).map((record, idx) => (
        <Division
          top={idx * 7}
          left='50%+1'
          width='50%-1'
          key={record.division.id}
          record={record}
        />
      ))}
    </element>
  );
}

export default Standings;
