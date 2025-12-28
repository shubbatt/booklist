import { useState } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  BookOpen
} from 'lucide-react';
import { useStore } from '../store';
import { BooklistItem, Booklist } from '../types';
import { v4 as uuidv4 } from 'uuid';

export function BooklistManager() {
  const { booklists, addBooklist, updateBooklist, deleteBooklist } = useStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<Booklist>>({
    code: '',
    name: '',
    grade: '',
    items: [],
    totalAmount: 0,
  });

  const [newItem, setNewItem] = useState<Partial<BooklistItem>>({
    name: '',
    quantity: 1,
    rate: 0,
  });

  const startEditing = (booklist: Booklist) => {
    setEditingId(booklist.id);
    setFormData({ ...booklist });
    setIsCreating(false);
  };

  const startCreating = () => {
    setIsCreating(true);
    setEditingId(null);
    setFormData({
      code: '',
      name: '',
      grade: '',
      items: [],
      totalAmount: 0,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData({
      code: '',
      name: '',
      grade: '',
      items: [],
      totalAmount: 0,
    });
  };

  const addItem = () => {
    if (newItem.name && newItem.rate) {
      const item: BooklistItem = {
        id: uuidv4(),
        name: newItem.name,
        quantity: newItem.quantity || 1,
        rate: newItem.rate,
        amount: (newItem.quantity || 1) * newItem.rate,
      };
      
      const items = [...(formData.items || []), item];
      const totalAmount = items.reduce((sum, i) => sum + i.amount, 0);
      
      setFormData({ ...formData, items, totalAmount });
      setNewItem({ name: '', quantity: 1, rate: 0 });
    }
  };

  const removeItem = (itemId: string) => {
    const items = (formData.items || []).filter(i => i.id !== itemId);
    const totalAmount = items.reduce((sum, i) => sum + i.amount, 0);
    setFormData({ ...formData, items, totalAmount });
  };

  const handleSave = () => {
    if (formData.code && formData.name && formData.grade) {
      if (isCreating) {
        addBooklist(formData as Omit<Booklist, 'id'>);
      } else if (editingId) {
        updateBooklist(editingId, formData);
      }
      cancelEditing();
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this booklist?')) {
      deleteBooklist(id);
    }
  };

  return (
    <div className="booklist-manager">
      <header className="page-header">
        <div>
          <h1>Booklist Manager</h1>
          <p className="subtitle">Manage grade booklists and items</p>
        </div>
        {!isCreating && !editingId && (
          <button className="btn btn-primary" onClick={startCreating}>
            <Plus size={18} /> New Booklist
          </button>
        )}
      </header>

      {(isCreating || editingId) && (
        <div className="booklist-form card">
          <div className="card-header">
            <h3>{isCreating ? 'Create New Booklist' : 'Edit Booklist'}</h3>
            <button className="btn btn-secondary btn-small" onClick={cancelEditing}>
              <X size={16} /> Cancel
            </button>
          </div>
          <div className="card-body">
            <div className="form-grid">
              <div className="form-group">
                <label>Code</label>
                <input
                  type="text"
                  value={formData.code || ''}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., VCH-GR2-ALL"
                />
              </div>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Stationary List for Grade 2"
                />
              </div>
              <div className="form-group">
                <label>Grade</label>
                <input
                  type="text"
                  value={formData.grade || ''}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  placeholder="e.g., Grade 2"
                />
              </div>
            </div>

            <div className="items-section">
              <h4>Items</h4>
              
              <div className="add-item-form">
                <input
                  type="text"
                  placeholder="Item name"
                  value={newItem.name || ''}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Qty"
                  min="1"
                  value={newItem.quantity || ''}
                  onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                  style={{ width: '80px' }}
                />
                <input
                  type="number"
                  placeholder="Rate"
                  min="0"
                  value={newItem.rate || ''}
                  onChange={(e) => setNewItem({ ...newItem, rate: parseFloat(e.target.value) || 0 })}
                  style={{ width: '100px' }}
                />
                <button className="btn btn-small" onClick={addItem}>
                  <Plus size={16} /> Add
                </button>
              </div>

              <div className="items-list">
                {(formData.items || []).map((item) => (
                  <div key={item.id} className="item-row">
                    <span className="item-name">{item.name}</span>
                    <span className="item-qty">x{item.quantity}</span>
                    <span className="item-rate">MVR {item.rate}</span>
                    <span className="item-amount">MVR {item.amount}</span>
                    <button 
                      className="icon-btn danger"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="items-total">
                <strong>Total: MVR {formData.totalAmount || 0}</strong>
              </div>
            </div>

            <div className="form-actions">
              <button className="btn btn-primary" onClick={handleSave}>
                <Save size={18} /> Save Booklist
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="booklists-grid">
        {booklists.map((booklist) => (
          <div key={booklist.id} className="booklist-card card">
            <div className="card-header">
              <div>
                <h3>{booklist.grade}</h3>
                <span className="booklist-code">{booklist.code}</span>
              </div>
              <div className="card-actions">
                <button 
                  className="icon-btn"
                  onClick={() => startEditing(booklist)}
                >
                  <Edit size={18} />
                </button>
                <button 
                  className="icon-btn danger"
                  onClick={() => handleDelete(booklist.id)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div className="card-body">
              <div className="booklist-summary">
                <div className="summary-stat">
                  <BookOpen size={20} />
                  <span>{booklist.items.length} items</span>
                </div>
                <div className="summary-total">
                  MVR {booklist.totalAmount}
                </div>
              </div>
              <ul className="booklist-items-preview">
                {booklist.items.slice(0, 5).map((item) => (
                  <li key={item.id}>
                    <span>{item.name}</span>
                    <span>x{item.quantity}</span>
                  </li>
                ))}
                {booklist.items.length > 5 && (
                  <li className="more-items">+{booklist.items.length - 5} more items</li>
                )}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

