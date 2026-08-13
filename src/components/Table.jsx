import React from 'react';
import PropTypes from 'prop-types';

function formatRow(row, widths) {
  return row
    .map((cell, idx) => idx === 0 ? cell.padEnd(widths[idx]) : cell.padStart(widths[idx]))
    .join('');
}

function Table({ headers, widths, rows, top = 0, ...rest }) {
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

  // The header and the rows are siblings rather than children of a wrapping
  // element so that the table can be scrolled by a scrollable parent. Blessed
  // only offsets a scrollable element's direct children.
  return (
    <React.Fragment>
      <box
        {...rest}
        top={top}
        height={1}
        fg='black'
        bg='white'
        wrap={false}
        content={headerRow}
      />
      <box
        {...rest}
        top={top + 1}
        height={rows.length}
        wrap={false}
        content={contentRows.join('\n')}
      />
    </React.Fragment>
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
