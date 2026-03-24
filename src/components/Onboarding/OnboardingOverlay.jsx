import { useState, useEffect } from 'react';
import Button from '../ui/Button';

const ONBOARDING_KEY = 'tomorrow-onboarding-complete';

const SCREENS = [
  {
    id: 'concept',
    title: 'Write to your future self.',
    body: (
      <>
        Not a journal. Not a note to remember.
        A genuine act of trust placed in{' '}
        <em>exactly one future moment.</em>
      </>
    ),
    illustration: 'envelope',
    actions: null, // auto-advance
  },
  {
    id: 'first-letter',
    title: 'What do you write about?',
    body: (
      <>
        Anything. Everything. The small things you're glad you recorded,
        and the big feelings you're not sure yet how to carry.
      </>
    ),
    example: {
      label: 'A letter like this one',
      text: (
        <>
          "Right now I'm sitting at the kitchen table with the window open.
          The neighbour's kid is learning the trumpet — badly, but with{' '}
          <strong>genuine conviction</strong>.
          I want to remember this version of ordinary. When you read this,{' '}
          I hope you're somewhere you like being."
        </>
      ),
    },
    illustration: 'letter',
    actions: null,
  },
  {
    id: 'seal',
    title: 'Seal it for later.',
    body: (
      <>
        Set a date — six months, a year, five years. The letter sits
        and waits. When the day arrives, it's delivered{' '}
        <em>once</em>. Then it's sealed forever.
      </>
    ),
    illustration: 'calendar',
    timeframes: [
      { label: '6 months', hint: 'Check in' },
      { label: '1 year', hint: 'A cycle' },
      { label: '5 years', hint: 'A chapter' },
      { label: 'Custom', hint: 'Your date' },
    ],
    actions: null,
  },
  {
    id: 'cta',
    title: 'Your future self will thank you.',
    body: (
      <>
        There's no wrong time to start. The best letters are written before
        you know how the story goes.
      </>
    ),
    illustration: 'seal',
    actions: 'final',
  },
];

