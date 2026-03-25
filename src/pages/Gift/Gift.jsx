import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import './Gift.css';

const GIFT_PLANS = [
  {
    id: 'keeper-1m',
    name: 'Keeper',
    duration: '1 month',
    price: 3.99,
    icon: '✦',
    color: '#6366f1',
    features: ['Unlimited letters', 'Photo attachments', 'Voice recordings'],
  },
  {
    id: 'keeper-1y',
    name: 'Keeper',
    duration: '1 year',
    price: 39.99,
    icon: '✦',
    color: '#6366f1',
    features: ['Unlimited letters', 'Photo attachments', 'Voice recordings', 'Save 17%'],
  },
  {
    id: 'legacy-1y',
    name: 'Legacy',
    duration: '1 year',
    price: 99.99,
    icon: '✦',
    color: '#e85d04',
    features: ['Everything in Keeper', 'AI Future Guidance', 'Family tree letters', 'Save 17%'],
  },
];

const DELIVERY_OPTIONS = [
  {
    id: 'now',
    title: 'Send gift card now',
    desc: 'Email will be sent immediately with the gift code',
  },
  {
    id: 'scheduled',
    title: 'Schedule for a specific date',
    desc: 'Choose a date — the gift will arrive on that day',
  },
  {
    id: 'voucher',
    title: 'Give as a physical voucher',
    desc: 'Print a beautiful gift card to hand-deliver',
  },
];

function GiftCardPreview({ plan, recipientName }) {
  return (
    <div className="gift-card-preview">
      <div className="gift-card-logo">Tomorrow ✦</div>
      <div className="gift-card-amount">
        {plan.id.includes('legacy') ? 'Legacy' : 'Keeper'}
      </div>
      <div className="gift-card-plan">
        {plan.duration} subscription · Gifted by {recipientName || 'someone who cares'}
      </div>
      <div className="gift-card-to">
        ✦ Give the gift of time. Write today. Read tomorrow.
      </div>
    </div>
  );
}

export default function Gift() {
  const [selectedPlan, setSelectedPlan] = useState(GIFT_PLANS[1]);
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [senderName, setSenderName] = useState('');
  const [message, setMessage] = useState('');
  const [delivery, setDelivery] = useState('now');

  const isFormValid = recipientEmail && senderName && recipientName;

  return (
    <div className="gift-page page-enter">
      <nav className="gift-nav">
        <Link to="/" className="gift-nav-logo">
          Tomorrow <span>✦</span>
        </Link>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/pricing">
            <Button variant="secondary" size="sm">See Plans</Button>
          </Link>
          <Link to="/write">
            <Button variant="primary" size="sm">Write a Letter</Button>
          </Link>
        </div>
      </nav>

      <div className="gift-inner">
        <header className="gift-header stagger-in">
          <p className="gift-eyebrow">Gift</p>
          <h1 className="gift-heading">
            Give the gift of time胶囊.
          </h1>
          <p className="gift-subheading">
            A Tomorrow subscription is a letter that lasts. Gift it to someone
            who could use a message from the past — to their future self.
          </p>
        </header>

        {/* Gift card preview */}
        <GiftCardPreview plan={selectedPlan} recipientName={recipientName} />

        {/* Plan selection */}
        <div className="gift-plans stagger-in">
          {GIFT_PLANS.map(plan => (
            <div
              key={plan.id}
              className={`gift-plan-card ${selectedPlan.id === plan.id ? 'selected' : ''}`}
              onClick={() => setSelectedPlan(plan)}
            >
              <div className="gift-plan-icon" style={{ background: plan.color + '22', borderColor: plan.color + '44' }}>
                {plan.icon}
              </div>
              <div className="gift-plan-name">{plan.name}</div>
              <div className="gift-plan-duration">{plan.duration}</div>
              <div className="gift-plan-price">${plan.price}</div>
              <ul className="gift-plan-features">
                {plan.features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Recipient form */}
        <div className="gift-form stagger-in">
          <h2 className="gift-form-title">Who is this gift for?</h2>

          <div className="gift-form-row">
            <div className="gift-form-field">
              <label className="gift-form-label">Recipient Name</label>
              <input
                type="text"
                className="gift-form-input"
                placeholder="Sofia"
                value={recipientName}
                onChange={e => setRecipientName(e.target.value)}
              />
            </div>
            <div className="gift-form-field">
              <label className="gift-form-label">Recipient Email</label>
              <input
                type="email"
                className="gift-form-input"
                placeholder="sofia@example.com"
                value={recipientEmail}
                onChange={e => setRecipientEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="gift-form-field">
            <label className="gift-form-label">Your Name</label>
            <input
              type="text"
              className="gift-form-input"
              placeholder="Your name"
              value={senderName}
              onChange={e => setSenderName(e.target.value)}
            />
          </div>

          <div className="gift-form-field">
            <label className="gift-form-label">Personal Message (optional)</label>
            <textarea
              className="gift-form-input gift-form-textarea"
              placeholder="Write a personal note to accompany the gift..."
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
            <p className="gift-form-hint">
              This will be included in the gift email.
            </p>
          </div>
        </div>

        {/* Delivery options */}
        <div className="gift-form stagger-in">
          <h2 className="gift-form-title">How should we deliver it?</h2>
          <div className="gift-delivery-options">
            {DELIVERY_OPTIONS.map(opt => (
              <div
                key={opt.id}
                className={`gift-delivery-option ${delivery === opt.id ? 'selected' : ''}`}
                onClick={() => setDelivery(opt.id)}
              >
                <div className="gift-delivery-radio" />
                <div>
                  <p className="gift-delivery-title">{opt.title}</p>
                  <p className="gift-delivery-desc">{opt.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Checkout */}
        <div className="gift-checkout stagger-in">
          <h2 className="gift-checkout-title">Order Summary</h2>
          <div className="gift-summary-row">
            <span className="gift-summary-label">Plan</span>
            <span className="gift-summary-value">
              {selectedPlan.name} · {selectedPlan.duration}
            </span>
          </div>
          <div className="gift-summary-row">
            <span className="gift-summary-label">Recipient</span>
            <span className="gift-summary-value">
              {recipientName || '—'}
            </span>
          </div>
          <div className="gift-summary-row">
            <span className="gift-summary-label">Delivery</span>
            <span className="gift-summary-value">
              {DELIVERY_OPTIONS.find(d => d.id === delivery)?.title.split(' ')[0] || '—'}
            </span>
          </div>
          <div className="gift-summary-row gift-summary-total">
            <span className="gift-summary-label">Total</span>
            <span className="gift-summary-value">${selectedPlan.price}</span>
          </div>

          <div className="gift-coming-soon">
            <div className="gift-coming-soon-icon">🔒</div>
            <div className="gift-coming-soon-text">
              <strong>Payment processing coming soon.</strong> Gift cards and
              subscription purchases will be available shortly. For now, you
              can share this page with someone and ask them to sign up — they'll
              know you care.
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!isFormValid}
          >
            {isFormValid
              ? `Give ${selectedPlan.name} ($${selectedPlan.price})`
              : 'Fill in recipient details to continue'}
          </Button>
        </div>

        {/* Share instead */}
        <div className="gift-share">
          <p className="gift-share-title">Or just share the idea.</p>
          <p className="gift-share-body">
            Sometimes the best gift is just telling someone about Tomorrow.
          </p>
          <div className="gift-share-links">
            <Button
              variant="secondary"
              onClick={() => navigator.clipboard?.writeText('https://tomorrow.app')}
            >
              📋 Copy Link
            </Button>
            <Link to="/">
              <Button variant="secondary">← Back to Tomorrow</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
