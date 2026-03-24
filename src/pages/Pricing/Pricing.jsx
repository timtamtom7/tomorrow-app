import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import './Pricing.css';

const FREE_FEATURES = [
  { icon: '✓', text: '1 active letter at a time', included: true },
  { icon: '✓', text: 'Basic email delivery', included: true },
  { icon: '✓', text: 'Write to Future Me or someone else', included: true },
  { icon: '✓', text: 'Tone selection (quiet, urgent, playful, somber)', included: true },
  { icon: '✗', text: 'Photo attachments', included: false },
  { icon: '✗', text: 'Voice recording', included: false },
  { icon: '✗', text: 'Unlimited letters', included: false, pro: true },
  { icon: '✗', text: 'AI future guidance (Legacy)', included: false, pro: true },
];

const KEEPER_FEATURES = [
  { icon: '✓', text: 'Unlimited active letters', included: true },
  { icon: '✓', text: 'Scheduled delivery dates', included: true },
  { icon: '✓', text: 'Photo attachments', included: true },
  { icon: '✓', text: 'Voice recording', included: true },
  { icon: '✓', text: 'Write to Future Me or someone else', included: true },
  { icon: '✓', text: 'Tone selection', included: true },
  { icon: '✓', text: '7-day reminder notifications', included: true },
  { icon: '✗', text: 'AI future guidance (Legacy)', included: false, pro: true },
];

const LEGACY_FEATURES = [
  { icon: '✓', text: 'Everything in Keeper', included: true },
  { icon: '✓', text: 'AI Future Guidance', included: true, highlight: true },
  { icon: '✓', text: 'Priority delivery (first in queue)', included: true },
  { icon: '✓', text: 'Family tree letters', included: true, highlight: true },
  { icon: '✓', text: 'Letter series & chapters', included: true },
  { icon: '✓', text: 'Photo attachments', included: true },
  { icon: '✓', text: 'Voice recording', included: true },
  { icon: '✓', text: 'Unlimited letters', included: true },
];

const FAQ = [
  {
    q: 'Can I cancel anytime?',
    a: 'Yes — cancel anytime from Settings → Subscription. Your letters will still be delivered on their scheduled dates.',
  },
  {
    q: 'What happens to my letters if I downgrade?',
    a: 'All your sealed and scheduled letters will still arrive on their dates. Only new letters are limited by your tier.',
  },
  {
    q: 'What is "AI Future Guidance"?',
    a: "Legacy members can ask AI questions about their past letters. The AI reads everything you've written and offers perspective — like a thoughtful friend who has known you across time.",
  },
  {
    q: 'How do photo attachments work?',
    a: "Photos are encrypted end-to-end and attached to your letter. They're only viewable by the recipient when the letter is opened.",
  },
  {
    q: 'What is a "Family Tree"?',
    a: 'A Legacy feature that lets you write letters to future generations — your children, grandchildren. The letters can unlock chapter by chapter as they grow.',
  },
];

function FeatureItem({ feature }) {
  const iconClass = feature.highlight
    ? 'pro'
    : feature.included
    ? 'included'
    : 'excluded';
  return (
    <li className={`tier-feature${feature.pro ? ' pro' : ''}${feature.highlight ? ' tier-feature-highlight' : ''}`}>
      <span className={`tier-feature-icon ${iconClass}`}>
        {feature.icon}
      </span>
      <span className="tier-feature-text">{feature.text}</span>
      {feature.highlight && (
        <span className="tier-feature-new">New</span>
      )}
    </li>
  );
}

export default function Pricing() {
  return (
    <div className="pricing-page page-enter">
      <div className="pricing-inner">
        <Link to="/" className="pricing-back">
          ← Back to Tomorrow
        </Link>

        <header className="pricing-header">
          <p className="pricing-eyebrow">Simple, honest pricing</p>
          <h1 className="pricing-heading">
            Your words deserve<br />a future.
          </h1>
          <p className="pricing-subheading">
            Tomorrow is free to start. Upgrade when you're ready to write more,
            add memories that go beyond words, and unlock guidance from your past selves.
          </p>
        </header>

        <div className="pricing-tiers stagger-in">
          {/* Free */}
          <div className="tier-card">
            <p className="tier-name">Free</p>
            <div className="tier-price">
              <span className="tier-price-amount">$0</span>
              <span className="tier-price-period">forever</span>
            </div>
            <div className="tier-divider" />
            <ul className="tier-features">
              {FREE_FEATURES.map((f, i) => (
                <FeatureItem key={i} feature={f} />
              ))}
            </ul>
            <Link to="/auth" className="tier-cta">
              <Button variant="secondary" size="lg" fullWidth>
                Get Started Free
              </Button>
            </Link>
          </div>

          {/* Keeper */}
          <div className="tier-card tier-featured">
            <span className="tier-badge">Most Popular</span>
            <p className="tier-name">Keeper</p>
            <div className="tier-price">
              <span className="tier-price-amount">$3.99</span>
              <span className="tier-price-period">/ month</span>
            </div>
            <div className="tier-divider" />
            <ul className="tier-features">
              {KEEPER_FEATURES.map((f, i) => (
                <FeatureItem key={i} feature={f} />
              ))}
            </ul>
            <Link to="/auth?plan=keeper" className="tier-cta">
              <Button variant="primary" size="lg" fullWidth>
                ✦ Start Keeper
              </Button>
            </Link>
          </div>

          {/* Legacy */}
          <div className="tier-card">
            <p className="tier-name">Legacy</p>
            <div className="tier-price">
              <span className="tier-price-amount">$9.99</span>
              <span className="tier-price-period">/ month</span>
            </div>
            <div className="tier-divider" />
            <div className="tier-ai-callout">
              <p className="tier-ai-callout-title">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 16v-4M12 8h.01"/>
                </svg>
                Includes AI Future Guidance
              </p>
              <p className="tier-ai-callout-body">
                "Your past letters become a map. The AI reads everything and
                offers perspective — like talking to someone who has known you across time."
              </p>
            </div>
            <ul className="tier-features">
              {LEGACY_FEATURES.map((f, i) => (
                <FeatureItem key={i} feature={f} />
              ))}
            </ul>
            <Link to="/auth?plan=legacy" className="tier-cta">
              <Button variant="secondary" size="lg" fullWidth>
                Start Legacy
              </Button>
            </Link>
          </div>
        </div>

        {/* FAQ */}
        <section className="pricing-faq">
          <h2 className="pricing-faq-heading">Common questions</h2>
          {FAQ.map((item, i) => (
            <div key={i} className="pricing-faq-item">
              <p className="pricing-faq-q">{item.q}</p>
              <p className="pricing-faq-a">{item.a}</p>
            </div>
          ))}
        </section>

        {/* Promise */}
        <div className="pricing-promise">
          <p className="pricing-promise-text">
            "Every letter written here is a small act of faith in the future.
            <strong> That worth doesn't change with a price tag.</strong>"
          </p>
        </div>
      </div>
    </div>
  );
}
