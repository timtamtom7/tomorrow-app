import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createLetter, sealLetter } from '../../lib/firestore';
import { sendLetterEmail } from '../../lib/email';
import Navbar from '../../components/Navbar';
import Button from '../../components/ui/Button';
import Input, { Textarea } from '../../components/ui/Input';
import './Write.css';

const TONES = [
  { value: 'quiet', label: 'Quiet', hint: 'Intimate, reflective, soft' },
  { value: 'urgent', label: 'Urgent', hint: 'Important, pressing, serious' },
  { value: 'playful', label: 'Playful', hint: 'Light, fun, spontaneous' },
  { value: 'somber', label: 'Somber', hint: 'Serious, melancholic, mindful' },
];

const RECIPIENT_TYPES = [
  { value: 'me', label: 'Future Me', icon: '✦' },
  { value: 'other', label: 'Someone Else', icon: '💌' },
];

function getMinDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

export default function Write() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [recipientType, setRecipientType] = useState('me');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [tone, setTone] = useState('quiet');
  const [deliverAt, setDeliverAt] = useState('');
  const [allowReply, setAllowReply] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/auth?redirect=/write');
    }
  }, [user, navigate]);

  function validate() {
    const errs = {};
    if (recipientType === 'other') {
      if (!recipientEmail.trim()) errs.recipientEmail = 'Email address is required.';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) errs.recipientEmail = 'Enter a valid email address.';
    }
    if (!body.trim()) errs.body = 'Your letter can\'t be empty.';
    if (body.trim().length < 10) errs.body = 'Your letter feels a bit short. Say a bit more.';
    if (!deliverAt) errs.deliverAt = 'Pick a delivery date.';
    else if (new Date(deliverAt) <= new Date()) errs.deliverAt = 'Date must be at least tomorrow.';
    return errs;
  }

  async function handleSubmit(e, action) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      const isSealed = action === 'seal';
      const letterData = {
        senderId: user.uid,
        senderName: user.displayName || user.email || 'Someone',
        recipientEmail: recipientType === 'other' ? recipientEmail : null,
        recipientName: recipientType === 'other' ? recipientName : 'Future Me',
        subject: subject.trim(),
        body: body.trim(),
        tone,
        deliverAt,
        status: isSealed ? 'sealed' : 'draft',
      };

      const letterRef = await createLetter(letterData);

      if (isSealed) {
        // Send email immediately for demo (in production this would be scheduled)
        if (recipientType === 'other' && recipientEmail) {
          await sendLetterEmail({
            to: recipientEmail,
            senderName: user.displayName || user.email || 'Someone',
            subject: subject.trim(),
            body: body.trim(),
            letterId: letterRef.id,
          });
        }
        navigate(`/app/letters/${letterRef.id}?sealed=1`);
      } else {
        navigate(`/app/letters/${letterRef.id}`);
      }
    } catch (err) {
      console.error('Failed to save letter:', err);
      setErrors({ form: 'Something went wrong. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="write-page page-enter">
      <Navbar />

      <main className="write-main">
        <div className="write-container">
          <header className="write-header">
            <h1 className="write-title">Write a Letter</h1>
            <p className="write-subtitle">
              Write now. Send later. This letter will arrive exactly once, on the day you choose.
            </p>
          </header>

          <form className="write-form" onSubmit={() => {}} noValidate>
            {/* Recipient */}
            <section className="write-section stagger-in">
              <h2 className="write-section-title">Who is this letter for?</h2>
              <div className="recipient-type-selector">
                {RECIPIENT_TYPES.map(rt => (
                  <button
                    key={rt.value}
                    type="button"
                    className={`recipient-type-btn ${recipientType === rt.value ? 'recipient-type-btn-active' : ''}`}
                    onClick={() => setRecipientType(rt.value)}
                  >
                    <span className="recipient-type-icon">{rt.icon}</span>
                    <span className="recipient-type-label">{rt.label}</span>
                  </button>
                ))}
              </div>

              {recipientType === 'other' && (
                <div className="recipient-other-fields stagger-in">
                  <Input
                    label="Recipient's email"
                    type="email"
                    placeholder="them@example.com"
                    value={recipientEmail}
                    onChange={e => setRecipientEmail(e.target.value)}
                    error={errors.recipientEmail}
                  />
                  <Input
                    label="Recipient's name (optional)"
                    placeholder="Sofia, Mom, Future Child…"
                    value={recipientName}
                    onChange={e => setRecipientName(e.target.value)}
                    hint="Shows as 'A letter from [name]' in the email"
                  />
                </div>
              )}

              {recipientType === 'me' && (
                <p className="write-hint">
                  This letter will arrive in your own Tomorrow inbox on the delivery date.
                </p>
              )}
            </section>

            {/* Subject */}
            <section className="write-section stagger-in">
              <Input
                label="Subject line (optional)"
                placeholder="A note for when things change…"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                hint="Optional. The recipient will see this before opening."
              />
            </section>

            {/* Body */}
            <section className="write-section write-textarea-section stagger-in">
              <Textarea
                label="Your letter"
                placeholder="Dear Future Me,&#10;&#10;Right now, I'm…&#10;&#10;I hope that when you read this…"
                value={body}
                onChange={e => setBody(e.target.value)}
                rows={12}
                error={errors.body}
              />
              <p className="write-body-hint">
                Write freely. This is between you and the future.
              </p>
            </section>

            {/* Tone */}
            <section className="write-section stagger-in">
              <h2 className="write-section-title">How should this feel? <span className="write-optional">(optional)</span></h2>
              <div className="tone-selector">
                {TONES.map(t => (
                  <button
                    key={t.value}
                    type="button"
                    className={`tone-btn ${tone === t.value ? 'tone-btn-active' : ''}`}
                    onClick={() => setTone(t.value)}
                  >
                    <span className="tone-btn-label">{t.label}</span>
                    <span className="tone-btn-hint">{t.hint}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Delivery date */}
            <section className="write-section stagger-in">
              <h2 className="write-section-title">When should this arrive?</h2>
              <Input
                type="date"
                label="Delivery date"
                value={deliverAt}
                onChange={e => setDeliverAt(e.target.value)}
                min={getMinDate()}
                error={errors.deliverAt}
              />
              {deliverAt && (
                <p className="write-date-hint">
                  Your letter will be delivered on{' '}
                  <strong>{new Date(deliverAt + 'T09:00:00').toLocaleDateString('en-US', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                  })}.
                  </strong>{' '}
                  Plan accordingly.
                </p>
              )}
            </section>

            {/* Allow reply (for other recipients) */}
            {recipientType === 'other' && (
              <section className="write-section">
                <div className="reply-toggle">
                  <div>
                    <p className="reply-toggle-label">Allow the recipient to reply?</p>
                    <p className="reply-toggle-hint">If enabled, they can send a reply back to your email.</p>
                  </div>
                  <button
                    type="button"
                    className={`toggle ${allowReply ? 'toggle-on' : ''}`}
                    onClick={() => setAllowReply(!allowReply)}
                    role="switch"
                    aria-checked={allowReply}
                  >
                    <span className="toggle-thumb" />
                  </button>
                </div>
              </section>
            )}

            {errors.form && (
              <p className="write-form-error">{errors.form}</p>
            )}

            {/* Actions */}
            <div className="write-actions">
              <Button
                variant="secondary"
                size="lg"
                loading={submitting}
                onClick={e => handleSubmit(e, 'draft')}
              >
                Save as Draft
              </Button>
              <Button
                variant="primary"
                size="lg"
                loading={submitting}
                onClick={e => handleSubmit(e, 'seal')}
              >
                ✦ Seal & Schedule
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
