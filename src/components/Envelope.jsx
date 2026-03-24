import { useState, useEffect } from 'react';
import './Envelope.css';

export default function Envelope({ onComplete }) {
  const [phase, setPhase] = useState('closed');

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('opening'), 400),
      setTimeout(() => setPhase('open'), 1100),
      setTimeout(() => setPhase('reveal'), 1600),
      setTimeout(() => onComplete && onComplete(), 2200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="envelope-wrapper">
      <div className={`envelope ${phase === 'open' || phase === 'reveal' ? 'envelope-open' : ''}`}>
        {/* Envelope body */}
        <div className="envelope-body">
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
