import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { subscribeToLetter, updateLetter, sealLetter as apiSealLetter, cancelLetter } from '../../lib/firestore';
import { sendLetterEmail } from '../../lib/email';
import Navbar from '../../components/Navbar';
import Button from '../../components/ui/Button';
import Input, { Textarea } from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import './LetterDetail.css';

const TONES = ['quiet', 'urgent', 'playful', 'somber'];

function timeUntil(dateStr) {
  const now = new Date();
  const target = new Date(dateStr);
  const diff = target - now;
  if (diff <= 0) return 'Arriving soon';
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days === 1) return 'Arrives tomorrow';
  if (days < 7) return `Arrives in ${days} days`;
  if (days < 30) return `Arrives in ${Math.ceil(days / 7)} weeks`;
  if (days < 365) return `Arrives in ${Math.ceil(days / 30)} months`;
  return `Arrives in ${Math.ceil(days / 365)} years`;
}

function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

export default function LetterDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [letter, setLetter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSealedBanner, setShowSealedBanner] = useState(searchParams.get('sealed') === '1');

  // Edit form state
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [deliverAt, setDeliverAt] = useState('');
  const [tone, setTone] = useState('quiet');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    const unsub = subscribeToLetter(id, fetched => {
      if (!fetched) { navigate('/app'); return; }
      if (fetched.senderId !== user.uid) { navigate('/app'); return; }
      setLetter(fetched);
      setSubject(fetched.subject || '');
      setBody(fetched.body || '');
      setDeliverAt(fetched.deliverAt ? new Date(fetched.deliverAt).toISOString().split('T')[0] : '');
      setTone(fetched.tone || 'quiet');
      setLoading(false);
    });
    return unsub;
  }, [id, user, navigate]);

  async function handleSave() {
    const errs = {};
    if (!body.trim()) errs.body = "Your letter can't be empty.";
    if (body.trim().length < 10) errs.body = "Your letter is too short.";
    if (!deliverAt) errs.deliverAt = 'Pick a delivery date.';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSaving(true);
    try {
      await updateLetter(id, {
        subject: subject.trim(),
        body: body.trim(),
        deliverAt: new Date(deliverAt),
        tone,
      });
      setEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleSeal() {
    if (!window.confirm('Seal this letter? Once sealed, it cannot be edited. It will be delivered on the scheduled date.')) return;
    setSaving(true);
    try {
      await apiSealLetter(id);
      if (letter.recipientEmail) {
        await sendLetterEmail({
          to: letter.recipientEmail,
          senderName: letter.senderName,
          subject: letter.subject,
          body: letter.body,
          letterId: id,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleCancel() {
    if (!window.confirm('Cancel this letter? It will not be delivered.')) return;
    await cancelLetter(id);
  }

  if (loading || !letter) return null;

  const isDraft = letter.status === 'draft';
  const isSealed = letter.status === 'sealed';
  const isDelivered = letter.status === 'delivered';
  const isOpened = letter.status === 'opened';

  return (
    <div className="letter-detail-page page-enter">
      <Navbar />
      <main className="letter-detail-main">
        <div className="letter-detail-container">
          {/* Back link */}
          <Link to="/app" className="back-link">← Back to Your Letters</Link>

          {/* Sealed banner */}
          {showSealedBanner && (
            <div className="sealed-banner">
              <span className="sealed-banner-icon">✦</span>
              <div>
                <p className="sealed-banner-title">Letter sealed and scheduled.</p>
                <p className="sealed-banner-body">
                  {letter.recipientEmail
                    ? `Your letter will be delivered to ${letter.recipientName} on ${formatDate(letter.deliverAt)}.`
                    : `Your letter will arrive in your inbox on ${formatDate(letter.deliverAt)}.`}
                </p>
              </div>
              <button className="sealed-banner-close" onClick={() => setShowSealedBanner(false)}>×</button>
            </div>
          )}

          {/* Status bar */}
          <div className="letter-status-bar">
            <div className="letter-status-info">
              <span className={`status-pill status-${letter.status}`}>
                {isDraft ? 'Draft' : isSealed ? 'Sealed' : isDelivered ? 'Delivered' : isOpened ? 'Opened' : letter.status}
              </span>
              {isSealed && letter.deliverAt && (
                <span className="letter-status-countdown">{timeUntil(letter.deliverAt)}</span>
              )}
            </div>
            <div className="letter-status-actions">
              {isDraft && !editing && (
                <>
                  <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>Edit</Button>
                  <Button variant="primary" size="sm" loading={saving} onClick={handleSeal}>Seal & Send</Button>
                </>
              )}
              {isDraft && editing && (
                <>
                  <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
                  <Button variant="primary" size="sm" loading={saving} onClick={handleSave}>Save Changes</Button>
                </>
              )}
              {isSealed && (
                <Button variant="ghost" size="sm" onClick={handleCancel}>Cancel Delivery</Button>
              )}
            </div>
          </div>

          {/* Letter display */}
          <Card className="letter-detail-card">
            {editing ? (
              <div className="letter-edit-form">
                <Input
                  label="Subject"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="A note for the future…"
                />
                <Textarea
                  label="Letter"
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  rows={10}
                  error={errors.body}
                />
                <div className="letter-edit-meta">
                  <Input
                    type="date"
                    label="Delivery date"
                    value={deliverAt}
                    onChange={e => setDeliverAt(e.target.value)}
                    min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                    error={errors.deliverAt}
                  />
                  <div className="tone-edit">
                    <p className="tone-edit-label">Tone</p>
                    <div className="tone-edit-btns">
                      {TONES.map(t => (
                        <button
                          key={t}
                          className={`tone-edit-btn ${tone === t ? 'tone-edit-btn-active' : ''}`}
                          onClick={() => setTone(t)}
                        >
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="letter-read-view">
                <div className="letter-read-header">
                  <p className="letter-read-recipient">
                    {letter.recipientEmail ? `To ${letter.recipientName}` : 'To Future Me'}
                    {letter.recipientEmail && (
                      <span className="recipient-tag">{letter.recipientEmail}</span>
                    )}
                    {letter.recipientRelationship && (
                      <span className="recipient-relationship-tag">{letter.recipientRelationship}</span>
                    )}
                  </p>
                  {letter.subject && (
                    <h2 className="letter-read-subject">{letter.subject}</h2>
                  )}
                  <div className="letter-read-meta">
                    {letter.tone && (
                      <span className="letter-read-tone">{letter.tone}</span>
                    )}
                    {letter.deliverAt && (
                      <span className="letter-read-date">
                        Delivering {formatDate(letter.deliverAt)}
                      </span>
                    )}
                  </div>
                  {/* Media attachments */}
                  {(letter.photoAttachment?.url || letter.voiceAttachment?.url) && (
                    <div className="letter-read-media">
                      {letter.photoAttachment?.url && (
                        <img src={letter.photoAttachment.url} alt="Letter attachment" className="letter-media-photo" />
                      )}
                      {letter.voiceAttachment?.url && (
                        <div className="letter-media-voice">
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
                </div>
                <div className="letter-read-divider" />
                <div className="letter-read-body prose-letter">
                  {body.split('\n').map((line, i) => (
                    <p key={i}>{line || '\u00A0'}</p>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Claim link (for sealed/delivered letters) */}
          {(isSealed || isDelivered) && (
            <div className="claim-info">
              <p className="claim-info-label">Share this link with the recipient:</p>
              <div className="claim-link-box">
                <code className="claim-link">{window.location.origin}/letter/{id}</code>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