export default function OnboardingOverlay() {
  const [current, setCurrent] = useState(0);
  const [done, setDone] = useState(false);
  const screen = SCREENS[current];

  useEffect(() => {
    const key = ONBOARDING_KEY;
    if (localStorage.getItem(key)) {
      setDone(true);
    }
  }, []);

  useEffect(() => {
    if (done) return;
    if (screen.actions === null && current < SCREENS.length - 1) {
      const timer = setTimeout(() => setCurrent(c => c + 1), 3200);
      return () => clearTimeout(timer);
    }
  }, [current, done, screen.actions]);

  if (done) return null;

  function handleDismiss() {
    setDone(true);
    localStorage.setItem(ONBOARDING_KEY, '1');
  }

  function handleFinish() {
    setDone(true);
    localStorage.setItem(ONBOARDING_KEY, '1');
  }

  function handleNext() {
    if (current < SCREENS.length - 1) {
      setCurrent(c => c + 1);
    }
  }

  function handleBack() {
    if (current > 0) {
      setCurrent(c => c - 1);
    }
  }

  return (
    <div className="onboarding-backdrop" role="dialog" aria-modal="true" aria-label="Welcome to Tomorrow">
      <div className="onboarding-modal">
        {/* Progress dots */}
        <div className="onboarding-progress">
          {SCREENS.map((_, i) => (
            <div
              key={i}
              className={`onboarding-progress-dot${i === current ? ' active' : i < current ? ' done' : ''}`}
            />
          ))}
        </div>

        {/* Skip */}
        <button className="onboarding-skip" onClick={handleDismiss}>
          Skip
        </button>

        {/* Illustration */}
        <Illustration id={screen.id} />

        {/* Content */}
        <h2 className="onboarding-title">{screen.title}</h2>
        <p className="onboarding-body">{screen.body}</p>

        {/* Example letter (screen 2) */}
        {screen.example && (
          <div className="onboarding-example">
            <p className="onboarding-example-label">{screen.example.label}</p>
            <p className="onboarding-example-text">{screen.example.text}</p>
          </div>
        )}

        {/* Timeframes (screen 3) */}
        {screen.timeframes && (
          <div className="onboarding-timeframes">
            {screen.timeframes.map((tf, i) => (
              <div key={i} className="onboarding-timeframe">
                <p className="onboarding-timeframe-label">{tf.label}</p>
                <p className="onboarding-timeframe-hint">{tf.hint}</p>
              </div>
            ))}
          </div>
        )}

        {/* Actions (screen 4) */}
        {screen.actions === 'final' && (
          <div className="onboarding-actions">
            <Button variant="secondary" size="lg" onClick={handleDismiss}>
              Maybe Later
            </Button>
            <Button variant="primary" size="lg" onClick={handleFinish}>
              ✦ Write Your First Letter
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function Illustration({ id }) {
  if (id === 'envelope') {
    return (
      <svg
        className="onboarding-illustration"
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Envelope body */}
        <rect x="4" y="20" width="72" height="50" rx="6" fill="#1c1c1e" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
        {/* Flap */}
        <path d="M4 20 L40 46 L76 20" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" fill="none"/>
        {/* Wax seal */}
        <circle cx="40" cy="54" r="10" fill="url(#sealGrad)"/>
        <text x="40" y="58" textAnchor="middle" fill="white" fontSize="9" fontFamily="serif">✦</text>
        {/* Accent glow */}
        <circle cx="40" cy="54" r="14" fill="none" stroke="rgba(232,93,4,0.3)" strokeWidth="1"/>
        <defs>
          <radialGradient id="sealGrad" cx="35%" cy="35%">
            <stop offset="0%" stopColor="#ff7a2a"/>
            <stop offset="100%" stopColor="#e85d04"/>
          </radialGradient>
        </defs>
      </svg>
    );
  }

  if (id === 'letter') {
    return (
      <svg
        className="onboarding-illustration"
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Paper */}
        <rect x="12" y="8" width="56" height="64" rx="4" fill="#f5f0e8" stroke="rgba(0,0,0,0.08)" strokeWidth="1"/>
        {/* Lines */}
        <rect x="20" y="22" width="40" height="4" rx="2" fill="rgba(0,0,0,0.1)"/>
        <rect x="20" y="32" width="32" height="4" rx="2" fill="rgba(0,0,0,0.08)"/>
        <rect x="20" y="42" width="36" height="4" rx="2" fill="rgba(0,0,0,0.08)"/>
        <rect x="20" y="52" width="28" height="4" rx="2" fill="rgba(0,0,0,0.06)"/>
        <rect x="20" y="62" width="20" height="4" rx="2" fill="rgba(0,0,0,0.05)"/>
        {/* Accent corner */}
        <path d="M68 8 L68 18 L58 8 Z" fill="#e85d04" opacity="0.3"/>
      </svg>
    );
  }

  if (id === 'calendar') {
    return (
      <svg
        className="onboarding-illustration"
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Calendar body */}
        <rect x="8" y="16" width="64" height="56" rx="6" fill="#1c1c1e" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
        {/* Header */}
        <rect x="8" y="16" width="64" height="14" rx="6" fill="#252528"/>
        <rect x="8" y="26" width="64" height="4" fill="#252528"/>
        {/* Calendar hooks */}
        <rect x="22" y="10" width="6" height="12" rx="3" fill="rgba(255,255,255,0.15)"/>
        <rect x="52" y="10" width="6" height="12" rx="3" fill="rgba(255,255,255,0.15)"/>
        {/* Highlighted date */}
        <rect x="20" y="38" width="12" height="12" rx="3" fill="#e85d04" opacity="0.9"/>
        {/* Other dates */}
        <rect x="40" y="38" width="12" height="12" rx="3" fill="rgba(255,255,255,0.05)"/>
        <rect x="20" y="54" width="12" height="12" rx="3" fill="rgba(255,255,255,0.05)"/>
        <rect x="40" y="54" width="12" height="12" rx="3" fill="rgba(255,255,255,0.05)"/>
      </svg>
    );
  }

  if (id === 'seal') {
    return (
      <svg
        className="onboarding-illustration"
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer ring */}
        <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(232,93,4,0.2)" strokeWidth="1.5"/>
        {/* Wax seal */}
        <circle cx="40" cy="40" r="26" fill="url(#sealGrad2)"/>
        {/* Inner circle */}
        <circle cx="40" cy="40" r="20" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
        {/* Star */}
        <text x="40" y="46" textAnchor="middle" fill="white" fontSize="18" fontFamily="serie">✦</text>
        {/* Dotted ring */}
        <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(232,93,4,0.15)" strokeWidth="1" strokeDasharray="2 4"/>
        <defs>
          <radialGradient id="sealGrad2" cx="35%" cy="35%">
            <stop offset="0%" stopColor="#ff7a2a"/>
            <stop offset="60%" stopColor="#e85d04"/>
            <stop offset="100%" stopColor="#c44d00"/>
          </radialGradient>
        </defs>
      </svg>
    );
  }

  return null;
}
