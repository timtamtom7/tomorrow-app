import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import './Community.css';

// Sample community letters (in production these come from Firestore community collection)
const SAMPLE_PUBLIC_LETTERS = [
  {
    id: 'pub-1',
    author: 'Anonymous',
    initials: '?',
    color: '#6366f1',
    body: `"I wrote this five years ago, not knowing what 2025 would look like. What I know now: the worry was mostly unnecessary. The things I was afraid of either didn't happen or, if they did, I handled them better than I expected. If you're reading this in a hard moment — you're going to be okay."`,
    yearsAgo: 5,
    toLabel: 'The person reading this right now',
    reads: 1847,
  },
  {
    id: 'pub-2',
    author: 'Sofia R.',
    initials: 'SR',
    color: '#e85d04',
    body: `"To whoever finds this in the archive — I was 28 when I wrote this. I had just gotten out of a relationship that I thought would break me. It didn't. I hope if you're going through something similar, you know that the version of you on the other side is stronger than you think."`,
    yearsAgo: 3,
    toLabel: 'A stranger, somewhere in the future',
    reads: 921,
  },
  {
    id: 'pub-3',
    author: 'Anonymous',
    initials: '?',
    color: '#22c55e',
    body: `"The world in 2024 felt fragile. Climate anxiety, political chaos, loneliness. But here is what I also know: I had a dog named Bento, I learned to cook pasta properly, and the small pleasures were real. Don't let the noise drown out what's good."`,
    yearsAgo: 2,
    toLabel: 'Someone who needs this',
    reads: 2341,
  },
  {
    id: 'pub-4',
    author: 'Marcus T.',
    initials: 'MT',
    color: '#f59e0b',
    body: `"Written on the morning of my 35th birthday. I'm in good health, I have people I love, I'm not where I thought I'd be but I'm okay with that. To future me: are you still playing guitar? Did we ever make it to Japan? Be honest."`,
    yearsAgo: 4,
    toLabel: 'Myself at 39',
    reads: 567,
  },
];

const SAMPLE_ARCHIVE = [
  {
    id: 'arc-1',
    from: 'Elena M.',
    to: 'The woman I was at 30',
    excerpt: `"You think you need to have everything figured out by now. You don't. The mess you're in right now — the job uncertainty, the relationship that isn't working — you're going to look back on this and laugh, not because it was funny, but because you survived it and it became part of the story."`,
    deliveredAt: 'March 2024',
    reads: 3421,
  },
  {
    id: 'arc-2',
    from: 'Anonymous',
    to: 'A future parent',
    excerpt: `"You will doubt yourself constantly. Your kid will still think you're the greatest person alive, at least until they're 14. The hard parts are worth it in ways you can't understand yet. Write them a letter too."`,
    deliveredAt: 'January 2025',
    reads: 5612,
  },
  {
    id: 'arc-3',
    from: 'James K.',
    to: 'Myself in 2030',
    excerpt: `"If you're reading this, I hope you've been back to that hiking trip in Patagonia. If not — book the flight. You won't regret it. The version of you that hasn't gone yet keeps putting it off. Stop."`,
    deliveredAt: 'August 2023',
    reads: 1876,
  },
  {
    id: 'arc-4',
    from: 'Anonymous',
    to: 'Someone starting over',
    excerpt: `"Whatever ended — a marriage, a career, a chapter you thought was permanent — this is not the end of your story. It's the part where things get interesting. The person you become after loss is someone worth meeting."`,
    deliveredAt: 'November 2024',
    reads: 7234,
  },
];

const TIMED_YEARS = [
  { years: 1, label: '1 year' },
  { years: 3, label: '3 years' },
  { years: 5, label: '5 years' },
  { years: 10, label: '10 years' },
  { years: 20, label: '20 years' },
  { years: 50, label: '50 years' },
];

