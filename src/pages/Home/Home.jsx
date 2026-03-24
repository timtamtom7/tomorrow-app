import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Envelope from '../../components/Envelope';
import Button from '../../components/ui/Button';
import './Home.css';

export default function Home() {
  const { user } = useAuth();
  const [animDone, setAnimDone] = useState(false);

  return (
    <div className="home page-enter">
      <div className="home-inner">
        {/* Left — emotional copy */}
        <div className="home-left stagger-in">
          <p className="home-eyebrow">A message from the past.</p>
          <h1 className="home-heading">
            Write a letter.<br />
            Set a date.<br />
            <span className="home-heading-accent">Trust the future.</span>
          </h1>
          <p className="home-body">
            Tomorrow is a time capsule for your thoughts. Write to your future self,
            a partner, a friend, or someone you haven't met yet. When the day arrives,
            it arrives exactly once — and then it's sealed forever.
          </p>
          <div className="home-actions">
            <Link to="/write">
              <Button variant="primary" size="lg">
                Write a Letter
              </Button>
            </Link>
            {user ? (
              <Link to="/app" className="home-secondary-link">
                View your letters →
              </Link>
            ) : (
              <Link to="/auth" className="home-secondary-link">
                Sign in to get started →
              </Link>
            )}
          </div>

          {/* Social proof */}
          <div className="home-proof">
            <div className="home-proof-avatars">
              <span className="proof-avatar" style={{ background: '#e85d04' }}>M</span>
              <span className="proof-avatar" style={{ background: '#6366f1' }}>S</span>
              <span className="proof-avatar" style={{ background: '#22c55e' }}>R</span>
              <span className="proof-avatar" style={{ background: '#f59e0b' }}>A</span>
            </div>
            <p className="home-proof-text">
              Letters sealed and waiting for their moment.
            </p>
          </div>
        </div>

        {/* Right — envelope animation */}
        <div className="home-right">
          <div className="home-envelope-container">
            {!animDone && (
              <p className="home-envelope-hint">This is what your letter will look like</p>
            )}
            <Envelope onComplete={() => setAnimDone(true)} />
            {animDone && (
              <div className="home-demo-label">
                <span>A letter from the past</span>
              </div>
            )}
          </div>

          {/* Feature chips */}
          <div className="home-features">
            <span className="feature-chip">
              <span className="feature-chip-icon">📅</span>
              Set any future date
            </span>
            <span className="feature-chip">
              <span className="feature-chip-icon">🔒</span>
              Read once, then gone
            </span>
            <span className="feature-chip">
              <span className="feature-chip-icon">💌</span>
              Arrives by email
            </span>
          </div>
        </div>
      </div>

      {/* Example letter — real excerpt */}
      <section className="home-example">
        <div className="home-example-inner">
          <p className="home-example-eyebrow">What does a letter actually look like?</p>
          <h2 className="home-example-heading">Written by someone today, for someone tomorrow.</h2>
          <div className="home-example-letter">
            <div className="home-example-letter-meta">
              <span className="home-example-from">From: Marco</span>
              <span className="home-example-date">Arriving: March 2027</span>
            </div>
            <div className="home-example-letter-body">
              <p>
                "Right now I'm sitting at the kitchen table with the window open.
                The neighbour's kid is learning the trumpet — badly, but with genuine conviction.
                I want to remember this version of ordinary. When you read this,
                I hope you're somewhere you like being.
              </p>
              <p>
                A year ago I wouldn't have written this. I would have thought it was too small,
                too ordinary, not worth preserving. Now I think maybe the ordinary is exactly
                what gets lost first. So here's me, holding onto it."
              </p>
              <p>
                <em>— The version of me that still plays records on Sunday mornings.</em>
              </p>
            </div>
            <div className="home-example-seal">
              <span className="home-example-seal-icon">✦</span>
              <span>Sealed. Waiting.</span>
            </div>
          </div>
          <Link to="/write">
            <Button variant="secondary" size="lg">
              Write Your Own Letter →
            </Button>
          </Link>
        </div>
      </section>

      {/* Use cases */}
      <section className="home-usecases">
        <div className="home-usecases-inner">
          <h2 className="home-usecases-heading">Letters for every version of the future</h2>
          <div className="home-usecases-grid">
            <div className="usecase-card">
              <div className="usecase-icon">🌱</div>
              <h3 className="usecase-title">For Future Me</h3>
              <p className="usecase-body">
                A year from now, five years. A note for when you've forgotten what this
                version of you was thinking, feeling, hoping for.
              </p>
            </div>
            <div className="usecase-card">
              <div className="usecase-icon">💜</div>
              <h3 className="usecase-title">For a Partner</h3>
              <p className="usecase-body">
                Write now, seal it for your anniversary, a move, a hard season.
                Words written in calm that arrive when they matter most.
              </p>
            </div>
            <div className="usecase-card">
              <div className="usecase-icon">👶</div>
              <h3 className="usecase-title">For Future Children</h3>
              <p className="usecase-body">
                Legacy members can write letters that unlock chapter by chapter as your
                children grow — letters that grow with them.
              </p>
              <span className="usecase-pro-badge">Legacy</span>
            </div>
            <div className="usecase-card">
              <div className="usecase-icon">🪴</div>
              <h3 className="usecase-title">For Hard Seasons</h3>
              <p className="usecase-body">
                Write to yourself during something difficult. Set the date for when
                you think you'll be through it — and see if you were right.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="home-how">
        <h2 className="home-how-heading">How Tomorrow works</h2>
        <div className="home-how-steps">
          <div className="home-step">
            <div className="home-step-num">01</div>
            <h3 className="home-step-title">Write</h3>
            <p className="home-step-body">
              Pour your thoughts onto the page. Write to your future self, a partner,
              a friend, or anyone at all. Choose a tone — quiet, urgent, playful, somber.
            </p>
          </div>
          <div className="home-step-divider" />
          <div className="home-step">
            <div className="home-step-num">02</div>
            <h3 className="home-step-title">Seal</h3>
            <p className="home-step-body">
              Set a delivery date — six months from now, a year, five years.
              Your letter is encrypted and sealed. There's no editing after you send.
            </p>
          </div>
          <div className="home-step-divider" />
          <div className="home-step">
            <div className="home-step-num">03</div>
            <h3 className="home-step-title">Arrive</h3>
            <p className="home-step-body">
              On that day, your letter arrives. Exactly once. The recipient opens it,
              reads it — and then it's sealed forever. No copies. No archives.
            </p>
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="home-cta">
        <div className="home-cta-inner">
          <h2 className="home-cta-heading">What do you want to say?</h2>
          <p className="home-cta-body">
            The best letters are written when you don't know what comes next.
            Trust the future. Write today.
          </p>
          <Link to="/write">
            <Button variant="primary" size="lg">✦ Write Your First Letter</Button>
          </Link>
          <p className="home-cta-pricing-note">
            Free to start.{' '}
            <Link to="/pricing" className="home-cta-pricing-link">
              See plans →
            </Link>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <p>Tomorrow — A message from the past.</p>
        <div className="home-footer-links">
          <Link to="/pricing">Pricing</Link>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <Link to="/settings">Settings</Link>
        </div>
      </footer>
    </div>
  );
}
