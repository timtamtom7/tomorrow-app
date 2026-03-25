import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { subscribeToUserLetters } from '../../lib/firestore';
import Navbar from '../../components/Navbar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import './AIInsights.css';

function getSubscription() {
  try {
    return JSON.parse(localStorage.getItem('tomorrow-subscription') || '{"plan":"free"}');
  } catch {
    return { plan: 'free' };
  }
}

function analyzeThemes(letters) {
  const text = letters.map(l => `${l.subject || ''} ${l.body || ''}`).join(' ').toLowerCase();

  const themeKeywords = {
    'growth & change': ['grow', 'change', 'different', 'become', 'evolve', 'improve', 'learn'],
    'love & relationships': ['love', 'miss', 'together', 'apart', 'family', 'friend', 'partner', 'heart'],
    'fear & anxiety': ['fear', 'worried', 'anxious', 'nervous', 'scared', 'uncertain', 'doubt', 'afraid'],
    'hope & optimism': ['hope', 'believe', 'trust', 'excited', 'looking forward', 'future', 'someday'],
    'gratitude': ['grateful', 'thankful', 'appreciate', 'blessed', 'lucky'],
    'loss & grief': ['lost', 'gone', 'miss', 'passed', 'death', 'grief', 'mourning'],
    'ambition': ['dream', 'goal', 'want', 'wish', 'someday', 'succeed', 'achieve', 'career'],
    'identity & self': ['myself', 'who i am', 'who am i', 'figuring out', 'identity', 'authentic'],
  };

  const results = [];
  for (const [theme, keywords] of Object.entries(themeKeywords)) {
    const count = keywords.reduce((acc, kw) => acc + (text.split(kw).length - 1), 0);
    if (count > 0) {
      results.push({ theme, count, keywords: keywords.filter(k => text.includes(k)) });
    }
  }

  return results.sort((a, b) => b.count - a.count);
}

function getTimeRange(letter) {
  if (!letter.deliverAt) return null;
  const created = letter.createdAt?.toDate?.() || new Date();
  const deliver = new Date(letter.deliverAt);
  const yearsDiff = (deliver - created) / (1000 * 60 * 60 * 24 * 365);
  return yearsDiff;
}

function generateInsights(letters, themes) {
  const insights = [];
  const opened = letters.filter(l => l.status === 'opened');
  const sealed = letters.filter(l => l.status === 'sealed');
  const drafts = letters.filter(l => l.status === 'draft');

  if (letters.length >= 3) {
    insights.push({
      type: 'pattern',
      icon: '🔁',
      title: 'Consistent Writer',
      body: `You've written ${letters.length} letters across time. ${opened.length > 0 ? `${opened.length} have been opened and read — that's real introspection.` : `Your letters are waiting to be read. They'll carry your voice forward.`}`,
    });
  }

  if (themes.length > 0) {
    const top = themes[0];
    insights.push({
      type: 'theme',
      icon: '💡',
      title: `Top Theme: "${top.theme}"`,
      body: `You return to this idea often — ${top.count} signal${top.count > 1 ? 's' : ''} across your letters. Words like "${top.keywords.slice(0, 3).join('", "')}" show what's alive in you.`,
    });
  }

  const longTerm = letters.filter(l => getTimeRange(l) && getTimeRange(l) >= 1);
  if (longTerm.length > 0) {
    insights.push({
      type: 'patience',
      icon: '⏳',
      title: 'Long Game',
      body: `${longTerm.length} of your letters are set to arrive a year or more from now. You're playing a patient game — writing to a future that hasn't arrived yet.`,
    });
  }

  const tones = {};
  letters.forEach(l => {
    if (l.tone) tones[l.tone] = (tones[l.tone] || 0) + 1;
  });
  const dominantTone = Object.entries(tones).sort((a, b) => b[1] - a[1])[0];
  if (dominantTone) {
    const toneMessages = {
      quiet: 'Your letters tend toward quiet reflection. You write introspectively, with care and depth.',
      urgent: 'You write with urgency — things you need to say, situations you\'re working through.',
      playful: 'Playfulness comes through in your writing. There\'s lightness, humor, and joy in your words.',
      somber: 'Your letters carry weight. You write through difficult things with honesty and gravity.',
    };
    insights.push({
      type: 'tone',
      icon: '🎭',
      title: `Dominant Tone: ${dominantTone[0].charAt(0).toUpperCase() + dominantTone[0].slice(1)}`,
      body: toneMessages[dominantTone[0]] || '',
    });
  }

  if (opened.length > 1) {
    const recipients = {};
    letters.forEach(l => {
      if (l.recipientName && l.recipientName !== 'Future Me') {
        recipients[l.recipientName] = (recipients[l.recipientName] || 0) + 1;
      }
    });
    const topRecipient = Object.entries(recipients).sort((a, b) => b[1] - a[1])[0];
    if (topRecipient) {
      insights.push({
        type: 'recipient',
        icon: '💌',
        title: `${topRecipient[0]} is a frequent recipient`,
        body: `You've written ${topRecipient[1]} letter${topRecipient[1] > 1 ? 's' : ''} to ${topRecipient[0]}. That's an ongoing conversation across time.`,
      });
    }
  }

  if (drafts.length > 0) {
    insights.push({
      type: 'wip',
      icon: '✏️',
      title: `${drafts.length} letter${drafts.length > 1 ? 's' : ''} in progress`,
      body: drafts.length === 1
        ? 'You have a letter that\'s waiting for its moment. Finish it when you\'re ready.'
        : `${drafts.length} letters are waiting for their moment. Some words take time.`,
    });
  }

  if (insights.length === 0 && letters.length > 0) {
    insights.push({
      type: 'start',
      icon: '✦',
      title: 'Your letters await',
      body: 'Write a few more letters, and patterns will emerge. Your past selves will start talking back.',
    });
  }

  return insights;
}

