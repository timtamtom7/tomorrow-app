import { useState, useRef, useEffect, useCallback } from 'react';
import './RichTextEditor.css';

export default function RichTextEditor({
  label,
  placeholder = '',
  value = '',
  onChange,
  error,
  rows = 14,
  id,
}) {
  const editorRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  // Sync external value changes (e.g., template applied)
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  function handleInput() {
    const html = editorRef.current?.innerHTML || '';
    const text = editorRef.current?.innerText || '';
    // Strip simple HTML tags for the "body" plain text used in validation
    const plain = text.trim();
    onChange?.({ html, plain });
  }

  function execFormat(command, value = null) {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    handleInput();
  }

  function handleBold() { execFormat('bold'); }
  function handleItalic() { execFormat('italic'); }
  function handleUnderline() { execFormat('underline'); }

  const isEmpty = !editorRef.current?.innerText?.trim();

  return (
    <div className={`field ${error ? 'field-error' : ''} rich-text-wrapper`}>
      {label && (
        <label className="field-label" htmlFor={inputId}>
          {label}
        </label>
      )}

      <div className={`rich-editor-container ${isFocused ? 'rich-editor-focused' : ''} ${error ? 'rich-editor-error' : ''}`}>
        {/* Toolbar */}
        <div className="rich-editor-toolbar">
          <button
            type="button"
            className="rich-tool-btn"
            onMouseDown={e => { e.preventDefault(); handleBold(); }}
            title="Bold"
            tabIndex={-1}
          >
            <svg viewBox="0 0 20 20" fill="none" width="14" height="14">
              <path d="M5 4h5.5a3.5 3.5 0 010 7H5V4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
              <path d="M5 11h6a3.5 3.5 0 010 7H5v-7z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
            </svg>
            <span className="rich-tool-label">B</span>
          </button>
          <button
            type="button"
            className="rich-tool-btn rich-tool-italic"
            onMouseDown={e => { e.preventDefault(); handleItalic(); }}
            title="Italic"
            tabIndex={-1}
          >
            <span className="rich-tool-label" style={{ fontStyle: 'italic' }}>I</span>
          </button>
          <button
            type="button"
            className="rich-tool-btn rich-tool-underline"
            onMouseDown={e => { e.preventDefault(); handleUnderline(); }}
            title="Underline"
            tabIndex={-1}
          >
            <span className="rich-tool-label" style={{ textDecoration: 'underline' }}>U</span>
          </button>

          <div className="rich-toolbar-divider" />

          <span className="rich-editor-hint-text">
            Select text to format
          </span>
        </div>

        {/* Editable area */}
        <div
          ref={editorRef}
          id={inputId}
          className={`rich-editor-content ${isEmpty ? 'rich-editor-empty' : ''}`}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          data-placeholder={placeholder}
          role="textbox"
          aria-multiline="true"
          aria-label={label || 'Letter body'}
        />
      </div>

      {error && <p className="field-error-msg">{error}</p>}
    </div>
  );
}
