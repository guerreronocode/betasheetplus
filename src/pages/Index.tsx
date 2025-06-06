
import React from 'react';
import Header from '@/components/Header';
import QuickStats from '@/components/QuickStats';
import FinancialScore from '@/components/FinancialScore';
import Goals from '@/components/Goals';
import Achievements from '@/components/Achievements';
import MonthlyObjectives from '@/components/MonthlyObjectives';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Boas vindas e estatísticas rápidas */}
        <div className="mb-8">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Olá, João! 👋
            </h2>
            <p className="text-gray-600">
              Você está no <span className="font-semibold text-green-600">Nível 7</span> e ganhou <span className="font-semibold text-yellow-600">+120 pontos</span> esta semana!
            </p>
          </div>
          
          <QuickStats />
        </div>

        {/* Layout em grid responsivo */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna principal */}
          <div className="lg:col-span-2 space-y-8">
            <FinancialScore />
            <Goals />
            <Achievements />
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <MonthlyObjectives />
            
            {/* Card de dica rápida */}
            <div className="bg-gradient-finance p-6 rounded-lg text-white">
              <h4 className="font-semibold mb-2">💡 Dica do Dia</h4>
              <p className="text-sm opacity-90 mb-4">
                Revisar seus gastos semanalmente pode aumentar sua taxa de poupança em até 15%!
              </p>
              <button className="bg-white text-green-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                Revisar Gastos
              </button>
            </div>

            {/* Progresso semanal */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h4 className="font-semibold mb-4 text-gray-900">Progresso Semanal</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Receitas registradas</span>
                  <span className="text-sm font-medium">100%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full w-full"></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Gastos controlados</span>
                  <span className="text-sm font-medium">78%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full w-3/4"></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Metas atingidas</span>
                  <span className="text-sm font-medium">60%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full w-3/5"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