function PublicLetterCard({ letter }) {
  return (
    <div className="community-letter-card">
      <div className="community-letter-meta">
        <div className="community-letter-from">
          <div className="community-letter-avatar" style={{ background: letter.color }}>
            {letter.initials}
          </div>
          <div className="community-letter-from-text">
            <span className="community-letter-author">
              {letter.author}
            </span>
            <span className="community-letter-date">
              {letter.yearsAgo} year{letter.yearsAgo !== 1 ? 's' : ''} ago
            </span>
          </div>
        </div>
        <span className="community-letter-tag">
          ✦ To {letter.toLabel}
        </span>
      </div>
      <div className="community-letter-body">
        {letter.body.split('\n\n').map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
      <div className="community-letter-footer">
        <span className="community-letter-reads">
          ↑ {letter.reads.toLocaleString()} people have read this
        </span>
      </div>
    </div>
  );
}

function ArchiveCard({ letter }) {
  return (
    <div className="community-archive-card">
      <div className="community-archive-seal">✦</div>
      <p className="community-archive-from">{letter.from}</p>
      <p className="community-archive-to">→ {letter.to}</p>
      <p className="community-archive-excerpt">{letter.excerpt}</p>
      <div className="community-archive-date">
        ✦ Delivered {letter.deliveredAt} · {letter.reads.toLocaleString()} reads
      </div>
    </div>
  );
}

export default function Community() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('public'); // 'public' | 'timed' | 'archive'
  const [timedYears, setTimedYears] = useState(5);
  const [timedPublic, setTimedPublic] = useState(false);

  function handleTimedWrite() {
    if (!user) {
      navigate('/auth?next=/write&mode=timed&years=' + timedYears + '&public=' + timedPublic);
      return;
    }
    navigate('/write?mode=timed&years=' + timedYears + '&public=' + timedPublic);
  }

  const TABS = [
    { value: 'public', label: 'Letter to the Future' },
    { value: 'timed', label: 'Write to be Opened' },
    { value: 'archive', label: 'Community Archive' },
  ];

  return (
    <div className="community-page page-enter">
      <nav className="community-nav">
        <Link to="/" className="community-nav-logo">
          Tomorrow <span>✦</span>
        </Link>
        <div className="community-nav-actions">
          {user ? (
            <Link to="/app">
              <Button variant="secondary" size="sm">My Letters</Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button variant="secondary" size="sm">Sign In</Button>
            </Link>
          )}
          <Link to="/write">
            <Button variant="primary" size="sm">Write a Letter</Button>
          </Link>
        </div>
      </nav>

      <div className="community-inner">
        <header className="community-header stagger-in">
          <p className="community-eyebrow">Community</p>
          <h1 className="community-heading">
            Words that outlive their moment.
          </h1>
          <p className="community-subheading">
            Some letters are meant for one person. Others are meant for whoever
            needs them. Read, reflect, and contribute your own.
          </p>
        </header>

        {/* Tabs */}
        <div className="community-tabs">
          {TABS.map(t => (
            <button
              key={t.value}
              className={`community-tab ${tab === t.value ? 'community-tab-active' : ''}`}
              onClick={() => setTab(t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Public letters feed */}
        {tab === 'public' && (
          <div className="community-feed">
            {SAMPLE_PUBLIC_LETTERS.map(letter => (
              <PublicLetterCard key={letter.id} letter={letter} />
            ))}
            <div style={{ textAlign: 'center', padding: '24px 0 48px' }}>
              <Link to="/write">
                <Button variant="secondary">
                  ✦ Add Your Voice to the Archive
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Timed release */}
        {tab === 'timed' && (
          <div>
            <div className="community-timed-section stagger-in">
              <h2 className="community-timed-heading">
                Write a letter that opens in the future.
              </h2>
              <p className="community-timed-body">
                Set a year from now, or fifty. When that day comes, your letter
                will be delivered — and if you choose, it will also become part
                of the public archive for others to read.
              </p>

              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-h)', marginBottom: 12 }}>
                When should it open?
              </p>
              <div className="community-timed-grid">
                {TIMED_YEARS.map(opt => (
                  <div
                    key={opt.years}
                    className={`community-timed-option ${timedYears === opt.years ? 'selected' : ''}`}
                    onClick={() => setTimedYears(opt.years)}
                  >
                    <div className="community-timed-years">{opt.years}</div>
                    <div className="community-timed-label">{opt.label === opt.label ? opt.label.replace(' years', '').replace(' year', '') : opt.label}</div>
                  </div>
                ))}
              </div>
              <div className="community-timed-toggle">
                <div
                  className={`community-toggle ${timedPublic ? 'active' : ''}`}
                  onClick={() => setTimedPublic(!timedPublic)}
                >
                  <div className="community-toggle-knob" />
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-h)' }}>
                    Also publish to the public archive
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--text-m)' }}>
                    When it opens, add this letter to the community archive so others can read it
                    {timedYears > 1 ? ` in ${timedYears} years` : ' next year'}. You can remain anonymous.
                  </p>
                </div>
              </div>
              <Button
                variant="primary"
                size="lg"
                className="community-timed-write-btn"
                onClick={handleTimedWrite}
              >
                ✦ Write a Letter Opening in {timedYears} Year{timedYears !== 1 ? 's' : ''}
              </Button>
            </div>

            <div style={{ paddingBottom: 64 }}>
              <p style={{ fontSize: 14, color: 'var(--text-m)', textAlign: 'center' }}>
                {SAMPLE_PUBLIC_LETTERS.length} letters waiting to be opened in the future
              </p>
            </div>
          </div>
        )}

        {/* Community archive */}
        {tab === 'archive' && (
          <div>
            <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: 14, color: 'var(--text-m)' }}>
                Letters that have been delivered and shared with the community.
                Read-only. Opt-in only.
              </p>
            </div>
            <div className="community-archive-grid">
              {SAMPLE_ARCHIVE.map(letter => (
                <ArchiveCard key={letter.id} letter={letter} />
              ))}
            </div>
            <div style={{ textAlign: 'center', padding: '32px 0 64px' }}>
              <p style={{ fontSize: 14, color: 'var(--text-m)', marginBottom: 16 }}>
                Have a delivered letter? Share it with the community.
              </p>
              <Link to="/settings">
                <Button variant="secondary">
                  Opt-in in Settings →
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
