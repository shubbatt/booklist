import { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Building2,
  CheckSquare,
  Edit,
  ToggleLeft,
  ToggleRight,
  UserPlus,
  Store
} from 'lucide-react';
import { useStore } from '../store';
import { UserRole, User, Outlet } from '../types';

export function Settings() {
  const {
    schools,
    optionItems,
    currentUser,
    addSchool,
    addOptionItem,
    updateOptionItem,
    deleteOptionItem,
    toggleOptionItem,
  } = useStore();

  const isAdmin = currentUser?.role === 'admin';

  // Local state for users and outlets from database (not from store)
  const [users, setUsers] = useState<User[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);

  // Load users and outlets from database on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersRes, outletsRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/outlets')
        ]);

        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData);
        }

        if (outletsRes.ok) {
          const outletsData = await outletsRes.json();
          setOutlets(outletsData);
        }
      } catch (err) {
        console.error('Failed to load data:', err);
      }
    };

    loadData();
  }, []);

  // Refresh data from database
  const refreshData = async () => {
    try {
      const [usersRes, outletsRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/outlets')
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }

      if (outletsRes.ok) {
        const outletsData = await outletsRes.json();
        setOutlets(outletsData);
      }
    } catch (err) {
      console.error('Failed to refresh data:', err);
    }
  };

  const [newSchool, setNewSchool] = useState('');
  const [newOptionName, setNewOptionName] = useState('');
  const [newOptionKey, setNewOptionKey] = useState('');
  const [editingOption, setEditingOption] = useState<string | null>(null);

  // User management state
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('staff');
  const [newUserOutlet, setNewUserOutlet] = useState('');
  const [editingUser, setEditingUser] = useState<string | null>(null);

  // Outlet management state
  const [newOutletName, setNewOutletName] = useState('');
  const [newOutletCode, setNewOutletCode] = useState('');
  const [editingOutlet, setEditingOutlet] = useState<string | null>(null);

  const handleAddSchool = () => {
    if (newSchool.trim()) {
      addSchool(newSchool.trim());
      setNewSchool('');
    }
  };

  const handleAddOption = () => {
    if (newOptionName.trim() && newOptionKey.trim()) {
      addOptionItem({
        name: newOptionName.trim(),
        key: newOptionKey.trim(),
        enabled: true,
        defaultChecked: false,
      });
      setNewOptionName('');
      setNewOptionKey('');
    }
  };

  const handleEditOption = (id: string, field: 'name' | 'key' | 'defaultChecked', value: string | boolean) => {
    updateOptionItem(id, { [field]: value });
    if (field === 'name' || field === 'key') {
      setEditingOption(null);
    }
  };

  const handleAddUser = async () => {
    if (newUsername.trim() && newPassword.trim() && newUserName.trim()) {
      if (newUserRole === 'staff' && !newUserOutlet) {
        alert('Please select an outlet for staff user');
        return;
      }

      try {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: newUsername.trim(),
            password: newPassword.trim(),
            name: newUserName.trim(),
            role: newUserRole,
            outletId: newUserRole === 'staff' ? newUserOutlet : null,
            active: true,
          }),
        });

        if (res.ok) {
          await refreshData(); // Reload from database
          setNewUsername('');
          setNewPassword('');
          setNewUserName('');
          setNewUserRole('staff');
          setNewUserOutlet('');
          alert('User created successfully!');
        } else {
          const error = await res.json();
          alert(`Failed to create user: ${error.error || 'Unknown error'}`);
        }
      } catch (err) {
        console.error('Failed to create user:', err);
        alert('Failed to create user. Make sure the server is running.');
      }
    }
  };

  const handleUpdateUser = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      try {
        const res = await fetch(`/api/users/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: newUsername.trim() || user.username,
            password: newPassword.trim() || undefined,
            name: newUserName.trim() || user.name,
            role: newUserRole,
            outletId: newUserRole === 'staff' ? newUserOutlet : null,
          }),
        });

        if (res.ok) {
          await refreshData(); // Reload from database
          setEditingUser(null);
          setNewUsername('');
          setNewPassword('');
          setNewUserName('');
          setNewUserRole('staff');
          setNewUserOutlet('');
        } else {
          alert('Failed to update user');
        }
      } catch (err) {
        console.error('Failed to update user:', err);
        alert('Failed to update user. Make sure the server is running.');
      }
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
        if (res.ok) {
          await refreshData(); // Reload from database
        } else {
          alert('Failed to delete user');
        }
      } catch (err) {
        console.error('Failed to delete user:', err);
        alert('Failed to delete user. Make sure the server is running.');
      }
    }
  };

  const handleAddOutlet = async () => {
    if (newOutletName.trim() && newOutletCode.trim()) {
      try {
        const res = await fetch('/api/outlets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newOutletName.trim(),
            code: newOutletCode.trim(),
            active: true,
          }),
        });

        if (res.ok) {
          await refreshData(); // Reload from database
          setNewOutletName('');
          setNewOutletCode('');
          alert('Outlet created successfully!');
        } else {
          const error = await res.json();
          alert(`Failed to create outlet: ${error.error || 'Unknown error'}`);
        }
      } catch (err) {
        console.error('Failed to create outlet:', err);
        alert('Failed to create outlet. Make sure the server is running.');
      }
    }
  };

  const handleUpdateOutlet = async (outletId: string) => {
    const outlet = outlets.find(o => o.id === outletId);
    if (outlet) {
      try {
        const res = await fetch(`/api/outlets/${outletId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newOutletName.trim() || outlet.name,
            code: newOutletCode.trim() || outlet.code,
          }),
        });

        if (res.ok) {
          await refreshData(); // Reload from database
          setEditingOutlet(null);
          setNewOutletName('');
          setNewOutletCode('');
        } else {
          alert('Failed to update outlet');
        }
      } catch (err) {
        console.error('Failed to update outlet:', err);
        alert('Failed to update outlet. Make sure the server is running.');
      }
    }
  };

  const handleDeleteOutlet = async (outletId: string) => {
    if (window.confirm('Are you sure you want to delete this outlet?')) {
      try {
        const res = await fetch(`/api/outlets/${outletId}`, { method: 'DELETE' });
        if (res.ok) {
          await refreshData(); // Reload from database
        } else {
          alert('Failed to delete outlet');
        }
      } catch (err) {
        console.error('Failed to delete outlet:', err);
        alert('Failed to delete outlet. Make sure the server is running.');
      }
    }
  };

  return (
    <div className="settings">
      <header className="page-header">
        <div>
          <h1>Settings</h1>
          <p className="subtitle">Manage schools, users, and outlets</p>
        </div>
      </header>

      <div className="settings-grid">
        <div className="settings-card card">
          <div className="card-header">
            <h3><Building2 size={20} /> Schools</h3>
          </div>
          <div className="card-body">
            <div className="add-form">
              <input
                type="text"
                value={newSchool}
                onChange={(e) => setNewSchool(e.target.value)}
                placeholder="Add new school..."
                onKeyPress={(e) => e.key === 'Enter' && handleAddSchool()}
              />
              <button className="btn btn-small" onClick={handleAddSchool}>
                <Plus size={16} />
              </button>
            </div>
            <ul className="settings-list">
              {schools.map((school) => (
                <li key={school.id}>
                  <span>{school.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>




        {isAdmin && (
          <>
            <div className="settings-card card full-width">
              <div className="card-header">
                <h3><UserPlus size={20} /> User Management</h3>
                <p className="hint">Add and manage staff and admin users</p>
              </div>
              <div className="card-body">
                <div className="form-grid" style={{ marginBottom: '20px' }}>
                  <div className="form-group">
                    <label>Username</label>
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="Enter username"
                    />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter password"
                    />
                  </div>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Role</label>
                    <select
                      value={newUserRole}
                      onChange={(e) => {
                        setNewUserRole(e.target.value as UserRole);
                        if (e.target.value === 'admin') {
                          setNewUserOutlet('');
                        }
                      }}
                    >
                      <option value="staff">Staff</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  {newUserRole === 'staff' && (
                    <div className="form-group">
                      <label>Outlet</label>
                      <select
                        value={newUserOutlet}
                        onChange={(e) => setNewUserOutlet(e.target.value)}
                        required
                      >
                        <option value="">Select outlet...</option>
                        {outlets.filter(o => o.active).map(outlet => (
                          <option key={outlet.id} value={outlet.id}>
                            {outlet.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                <div className="form-actions">
                  {editingUser ? (
                    <>
                      <button
                        className="btn btn-secondary"
                        onClick={() => {
                          setEditingUser(null);
                          setNewUsername('');
                          setNewPassword('');
                          setNewUserName('');
                          setNewUserRole('staff');
                          setNewUserOutlet('');
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleUpdateUser(editingUser)}
                      >
                        Update User
                      </button>
                    </>
                  ) : (
                    <button
                      className="btn btn-primary"
                      onClick={handleAddUser}
                      disabled={!newUsername || !newPassword || !newUserName || (newUserRole === 'staff' && !newUserOutlet)}
                    >
                      <UserPlus size={18} /> Add User
                    </button>
                  )}
                </div>

                <div style={{ marginTop: '24px' }}>
                  <h4 style={{ marginBottom: '12px', fontSize: '0.9rem', fontWeight: 600 }}>Existing Users</h4>
                  <ul className="settings-list">
                    {users.map((user) => (
                      <li key={user.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>{user.name}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {user.username} • {user.role === 'admin' ? 'Administrator' : 'Staff'}
                            {user.role === 'staff' && user.outletId && (
                              <span> • {outlets.find(o => o.id === user.outletId)?.name || 'Unknown Outlet'}</span>
                            )}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="icon-btn"
                            onClick={() => {
                              setEditingUser(user.id);
                              setNewUsername(user.username);
                              setNewPassword('');
                              setNewUserName(user.name);
                              setNewUserRole(user.role);
                              setNewUserOutlet(user.outletId || '');
                            }}
                            title="Edit user"
                          >
                            <Edit size={16} />
                          </button>
                          {user.id !== currentUser?.id && (
                            <button
                              className="icon-btn danger"
                              onClick={() => handleDeleteUser(user.id)}
                              title="Delete user"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="settings-card card full-width">
              <div className="card-header">
                <h3><Store size={20} /> Outlet Management</h3>
                <p className="hint">Manage outlets for staff assignment</p>
              </div>
              <div className="card-body">
                <div className="form-grid" style={{ marginBottom: '20px' }}>
                  <div className="form-group">
                    <label>Outlet Name</label>
                    <input
                      type="text"
                      value={newOutletName}
                      onChange={(e) => setNewOutletName(e.target.value)}
                      placeholder="e.g., Hithadhoo Outlet"
                    />
                  </div>
                  <div className="form-group">
                    <label>Outlet Code</label>
                    <input
                      type="text"
                      value={newOutletCode}
                      onChange={(e) => setNewOutletCode(e.target.value)}
                      placeholder="e.g., OUT-001"
                    />
                  </div>
                </div>
                <div className="form-actions">
                  {editingOutlet ? (
                    <>
                      <button
                        className="btn btn-secondary"
                        onClick={() => {
                          setEditingOutlet(null);
                          setNewOutletName('');
                          setNewOutletCode('');
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleUpdateOutlet(editingOutlet)}
                      >
                        Update Outlet
                      </button>
                    </>
                  ) : (
                    <button
                      className="btn btn-primary"
                      onClick={handleAddOutlet}
                      disabled={!newOutletName || !newOutletCode}
                    >
                      <Plus size={18} /> Add Outlet
                    </button>
                  )}
                </div>

                <div style={{ marginTop: '24px' }}>
                  <h4 style={{ marginBottom: '12px', fontSize: '0.9rem', fontWeight: 600 }}>Existing Outlets</h4>
                  <ul className="settings-list">
                    {outlets.map((outlet) => (
                      <li key={outlet.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>{outlet.name}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {outlet.code} • {outlet.active ? 'Active' : 'Inactive'}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="icon-btn"
                            onClick={() => {
                              setEditingOutlet(outlet.id);
                              setNewOutletName(outlet.name);
                              setNewOutletCode(outlet.code);
                            }}
                            title="Edit outlet"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="icon-btn danger"
                            onClick={() => handleDeleteOutlet(outlet.id)}
                            title="Delete outlet"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="settings-card card full-width">
          <div className="card-header">
            <h3><CheckSquare size={20} /> Option Items</h3>
            <p className="hint">Manage checkbox options for voucher redemption form</p>
          </div>
          <div className="card-body">
            <div className="add-form">
              <input
                type="text"
                value={newOptionName}
                onChange={(e) => setNewOptionName(e.target.value)}
                placeholder="Option name (e.g., Has Textbooks)"
                onKeyPress={(e) => e.key === 'Enter' && handleAddOption()}
              />
              <input
                type="text"
                value={newOptionKey}
                onChange={(e) => setNewOptionKey(e.target.value)}
                placeholder="Key (e.g., hasTextbooks)"
                onKeyPress={(e) => e.key === 'Enter' && handleAddOption()}
              />
              <button className="btn btn-small" onClick={handleAddOption}>
                <Plus size={16} />
              </button>
            </div>
            <div className="options-list">
              {optionItems.map((item) => (
                <div key={item.id} className="option-item">
                  <div className="option-controls">
                    <button
                      className="icon-btn"
                      onClick={() => toggleOptionItem(item.id)}
                      title={item.enabled ? 'Disable' : 'Enable'}
                    >
                      {item.enabled ? (
                        <ToggleRight size={20} className="enabled" />
                      ) : (
                        <ToggleLeft size={20} className="disabled" />
                      )}
                    </button>
                    {editingOption === item.id ? (
                      <div className="edit-option">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleEditOption(item.id, 'name', e.target.value)}
                          onBlur={() => setEditingOption(null)}
                          autoFocus
                        />
                        <input
                          type="text"
                          value={item.key}
                          onChange={(e) => handleEditOption(item.id, 'key', e.target.value)}
                          onBlur={() => setEditingOption(null)}
                        />
                      </div>
                    ) : (
                      <div className="option-info">
                        <span className={`option-name ${!item.enabled ? 'disabled' : ''}`}>
                          {item.name}
                        </span>
                        <span className="option-key">{item.key}</span>
                      </div>
                    )}
                  </div>
                  <div className="option-actions">
                    <label className="default-checkbox">
                      <input
                        type="checkbox"
                        checked={item.defaultChecked}
                        onChange={(e) => handleEditOption(item.id, 'defaultChecked', e.target.checked)}
                      />
                      <span>Default</span>
                    </label>
                    <button
                      className="icon-btn"
                      onClick={() => setEditingOption(item.id)}
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="icon-btn danger"
                      onClick={() => {
                        if (window.confirm(`Delete "${item.name}"?`)) {
                          deleteOptionItem(item.id);
                        }
                      }}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="data-management card">
        <div className="card-header">
          <h3>Data Management</h3>
        </div>
        <div className="card-body">
          <p className="hint">
            All data is stored in the SQLite database (<code>server/booklist.db</code>).
            The database is automatically backed up and can be easily migrated to MySQL if needed.
          </p>
          <div style={{ marginTop: '16px', padding: '12px', background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)' }}>
            <strong style={{ display: 'block', marginBottom: '8px' }}>Database Backup:</strong>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
              To backup your data, simply copy the <code>server/booklist.db</code> file.
              To restore, replace the database file and restart the server.
            </p>
          </div>
          {isAdmin && (
            <div className="btn-group" style={{ marginTop: '16px' }}>
              <button
                className="btn btn-secondary"
                onClick={async () => {
                  try {
                    const response = await fetch('/api/export');
                    if (response.ok) {
                      const blob = await response.blob();
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `booklist-backup-${new Date().toISOString().split('T')[0]}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    } else {
                      alert('Export not available. Please backup the database file directly.');
                    }
                  } catch (error) {
                    alert('Export not available. Please backup the database file directly.');
                  }
                }}
              >
                Export Data (JSON)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

