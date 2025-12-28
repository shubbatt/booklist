import { useState, useEffect } from 'react';
import { LogIn, Store, User, Lock, AlertCircle } from 'lucide-react';
import { useStore } from '../store';
import { Outlet } from '../types';

export function Login() {
  const { login } = useStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedOutletId, setSelectedOutletId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStaffUser, setIsStaffUser] = useState(false);
  const [availableOutlets, setAvailableOutlets] = useState<Outlet[]>([]);

  // Load outlets from database on mount (not from store)
  useEffect(() => {
    const loadOutlets = async () => {
      try {
        const res = await fetch('/api/outlets');
        if (!res.ok) {
          console.error('Failed to fetch outlets from database:', res.status, res.statusText);
          setAvailableOutlets([]);
          return;
        }
        const data = await res.json();
        if (Array.isArray(data)) {
          // Filter only active outlets from database
          // Database stores active as integer (0/1), but TypeScript expects boolean
          const active = data.filter((o: any) => {
            const isActive = typeof o.active === 'boolean' ? o.active : o.active === 1 || o.active !== 0;
            return isActive;
          }) as Outlet[];
          console.log('Loaded outlets from database:', active.length);
          setAvailableOutlets(active);
        } else {
          console.error('Invalid outlets data from API:', data);
          setAvailableOutlets([]);
        }
      } catch (err) {
        console.error('Failed to load outlets from database:', err);
        setAvailableOutlets([]);
      }
    };
    loadOutlets();
  }, []);

  // Check if user is staff when username changes
  useEffect(() => {
    if (username.trim()) {
      fetch('/api/users')
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(users => {
          if (Array.isArray(users)) {
            const user = users.find((u: any) => u.username === username);
            if (user && user.role === 'staff') {
              setIsStaffUser(true);
            } else {
              setIsStaffUser(false);
              setSelectedOutletId(''); // Clear outlet selection for non-staff
            }
          }
        })
        .catch(err => {
          // If API fails, assume not staff (will be caught during login)
          console.error('Failed to check user role:', err);
          setIsStaffUser(false);
        });
    } else {
      setIsStaffUser(false);
      setSelectedOutletId('');
    }
  }, [username]);

  const activeOutlets = availableOutlets;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validate inputs
    if (!username || !password) {
      setError('Please enter username and password');
      setIsLoading(false);
      return;
    }

    // Validate staff users have outlet selected
    if (isStaffUser && !selectedOutletId) {
      setError('Please select an outlet for staff login');
      setIsLoading(false);
      return;
    }

    // Attempt login
    try {
      const success = await login(username, password, isStaffUser ? selectedOutletId : undefined);
      
      if (!success) {
        setError('Invalid username, password, or outlet selection');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
        setError('Cannot connect to server. Please start the backend server (cd server && npm start)');
      } else {
        setError('Login failed. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <Store size={48} />
          </div>
          <h1>Book Voucher System</h1>
          <p className="login-subtitle">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="alert alert-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label>
              <User size={16} /> Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
                // Don't clear outlet selection here - let useEffect handle it
              }}
              placeholder="Enter your username"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>
              <Lock size={16} /> Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="form-group">
            <label>
              <Store size={16} /> Select Outlet {isStaffUser && '*'}
            </label>
            <select
              value={selectedOutletId}
              onChange={(e) => {
                setSelectedOutletId(e.target.value);
                setError('');
              }}
              required={isStaffUser}
              disabled={activeOutlets.length === 0}
            >
              <option value="">
                {activeOutlets.length === 0 
                  ? 'Loading outlets...' 
                  : 'Choose an outlet (optional for admin)...'}
              </option>
              {activeOutlets.map(outlet => (
                <option key={outlet.id} value={outlet.id}>
                  {outlet.name} ({outlet.code})
                </option>
              ))}
            </select>
            {activeOutlets.length === 0 && (
              <p className="hint" style={{ marginTop: '8px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                {isStaffUser 
                  ? 'No active outlets available. Please contact administrator.'
                  : 'Waiting for outlets to load...'}
              </p>
            )}
            {!isStaffUser && activeOutlets.length > 0 && (
              <p className="hint" style={{ marginTop: '8px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Optional for admin users. Required for staff.
              </p>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={isLoading || (isStaffUser && activeOutlets.length === 0)}
          >
            {isLoading ? (
              <>Loading...</>
            ) : (
              <>
                <LogIn size={18} /> Sign In
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p className="hint">
            Default: <strong>admin</strong> / <strong>admin123</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

