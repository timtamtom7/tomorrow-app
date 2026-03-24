import './Input.css';

export default function Input({
  label,
  error,
  hint,
  className = '',
  id,
  ...props
}) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={`field ${error ? 'field-error' : ''} ${className}`}>
      {label && (
        <label className="field-label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <input id={inputId} className="field-input" {...props} />
      {error && <p className="field-error-msg">{error}</p>}
      {hint && !error && <p className="field-hint">{hint}</p>}
    </div>
  );
}

export function Textarea({
  label,
  error,
  hint,
  className = '',
  id,
  rows = 8,
  ...props
}) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={`field ${error ? 'field-error' : ''} ${className}`}>
      {label && (
        <label className="field-label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className="field-input field-textarea"
        rows={rows}
        {...props}
      />
      {error && <p className="field-error-msg">{error}</p>}
      {hint && !error && <p className="field-hint">{hint}</p>}
    </div>
  );
}
