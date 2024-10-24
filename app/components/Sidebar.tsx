import React from 'react';

const Sidebar: React.FC = () => {
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
      </ul>
    </div>
  );
};

export default Sidebar;
