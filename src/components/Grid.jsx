import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import useKey from '../hooks/useKey.js';

function Grid({ items, itemHeight, itemMinWidth, onSelect }) {
  const containerRef = useRef();
  const [size, setSize] = useState([0, 0]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const updateSize = () => setSize([containerRef.current?.width, containerRef.current?.height]);
  useEffect(updateSize, []);

  const pos = [];
  let row = 0;
  let col = 0;
  const numCols = Math.floor(size[0] / itemMinWidth);
  const colWidth = Math.floor(size[0] / numCols);
  for (let i = 0; i < items.length; i++) {
    pos.push({
      top: row,
      left: col,
      width: colWidth,
      height: itemHeight,
    });
    col += colWidth;
    if (col > size[0] - colWidth) {
      col = 0;
      row += itemHeight;
    }
  }

  useEffect(() => {
    const curr = pos[selectedIndex].top;
    const total = pos[pos.length - 1].top;
    const perc = Math.round(curr / total * 100);
    containerRef.current.setScrollPerc(perc);
  }, [pos, selectedIndex]);

  useKey(['right', 'l'], useCallback(() => setSelectedIndex(prev => Math.min(prev + 1, items.length - 1)), [items.length]));
  useKey(['left', 'h'], useCallback(() => setSelectedIndex(prev => Math.max(prev - 1, 0)), []));
  useKey(['down', 'j'], useCallback(() => {
    setSelectedIndex(prev => {
      const next = prev + numCols;
      if (next < items.length) {
        return next;
      } else {
        return prev;
      }
    });
  }, [numCols, items.length]));
  useKey(['up', 'k'], useCallback(() => {
    setSelectedIndex(prev => {
      const next = prev - numCols;
      if (next >= 0) {
        return next;
      } else {
        return prev;
      }
    });
  }, [numCols]));
  useKey('enter', () => onSelect(selectedIndex));

  return (
    <box 
      ref={containerRef} 
      onResize={updateSize} 
      width='100%' 
      height='100%'
      scrollable={true}
    >
      {pos.map((p, idx) => (
        <box 
          {...p} 
          border={{type: selectedIndex === idx ? 'line' : 'bg'}}
          key={items[idx]}
          tags
          content={items[idx]}
          wrap={false}
        />
      ))}
    </box>
  );
}

Grid.propTypes = {
  items: PropTypes.arrayOf(PropTypes.string),
  itemHeight: PropTypes.number,
  itemMinWidth: PropTypes.number,
  onSelect: PropTypes.func,
};

export default Grid;
