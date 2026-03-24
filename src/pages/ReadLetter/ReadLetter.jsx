import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLetter, openLetter } from '../../lib/firestore';
import Envelope from '../../components/Envelope';
import Button from '../../components/ui/Button';
import './ReadLetter.css';

export default function ReadLetter() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [letter, setLetter] = useState(null);
  const [phase, setPhase] = useState('loading'); // loading | confirm | opening | reading | expired | already
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLetter() {
      try {
        const fetched = await getLetter(id);
        if (!fetched) {
          navigate('/');
          return;
        }
        setLetter(fetched);

        if (fetched.status === 'opened') {
          setPhase('already');
        } else if (fetched.status !== 'delivered' && fetched.status !== 'sealed') {
          setPhase('expired');
        } else {
          setPhase('confirm');
        }
      } catch (err) {
        // Firebase not configured or other error
        console.error('Failed to load letter:', err);
        setPhase('expired');
      } finally {
        setLoading(false);
      }
    }
    fetchLetter();
  }, [id, navigate]);

  async function handleOpen() {
    setPhase('opening');
    // Wait for envelope animation
    setTimeout(async () => {
      try {
        await openLetter(id);
      } catch (err) {
        console.error('Failed to mark letter as opened:', err);
      }
      setPhase('reading');
    }, 2200);
  }

  function handleMaybeLater() {
    navigate('/');
  }

  if (loading) {
    return (
      <div className="read-page">
        <div className="read-loading">
          <div className="read-loading-icon">✦</div>
          <p>Loading your letter…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="read-page page-enter">
      {/* Header */}
      <header className="read-header">
        <div className="read-header-logo">
          <span className="read-logo-mark">✦</span>
          <span className="read-logo-text">Tomorrow</span>
        </div>
      </header>

      <main className="read-main">
        <div className="read-container">
          {/* Phase: Confirm — dark overlay modal */}
          {phase === 'confirm' && (
            <div className="read-confirm-overlay">
              <div className="read-confirm stagger-in">
                <div className="read-confirm-stamp">
                  <div className="read-stamp-circle">
                    <span>✦</span>
                  </div>
                </div>
                <p className="read-confirm-from">
                  You have a letter from
                </p>
                <h1 className="read-confirm-sender">
                  {letter?.senderName}
                </h1>
                <div className="read-confirm-divider" />
                <p className="read-confirm-warning">
                  Once you open this, it will be sealed forever.
                  <br />No copies. No archives. Just this moment.
                </p>
                <div className="read-confirm-actions">
                  <Button variant="primary" size="lg" onClick={handleOpen}>
                    ✦ Open the Letter
                  </Button>
                  <Button variant="ghost" size="lg" onClick={handleMaybeLater}>
                    Maybe Later
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Phase: Opening animation */}
          {phase === 'opening' && (
            <div className="read-opening">
              <Envelope onComplete={() => {}} />
              <p className="read-opening-label">Opening your letter…</p>
            </div>
          )}

          {/* Phase: Reading */}
          {phase === 'reading' && letter && (
            <div className="read-reading stagger-in">
              <div className="read-letter-card">
                <div className="read-letter-from">
                  <p className="read-letter-from-label">A letter from</p>
                  <p className="read-letter-from-name">{letter.senderName}</p>
                </div>
                {letter.subject && (
                  <h2 className="read-letter-subject">{letter.subject}</h2>
                )}
                <div className="read-letter-divider" />
                {/* Media attachments */}
                {(letter.photoAttachment?.url || letter.voiceAttachment?.url) && (
                  <div className="read-letter-media">
                    {letter.photoAttachment?.url && (
                      <img src={letter.photoAttachment.url} alt="Letter attachment" className="read-media-photo" />
                    )}
                    {letter.voiceAttachment?.url && (
                      <div className="read-media-voice">
                        <svg viewBox="0 0 20 20" fill="none" width="14" height="14">
                          <rect x="7" y="1" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.4"/>
                          <path d="M4 9a5.5 5.5 0 0111 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                          <path d="M7 15a5.5 5.5 0 006 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                        </svg>
                        Voice recording attached
                      </div>
                    )}
                  </div>
                )}
                <div className="read-letter-body prose-letter">
                  {letter.body?.split('\n').map((line, i) => (
                    <p key={i}>{line || '\u00A0'}</p>
                  ))}
                </div>
              </div>
              <div className="read-done">
                <div className="read-done-icon">✦</div>
                <p className="read-done-text">
                  This letter has been sealed forever.
                </p>
                <button className="read-done-home" onClick={() => navigate('/')}>
                  Return to Tomorrow
                </button>
              </div>
            </div>
          )}

          {/* Phase: Already opened */}
          {phase === 'already' && (
            <div className="read-already stagger-in">
              <div className="read-already-icon">✦</div>
              <h1 className="read-already-title">This letter has been sealed.</h1>
              <p className="read-already-body">
                This letter was opened once, and is now sealed forever.
                There are no copies, no archives. Just this moment that passed.
              </p>
              <a href="/" className="read-already-link">Return to Tomorrow</a>
            </div>
          )}

          {/* Phase: Not available */}
          {phase === 'expired' && (
            <div className="read-expired stagger-in">
              <div className="read-expired-icon">✦</div>
              <h1 className="read-expired-title">This letter isn't available.</h1>
              <p className="read-expired-body">
                This letter may not have been delivered yet, or the claim link has expired.
                Letters are available to claim for 7 days after delivery.
              </p>
              <a href="/" className="read-expired-link">Return to Tomorrow</a>
            </div>
          )}
        </div>
      </main>

      <footer className="read-footer">
        <p>Tomorrow — A message from the past.</p>
      </footer>
    </div>
  );
}
