import { 
  LayoutDashboard, 
  PlusCircle, 
  ClipboardList, 
  BookOpen, 
  Settings,
  Package,
  Warehouse,
  FileText,
  LogOut,
  Store
} from 'lucide-react';
import { useStore } from '../store';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'new-redemption', label: 'New Voucher', icon: PlusCircle },
  { id: 'redemptions', label: 'All Orders', icon: ClipboardList },
  { id: 'booklists', label: 'Booklists', icon: BookOpen },
  { id: 'stock', label: 'Stock', icon: Warehouse },
  { id: 'dayend', label: 'Day End', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
] as const;

export function Sidebar() {
  const { activeView, setActiveView, getStats, currentUser, selectedOutlet, logout } = useStore();
  const stats = getStats();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Package size={32} />
        <h1>BookVoucher</h1>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeView === item.id ? 'active' : ''}`}
            onClick={() => setActiveView(item.id)}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
            {item.id === 'redemptions' && stats.totalRedemptions > 0 && (
              <span className="badge">{stats.totalRedemptions}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar-stats">
        <div className="stat-card">
          <span className="stat-value">{stats.pendingDeliveries}</span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.deliveredToday}</span>
          <span className="stat-label">Today</span>
        </div>
      </div>

      <div className="sidebar-user-info">
        {selectedOutlet && (
          <div className="outlet-badge">
            <Store size={14} />
            <span>{selectedOutlet.name}</span>
          </div>
        )}
        <div className="user-info">
          <span className="user-name">{currentUser?.name || 'User'}</span>
          <span className="user-role">{currentUser?.role === 'admin' ? 'Administrator' : 'Staff'}</span>
        </div>
        <button 
          className="btn btn-secondary btn-small btn-block"
          onClick={logout}
          style={{ marginTop: '12px' }}
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
}

