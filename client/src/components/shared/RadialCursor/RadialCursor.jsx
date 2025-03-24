import React, {useEffect, useState} from "react";

import "./RadialCursor.css";

const CursorRadius = ({
                          size = 40,
                          borderWidth = 2,
                          borderColor = '#050C35',
                          transitionSpeed = 0.05,
                          hoverSize = 25,
                          hoverColor = '#ffff00',
                          isHovering = false,
                      }) => {
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            setCursorPosition({
                x: e.clientX,
                y: e.clientY
            });
        };

        document.addEventListener('mousemove', handleMouseMove);
        return () => document.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const cursorStyles = {
        position: 'fixed',
        width: `${isHovering ? hoverSize : size}px`,
        height: `${isHovering ? hoverSize : size}px`,
        borderRadius: '50%',
        border: `${borderWidth}px solid ${isHovering ? hoverColor : borderColor}`,
        backgroundColor: isHovering ? "rgba(255, 255, 0, .6)" : 'transparent',
        pointerEvents: 'none',
        transform: `translate(-50%, -50%)`,
        transition: `all ${transitionSpeed}s ease-out`,
        zIndex: 1000,
        left: `${cursorPosition.x}px`,
        top: `${cursorPosition.y}px`
    };

    return (
        <div>
            <div style={cursorStyles} />
        </div>
    );
};

CursorRadius.displayName = 'CursorRadius';

export default CursorRadius;