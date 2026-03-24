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

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [letters, setLetters] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

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
            <Link to="/write">
              <Button variant="primary">
                ✦ Write a Letter
              </Button>
            </Link>
          </header>

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
              <div className="app-empty-icon">✦</div>
              <h2 className="app-empty-title">No letters yet</h2>
              <p className="app-empty-body">
                {filter === 'all'
                  ? "You haven't written any letters. Start with a note to your future self."
                  : `No ${filter === 'drafts' ? 'drafts' : filter === 'active' ? 'active' : 'opened'} letters.`}
              </p>
              {filter === 'all' && (
                <Link to="/write">
                  <Button variant="primary">Write Your First Letter</Button>
                </Link>
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
                              <span className="recipient-badge">To someone else</span>
                              <span className="letter-recipient-name">{letter.recipientName}</span>
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
    </div>
  );
}
