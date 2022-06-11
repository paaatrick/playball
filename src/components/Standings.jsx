import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStandings, selectData } from '../features/standings';

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
  return record.team.teamName.padEnd(15) + 
    record.wins.toString().padStart(5) + 
    record.losses.toString().padStart(5) + 
    record.winningPercentage.padStart(7) + 
    record.gamesBack.padStart(6) + 
    record.wildCardGamesBack.padStart(6) + 
    `${lastTen.wins}-${lastTen.losses}`.padStart(6) + 
    record.streak.streakCode.padStart(5);
}

function Division({record, top, left, width}) {
  return (
    <box top={top} left={left} height={6} width={width}>
      <box top={0} left={0} height={1} fg='black' bg='white' content={formatHeaderRow(record)} wrap={false} />
      <box top={1} left={0} height={5} content={record.teamRecords.map(formatTeamRow).join('\n')} wrap={false} />
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

  useEffect(() => dispatch(fetchStandings()), []);

  if (!standings) {
    return <element />;
  }

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
