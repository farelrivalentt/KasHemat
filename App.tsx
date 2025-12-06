import React, { useState } from 'react';
import { HashRouter } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Products from './pages/Products';
import TransactionHistory from './pages/TransactionHistory';
import Reports from './pages/Reports';
import BottomNav from './components/BottomNav';
import { TabView } from './types';

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabView>('dashboard');

  const renderScreen = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard onChangeTab={setCurrentTab} />;
      case 'pos':
        return <POS />;
      case 'products':
        return <Products />;
      case 'transactions':
        return <TransactionHistory />;
      case 'reports':
        return <Reports />;
      default:
        return <Dashboard onChangeTab={setCurrentTab} />;
    }
  };

  return (
    <HashRouter>
      <div className="bg-gray-50 min-h-screen text-gray-800 font-sans max-w-md mx-auto shadow-2xl overflow-hidden relative border-x border-gray-200">
        <div className="h-full overflow-y-auto no-scrollbar">
          {renderScreen()}
        </div>
        <BottomNav currentTab={currentTab} onTabChange={setCurrentTab} />
      </div>
    </HashRouter>
  );
};

export default App;