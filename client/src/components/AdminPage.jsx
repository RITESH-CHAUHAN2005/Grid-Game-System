import { useState } from 'react';
import AdminDashboard from './AdminDashboard';
import './admin.css';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from '../constants/admin';

export default function AdminPage({ tiles }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
      return;
    }

    setError('Invalid credentials');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    resetForm();
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setError('');
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-container">
        <div className="admin-card">
          <div className="admin-header">
            <div className="admin-title">Admin Login</div>
            <div className="small-muted">Secure area</div>
          </div>

          <div className="admin-grid">
            <div className="admin-left">
              <form onSubmit={handleSubmit} className="admin-form">
                <label>Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@grid.com" />

                <label style={{marginTop:12}}>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />

                {error && <div style={{color:'red',marginTop:8}}>{error}</div>}

                <div className="actions">
                  <button className="btn" type="submit">Sign in</button>
                  <button type="button" className="btn ghost" onClick={resetForm}>Reset</button>
                </div>
              </form>
            </div>

            <div className="admin-right">
              <div className="small-muted">Demo admin credentials</div>
              <div className="admin-credentials"><strong>{ADMIN_EMAIL}</strong></div>
              <div><strong>{ADMIN_PASSWORD}</strong></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-card">
        <div className="admin-dashboard-head">
          <h1 style={{margin:0}}>Admin Dashboard</h1>
          <div>
            <button className="btn logout" onClick={handleLogout}>Logout</button>
          </div>
        </div>
        <AdminDashboard tiles={tiles} />
      </div>
    </div>
  );
}
