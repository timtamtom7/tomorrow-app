import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { signOut } from '../../lib/auth';
import Navbar from '../../components/Navbar';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import './Settings.css';

function getSubscription() {
  try {
    return JSON.parse(localStorage.getItem('tomorrow-subscription') || '{"plan":"free"}');
  } catch {
    return { plan: 'free' };
  }
}

function saveSubscription(sub) {
  localStorage.setItem('tomorrow-subscription', JSON.stringify(sub));
}

function getNotificationPrefs() {
  try {
    return JSON.parse(localStorage.getItem('tomorrow-notifications') || '{}');
  } catch {
    return {};
  }
}

function saveNotificationPrefs(prefs) {
  localStorage.setItem('tomorrow-notifications', JSON.stringify(prefs));
}

function NotificationToggle({ label, description, enabled, onToggle }) {
  return (
    <div className="settings-notification settings-notification-toggle">
      <div>
        <p className="settings-notification-title">{label}</p>
        <p className="settings-notification-hint">{description}</p>
      </div>
      <div
        className={`settings-toggle ${enabled ? 'settings-toggle-on' : ''}`}
        onClick={onToggle}
        role="switch"
        aria-checked={enabled}
        tabIndex={0}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onToggle()}
      >
        <div className="settings-toggle-knob" />
      </div>
    </div>
  );
}

const PLAN_FEATURES = {
  free: [],
  keeper: [
    'Unlimited active letters',
    'Photo attachments',
    'Voice recording',
    'Scheduled delivery dates',
  ],
  legacy: [
    'Everything in Keeper',
    'AI Future Guidance',
    'Priority delivery',
    'Family tree letters',
    'Letter series & chapters',
  ],
};

export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => document.documentElement.getAttribute('data-theme') || 'dark');
  const [subscription, setSubscription] = useState(getSubscription);
  const [notifPrefs, setNotifPrefs] = useState(getNotificationPrefs);
  const [communityOptIn, setCommunityOptIn] = useState(() => {
    const saved = localStorage.getItem('tomorrow-community-optin');
    return saved === 'true';
  });

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
    alert('Account deletion requires backend setup. Contact support.');
  }

  function handleCancelSubscription() {
    if (!window.confirm('Cancel your subscription? Your letters will still be delivered on their scheduled dates.')) return;
    saveSubscription({ plan: 'free' });
    setSubscription({ plan: 'free' });
  }

  function handleNotifToggle(key) {
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(updated);
    saveNotificationPrefs(updated);
    // Request browser notification permission if enabling
    if (updated[key] && !('Notification' in window)) {
      alert('This browser does not support push notifications.');
    } else if (updated[key] && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  function handleCommunityOptIn(value) {
    setCommunityOptIn(value);
    localStorage.setItem('tomorrow-community-optin', String(value));
  }

  const planName = subscription.plan === 'keeper' ? 'Keeper' : subscription.plan === 'legacy' ? 'Legacy' : 'Free';
  const planPrice = subscription.plan === 'keeper' ? '$3.99 / month' : subscription.plan === 'legacy' ? '$9.99 / month' : 'Free forever';
  const planFeatures = PLAN_FEATURES[subscription.plan] || [];

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

          {/* Subscription */}
          <section className="settings-section">
            <h2 className="settings-section-title">Subscription</h2>
            <Card className="subscription-card">
              <div className="subscription-card-inner">
                {/* Current plan */}
                <div className="subscription-plan-row">
                  <div className="subscription-plan-info">
                    <p className="subscription-plan-name">
                      ✦ {planName}
                      <span className={`subscription-plan-badge ${subscription.plan === 'free' ? 'free' : ''}`}>
                        {subscription.plan === 'free' ? 'Free' : subscription.plan === 'keeper' ? 'Active' : 'Active'}
                      </span>
                    </p>
                    <p className="subscription-plan-price">{planPrice}</p>
                  </div>
                  {subscription.plan !== 'free' && (
                    <Button variant="secondary" size="sm" onClick={handleCancelSubscription}>
                      Cancel
                    </Button>
                  )}
                </div>

                {subscription.plan !== 'free' && (
                  <>
                    <div className="subscription-divider" />
                    <div className="subscription-features">
                      {planFeatures.map((f, i) => (
                        <div key={i} className="subscription-feature-item">
                          <span className="subscription-feature-item-icon">✓</span>
                          {f}
                        </div>
                      ))}
                    </div>
                    <p className="subscription-cancel-note">
                      "Cancel anytime. Your letters will still arrive on their dates."
                    </p>
                  </>
                )}

                {subscription.plan === 'free' && (
                  <>
                    <div className="subscription-divider" />
                    <div className="pro-feature-locked">
                      <span className="pro-feature-locked-icon">✦</span>
                      <p className="pro-feature-locked-text">
                        <strong>Keeper</strong> adds unlimited letters, photos, and voice recording.
                        <strong> Legacy</strong> adds AI guidance from your past letters.
                      </p>
                    </div>
                    <Link to="/pricing" className="subscription-upgrade-btn">
                      <Button variant="primary" size="sm">
                        ✦ Upgrade Your Plan
                      </Button>
                    </Link>
                  </>
                )}
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
              <NotificationToggle
                label="Letter delivery reminder"
                description="7 days before a letter is delivered"
                enabled={!!notifPrefs.deliveryReminder}
                onToggle={() => handleNotifToggle('deliveryReminder')}
              />
              <NotificationToggle
                label="Letter delivered"
                description="When your letter has been opened by the recipient"
                enabled={!!notifPrefs.letterDelivered}
                onToggle={() => handleNotifToggle('letterDelivered')}
              />
              <NotificationToggle
                label="Write reminder"
                description="Remind me to write a letter when I haven't in 3 months"
                enabled={!!notifPrefs.writeReminder}
                onToggle={() => handleNotifToggle('writeReminder')}
              />
              <NotificationToggle
                label="Someone wrote me a letter"
                description="When you receive a new letter"
                enabled={!!notifPrefs.receivedLetter}
                onToggle={() => handleNotifToggle('receivedLetter')}
              />
              <div className="settings-notification">
                <div>
                  <p className="settings-notification-title">Browser push notifications</p>
                  <p className="settings-notification-hint">
                    {typeof Notification !== 'undefined'
                      ? Notification.permission === 'granted'
                        ? "Enabled — you will receive push notifications"
                        : Notification.permission === 'denied'
                        ? 'Blocked by your browser. Enable in browser settings.'
                        : 'Not yet requested — toggle a notification above to enable.'
                      : 'Not supported in this browser'}
                  </p>
                </div>
              </div>
            </Card>
          </section>

          {/* Community */}
          <section className="settings-section">
            <h2 className="settings-section-title">Community</h2>
            <Card>
              <NotificationToggle
                label="Share delivered letters to the community archive"
                description="When a letter is delivered, add it to the community archive so others can read it. You remain anonymous unless you choose otherwise."
                enabled={communityOptIn}
                onToggle={() => handleCommunityOptIn(!communityOptIn)}
              />
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
