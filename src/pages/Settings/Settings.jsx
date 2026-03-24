import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { signOut } from '../../lib/auth';
import Navbar from '../../components/Navbar';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import './Settings.css';

export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => document.documentElement.getAttribute('data-theme') || 'dark');

  useEffect(() => {
    if (!user) { navigate('/auth'); }
  }, [user, navigate]);

  function handleThemeChange(newTheme) {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('tomorrow-theme', newTheme);
  }

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  async function handleDeleteAccount() {
    if (!window.confirm('Delete your account and all letters? This cannot be undone.')) return;
    // In production: call backend to delete user + data
    alert('Account deletion requires backend setup. Contact support.');
  }

  return (
    <div className="settings-page page-enter">
      <Navbar />
      <main className="settings-main">
        <div className="settings-container">
          <header className="settings-header">
            <Link to="/app" className="back-link">← Back</Link>
            <h1 className="settings-title">Settings</h1>
          </header>

          {/* Profile */}
          <section className="settings-section">
            <h2 className="settings-section-title">Profile</h2>
            <Card>
              <div className="settings-field">
                <p className="settings-field-label">Name</p>
                <p className="settings-field-value">{user?.displayName || 'Not set'}</p>
              </div>
              <div className="settings-field">
                <p className="settings-field-label">Email</p>
                <p className="settings-field-value">{user?.email}</p>
              </div>
            </Card>
          </section>

          {/* Appearance */}
          <section className="settings-section">
            <h2 className="settings-section-title">Appearance</h2>
            <Card>
              <div className="theme-selector">
                <button
                  className={`theme-btn ${theme === 'dark' ? 'theme-btn-active' : ''}`}
                  onClick={() => handleThemeChange('dark')}
                >
                  <span className="theme-btn-preview theme-preview-dark">
                    <span className="theme-preview-bar" />
                    <span className="theme-preview-text" />
                    <span className="theme-preview-text theme-preview-text-sm" />
                  </span>
                  <span className="theme-btn-label">Dark</span>
                </button>
                <button
                  className={`theme-btn ${theme === 'light' ? 'theme-btn-active' : ''}`}
                  onClick={() => handleThemeChange('light')}
                >
                  <span className="theme-btn-preview theme-preview-light">
                    <span className="theme-preview-bar" />
                    <span className="theme-preview-text" />
                    <span className="theme-preview-text theme-preview-text-sm" />
                  </span>
                  <span className="theme-btn-label">Light</span>
                </button>
              </div>
            </Card>
          </section>

          {/* Notifications */}
          <section className="settings-section">
            <h2 className="settings-section-title">Notifications</h2>
            <Card>
              <div className="settings-notification">
                <div>
                  <p className="settings-notification-title">Letter delivery reminder</p>
                  <p className="settings-notification-hint">7 days before a letter is delivered</p>
                </div>
                <span className="settings-notification-status">Email (coming soon)</span>
              </div>
              <div className="settings-notification">
                <div>
                  <p className="settings-notification-title">Letter delivered</p>
                  <p className="settings-notification-hint">When your letter has been opened</p>
                </div>
                <span className="settings-notification-status">Email (coming soon)</span>
              </div>
              <div className="settings-notification">
                <div>
                  <p className="settings-notification-title">Letter expired</p>
                  <p className="settings-notification-hint">When a letter was never claimed</p>
                </div>
                <span className="settings-notification-status">Email (coming soon)</span>
              </div>
            </Card>
          </section>

          {/* About */}
          <section className="settings-section">
            <h2 className="settings-section-title">About</h2>
            <Card>
              <div className="settings-field">
                <p className="settings-field-label">Version</p>
                <p className="settings-field-value">1.0.0</p>
              </div>
              <div className="settings-field">
                <p className="settings-field-label">Built with</p>
                <p className="settings-field-value">React, Firebase, Resend</p>
              </div>
            </Card>
          </section>

          {/* Danger zone */}
          <section className="settings-section">
            <h2 className="settings-section-title settings-danger-title">Account</h2>
            <Card className="settings-danger-card">
              <div className="settings-danger-row">
                <div>
                  <p className="settings-danger-label">Sign out</p>
                  <p className="settings-danger-hint">Sign out of your Tomorrow account on this device.</p>
                </div>
                <Button variant="secondary" size="sm" onClick={handleSignOut}>Sign Out</Button>
              </div>
              <div className="settings-danger-row settings-danger-row-border">
                <div>
                  <p className="settings-danger-label">Delete account</p>
                  <p className="settings-danger-hint">Permanently delete your account and all letters. This cannot be undone.</p>
                </div>
                <Button variant="danger" size="sm" onClick={handleDeleteAccount}>Delete Account</Button>
              </div>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}
