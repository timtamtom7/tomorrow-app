import { useState, useEffect } from 'react';
import { FIREBASE_CONFIGURED } from '../../context/AuthContext';
import './FirebaseErrorBanner.css';

export default function FirebaseErrorBanner() {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const key = 'tomorrow-firebase-banner-dismissed';
    if (localStorage.getItem(key)) {
      setDismissed(true);
    }
  }, []);

  if (FIREBASE_CONFIGURED || dismissed) return null;

  function handleDismiss() {
    setDismissed(true);
    localStorage.setItem('tomorrow-firebase-banner-dismissed', '1');
  }

  return (
    <div className="firebase-banner" role="alert">
      <span className="firebase-banner-icon">!</span>
      <div className="firebase-banner-body">
        <p className="firebase-banner-title">Firebase not configured</p>
        <p className="firebase-banner-text">
          Add your Firebase config to <code>src/firebase/config.js</code>.
          Until then, letters won't save to the database.
          See the <code>README.md</code> for setup instructions.
        </p>
      </div>
      <a
        href="https://console.firebase.google.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="firebase-banner-link"
      >
        Firebase Console →
      </a>
      <button
        className="firebase-banner-dismiss"
        onClick={handleDismiss}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
