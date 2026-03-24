import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createLetter, sealLetter, updateLetter } from '../../lib/firestore';
import { subscribeToUserRecipients } from '../../lib/recipients';
import { sendLetterEmail } from '../../lib/email';
import { getTemplateById } from '../../lib/templates';
import Navbar from '../../components/Navbar';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import RichTextEditor from '../../components/ui/RichTextEditor';
import RecipientCard from '../../components/Recipient/RecipientCard';
import RecipientModal from '../../components/Recipient/RecipientModal';
import TemplatePicker from '../../components/Template/TemplatePicker';
import MediaAttachments from '../../components/Media/MediaAttachments';
import ErrorBanner from '../../components/ErrorState/ErrorBanner';
import './Write.css';

const TONES = [
  { value: 'quiet', label: 'Quiet', hint: 'Intimate, reflective, soft' },
  { value: 'urgent', label: 'Urgent', hint: 'Important, pressing, serious' },
  { value: 'playful', label: 'Playful', hint: 'Light, fun, spontaneous' },
  { value: 'somber', label: 'Somber', hint: 'Serious, melancholic, mindful' },
];

const RECIPIENT_TYPES = [
  { value: 'me', label: 'Future Me', icon: '✦' },
  { value: 'saved', label: 'Saved Recipient', icon: '💌' },
  { value: 'other', label: 'New Recipient', icon: '📝' },
];

function getMinDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function getSubscription() {
  try {
    return JSON.parse(localStorage.getItem('tomorrow-subscription') || '{"plan":"free"}');
  } catch {
    return { plan: 'free' };
  }
}

function getActiveLettersCount() {
  try {
    return parseInt(localStorage.getItem('tomorrow-active-count') || '0', 10);
  } catch {
    return 0;
  }
}

function setActiveLettersCount(n) {
  localStorage.setItem('tomorrow-active-count', String(n));
}

function fillTemplatePlaceholder(template) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.toLocaleDateString('en-US', { month: 'long' });
  const day = now.getDate();
  const today = `${month} ${day}, ${year}`;
  return template.placeholder.replace('{date}', today);
}

