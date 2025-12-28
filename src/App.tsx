import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { NewRedemption } from './components/NewRedemption';
import { RedemptionsList } from './components/RedemptionsList';
import { BooklistManager } from './components/BooklistManager';
import { StockManagement } from './components/StockManagement';
import { DayEndReport } from './components/DayEndReport';
import { Settings } from './components/Settings';
import { Login } from './components/Login';
import { useStore } from './store';
import './App.css';

function App() {
  const { activeView, isAuthenticated, _hasHydrated } = useStore();

  // Wait for hydration to complete to prevent login screen flash
  if (!_hasHydrated) {
    return <div className="loading-screen">Loading...</div>;
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login />;
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'new-redemption':
        return <NewRedemption />;
      case 'redemptions':
        return <RedemptionsList />;
      case 'booklists':
        return <BooklistManager />;
      case 'stock':
        return <StockManagement />;
      case 'dayend':
        return <DayEndReport />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app">
      <Sidebar />
      <main className="main-content">
        {renderView()}
      </main>
    </div>
  );
}

export default App;
