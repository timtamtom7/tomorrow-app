import { LETTER_TEMPLATES } from '../../lib/templates';
import './TemplatePicker.css';

export default function TemplatePicker({ onSelect, onClose, currentBody }) {
  return (
    <div className="template-picker-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="template-picker">
        <div className="template-picker-header">
          <div>
            <h2 className="template-picker-title">Choose a Letter Template</h2>
            <p className="template-picker-subtitle">
              Pick a starting point to help you write — or start from scratch.
            </p>
          </div>
          <button className="template-picker-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="template-picker-grid">
          {/* Blank option */}
          <button
            className="template-card template-card-blank"
            onClick={() => onSelect(null)}
          >
            <div className="template-card-icon-wrap template-card-icon-blank">
              <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="template-card-title">Start from scratch</p>
            <p className="template-card-desc">Write freely, your own way</p>
          </button>

          {LETTER_TEMPLATES.map(tpl => (
            <button
              key={tpl.id}
              className="template-card"
              onClick={() => onSelect(tpl)}
            >
              <div className="template-card-icon-wrap">
                <span className="template-card-icon">{tpl.icon}</span>
              </div>
              <p className="template-card-title">{tpl.title}</p>
              <p className="template-card-desc">{tpl.description}</p>
              <div className="template-card-prompts">
                {tpl.prompts.slice(0, 1).map((p, i) => (
                  <p key={i} className="template-card-prompt">"{p}"</p>
                ))}
              </div>
            </button>
          ))}
        </div>

        <div className="template-picker-footer">
          <p className="template-picker-footer-hint">
            Templates provide a starting point — your letter is always entirely yours.
          </p>
        </div>
      </div>
    </div>
  );
}