function InsightCard({ insight }) {
  return (
    <Card className={`insight-card insight-${insight.type}`}>
      <div className="insight-icon">{insight.icon}</div>
      <div className="insight-content">
        <h3 className="insight-title">{insight.title}</h3>
        <p className="insight-body">{insight.body}</p>
      </div>
    </Card>
  );
}

function ThemeBar({ theme, maxCount }) {
  const pct = Math.min((theme.count / maxCount) * 100, 100);
  return (
    <div className="theme-bar-row">
      <div className="theme-bar-header">
        <span className="theme-bar-name">{theme.theme}</span>
        <span className="theme-bar-count">{theme.count} {theme.count === 1 ? 'mention' : 'mentions'}</span>
      </div>
      <div className="theme-bar-track">
        <div className="theme-bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function AIInsights() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscription] = useState(getSubscription);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (subscription.plan !== 'legacy') {
      setLoading(false);
      return;
    }
    const unsub = subscribeToUserLetters(user.uid, fetched => {
      setLetters(fetched.filter(l => !['cancelled', 'deleted'].includes(l.status)));
      setLoading(false);
    });
    return unsub;
  }, [user, navigate, subscription.plan]);

  if (subscription.plan !== 'legacy') {
    return (
      <div className="app-page page-enter">
        <Navbar />
        <main className="app-main">
          <div className="app-container">
            <div className="legacy-gate">
              <div className="legacy-gate-icon">✦</div>
              <h2 className="legacy-gate-title">AI Insights — Legacy Only</h2>
              <p className="legacy-gate-body">
                AI reads your letters and reveals the patterns, themes, and threads running through your writing.
                It's like a thoughtful friend who has known you across time.
              </p>
              <p className="legacy-gate-body">
                Upgrade to Legacy to unlock this feature.
              </p>
              <Link to="/pricing">
                <Button variant="primary">✦ See Legacy Plan</Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const lettersWithBody = letters.filter(l => l.body && l.body.trim().length > 20);
  const themes = analyzeThemes(lettersWithBody);
  const insights = generateInsights(lettersWithBody, themes);
  const maxThemeCount = themes.length > 0 ? themes[0].count : 1;

  return (
    <div className="app-page page-enter">
      <Navbar />

      <main className="app-main">
        <div className="app-container">
          <header className="app-header">
            <div className="app-header-left">
              <h1 className="app-title">AI Insights</h1>
              <p className="app-subtitle">Patterns from your letters — what your past selves keep saying.</p>
            </div>
          </header>

          {loading ? (
            <div className="app-loading">
              <div className="skeleton" style={{ height: 120, borderRadius: 12 }} />
              <div className="skeleton" style={{ height: 120, borderRadius: 12 }} />
              <div className="skeleton" style={{ height: 120, borderRadius: 12 }} />
            </div>
          ) : lettersWithBody.length < 1 ? (
            <div className="ai-empty">
              <div className="ai-empty-icon">✦</div>
              <h2 className="ai-empty-title">Not enough letters yet</h2>
              <p className="ai-empty-body">
                Write a few sealed letters and AI Insights will start finding patterns.
                Each letter you write becomes part of the conversation across time.
              </p>
              <Link to="/write">
                <Button variant="primary">✦ Write a Letter</Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Insights */}
              <section className="ai-section stagger-in">
                <h2 className="ai-section-title">What AI Found</h2>
                <div className="insights-grid">
                  {insights.map((insight, i) => (
                    <InsightCard key={i} insight={insight} />
                  ))}
                </div>
              </section>

              {/* Theme breakdown */}
              {themes.length > 0 && (
                <section className="ai-section stagger-in">
                  <h2 className="ai-section-title">Theme Breakdown</h2>
                  <Card className="themes-card">
                    {themes.map(t => (
                      <ThemeBar key={t.theme} theme={t} maxCount={maxThemeCount} />
                    ))}
                  </Card>
                </section>
              )}

              {/* Letters summary */}
              <section className="ai-section stagger-in">
                <h2 className="ai-section-title">Letters Analyzed</h2>
                <div className="ai-letters-count">
                  <span className="ai-letters-num">{lettersWithBody.length}</span>
                  <span className="ai-letters-label">
                    letter{lettersWithBody.length !== 1 ? 's' : ''} read and analyzed
                  </span>
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
