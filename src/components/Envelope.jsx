import { useState, useEffect } from 'react';
import './Envelope.css';

export default function Envelope({ onComplete }) {
  const [phase, setPhase] = useState('closed');

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('shaking'), 400),
      setTimeout(() => setPhase('opening'), 900),
      setTimeout(() => setPhase('open'), 1400),
      setTimeout(() => setPhase('reveal'), 1800),
      setTimeout(() => onComplete && onComplete(), 2400),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="envelope-wrapper">
      <div className={`envelope ${phase}`}>
        {/* Envelope body */}
        <div className="envelope-body">
          {/* Pocket shadow */}
          <div className="envelope-pocket" />
          {/* Flap */}
          <div className={`envelope-flap ${phase === 'opening' ? 'envelope-flap-opening' : ''} ${phase === 'open' || phase === 'reveal' ? 'envelope-flap-open' : ''}`} />
          {/* Letter inside */}
          <div className={`envelope-letter ${phase === 'reveal' ? 'envelope-letter-reveal' : ''}`}>
            <div className="envelope-letter-lines">
              <div className="envelope-line" style={{ width: '60%' }} />
              <div className="envelope-line" style={{ width: '80%' }} />
              <div className="envelope-line" style={{ width: '45%' }} />
              <div className="envelope-line" style={{ width: '70%' }} />
              <div className="envelope-line" style={{ width: '55%' }} />
            </div>
          </div>
        </div>
        {/* Wax seal */}
        <div className={`envelope-seal ${phase === 'open' || phase === 'reveal' ? 'envelope-seal-broken' : ''}`}>
          <span>✦</span>
        </div>
      </div>
    </div>
  );
}
