import React, { useEffect, useState } from 'react';
import { useThemeMode } from '../contexts/ThemeContext';
import '../styles/cursor.css';

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dotPosition, setDotPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const { mode } = useThemeMode();

  useEffect(() => {
    document.body.setAttribute('data-theme', mode);
  }, [mode]);

  useEffect(() => {
    const updateCursor = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setDotPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      const isInteractive =
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.tagName === 'TEXTAREA' ||
        target.closest('button') ||
        target.closest('a') ||
        target.getAttribute('role') === 'button';

      setIsHovering(isInteractive);
    };

    window.addEventListener('mousemove', updateCursor);
    document.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', updateCursor);
      document.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return (
    <>
      <div
        className={`custom-cursor ${isHovering ? 'hover' : ''}`}
        style={{
          transform: `translate(${position.x - 10}px, ${position.y - 10}px)`,
        }}
      />
      <div
        className={`custom-cursor-dot ${isHovering ? 'hover' : ''}`}
        style={{
          transform: `translate(${dotPosition.x - 3}px, ${dotPosition.y - 3}px)`,
        }}
      />
    </>
  );
};

export default CustomCursor;