
import React from 'react';
import { StarIcon } from './Icons';

interface HeaderProps {
  points: number;
}

const Header: React.FC<HeaderProps> = ({ points }) => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm shadow-md z-50">
      <div className="container mx-auto px-4 h-20 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">
          Easy<span className="text-indigo-600">Bill</span>
        </h1>
        <div className="flex items-center space-x-3 bg-indigo-600 text-white font-bold rounded-full px-5 py-2 shadow-lg">
          <StarIcon className="w-6 h-6 text-yellow-300" />
          <span className="text-xl tracking-wider">
            {new Intl.NumberFormat().format(points)}
          </span>
          <span className="text-sm font-normal opacity-80">puntos</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
