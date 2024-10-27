'use client';

import React, { useState } from 'react';
import { ChevronsRight, CornerRightDown, Palette, FileCode2, Wrench } from 'lucide-react';
import { colors } from './colors';

const Sidebar: React.FC = () => {
  const [expandedNodes, setExpandedNodes] = useState<{ [key: string]: boolean }>({
    componentStyle: false,
    background: false,
  });

  const toggleNode = (node: string) => {
    setExpandedNodes(prev => ({ ...prev, [node]: !prev[node] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="md:w-64 bg-gray-800 p-4 shadow-md fixed md:static top-0 left-0 md:left-auto">
      <h2 className="text-xl font-bold mb-4 text-white">Sidebar</h2>
      <ul>
        <li>
        <div className="flex items-center">
          <button
            className=" py-2 px-4 rounded-md hover:bg-gray-700 text-white flex items-center"
            onClick={() => toggleNode('componentStyle')}
          >
            {expandedNodes.componentStyle ? 
              <div className="flex items-center">
                <Wrench className="mr-2 transition-transform" />
                <span>Properties</span>
                <CornerRightDown className="ml-2 transition-transform translate-y-2" />
              </div>

             : 
              <div className="flex items-center">
                <ChevronsRight className="mr-2 transition-transform" />
                <FileCode2 className="mr-2 transition-transform" />
                <span>Component Style</span>
              </div>

            }   
          </button>
          </div>
          <ul className={`ml-4 ${expandedNodes.componentStyle ? '' : 'hidden'}`}>
            <li>
              <button
                className="block py-2 px-4 rounded-md hover:bg-gray-700 text-white flex items-center"
                onClick={() => toggleNode('background')}
              >
                {expandedNodes.background ? 
                  <div className="flex items-center">
                    <Palette className="mr-2 transition-transform" />
                    <span>Colors</span>
                    <CornerRightDown className="ml-2 transition-transform translate-y-2" />
                  </div>
                 : 
                    <div className="flex items-center">
                    <ChevronsRight className="mr-2 transition-transform" />
                    <Palette className="mr-2 transition-transform" />
                    Palette
                  </div>
                }
                
              </button>
              <ul className={`ml-4 ${expandedNodes.background ? '' : 'hidden'}`}>
                {colors.map((color, index) => (
                  <li key={color.name}>
                    <button
                      className={`bg-[${color.value}] px-4 py-0 rounded-md hover:bg-red-400 text-[${colors[(15-index)].value}]`}
                      onClick={() => copyToClipboard("[" + color + "]")}
                    >
                      {color.name}
                    </button>
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
