import { useState, useEffect } from 'react';
import { createRecipient, updateRecipient, deleteRecipient } from '../../lib/recipients';
import { getLettersToRecipient } from '../../lib/firestore';
import Button from '../ui/Button';
import Input from '../ui/Input';
import './RecipientModal.css';

const RELATIONSHIP_OPTIONS = [
  { value: 'child', label: 'Child' },
  { value: 'partner', label: 'Partner / Spouse' },
  { value: 'parent', label: 'Parent' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'friend', label: 'Friend' },
  { value: 'other', label: 'Other' },
];

const STATUS_LABELS = {
  sealed: 'Scheduled',
  delivered: 'Delivered',
  opened: 'Opened',
};

function formatDate(date) {
  if (!date) return '';
  const d = date.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function RecipientModal({ user, recipient, onClose, onSaved, onDeleted }) {
  const isEditing = !!recipient;
  const [name, setName] = useState(recipient?.name || '');
  const [relationship, setRelationship] = useState(recipient?.relationship || '');
  const [email, setEmail] = useState(recipient?.email || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [letterHistory, setLetterHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Fetch letter history when editing an existing recipient with an email
  useEffect(() => {
    if (!isEditing || !recipient?.email) return;
    setHistoryLoading(true);
    getLettersToRecipient(user.uid, recipient.email)
      .then(letters => {
        setLetterHistory(letters || []);
        setHistoryLoading(false);
      })
      .catch(() => {
        setLetterHistory([]);
        setHistoryLoading(false);
      });
  }, [isEditing, recipient?.email, user?.uid]);

  async function handleSave(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a name for your recipient.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      if (isEditing) {
        await updateRecipient(recipient.id, {
          name: name.trim(),
          relationship,
          email: email.trim(),
        });
      } else {
        await createRecipient({
          userId: user.uid,
          name: name.trim(),
          relationship,
          email: email.trim(),
        });
      }
      onSaved?.();
      onClose();
    } catch (err) {
      console.error('Failed to save recipient:', err);
      setError('Failed to save recipient. Check your Firebase connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    setLoading(true);
    try {
      await deleteRecipient(recipient.id);
      onDeleted?.();
      onClose();
    } catch (err) {
      console.error('Failed to delete recipient:', err);
      setError('Failed to delete recipient. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="recipient-modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="recipient-modal">
        <div className="recipient-modal-header">
          <h2 className="recipient-modal-title">
            {isEditing ? 'Edit Recipient' : 'Add a Recipient'}
          </h2>
          <button className="recipient-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <form className="recipient-modal-form" onSubmit={handleSave}>
          <Input
            label="Recipient name"
            placeholder="Sofia, Mom, Future Child…"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
          />

          <div className="field">
            <label className="field-label">Relationship</label>
            <div className="relationship-picker">
              {RELATIONSHIP_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  className={`relationship-chip ${relationship === opt.value ? 'relationship-chip-active' : ''}`}
                  onClick={() => setRelationship(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Email address (optional)"
            type="email"
            placeholder="them@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            hint="Letters will be sent here on the delivery date."
          />

          {error && (
            <div className="recipient-modal-error">
              <span className="recipient-modal-error-icon">!</span>
              <div>
                <p className="recipient-modal-error-title">Recipient creation failed</p>
                <p className="recipient-modal-error-body">{error}</p>
              </div>
            </div>
          )}

          {/* Letter history — shown when editing a recipient with email */}
          {isEditing && recipient?.email && (
            <div className="recipient-history">
              <h4 className="recipient-history-title">
                Letters sent to {recipient.name}
              </h4>
              {historyLoading ? (
                <p className="recipient-history-empty">Loading…</p>
              ) : letterHistory.length === 0 ? (
                <p className="recipient-history-empty">
                  No letters sent yet. Write one from the{' '}
                  <a href="/write" className="recipient-history-link">letter editor</a>.
                </p>
              ) : (
                <div className="recipient-history-list">
                  {letterHistory.map(letter => (
                    <div key={letter.id} className="recipient-history-item">
                      <div className="recipient-history-item-icon">
                        {letter.status === 'opened' ? '✦' : letter.status === 'delivered' ? '✓' : '◷'}
                      </div>
                      <div className="recipient-history-item-info">
                        <p className="recipient-history-item-subject">
                          {letter.subject || 'No subject'}
                        </p>
                        <p className="recipient-history-item-date">
                          {letter.deliverAt ? `Delivers ${formatDate(letter.deliverAt)}` : ''}
                          {letter.sentAt ? ` · ${STATUS_LABELS[letter.status] || letter.status}` : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="recipient-modal-actions">
            {isEditing && (
              <button
                type="button"
                className={`recipient-delete-btn ${deleteConfirm ? 'recipient-delete-btn-confirm' : ''}`}
                onClick={handleDelete}
                disabled={loading}
              >
                {deleteConfirm ? 'Click again to confirm delete' : 'Delete recipient'}
              </button>
            )}
            <div className="recipient-modal-actions-right">
              <Button variant="secondary" size="sm" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" loading={loading}>
                {isEditing ? 'Save changes' : 'Add recipient'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
