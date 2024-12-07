'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from './Sidebar';

const MIN_WIDTH = 300;
const MAX_WIDTH = 1600;

const ResizableSidebar: React.FC = () => {
  const [width, setWidth] = useState(384); // 384px = 96rem (md:w-96)
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (isResizing) {
      const newWidth = e.clientX;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setWidth(newWidth);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    }

    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  return (
    <div style={{ width: `${width}px` }} className="relative flex">
      <Sidebar className="w-full" />
      <div
        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-gray-500 transition-colors"
        style={{ 
          background: isResizing ? '#4a5568' : '#2d3748',
        }}
        onMouseDown={startResizing}
      />
    </div>
  );
};

export default ResizableSidebar;
