'use client';

import React, { useState } from 'react';
import { ChevronsRight, CornerRightDown, Palette, FileCode2, Wrench } from 'lucide-react';
import { colors } from '../res/colors';
//import Styles from './Styles';
import { useComponentContext } from '../context/ComponentContext';

const Sidebar: React.FC = () => {
  const [expandedNodes, setExpandedNodes] = useState<{ [key: string]: boolean }>({
    componentStyle: false,
    background: false,
  });
  const { selectedComponent, setSelectedComponent, components} = useComponentContext();

  const toggleNode = (node: string) => {
    setExpandedNodes(prev => ({ ...prev, [node]: !prev[node] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleComponentChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedComponent(event.target.value);
    if (event.target.value) {
      //compileAndRender(event.target.value);
    }
  }

  return (
    <div className="md:w-64 bg-gray-800 p-4 shadow-md fixed md:static top-0 left-0 md:left-auto">
      <h2 className="text-xl font-bold mb-4 text-white">Sidebar 2</h2>
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
                className=" py-2 px-4 rounded-md hover:bg-gray-700 text-white flex items-center"
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
                      className={`bg-${color.name} px-4 py-0 rounded-md hover:bg-[#555555] min-w-[200px] text-${colors[(index+16) % colors.length].name}`}
                      onClick={() => copyToClipboard("[" + color.value + "]")}
                    >
                      {color.name}
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </li>
        <li>
          <select className="w-full p-2 border rounded mb-4 bg-[#b472d0]" value={selectedComponent} onChange={handleComponentChange}>
            <option value="">Select a component</option>
            {Object.keys(components).map(comp => <option key={comp} value={comp}>{comp}</option>)}
          </select>
        </li>
      </ul>

    </div>
  );
};

export default Sidebar;
