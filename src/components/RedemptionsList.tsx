import { useState } from 'react';
import {
  Search,
  Filter,
  Trash2,
  Phone,
  ChevronDown,
  ChevronUp,
  Package
} from 'lucide-react';
import { useStore } from '../store';
import { format } from 'date-fns';
import { DeliveryStatus } from '../types';

export function RedemptionsList() {
  const {
    redemptions,
    booklists,
    searchQuery,
    setSearchQuery,
    updateRedemption,
    deleteRedemption,
    setActiveView
  } = useStore();

  const [statusFilter, setStatusFilter] = useState<DeliveryStatus | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);

  const filteredRedemptions = redemptions.filter(r => {
    const matchesSearch =
      r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.voucherId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.contactNo.includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || r.deliveryStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (id: string, status: DeliveryStatus) => {
    updateRedemption(id, { deliveryStatus: status });
    setEditingStatusId(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      deleteRedemption(id);
    }
  };

  return (
    <div className="redemptions-list">
      <header className="page-header">
        <div>
          <h1>All Orders</h1>
          <p className="subtitle">{filteredRedemptions.length} orders found</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setActiveView('new-redemption')}
        >
          + New Voucher
        </button>
      </header>

      <div className="filters-bar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by name, voucher ID, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-buttons">
          <Filter size={18} />
          <button
            className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-btn ${statusFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setStatusFilter('pending')}
          >
            Pending
          </button>
          <button
            className={`filter-btn ${statusFilter === 'wrapping' ? 'active' : ''}`}
            onClick={() => setStatusFilter('wrapping')}
          >
            Wrapping
          </button>
          <button
            className={`filter-btn ${statusFilter === 'delivered' ? 'active' : ''}`}
            onClick={() => setStatusFilter('delivered')}
          >
            Delivered
          </button>
          <button
            className={`filter-btn ${statusFilter === 'collected' ? 'active' : ''}`}
            onClick={() => setStatusFilter('collected')}
          >
            Collected
          </button>
        </div>
      </div>

      {filteredRedemptions.length === 0 ? (
        <div className="empty-state large">
          <Package size={64} />
          <h3>No orders found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="orders-table">
          <div className="table-header">
            <span>Voucher</span>
            <span>Student</span>
            <span>Parent</span>
            <span>School</span>
            <span>Date</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {filteredRedemptions.map((r) => {
            const booklist = booklists.find(b => b.id === r.booklistId);
            const isExpanded = expandedId === r.id;

            return (
              <div key={r.id} className={`table-row ${isExpanded ? 'expanded' : ''}`}>
                <div className="row-main" onClick={() => setExpandedId(isExpanded ? null : r.id)}>
                  <span className="voucher-id">#{r.voucherId}</span>
                  <span className="student-name">{r.studentName}</span>
                  <span className="parent-info">
                    {r.parentName}
                    <a href={`tel:${r.contactNo}`} className="phone-link">
                      <Phone size={14} /> {r.contactNo}
                    </a>
                  </span>
                  <span>{r.school}</span>
                  <span>{format(new Date(r.createdAt), 'MMM d, yyyy')}</span>
                  <span>
                    {editingStatusId === r.id ? (
                      <select
                        value={r.deliveryStatus}
                        onChange={(e) => handleStatusChange(r.id, e.target.value as DeliveryStatus)}
                        onBlur={() => setEditingStatusId(null)}
                        autoFocus
                        className="status-select"
                      >
                        <option value="pending">Pending</option>
                        <option value="wrapping">Wrapping</option>
                        <option value="delivered">Delivered</option>
                        <option value="collected">Collected</option>
                      </select>
                    ) : (
                      <span
                        className={`status-badge ${r.deliveryStatus}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingStatusId(r.id);
                        }}
                      >
                        {r.deliveryStatus}
                      </span>
                    )}
                  </span>
                  <span className="actions">
                    <button className="icon-btn" title="View Details">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    <button
                      className="icon-btn danger"
                      title="Delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(r.id);
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </span>
                </div>

                {isExpanded && (
                  <div className="row-details">
                    <div className="detail-grid">
                      <div className="detail-item">
                        <label>Location</label>
                        <span>{r.location}</span>
                      </div>
                      <div className="detail-item">
                        <label>Class</label>
                        <span>{r.studentClass || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <label>Booklist</label>
                        <span>{booklist?.code} - {booklist?.grade}</span>
                      </div>
                      <div className="detail-item">
                        <label>Amount</label>
                        <span className="amount">MVR {booklist?.totalAmount}</span>
                      </div>
                      <div className="detail-item">
                        <label>Exercise Books</label>
                        <span>
                          Single: {r.singleRuled}, Double: {r.doubleRuled}, Square: {r.squareRuled}
                        </span>
                      </div>
                      <div className="detail-item">
                        <label>Customization</label>
                        <span>{r.customization.replace(/_/g, ' ')}</span>
                      </div>
                      <div className="detail-item">
                        <label>Options</label>
                        <span className="tags">
                          {r.hasTextbooks && <span className="tag">Textbooks</span>}
                          {r.hasStationary && <span className="tag">Stationary</span>}
                          {r.lens && <span className="tag">Lens</span>}
                          {r.cellophane && <span className="tag">Cellophane</span>}
                          {r.noName && <span className="tag warning">No Name</span>}
                        </span>
                      </div>
                      <div className="detail-item">
                        <label>Delivery Date</label>
                        <span>{r.deliveryDate ? format(new Date(r.deliveryDate), 'MMM d, yyyy') : 'Not set'}</span>
                      </div>
                      {r.additionalItems && (
                        <div className="detail-item full-width">
                          <label>Additional Items</label>
                          <span>{r.additionalItems}</span>
                        </div>
                      )}
                      {r.comments && (
                        <div className="detail-item full-width">
                          <label>Comments</label>
                          <span>{r.comments}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