export default function Write() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [recipientType, setRecipientType] = useState('me');
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientRelationship, setRecipientRelationship] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState({ plain: '', html: '' });
  const [tone, setTone] = useState('quiet');
  const [deliverAt, setDeliverAt] = useState('');
  const [allowReply, setAllowReply] = useState(false);

  // Media
  const [photoAttachment, setPhotoAttachment] = useState(null);
  const [voiceAttachment, setVoiceAttachment] = useState(null);

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [subscription] = useState(getSubscription);
  const [showPastDateError, setShowPastDateError] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showRecipientModal, setShowRecipientModal] = useState(false);
  const [editingRecipient, setEditingRecipient] = useState(null);
  const [savedRecipients, setSavedRecipients] = useState([]);
  const [saveError, setSaveError] = useState('');
  const [autoSaveStatus, setAutoSaveStatus] = useState('idle'); // idle | saving | saved | error
  const [draftLetterId, setDraftLetterId] = useState(null);

  // Refs
  const autoSaveTimer = useRef(null);
  const hasLoadedInitial = useRef(false);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/auth?redirect=/write');
    }
  }, [user, navigate]);

  // Subscribe to saved recipients
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToUserRecipients(user.uid, setSavedRecipients);
    return unsub;
  }, [user]);

  // Apply template to body
  function applyTemplate(template) {
    const filled = fillTemplatePlaceholder(template);
    // Convert plain text newlines to HTML <br> tags for the rich text editor
    const html = filled.replace(/\n/g, '<br>');
    setBody({ plain: filled, html });
    if (template.recipientType === 'me') {
      setRecipientType('me');
    } else if (template.recipientType === 'other' && template.relationship) {
      setRecipientType('other');
      setRecipientRelationship(template.relationship);
    }
    setShowTemplatePicker(false);
  }

  // Auto-save draft
  const saveDraft = useCallback(async (data) => {
    if (!user || !body.plain.trim()) return;
    setAutoSaveStatus('saving');
    try {
      if (draftLetterId) {
        await updateLetter(draftLetterId, { ...data, status: 'draft' });
      } else {
        const ref = await createLetter({ ...data, senderId: user.uid, senderName: user.displayName || user.email || 'Someone', status: 'draft' });
        setDraftLetterId(ref.id);
      }
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
    } catch {
      setAutoSaveStatus('error');
    }
  }, [user, draftLetterId, body]);

  // Debounced auto-save on body/recipient changes
  useEffect(() => {
    if (!user || !body.plain.trim() || hasLoadedInitial.current === false) return;
    clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      const data = buildLetterData();
      saveDraft(data);
    }, 2000);
    return () => clearTimeout(autoSaveTimer.current);
  }, [body, recipientEmail, recipientName, subject, tone, deliverAt, recipientRelationship]);

  function buildLetterData() {
    const recipientEmailVal = recipientType === 'saved' && selectedRecipient
      ? selectedRecipient.email
      : recipientType === 'other' ? recipientEmail : null;
    const recipientNameVal = recipientType === 'saved' && selectedRecipient
      ? selectedRecipient.name
      : recipientType === 'other' ? recipientName
      : recipientType === 'me' ? 'Future Me' : 'Someone';

    return {
      recipientEmail: recipientEmailVal || null,
      recipientName: recipientNameVal,
      recipientRelationship: recipientRelationship || null,
      subject: subject.trim(),
      body: body.plain.trim(),
      bodyHtml: body.html || null,
      tone,
      deliverAt: deliverAt || null,
      photoAttachment: photoAttachment || null,
      voiceAttachment: voiceAttachment || null,
      allowReply,
    };
  }

  function handleDeliverAtChange(e) {
    const val = e.target.value;
    setDeliverAt(val);
    if (val && new Date(val) <= new Date()) {
      setShowPastDateError(true);
    } else {
      setShowPastDateError(false);
      setErrors(prev => {
        const next = { ...prev };
        delete next.deliverAt;
        return next;
      });
    }
    hasLoadedInitial.current = true;
  }

  function validate(allowCountCheck = true) {
    const errs = {};

    if (recipientType === 'saved' && !selectedRecipient) {
      errs.recipient = 'Please select a recipient from your saved list.';
    }
    if (recipientType === 'other') {
      if (!recipientEmail.trim()) errs.recipientEmail = 'Email address is required.';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) errs.recipientEmail = 'Enter a valid email address.';
    }
    if (!body.plain.trim()) errs.body = 'Your letter can\'t be empty.';
    else if (body.plain.trim().length < 10) errs.body = 'Your letter feels a bit short. Say a bit more.';
    if (!deliverAt) errs.deliverAt = 'Pick a delivery date.';
    if (deliverAt && new Date(deliverAt) <= new Date()) errs.deliverAt = 'Choose a date in the future.';
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
    setSaveError('');
    setSubmitting(true);

    try {
      const isSealed = action === 'seal';
      const data = buildLetterData();
      const letterData = {
        senderId: user.uid,
        senderName: user.displayName || user.email || 'Someone',
        ...data,
        status: isSealed ? 'sealed' : 'draft',
      };

      let letterRef;
      if (draftLetterId) {
        // Update existing draft
        await updateLetter(draftLetterId, { ...letterData });
        letterRef = { id: draftLetterId };
      } else {
        letterRef = await createLetter(letterData);
      }

      if (isSealed) {
        if (subscription.plan === 'free') {
          setActiveLettersCount(getActiveLettersCount() + 1);
        }
        const recipientEmailVal = data.recipientEmail;
        if (recipientType !== 'me' && recipientEmailVal) {
          await sendLetterEmail({
            to: recipientEmailVal,
            senderName: user.displayName || user.email || 'Someone',
            subject: data.subject,
            body: data.body,
            bodyHtml: data.bodyHtml || null,
            letterId: letterRef.id,
          });
        }
        navigate(`/app/letters/${letterRef.id}?sealed=1`);
      } else {
        navigate(`/app/letters/${letterRef.id}`);
      }
    } catch (err) {
      console.error('Failed to save letter:', err);
      setSaveError('Failed to save your letter. Check that Firebase is configured, or try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleRecipientSelect(recipient) {
    setSelectedRecipient(recipient);
    setRecipientType('saved');
    setRecipientEmail(recipient.email || '');
    setRecipientName(recipient.name || '');
    setRecipientRelationship(recipient.relationship || '');
  }

  function handleRecipientModalSaved() {
    // Recipients list will update via subscription
  }

  return (
    <div className="write-page page-enter">
      <Navbar />

      <main className="write-main">
        <div className="write-container">
          <header className="write-header">
            <div className="write-header-row">
              <div>
                <h1 className="write-title">Write a Letter</h1>
                <p className="write-subtitle">
                  Write now. Send later. This letter will arrive exactly once, on the day you choose.
                </p>
              </div>
              {autoSaveStatus !== 'idle' && (
                <div className={`autosave-indicator autosave-${autoSaveStatus}`}>
                  {autoSaveStatus === 'saving' && (
                    <span className="autosave-dot" />
                  )}
                  {autoSaveStatus === 'saved' && <span className="autosave-text">Draft saved</span>}
                  {autoSaveStatus === 'error' && <span className="autosave-text autosave-error">Save failed</span>}
                </div>
              )}
            </div>

            {/* Template quick-pick */}
            {!body.plain && (
              <button
                className="write-template-prompt-btn"
                onClick={() => setShowTemplatePicker(true)}
              >
                <svg viewBox="0 0 20 20" fill="none" width="14" height="14">
                  <path d="M3 5h14M3 10h10M3 15h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
                Start with a template?
              </button>
            )}
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
                    onClick={() => {
                      setRecipientType(rt.value);
                      if (rt.value !== 'saved') setSelectedRecipient(null);
                      hasLoadedInitial.current = true;
                    }}
                  >
                    <span className="recipient-type-icon">{rt.icon}</span>
                    <span className="recipient-type-label">{rt.label}</span>
                  </button>
                ))}
              </div>

              {/* Saved recipients */}
              {recipientType === 'saved' && (
                <div className="recipient-saved-section stagger-in">
                  {savedRecipients.length > 0 ? (
                    <div className="recipient-saved-list">
                      {savedRecipients.map(r => (
                        <RecipientCard
                          key={r.id}
                          recipient={r}
                          compact
                          onEdit={() => {
                            setEditingRecipient(r);
                            setShowRecipientModal(true);
                          }}
                        />
                      ))}
                      <button
                        type="button"
                        className="recipient-saved-add"
                        onClick={() => {
                          setEditingRecipient(null);
                          setShowRecipientModal(true);
                        }}
                      >
                        <span>+</span> Add new recipient
                      </button>
                    </div>
                  ) : (
                    <div className="recipient-saved-empty">
                      <p className="recipient-saved-empty-text">No saved recipients yet.</p>
                      <button
                        type="button"
                        className="recipient-saved-add"
                        onClick={() => {
                          setEditingRecipient(null);
                          setShowRecipientModal(true);
                        }}
                      >
                        <span>+</span> Add your first recipient
                      </button>
                    </div>
                  )}
                  {savedRecipients.map(r => (
                    <button
                      key={r.id}
                      type="button"
                      className={`recipient-saved-chip ${selectedRecipient?.id === r.id ? 'recipient-saved-chip-active' : ''}`}
                      onClick={() => handleRecipientSelect(r)}
                    >
                      <span className="recipient-saved-chip-icon">💌</span>
                      {r.name}
                    </button>
                  ))}
                </div>
              )}

              {/* New recipient fields */}
              {recipientType === 'other' && (
                <div className="recipient-other-fields stagger-in">
                  <Input
                    label="Recipient's name"
                    placeholder="Sofia, Mom, Future Child…"
                    value={recipientName}
                    onChange={e => { setRecipientName(e.target.value); hasLoadedInitial.current = true; }}
                  />
                  <Input
                    label="Recipient's email"
                    type="email"
                    placeholder="them@example.com"
                    value={recipientEmail}
                    onChange={e => { setRecipientEmail(e.target.value); hasLoadedInitial.current = true; }}
                    error={errors.recipientEmail}
                    hint="The letter notification will be sent here."
                  />
                  <div className="field">
                    <label className="field-label">Relationship</label>
                    <div className="relationship-picker">
                      {['Child', 'Partner', 'Parent', 'Sibling', 'Friend', 'Other'].map(rel => (
                        <button
                          key={rel}
                          type="button"
                          className={`relationship-chip ${recipientRelationship === rel.toLowerCase() ? 'relationship-chip-active' : ''}`}
                          onClick={() => { setRecipientRelationship(rel.toLowerCase()); hasLoadedInitial.current = true; }}
                        >
                          {rel}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {recipientType === 'me' && (
                <p className="write-hint">
                  This letter will arrive in your own Tomorrow inbox on the delivery date.
                </p>
              )}

              {errors.recipient && (
                <p className="field-error-msg">{errors.recipient}</p>
              )}
            </section>

            {/* Subject */}
            <section className="write-section stagger-in">
              <Input
                label="Subject line (optional)"
                placeholder="A note for when things change…"
                value={subject}
                onChange={e => { setSubject(e.target.value); hasLoadedInitial.current = true; }}
                hint="Optional. The recipient will see this before opening."
              />
            </section>

            {/* Body */}
            <section className="write-section write-textarea-section stagger-in">
              <RichTextEditor
                label="Your letter"
                placeholder={"Dear Future Me,\n\nRight now, I'm…\n\nI hope that when you read this…"}
                value={body.html}
                onChange={({ html, plain }) => {
                  setBody({ html, plain });
                  hasLoadedInitial.current = true;
                }}
                error={errors.body}
              />
              {!body.plain && (
                <div className="write-body-hint-row">
                  <button
                    type="button"
                    className="write-template-fab-inline"
                    onClick={() => setShowTemplatePicker(true)}
                  >
                    <svg viewBox="0 0 20 20" fill="none" width="12" height="12">
                      <path d="M3 5h14M3 10h10M3 15h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                    </svg>
                    Start with a template?
                  </button>
                </div>
              )}
              <p className="write-body-hint">
                Write freely. Select text to add <strong>bold</strong>, <em>italic</em>, or <u>underline</u>.
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

            {/* Media attachments (Keeper+) */}
            <section className="write-section stagger-in">
              <MediaAttachments
                subscription={subscription}
                onPhotoChange={setPhotoAttachment}
                onVoiceChange={setVoiceAttachment}
                photoUrls={photoAttachment}
                voiceUrl={voiceAttachment}
              />
            </section>

            {/* Delivery date */}
            <section className="write-section stagger-in">
              <h2 className="write-section-title">When should this arrive?</h2>
              <Input
                type="date"
                label="Delivery date"
                value={deliverAt}
                onChange={handleDeliverAtChange}
                min={getMinDate()}
                error={errors.deliverAt || (showPastDateError ? 'Choose a date in the future.' : undefined)}
              />
              {deliverAt && !showPastDateError && (
                <p className="write-date-hint">
                  Your letter will be delivered on{' '}
                  <strong>{new Date(deliverAt + 'T09:00:00').toLocaleDateString('en-US', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                  })}.
                  </strong>{' '}
                  Plan accordingly.
                </p>
              )}
              {deliverAt && !showPastDateError && (
                <div className="write-timeframe-chips">
                  {[
                    { label: '6 months', days: 183 },
                    { label: '1 year', days: 365 },
                    { label: '5 years', days: 1825 },
                  ].map(tf => {
                    const d = new Date();
                    d.setDate(d.getDate() + tf.days);
                    const dateStr = d.toISOString().split('T')[0];
                    return (
                      <button
                        key={tf.label}
                        type="button"
                        className={`timeframe-chip ${deliverAt === dateStr ? 'timeframe-chip-active' : ''}`}
                        onClick={() => {
                          setDeliverAt(dateStr);
                          setShowPastDateError(false);
                          setErrors(prev => {
                            const next = { ...prev };
                            delete next.deliverAt;
                            return next;
                          });
                          hasLoadedInitial.current = true;
                        }}
                      >
                        {tf.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Allow reply (for other recipients) */}
            {recipientType !== 'me' && (
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

            {/* Form-level save error */}
            {saveError && (
              <ErrorBanner
                title="Letter save failed"
                body={saveError}
                onDismiss={() => setSaveError('')}
              />
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

      {/* Template picker modal */}
      {showTemplatePicker && (
        <TemplatePicker
          onSelect={template => {
            if (template) applyTemplate(template);
            else setShowTemplatePicker(false);
          }}
          onClose={() => setShowTemplatePicker(false)}
        />
      )}

      {/* Recipient modal */}
      {showRecipientModal && user && (
        <RecipientModal
          user={user}
          recipient={editingRecipient}
          onClose={() => {
            setShowRecipientModal(false);
            setEditingRecipient(null);
          }}
          onSaved={handleRecipientModalSaved}
          onDeleted={handleRecipientModalSaved}
        />
      )}
    </div>
  );
}
