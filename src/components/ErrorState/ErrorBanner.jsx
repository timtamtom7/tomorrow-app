import './ErrorBanner.css';

export default function ErrorBanner({ title, body, onRetry, onDismiss }) {
  return (
    <div className="error-banner">
      <div className="error-banner-icon-wrap">
        <svg className="error-banner-icon" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="11" fill="var(--color-error-subtle)" stroke="var(--color-error)" strokeWidth="1.2"/>
          <path d="M12 7v6" stroke="var(--color-error)" strokeWidth="1.8" strokeLinecap="round"/>
          <circle cx="12" cy="16" r="1.2" fill="var(--color-error)"/>
        </svg>
      </div>
      <div className="error-banner-content">
        <p className="error-banner-title">{title || 'Something went wrong'}</p>
        {body && <p className="error-banner-body">{body}</p>}
      </div>
      <div className="error-banner-actions">
        {onRetry && (
          <button className="error-banner-retry" onClick={onRetry}>
            Try again
          </button>
        )}
        {onDismiss && (
          <button className="error-banner-dismiss" onClick={onDismiss} aria-label="Dismiss">
            ×
          </button>
        )}
      </div>
    </div>
  );
}

export function SuccessBanner({ title, body, onDismiss }) {
  return (
    <div className="success-banner">
      <div className="error-banner-icon-wrap">
        <svg className="error-banner-icon" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="11" fill="var(--color-success-subtle)" stroke="var(--color-success)" strokeWidth="1.2"/>
          <path d="M7 12l3.5 3.5L17 9" stroke="var(--color-success)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className="error-banner-content">
        <p className="error-banner-title">{title}</p>
        {body && <p className="error-banner-body">{body}</p>}
      </div>
      {onDismiss && (
        <button className="error-banner-dismiss" onClick={onDismiss} aria-label="Dismiss">
          ×
        </button>
      )}
    </div>
  );
}
