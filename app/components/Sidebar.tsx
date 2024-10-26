'use client';

import React, { useState } from 'react';
import { CornerRightDown, ChevronDown } from 'lucide-react';

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
          <a
            href="#"
            className="block py-2 px-4 rounded-md hover:bg-gray-700 text-white"
          >
            Link 1
          </a>
        </li>
        <li>
          <a
            href="#"
            className="block py-2 px-4 rounded-md hover:bg-gray-700 text-white"
          >
            Link 2
          </a>
        </li>
        <li>
          {isComponentStyleOpen ? (
            <a
              href="#"
              className="block py-2 px-4 rounded-md hover:bg-gray-700 text-white flex items-center"
              onClick={toggleComponentStyle}
            >
              Component style
              <CornerRightDown className="ml-2 transition-transform translate-y-2" />
            </a>
          ) : (
            <a
              href="#"
              className="block py-2 px-4 rounded-md hover:bg-gray-700 text-white flex items-center"
              onClick={toggleComponentStyle}
            >
              <ChevronDown className="mr-2 transition-transform" />
              Component style
            </a>
          )}
          <ul className={`ml-4 ${isComponentStyleOpen ? '' : 'hidden'}`}>
            <li>
              {isBackgroundOpen ? (
                <a
                  href="#"
                  className="block py-2 px-4 rounded-md hover:bg-gray-700 text-white flex items-center"
                  onClick={toggleBackground}
                >
                  Background
                  <CornerRightDown className="ml-2 transition-transform translate-y-2" />
                </a>
              ) : (
                <a
                  href="#"
                  className="block py-2 px-4 rounded-md hover:bg-gray-700 text-white flex items-center"
                  onClick={toggleBackground}
                >
                  <ChevronDown className="mr-2 transition-transform" />
                  Background
                </a>
              )}
              <ul className={`ml-4 ${isBackgroundOpen ? '' : 'hidden'}`}>
                <li>
                  <a
                    href="#"
                    className="bg-[#000000] px-4 py-2 rounded-md hover:bg-gray-700 text-white"
                    onClick={() => copyToClipboard('#000000')}
                  >
                    BLACK
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="bg-[#ffffff] px-4 py-2 rounded-md hover:bg-gray-700 text-white"
                    onClick={() => copyToClipboard('#ffffff')}
                  >
                    WHITE
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="bg-[#9a0000] px-4 py-2 rounded-md hover:bg-gray-700 text-white"
                    onClick={() => copyToClipboard('#9a0000')}
                  >
                    RED
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="bg-[#a590e8] px-4 py-2 rounded-md hover:bg-gray-700 text-white"
                    onClick={() => copyToClipboard('#a590e8')}
                  >
                    CYAN
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="bg-[#b472d0] px-4 py-2 rounded-md hover:bg-gray-700 text-white"
                    onClick={() => copyToClipboard('#b472d0')}
                  >
                    PURPLE
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="bg-[#9fe339] px-4 py-2 rounded-md hover:bg-gray-700 text-white"
                    onClick={() => copyToClipboard('#9fe339')}
                  >
                    GREEN
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="bg-[#352879] px-4 py-2 rounded-md hover:bg-gray-700 text-white"
                    onClick={() => copyToClipboard('#352879')}
                  >
                    BLUE
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="bg-[#fff780] px-4 py-2 rounded-md hover:bg-gray-700 text-white"
                    onClick={() => copyToClipboard('#fff780')}
                  >
                    YELLOW
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="bg-[#d49a44] px-4 py-2 rounded-md hover:bg-gray-700 text-white"
                    onClick={() => copyToClipboard('#d49a44')}
                  >
                    ORANGE
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="bg-[#433900] px-4 py-2 rounded-md hover:bg-gray-700 text-white"
                    onClick={() => copyToClipboard('#433900')}
                  >
                    BROWN
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="bg-[#f6ab96] px-4 py-2 rounded-md hover:bg-gray-700 text-white"
                    onClick={() => copyToClipboard('#f6ab96')}
                  >
                    PINKY / LIGHT RED
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="bg-[#656565] px-4 py-2 rounded-md hover:bg-gray-700 text-white"
                    onClick={() => copyToClipboard('#656565')}
                  >
                    DARK GREY
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="bg-[#b1b1b1] px-4 py-2 rounded-md hover:bg-gray-700 text-white"
                    onClick={() => copyToClipboard('#b1b1b1')}
                  >
                    MID GREY
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="bg-[#e4ffb5] px-4 py-2 rounded-md hover:bg-gray-700 text-white"
                    onClick={() => copyToClipboard('#e4ffb5')}
                  >
                    LIGHT GREEN
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="bg-[#a9f3fe] px-4 py-2 rounded-md hover:bg-gray-700 text-white"
                    onClick={() => copyToClipboard('#a9f3fe')}
                  >
                    SKY / LIGHT BLUE
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="bg-[#d8e4e4] px-4 py-2 rounded-md hover:bg-gray-700 text-white"
                    onClick={() => copyToClipboard('#d8e4e4')}
                  >
                    LIGHT GREY
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
