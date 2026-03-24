import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { subscribeToUserRecipients } from '../../lib/recipients';
import Navbar from '../../components/Navbar';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import RecipientCard from '../../components/Recipient/RecipientCard';
import RecipientModal from '../../components/Recipient/RecipientModal';
import './Recipients.css';

export default function Recipients() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecipient, setEditingRecipient] = useState(null);

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    const unsub = subscribeToUserRecipients(user.uid, fetched => {
      setRecipients(fetched);
      setLoading(false);
    });
    return unsub;
  }, [user, navigate]);

  function handleEdit(recipient) {
    setEditingRecipient(recipient);
    setShowModal(true);
  }

  function handleAdd() {
    setEditingRecipient(null);
    setShowModal(true);
  }

  function handleModalSaved() {
    // Recipients list will update via subscription
  }

  const RELATIONSHIP_COUNTS = recipients.reduce((acc, r) => {
    const rel = r.relationship || 'other';
    acc[rel] = (acc[rel] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="recipients-page page-enter">
      <Navbar />
      <main className="recipients-main">
        <div className="recipients-container">
          <header className="recipients-header">
            <div className="recipients-header-left">
              <Link to="/app" className="back-link">← Back to Letters</Link>
              <h1 className="recipients-title">Recipients</h1>
              <p className="recipients-subtitle">
                People you write letters to. Save their profiles to reuse them across letters.
              </p>
            </div>
            <Button variant="primary" onClick={handleAdd}>
              ✦ Add Recipient
            </Button>
          </header>

          {loading ? (
            <div className="recipients-loading">
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton" style={{ height: 72, borderRadius: 12 }} />
              ))}
            </div>
          ) : recipients.length === 0 ? (
            <div className="recipients-empty">
              <svg className="recipients-empty-illustration" viewBox="0 0 120 120" fill="none">
                <circle cx="60" cy="60" r="50" fill="var(--surface-elevated)" stroke="var(--border)" strokeWidth="1.5"/>
                <circle cx="60" cy="48" r="16" fill="var(--color-recipient-subtle)" stroke="var(--color-recipient)" strokeWidth="1.2"/>
                <path d="M34 82c0-14.4 11.6-26 26-26s26 11.6 26 26" stroke="var(--color-recipient)" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              <h2 className="recipients-empty-title">No recipients yet</h2>
              <p className="recipients-empty-body">
                Add the people you write letters to. Save their name and email so you don't have to type it every time.
              </p>
              <Button variant="primary" onClick={handleAdd}>
                ✦ Add Your First Recipient
              </Button>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="recipients-summary stagger-in">
                <Card className="recipients-summary-card">
                  <p className="recipients-summary-num">{recipients.length}</p>
                  <p className="recipients-summary-label">
                    {recipients.length === 1 ? 'Recipient' : 'Recipients'} saved
                  </p>
                </Card>
                {Object.entries(RELATIONSHIP_COUNTS).map(([rel, count]) => (
                  <Card key={rel} className="recipients-summary-card">
                    <p className="recipients-summary-num">{count}</p>
                    <p className="recipients-summary-label" style={{ textTransform: 'capitalize' }}>
                      {rel}
                      {count !== 1 ? 's' : ''}
                    </p>
                  </Card>
                ))}
              </div>

              {/* Recipient list */}
              <div className="recipients-list stagger-in">
                {recipients.map(recipient => (
                  <RecipientCard
                    key={recipient.id}
                    recipient={recipient}
                    onEdit={handleEdit}
                  />
                ))}
              </div>

              <div className="recipients-list-footer">
                <Button variant="secondary" onClick={handleAdd}>
                  ✦ Add Another Recipient
                </Button>
              </div>
            </>
          )}
        </div>
      </main>

      {showModal && user && (
        <RecipientModal
          user={user}
          recipient={editingRecipient}
          onClose={() => {
            setShowModal(false);
            setEditingRecipient(null);
          }}
          onSaved={handleModalSaved}
          onDeleted={handleModalSaved}
        />
      )}
    </div>
  );
}
