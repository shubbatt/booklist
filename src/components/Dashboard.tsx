import { 
  TrendingUp, 
  Package, 
  Clock, 
  CheckCircle,
  ArrowRight,
  AlertCircle,
  FileText,
  Trash2
} from 'lucide-react';
import { useStore } from '../store';
import { format } from 'date-fns';

export function Dashboard() {
  const { 
    redemptions, 
    booklists, 
    drafts,
    setActiveView, 
    getStats,
    deleteDraft,
    setCurrentDraftId
  } = useStore();
  const stats = getStats();
  
  const recentRedemptions = redemptions.slice(0, 5);
  const pendingOrders = redemptions.filter(
    r => r.deliveryStatus === 'pending' || r.deliveryStatus === 'wrapping'
  ).slice(0, 5);

  const handleResumeDraft = (draftId: string) => {
    setCurrentDraftId(draftId);
    setActiveView('new-redemption');
  };

  const handleDeleteDraft = (draftId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this draft?')) {
      deleteDraft(draftId);
    }
  };

  return (
    <div className="dashboard">
      <header className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="subtitle">Welcome back! Here's your overview.</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setCurrentDraftId(null); // Clear current draft to start fresh
            setActiveView('new-redemption');
          }}
        >
          + New Voucher
        </button>
      </header>

      <div className="stats-grid">
        <div className="stat-box">
          <div className="stat-icon blue">
            <Package size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-number">{stats.totalRedemptions}</span>
            <span className="stat-title">Total Orders</span>
          </div>
        </div>
        
        <div className="stat-box">
          <div className="stat-icon orange">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-number">{stats.pendingDeliveries}</span>
            <span className="stat-title">Pending Delivery</span>
          </div>
        </div>
        
        <div className="stat-box">
          <div className="stat-icon green">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-number">{stats.deliveredToday}</span>
            <span className="stat-title">Delivered Today</span>
          </div>
        </div>
        
        <div className="stat-box">
          <div className="stat-icon purple">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-number">MVR {stats.totalValue.toLocaleString()}</span>
            <span className="stat-title">Total Value</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h3>Recent Orders</h3>
            <button 
              className="btn-link"
              onClick={() => setActiveView('redemptions')}
            >
              View All <ArrowRight size={16} />
            </button>
          </div>
          <div className="card-body">
            {recentRedemptions.length === 0 ? (
              <div className="empty-state">
                <Package size={48} />
                <p>No orders yet</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setActiveView('new-redemption')}
                >
                  Create First Order
                </button>
              </div>
            ) : (
              <ul className="order-list">
                {recentRedemptions.map((r) => {
                  const booklist = booklists.find(b => b.id === r.booklistId);
                  return (
                    <li key={r.id} className="order-item">
                      <div className="order-info">
                        <strong>{r.studentName}</strong>
                        <span className="order-meta">
                          {r.school} • {booklist?.grade || 'N/A'}
                        </span>
                      </div>
                      <div className="order-status">
                        <span className={`status-badge ${r.deliveryStatus}`}>
                          {r.deliveryStatus}
                        </span>
                        <span className="order-date">
                          {format(new Date(r.createdAt), 'MMM d')}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Pending Deliveries</h3>
            <AlertCircle size={20} className="text-warning" />
          </div>
          <div className="card-body">
            {pendingOrders.length === 0 ? (
              <div className="empty-state small">
                <CheckCircle size={32} />
                <p>All caught up!</p>
              </div>
            ) : (
              <ul className="order-list">
                {pendingOrders.map((r) => (
                  <li key={r.id} className="order-item">
                    <div className="order-info">
                      <strong>{r.studentName}</strong>
                      <span className="order-meta">{r.parentName}</span>
                    </div>
                    <span className={`status-badge ${r.deliveryStatus}`}>
                      {r.deliveryStatus}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Available Booklists</h3>
            <button 
              className="btn-link"
              onClick={() => setActiveView('booklists')}
            >
              Manage <ArrowRight size={16} />
            </button>
          </div>
          <div className="card-body">
            <ul className="booklist-list">
              {booklists.map((b) => (
                <li key={b.id} className="booklist-item">
                  <div>
                    <strong>{b.grade}</strong>
                    <span className="booklist-code">{b.code}</span>
                  </div>
                  <span className="booklist-total">MVR {b.totalAmount}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3><FileText size={20} /> Drafts</h3>
            {drafts.length > 0 && (
              <span className="badge">{drafts.length}</span>
            )}
          </div>
          <div className="card-body">
            {drafts.length === 0 ? (
              <div className="empty-state small">
                <FileText size={32} />
                <p>No drafts</p>
                <p className="hint" style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                  Start a new voucher to create a draft
                </p>
              </div>
            ) : (
              <ul className="draft-list">
                {drafts.slice(0, 5).map((draft) => {
                  const studentName = draft.formData.studentName || 'Unnamed';
                  const voucherId = draft.formData.voucherId || 'No ID';
                  const hasData = studentName !== 'Unnamed' || voucherId !== 'No ID';
                  return (
                    <li 
                      key={draft.id} 
                      className="draft-item"
                      onClick={() => handleResumeDraft(draft.id)}
                    >
                      <div className="draft-info">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong>{studentName}</strong>
                          {!hasData && (
                            <span className="draft-badge-new" style={{
                              fontSize: '0.7rem',
                              padding: '2px 6px',
                              background: 'var(--bg-hover)',
                              borderRadius: '4px',
                              color: 'var(--text-muted)'
                            }}>
                              New
                            </span>
                          )}
                        </div>
                        <span className="draft-meta">
                          {voucherId !== 'No ID' && `Voucher: ${voucherId} • `}
                          Step {draft.currentStep} of 6
                        </span>
                        <span className="draft-date">
                          Last saved: {format(new Date(draft.updatedAt), 'MMM d, h:mm a')}
                        </span>
                      </div>
                      <div className="draft-actions">
                        <button 
                          className="icon-btn danger"
                          onClick={(e) => handleDeleteDraft(draft.id, e)}
                          title="Delete draft"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

