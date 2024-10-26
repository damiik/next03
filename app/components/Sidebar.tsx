'use client';

import React, { useState } from 'react';
import { CornerRightDown, ChevronsRight, Palette, FileCode2, Wrench } from 'lucide-react';
import { colors } from './colors';


const Sidebar: React.FC = () => {
  const [isComponentStyleOpen, setIsComponentStyleOpen] = useState(false);
  const [isBackgroundOpen, setIsBackgroundOpen] = useState(false);

  const toggleComponentStyle = () => {
    setIsComponentStyleOpen(!isComponentStyleOpen);
  };

  const toggleBackground = () => {
    setIsBackgroundOpen(!isBackgroundOpen);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="md:w-64 bg-gray-800 p-4 shadow-md fixed md:static top-0 left-0 md:left-auto">
      <h2 className="text-xl font-bold mb-4 text-white">Sidebar</h2>
      <ul>
        <li>
          {isComponentStyleOpen ? (
            <a
              href="#"
              className="block py-2 px-4 rounded-md hover:bg-gray-700 text-white flex items-center"
              onClick={toggleComponentStyle}
            >
              <Wrench className="mr-2 transition-transform" />
              Properities
              <CornerRightDown className="ml-2 transition-transform translate-y-2" />
            </a>
          ) : (
            <a
              href="#"
              className="block py-2 px-4 rounded-md hover:bg-gray-700 text-white flex items-center"
              onClick={toggleComponentStyle}
            >
              <ChevronsRight className="mr-2 transition-transform" />
              <FileCode2 className="mr-2 transition-transform" />
              Component Style
            </a>
          )}
          <ul className={`ml-4 ${isComponentStyleOpen ? '' : 'hidden'}`}>
            <li>
              {isBackgroundOpen ? (
                <a
                  href="#"
                  className="py-2 px-4 rounded-md hover:bg-gray-700 text-white flex items-center"
                  onClick={toggleBackground}
                >
                  <Palette className="mr-2 transition-transform" />
                  Colors
                  <CornerRightDown className="ml-2 transition-transform translate-y-2" />
                </a>
              ) : (
                <a
                  href="#"
                  className="py-2 px-4 rounded-md hover:bg-gray-700 text-white flex items-center"
                  onClick={toggleBackground}
                >
                  <ChevronsRight className="mr-2 transition-transform" />
                  <Palette className="mr-2 transition-transform" />

                  Palette
                </a>
              )}
              <ul className={`ml-4 ${isBackgroundOpen ? '' : 'hidden'}`}>
                {Object.entries(colors).map(([color, name], index) => (
                  <li key={color}>
                    <a
                      href="#"
                      className={`bg-[${color}] px-4 py-0 rounded-md hover:bg-red-400 text-[${(Object.entries(colors)[(15-index)][0])}]`}
                      onClick={() => copyToClipboard("[" + color + "]")}
                    >
                      {name}
                    </a>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
