
import React from 'react';
import { Star, Coins, Calendar } from 'lucide-react';

const Header = () => {
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-finance bg-clip-text text-transparent">
              FinanceGame
            </h1>
            <p className="text-sm text-gray-500 flex items-center mt-1">
              <Calendar className="w-4 h-4 mr-1" />
              {currentDate}
            </p>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 bg-gradient-finance px-4 py-2 rounded-full text-white">
              <Star className="w-5 h-5" />
              <span className="font-semibold">Nível 7</span>
            </div>
            
            <div className="flex items-center space-x-2 bg-yellow-100 px-4 py-2 rounded-full text-yellow-800">
              <Coins className="w-5 h-5" />
              <span className="font-semibold">2,450 pts</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
