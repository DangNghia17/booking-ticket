import React from 'react';

const Header = ({ category, title }) => (
  <div className="mb-8">
    <p className="text-sm font-medium text-gray-500/80 uppercase tracking-wider mb-2">{category}</p>
    <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 
                   bg-clip-text text-transparent">
      {title}
    </h1>
  </div>
);

export default Header;
