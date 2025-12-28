import { useState } from 'react';
import {
  Package,
  Plus,
  Edit,
  Calendar,
  MapPin
} from 'lucide-react';
import { useStore } from '../store';
import { format } from 'date-fns';

const GRADES = ['1', '2', '3', '4', '5', '6', '7', '8', '9 BUS01', '9 SCI01', '9 Voc 101', '10 BUS01', '10 SCI01', '10 Voc 01'];

export function StockManagement() {
  const {
    voucherStock,
    locations,
    addVoucherStock,
    updateVoucherStock,
    getCurrentStock,
    getPreviousDayClosingStock,
    setActiveView,
    currentUser,
    selectedOutlet
  } = useStore();

  // Filter stock by outlet for staff users
  const getFilteredStock = () => {
    if (currentUser?.role === 'admin') {
      return voucherStock;
    }
    // Staff can only see stock for their selected outlet
    return voucherStock.filter(s => s.location === selectedOutlet?.name);
  };

  const filteredVoucherStock = getFilteredStock();

  // Initialize location based on user role
  const getInitialLocation = () => {
    if (currentUser?.role === 'staff' && selectedOutlet) {
      return selectedOutlet.name;
    }
    return locations[0]?.name || '';
  };

  const [selectedLocation, setSelectedLocation] = useState(getInitialLocation());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingStock, setEditingStock] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    voucherId: '',
    grade: '',
    openingStock: 0,
    received: 0,
    redeemed: 0,
    notes: '',
  });

  // Auto-calculate opening stock when grade or date changes
  const updateOpeningStock = (grade: string, date: string, location: string) => {
    if (grade && date && location) {
      const previousClosing = getPreviousDayClosingStock(grade, date, location);
      const existingStock = filteredVoucherStock.find(
        s => s.grade === grade && s.date === date && s.location === location
      );

      if (!existingStock) {
        // Auto-populate opening stock from previous day's closing
        setFormData(prev => ({
          ...prev,
          openingStock: previousClosing
        }));
      }
    }
  };

  // Get available locations based on user role
  const getAvailableLocations = () => {
    if (currentUser?.role === 'admin') {
      return locations;
    }
    // Staff can only see their outlet
    if (selectedOutlet) {
      return locations.filter(l => l.name === selectedOutlet.name);
    }
    return [];
  };

  const availableLocations = getAvailableLocations();

  const handleAddStock = () => {
    if (formData.grade && formData.voucherId) {
      // Opening stock = previous day's closing + any received stock added today
      // But if received is being added separately, we add it to opening
      const effectiveOpeningStock = formData.openingStock + formData.received;
      const closingStock = effectiveOpeningStock - formData.redeemed;

      addVoucherStock({
        voucherId: formData.voucherId,
        grade: formData.grade,
        openingStock: formData.openingStock, // Base opening (from previous day)
        received: formData.received, // New stock received today
        redeemed: formData.redeemed,
        closingStock,
        date: selectedDate,
        location: selectedLocation,
        notes: formData.notes,
      });
      setFormData({
        voucherId: '',
        grade: '',
        openingStock: 0,
        received: 0,
        redeemed: 0,
        notes: '',
      });
    }
  };

  const handleUpdateStock = (id: string) => {
    const stock = voucherStock.find(s => s.id === id);
    if (stock) {
      const closingStock = formData.openingStock + formData.received - formData.redeemed;
      updateVoucherStock(id, {
        ...formData,
        closingStock,
      });
      setEditingStock(null);
      setFormData({
        voucherId: '',
        grade: '',
        openingStock: 0,
        received: 0,
        redeemed: 0,
        notes: '',
      });
    }
  };

  const startEdit = (stock: typeof voucherStock[0]) => {
    setEditingStock(stock.id);
    setFormData({
      voucherId: stock.voucherId,
      grade: stock.grade,
      openingStock: stock.openingStock,
      received: stock.received,
      redeemed: stock.redeemed,
      notes: stock.notes || '',
    });
  };

  const filteredStock = filteredVoucherStock.filter(
    s => s.location === selectedLocation && s.date === selectedDate
  );

  // Set default location to selected outlet for staff
  const defaultLocation = currentUser?.role === 'staff' && selectedOutlet
    ? selectedOutlet.name
    : (availableLocations[0]?.name || '');

  if (selectedLocation !== defaultLocation && defaultLocation) {
    setSelectedLocation(defaultLocation);
  }

  return (
    <div className="stock-management">
      <header className="page-header">
        <div>
          <h1>Voucher Stock Management</h1>
          <p className="subtitle">Manage daily voucher stock by grade and location</p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => setActiveView('dashboard')}
        >
          Back to Dashboard
        </button>
      </header>

      <div className="stock-filters card">
        <div className="card-body">
          <div className="form-grid">
            <div className="form-group">
              <label><MapPin size={16} /> Location</label>
              <select
                value={selectedLocation}
                onChange={(e) => {
                  setSelectedLocation(e.target.value);
                  // Update opening stock when location changes
                  if (formData.grade) {
                    updateOpeningStock(formData.grade, selectedDate, e.target.value);
                  }
                }}
                disabled={currentUser?.role === 'staff'}
              >
                {availableLocations.map(l => (
                  <option key={l.id} value={l.name}>{l.name}</option>
                ))}
              </select>
              {currentUser?.role === 'staff' && (
                <span className="hint" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                  Location is set to your outlet
                </span>
              )}
            </div>
            <div className="form-group">
              <label><Calendar size={16} /> Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  // Update opening stock when date changes
                  if (formData.grade) {
                    updateOpeningStock(formData.grade, e.target.value, selectedLocation);
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="stock-summary card">
        <div className="card-header">
          <h3>Current Stock Summary</h3>
        </div>
        <div className="card-body">
          <div className="stock-summary-grid">
            {GRADES.map(grade => {
              const currentStock = getCurrentStock(grade, selectedLocation);
              return (
                <div key={grade} className="stock-summary-item">
                  <span className="grade-label">{grade}</span>
                  <span className="stock-value">{currentStock}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="stock-form card">
        <div className="card-header">
          <h3>{editingStock ? 'Edit Stock' : 'Add Stock Entry'}</h3>
        </div>
        <div className="card-body">
          <div className="form-grid">
            <div className="form-group">
              <label>Voucher ID</label>
              <input
                type="text"
                value={formData.voucherId}
                onChange={(e) => setFormData({ ...formData, voucherId: e.target.value })}
                placeholder="e.g., 3519"
              />
            </div>
            <div className="form-group">
              <label>Grade</label>
              <select
                value={formData.grade}
                onChange={(e) => {
                  const grade = e.target.value;
                  setFormData({ ...formData, grade });
                  updateOpeningStock(grade, selectedDate, selectedLocation);
                }}
              >
                <option value="">Select Grade</option>
                {GRADES.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Opening Stock (from previous day)</label>
              <input
                type="number"
                min="0"
                value={formData.openingStock}
                onChange={(e) => setFormData({ ...formData, openingStock: parseInt(e.target.value) || 0 })}
                readOnly={!editingStock}
                style={!editingStock ? { background: 'var(--bg-hover)', cursor: 'not-allowed' } : {}}
              />
              {!editingStock && formData.grade && (
                <span className="hint" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                  Auto-filled from previous day's closing stock
                </span>
              )}
            </div>
            <div className="form-group">
              <label>Received (added to opening stock)</label>
              <input
                type="number"
                min="0"
                value={formData.received}
                onChange={(e) => setFormData({ ...formData, received: parseInt(e.target.value) || 0 })}
              />
              <span className="hint" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                New stock received today
              </span>
            </div>
            <div className="form-group">
              <label>Redeemed</label>
              <input
                type="number"
                min="0"
                value={formData.redeemed}
                onChange={(e) => setFormData({ ...formData, redeemed: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="form-group full-width">
              <label>Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                placeholder="Additional notes..."
              />
            </div>
          </div>
          <div className="form-actions">
            {editingStock ? (
              <>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setEditingStock(null);
                    setFormData({
                      voucherId: '',
                      grade: '',
                      openingStock: 0,
                      received: 0,
                      redeemed: 0,
                      notes: '',
                    });
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => handleUpdateStock(editingStock)}
                >
                  Update Stock
                </button>
              </>
            ) : (
              <button
                className="btn btn-primary"
                onClick={handleAddStock}
                disabled={!formData.grade || !formData.voucherId}
              >
                <Plus size={18} /> Add Stock Entry
              </button>
            )}
          </div>
          {formData.grade && (
            <div className="stock-calculation">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Opening Stock:</span>
                  <strong>{formData.openingStock}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-teal)' }}>
                  <span>+ Received:</span>
                  <strong>+{formData.received}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626' }}>
                  <span>- Redeemed:</span>
                  <strong>-{formData.redeemed}</strong>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '8px',
                  borderTop: '1px solid var(--border)',
                  fontSize: '1.1rem'
                }}>
                  <span><strong>Closing Stock:</strong></span>
                  <strong style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>
                    {formData.openingStock + formData.received - formData.redeemed}
                  </strong>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  This closing stock will become tomorrow's opening stock
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="stock-list card">
        <div className="card-header">
          <h3>Stock Entries for {format(new Date(selectedDate), 'MMM d, yyyy')}</h3>
        </div>
        <div className="card-body">
          {filteredStock.length === 0 ? (
            <div className="empty-state">
              <Package size={48} />
              <p>No stock entries for this date</p>
            </div>
          ) : (
            <div className="stock-table">
              <div className="table-header">
                <span>Voucher ID</span>
                <span>Grade</span>
                <span>Opening</span>
                <span>Received</span>
                <span>Redeemed</span>
                <span>Closing</span>
                <span>Actions</span>
              </div>
              {filteredStock.map(stock => (
                <div key={stock.id} className="table-row">
                  <span>{stock.voucherId}</span>
                  <span>{stock.grade}</span>
                  <span>{stock.openingStock}</span>
                  <span className="text-success">+{stock.received}</span>
                  <span className="text-danger">-{stock.redeemed}</span>
                  <span className="stock-closing">{stock.closingStock}</span>
                  <span>
                    <button
                      className="icon-btn"
                      onClick={() => startEdit(stock)}
                    >
                      <Edit size={16} />
                    </button>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

