import { createContext, useContext, useEffect, useState } from 'react';
import { subscribeToAuth } from '../lib/auth';

const AuthContext = createContext(null);

const FIREBASE_CONFIGURED = !Object.values({
  apiKey: 'YOUR_FIREBASE_API_KEY',
  authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
}).every(v => v.startsWith('YOUR_'));

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firebaseReady] = useState(FIREBASE_CONFIGURED);

  useEffect(() => {
    if (!firebaseReady) {
      setLoading(false);
      return;
    }
    const unsub = subscribeToAuth(firebaseUser => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsub;
  }, [firebaseReady]);

  return (
    <AuthContext.Provider value={{ user, loading, firebaseReady }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export { FIREBASE_CONFIGURED };
