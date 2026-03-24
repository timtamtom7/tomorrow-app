import './RecipientCard.css';

const RELATIONSHIP_ICONS = {
  child: '👶',
  partner: '💌',
  parent: '🌳',
  sibling: '👯',
  friend: '🤝',
  other: '💌',
};

function getRelationshipLabel(rel) {
  const labels = {
    child: 'Child',
    partner: 'Partner',
    parent: 'Parent',
    sibling: 'Sibling',
    friend: 'Friend',
    other: 'Recipient',
  };
  return labels[rel] || rel || 'Recipient';
}

export default function RecipientCard({ recipient, onEdit, compact = false }) {
  const icon = RELATIONSHIP_ICONS[recipient.relationship] || RELATIONSHIP_ICONS.other;

  if (compact) {
    return (
      <button className="recipient-card-compact" onClick={() => onEdit?.(recipient)}>
        <span className="recipient-card-compact-icon">{icon}</span>
        <span className="recipient-card-compact-name">{recipient.name}</span>
        <span className="recipient-card-compact-rel">{getRelationshipLabel(recipient.relationship)}</span>
      </button>
    );
  }

  return (
    <div className="recipient-card">
      <div className="recipient-card-avatar">
        <span className="recipient-card-avatar-icon">{icon}</span>
      </div>
      <div className="recipient-card-info">
        <p className="recipient-card-name">{recipient.name}</p>
        <p className="recipient-card-meta">
          {getRelationshipLabel(recipient.relationship)}
          {recipient.email && (
            <>
              <span className="recipient-card-dot">·</span>
              {recipient.email}
            </>
          )}
        </p>
      </div>
      {onEdit && (
        <button
          className="recipient-card-edit-btn"
          onClick={() => onEdit(recipient)}
          aria-label={`Edit ${recipient.name}`}
        >
          Edit
        </button>
      )}
    </div>
  );
}
