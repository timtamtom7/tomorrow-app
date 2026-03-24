import { useState, useRef, useCallback } from 'react';
import './MediaAttachments.css';

export default function MediaAttachments({ subscription, onPhotoChange, onVoiceChange, photoUrls, voiceUrl }) {
  const [photoError, setPhotoError] = useState('');
  const [voiceError, setVoiceError] = useState('');
  const [voiceRecording, setVoiceRecording] = useState(false);
  const [voiceDuration, setVoiceDuration] = useState(0);
  const [voiceBlob, setVoiceBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const canUseMedia = subscription.plan === 'keeper' || subscription.plan === 'legacy';

  // --- Photo upload ---
  async function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError('');

    if (!file.type.startsWith('image/')) {
      setPhotoError('Please upload an image file (JPG, PNG, etc.)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setPhotoError('Photo must be smaller than 10 MB');
      return;
    }

    try {
      const url = URL.createObjectURL(file);
      onPhotoChange?.({ file, url, name: file.name });
    } catch (err) {
      setPhotoError('Failed to attach photo. Please try again.');
    }
  }

  // --- Voice recording ---
  const startVoiceRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setVoiceBlob(blob);
        onVoiceChange?.({ file: blob, url, duration: voiceDuration });
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start();
      setVoiceRecording(true);
      setVoiceDuration(0);
      setVoiceError('');

      timerRef.current = setInterval(() => {
        setVoiceDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      setVoiceError('Microphone access denied. Please allow microphone access to record voice messages.');
    }
  }, [voiceDuration, onVoiceChange]);

  const stopVoiceRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    clearInterval(timerRef.current);
    setVoiceRecording(false);
  }, []);

  function formatDuration(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function removePhoto() {
    onPhotoChange?.(null);
    setPhotoError('');
  }

  function removeVoice() {
    setVoiceBlob(null);
    onVoiceChange?.(null);
    setVoiceError('');
    setVoiceDuration(0);
  }

  return (
    <div className="media-attachments">
      <div className="media-attachments-header">
        <h3 className="media-attachments-title">Attachments</h3>
        {!canUseMedia && (
          <span className="pro-badge">Keeper+</span>
        )}
      </div>

      <div className="media-attachments-grid">
        {/* Photo attachment */}
        <div className="media-attachment-item">
          <div className="media-attachment-label">
            <svg className="media-icon" viewBox="0 0 20 20" fill="none">
              <rect x="1" y="3" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="1.4"/>
              <circle cx="7" cy="8" r="1.8" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M1 13l4.5-4 3 3.5L11 9l7 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Photo</span>
          </div>

          {photoUrls?.url ? (
            <div className="media-preview media-preview-photo">
              <img src={photoUrls.url} alt="Letter attachment" className="media-preview-img" />
              <button className="media-preview-remove" onClick={removePhoto} aria-label="Remove photo">
                ×
              </button>
            </div>
          ) : (
            <label className={`media-upload-btn ${!canUseMedia ? 'media-upload-btn-disabled' : ''}`}>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                disabled={!canUseMedia}
                className="media-upload-input"
              />
              <svg className="media-upload-icon" viewBox="0 0 20 20" fill="none" width="20" height="20">
                <path d="M10 13V4M6 8l4-4 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 14v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
              <span className="media-upload-text">Add photo</span>
            </label>
          )}

          {photoError && (
            <p className="media-attachment-error">
              <span className="media-attachment-error-icon">!</span>
              Photo attachment failed: {photoError}
            </p>
          )}
        </div>

        {/* Voice recording */}
        <div className="media-attachment-item">
          <div className="media-attachment-label">
            <svg className="media-icon" viewBox="0 0 20 20" fill="none">
              <rect x="7" y="1" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M4 9a5.5 5.5 0 0111 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              <path d="M7 15a5.5 5.5 0 006 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              <path d="M10 17v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            <span>Voice</span>
          </div>

          {voiceUrl?.url ? (
            <div className="media-preview media-preview-voice">
              <div className="media-voice-play">
                <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
                  <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M8 7l5 3-5 3V7z" fill="currentColor"/>
                </svg>
                <span className="media-voice-duration">{formatDuration(voiceUrl.duration || voiceDuration)}</span>
              </div>
              <button className="media-preview-remove" onClick={removeVoice} aria-label="Remove voice recording">
                ×
              </button>
            </div>
          ) : voiceRecording ? (
            <div className="media-recording">
              <div className="media-recording-indicator">
                <span className="media-recording-dot" />
                <span className="media-recording-time">{formatDuration(voiceDuration)}</span>
              </div>
              <button className="media-recording-stop" onClick={stopVoiceRecording}>
                <svg viewBox="0 0 16 16" fill="none" width="12" height="12">
                  <rect x="2" y="2" width="12" height="12" rx="2" fill="currentColor"/>
                </svg>
                Stop
              </button>
            </div>
          ) : (
            <button
              className={`media-upload-btn ${!canUseMedia ? 'media-upload-btn-disabled' : ''}`}
              onClick={startVoiceRecording}
              disabled={!canUseMedia}
            >
              <svg className="media-upload-icon" viewBox="0 0 20 20" fill="none" width="20" height="20">
                <rect x="7" y="1" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M4 9a5.5 5.5 0 0111 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                <path d="M7 15a5.5 5.5 0 006 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              <span className="media-upload-text">Record voice</span>
            </button>
          )}

          {voiceError && (
            <p className="media-attachment-error">
              <span className="media-attachment-error-icon">!</span>
              Media attachment failed: {voiceError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
