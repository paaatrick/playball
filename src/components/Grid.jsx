import React, { useEffect, useRef, useState } from "react";
import log from '../logger';

function Grid({ items, itemHeight, itemMinWidth, onSelect }) {
    const containerRef = useRef()
    const [size, setSize] = useState([0, 0])
    const [selectedIndex, setSelectedIndex] = useState(0)
    const updateSize = () => setSize([containerRef.current?.width, containerRef.current?.height])
    useEffect(updateSize, [])

    const pos = []
    let row = 0
    let col = 0
    const numCols = Math.floor(size[0] / itemMinWidth)
    const colWidth = Math.floor(size[0] / numCols)
    for (let i = 0; i < items.length; i++) {
        pos.push({
            top: row,
            left: col,
            width: colWidth,
            height: itemHeight,
        })
        col += colWidth
        if (col > size[0] - colWidth) {
            col = 0
            row += itemHeight
        }
    }

    const handleKeypress = (_, evt) => {
        if (evt.name === 'right' || evt.name === 'l') {
            setSelectedIndex(prev => Math.min(prev + 1, items.length - 1))
        } else if (evt.name === 'left' || evt.name === 'h') {
            setSelectedIndex(prev => Math.max(prev - 1, 0))
        } else if (evt.name === 'down' || evt.name === 'j') {
            setSelectedIndex(prev => {
                const next = prev + numCols
                if (next < items.length) {
                    return next
                } else {
                    return prev
                }
            })
        } else if (evt.name === 'up' || evt.name === 'k') {
            setSelectedIndex(prev => {
                const next = prev - numCols
                if (next >= 0) {
                    return next
                } else {
                    return prev
                }
            })
        } else if (evt.name === 'enter') {
            onSelect(selectedIndex)
        }
    };

    return (
        <box 
            ref={containerRef} 
            onKeypress={handleKeypress}
            onResize={updateSize} 
            width='100%' 
            height='100%'
            keyable
            focused
        >
            {pos.map((p, idx) => (
                <box 
                    {...p} 
                    border={{type: selectedIndex === idx ? 'line' : 'bg'}}
                    key={items[idx]}
                >
                    {items[idx]}
                </box>
            ))}
        </box>
    )
}

export default Grid;
