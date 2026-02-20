import React from 'react';
import PropTypes from 'prop-types';

function formatRow(row, widths) {
  return row
    .map((cell, idx) => idx === 0 ? cell.padEnd(widths[idx]) : cell.padStart(widths[idx]))
    .join('');
}

function Table({ headers, widths, rows, ...rest }) {
  const resolvedWidths = widths.map((width, idx) => {
    if (width !== 'auto') {
      return width;
    }
    return Math.max(
      (headers[idx] || '').length,
      ...rows.map(row => (row[idx] || '').length)
    );
  });
  const headerRow = formatRow(headers, resolvedWidths);
  const contentRows = rows.map(row => formatRow(row, resolvedWidths));

  return (
    <element {...rest}>
      <box
        top={0}
        left={0}
        width='100%'
        height={1}
        fg='black'
        bg='white'
        wrap={false}
        content={headerRow}
      />
      <box
        top={1}
        left={0}
        width='100%'
        height={rows.length}
        wrap={false}
        content={contentRows.join('\n')}
      />
    </element>
  );
}

Table.propTypes = {
  headers: PropTypes.arrayOf(PropTypes.string),
  widths: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.oneOf(['auto']),
  ])),
  rows: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
  top: PropTypes.number,
};

export default Table;
