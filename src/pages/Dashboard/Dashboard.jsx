import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { subscribeToUserLetters, deleteLetter } from '../../lib/firestore';
import Navbar from '../../components/Navbar';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import './Dashboard.css';

const STATUS_LABELS = {
  draft: 'Draft',
  sealed: 'Sealed',
  delivered: 'Delivered',
  opened: 'Opened',
  expired: 'Expired',
  cancelled: 'Cancelled',
};

const STATUS_COLORS = {
  draft: 'status-draft',
  sealed: 'status-sealed',
  delivered: 'status-delivered',
  opened: 'status-opened',
  expired: 'status-expired',
  cancelled: 'status-cancelled',
};

// Subscription state (localStorage for demo — replace with real subscription data)
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

function timeUntil(dateStr) {
  const now = new Date();
  const target = new Date(dateStr);
  const diff = target - now;
  if (diff <= 0) return 'Arriving soon';
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days === 1) return 'Arrives tomorrow';
  if (days < 7) return `Arrives in ${days} days`;
  if (days < 30) return `Arrives in ${Math.ceil(days / 7)} weeks`;
  if (days < 365) return `Arrives in ${Math.ceil(days / 30)} months`;
  return `Arrives in ${Math.ceil(days / 365)} years`;
}

function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function UpgradeModal({ onClose, onUpgrade }) {
  return (
    <div className="upgrade-modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="upgrade-modal">
        <svg className="upgrade-modal-icon" viewBox="0 0 56 56" fill="none">
          <circle cx="28" cy="28" r="28" fill="rgba(232,93,4,0.12)"/>
          <circle cx="28" cy="28" r="18" fill="url(#upgradeGrad)"/>
          <text x="28" y="33" textAnchor="middle" fill="white" fontSize="14" fontFamily="serif">✦</text>
          <defs>
            <radialGradient id="upgradeGrad" cx="35%" cy="35%">
              <stop offset="0%" stopColor="#ff7a2a"/>
              <stop offset="100%" stopColor="#e85d04"/>
            </radialGradient>
          </defs>
        </svg>
        <h3 className="upgrade-modal-title">You've reached your letter limit</h3>
        <p className="upgrade-modal-body">
          Free accounts can have 1 active letter at a time.
          Upgrade to <strong>Keeper</strong> for unlimited letters, photo attachments,
          and voice recordings — or go all the way to <strong>Legacy</strong> for AI
          future guidance.
        </p>
        <div className="upgrade-modal-actions">
          <Link to="/pricing" onClick={onClose}>
            <Button variant="primary" size="lg" fullWidth>
              ✦ See Plans
            </Button>
          </Link>
          <button className="upgrade-modal-dismiss" onClick={onClose}>
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [letters, setLetters] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [subscription, setSubscription] = useState(getSubscription);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    const unsub = subscribeToUserLetters(user.uid, fetched => {
      setLetters(fetched);
      setLoading(false);
    });
    return unsub;
  }, [user, navigate]);

  async function handleDelete(letterId, e) {
    e.stopPropagation();
    if (!window.confirm('Delete this draft?')) return;
    await deleteLetter(letterId);
  }

  const activeLetters = letters.filter(l =>
    !['cancelled', 'deleted', 'opened', 'expired'].includes(l.status)
  );
  const isAtLimit = subscription.plan === 'free' && activeLetters.length >= 1;

  const filteredLetters = letters.filter(l => {
    if (filter === 'all') return !['cancelled', 'deleted'].includes(l.status);
    if (filter === 'drafts') return l.status === 'draft';
    if (filter === 'active') return ['sealed', 'delivered'].includes(l.status);
    if (filter === 'read') return l.status === 'opened';
    return true;
  });

  const stats = {
    total: letters.filter(l => !['cancelled', 'deleted'].includes(l.status)).length,
    sealed: letters.filter(l => l.status === 'sealed').length,
    delivered: letters.filter(l => l.status === 'delivered').length,
    opened: letters.filter(l => l.status === 'opened').length,
  };

  const FILTERS = [
    { value: 'all', label: 'All' },
    { value: 'drafts', label: 'Drafts' },
    { value: 'active', label: 'Active' },
    { value: 'read', label: 'Opened' },
  ];

  function handleWriteClick(e) {
    if (isAtLimit) {
      e.preventDefault();
      setShowUpgradeModal(true);
    }
  }

  const planLabel = subscription.plan === 'keeper' ? 'Keeper' : subscription.plan === 'legacy' ? 'Legacy' : 'Free';

  return (
    <div className="app-page page-enter">
      <Navbar />

      <main className="app-main">
        <div className="app-container">
          <header className="app-header">
            <div className="app-header-left">
              <h1 className="app-title">Your Letters</h1>
              <p className="app-subtitle">
                {user?.displayName ? `${user.displayName}'s letters` : 'Your time capsule letters'}
              </p>
            </div>
            <Link to="/write" onClick={handleWriteClick}>
              <Button variant="primary">
                ✦ Write a Letter
              </Button>
            </Link>
          </header>

          {/* Subscription banner */}
          {subscription.plan === 'free' ? (
            <div className="subscription-banner stagger-in">
              <div className="subscription-banner-left">
                <div className="subscription-banner-icon">
                  <span style={{ fontSize: 14 }}>✦</span>
                  <span className="subscription-banner-title">Free plan — 1 letter at a time</span>
                </div>
                <p className="subscription-banner-body">
                  You have {1 - activeLetters.length} letter slot remaining.
                  Upgrade to write unlimited letters with photos and voice recordings.
                </p>
              </div>
              <div className="subscription-banner-actions">
                <Link to="/pricing">
                  <Button variant="primary" size="sm">
                    Upgrade
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="subscription-banner subscription-active stagger-in">
              <div className="subscription-banner-left">
                <div className="subscription-badge">
                  <span className="subscription-badge-dot" />
                  <span className="subscription-badge-name">✦ {planLabel}</span>
                </div>
                <p className="subscription-banner-body" style={{ marginTop: 4 }}>
                  {subscription.plan === 'legacy'
                    ? 'Unlimited letters, AI guidance, family tree, and priority delivery.'
                    : 'Unlimited letters, scheduled delivery, photos, and voice recordings.'}
                </p>
              </div>
              <div className="subscription-banner-actions">
                <Link to="/settings">
                  <Button variant="secondary" size="sm">
                    Manage
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="app-stats stagger-in">
            <Card className="stat-card">
              <p className="stat-num">{stats.total}</p>
              <p className="stat-label">Total Letters</p>
            </Card>
            <Card className="stat-card">
              <p className="stat-num">{stats.sealed}</p>
              <p className="stat-label">Waiting to Send</p>
            </Card>
            <Card className="stat-card">
              <p className="stat-num">{stats.delivered}</p>
              <p className="stat-label">Delivered</p>
            </Card>
            <Card className="stat-card">
              <p className="stat-num">{stats.opened}</p>
              <p className="stat-label">Opened</p>
            </Card>
          </div>

          {/* Filters */}
          <div className="app-filters">
            {FILTERS.map(f => (
              <button
                key={f.value}
                className={`filter-btn ${filter === f.value ? 'filter-btn-active' : ''}`}
                onClick={() => setFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Letter list */}
          {loading ? (
            <div className="app-loading">
              <div className="skeleton" style={{ height: 80, borderRadius: 12 }} />
              <div className="skeleton" style={{ height: 80, borderRadius: 12 }} />
              <div className="skeleton" style={{ height: 80, borderRadius: 12 }} />
            </div>
          ) : filteredLetters.length === 0 ? (
            <div className="app-empty">
              <EmptyIllustration filter={filter} />
              <h2 className="app-empty-title">
                {filter === 'all'
                  ? "No letters yet \u2014 that's the starting point."
                  : filter === 'drafts'
                  ? 'No drafts waiting.'
                  : filter === 'active'
                  ? 'No letters in transit.'
                  : 'No opened letters yet.'}
              </h2>
              <p className="app-empty-body">
                {filter === 'all'
                  ? 'Write a letter to your future self. Set a date. Trust the future.'
                  : `Nothing here yet. Letters you write will appear here.`}
              </p>
              {filter === 'all' && (
                <div className="app-empty-cta">
                  <Link to="/write">
                    <Button variant="primary">✦ Write Your First Letter</Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="app-letters stagger-in">
              {filteredLetters.map(letter => (
                <Link
                  key={letter.id}
                  to={`/app/letters/${letter.id}`}
                  className="letter-card-link"
                >
                  <Card hover className="letter-card">
                    <div className="letter-card-inner">
                      <div className="letter-card-left">
                        <div className="letter-card-recipient">
                          {letter.recipientEmail ? (
                            <>
                              <span className="recipient-badge">To {letter.recipientName || 'someone'}</span>
                              {letter.recipientRelationship && (
                                <span className="recipient-relationship-tag-small">{letter.recipientRelationship}</span>
                              )}
                            </>
                          ) : (
                            <span className="letter-recipient-name">Future Me</span>
                          )}
                        </div>
                        <p className="letter-card-subject">
                          {letter.subject || <em className="no-subject">No subject</em>}
                        </p>
                        <p className="letter-card-preview">
                          {letter.body?.slice(0, 80)}{letter.body?.length > 80 ? '…' : ''}
                        </p>
                      </div>
                      <div className="letter-card-right">
                        <span className={`status-badge ${STATUS_COLORS[letter.status] || ''}`}>
                          {STATUS_LABELS[letter.status] || letter.status}
                        </span>
                        {letter.status === 'sealed' && letter.deliverAt && (
                          <p className="letter-card-countdown">
                            {timeUntil(letter.deliverAt)}
                          </p>
                        )}
                        {letter.status === 'delivered' && (
                          <p className="letter-card-countdown">Delivered</p>
                        )}
                        {letter.status === 'opened' && letter.openedAt && (
                          <p className="letter-card-countdown">
                            Opened {formatDate(letter.openedAt)}
                          </p>
                        )}
                        {letter.status === 'draft' && (
                          <p className="letter-card-countdown">Draft</p>
                        )}
                        {letter.status === 'draft' && (
                          <button
                            className="letter-delete-btn"
                            onClick={e => handleDelete(letter.id, e)}
                            title="Delete draft"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {showUpgradeModal && (
        <UpgradeModal
          onClose={() => setShowUpgradeModal(false)}
          onUpgrade={() => navigate('/pricing')}
        />
      )}
    </div>
  );
}

function EmptyIllustration({ filter }) {
  if (filter !== 'all') return null;
  return (
    <svg className="app-empty-illustration" viewBox="0 0 120 120" fill="none">
      {/* Envelope */}
      <rect x="15" y="30" width="90" height="64" rx="8" fill="var(--surface-elevated)" stroke="var(--border)" strokeWidth="1.5"/>
      <path d="M15 30 L60 65 L105 30" stroke="var(--border-strong)" strokeWidth="1.5" fill="none"/>
      {/* Wax seal */}
      <circle cx="60" cy="80" r="14" fill="url(#emptySeal)"/>
      <text x="60" y="84.5" textAnchor="middle" fill="white" fontSize="10" fontFamily="serif">✦</text>
      {/* Decorative lines */}
      <rect x="30" y="44" width="60" height="4" rx="2" fill="var(--border)"/>
      <rect x="30" y="54" width="45" height="4" rx="2" fill="var(--border)"/>
      <circle cx="60" cy="80" r="18" fill="none" stroke="rgba(232,93,4,0.2)" strokeWidth="1"/>
      <defs>
        <radialGradient id="emptySeal" cx="35%" cy="35%">
          <stop offset="0%" stopColor="#ff7a2a"/>
          <stop offset="100%" stopColor="#e85d04"/>
        </radialGradient>
      </defs>
    </svg>
  );
}
