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
              Set a delivery date — a year from now, five years, whenever feels right.
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
            <Button variant="primary" size="lg">Write Your First Letter</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <p>Tomorrow — A message from the past.</p>
        <div className="home-footer-links">
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <Link to="/settings">Settings</Link>
        </div>
      </footer>
    </div>
  );
}
