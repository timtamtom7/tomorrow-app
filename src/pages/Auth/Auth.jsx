import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth, FIREBASE_CONFIGURED } from '../../context/AuthContext';
import { signIn, signUp } from '../../lib/auth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import './Auth.css';

export default function Auth() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/app';

  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) navigate(redirectTo);
  }, [user, navigate, redirectTo]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    if (mode === 'signup' && !name) { setError('Please enter your name.'); return; }

    setLoading(true);
    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password, name);
      }
      navigate(redirectTo);
    } catch (err) {
      const msg = err.code === 'auth/user-not-found' ? 'No account with that email.'
        : err.code === 'auth/wrong-password' ? 'Incorrect password.'
        : err.code === 'auth/email-already-in-use' ? 'An account with that email already exists.'
        : err.code === 'auth/weak-password' ? 'Password should be at least 6 characters.'
        : 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page page-enter">
      <header className="auth-header">
        <Link to="/" className="auth-logo">
          <span className="auth-logo-mark">✦</span>
          <span className="auth-logo-text">Tomorrow</span>
        </Link>
      </header>

      <main className="auth-main">
        {!FIREBASE_CONFIGURED && (
          <div className="auth-config-warning">
            <span className="auth-config-icon">⚠</span>
            <div>
              <p className="auth-config-title">Firebase not configured</p>
              <p className="auth-config-body">
                To enable sign up / sign in, add your Firebase credentials to{' '}
                <code>src/firebase/config.js</code>.
                See <code>TO-DO.md</code> for setup instructions.
              </p>
            </div>
          </div>
        )}
        <div className="auth-card-wrap">
          <Card className="auth-card">
            <div className="auth-card-header">
              <h1 className="auth-title">
                {mode === 'signin' ? 'Welcome back.' : 'Start writing.'}
              </h1>
              <p className="auth-subtitle">
                {mode === 'signin'
                  ? 'Sign in to access your letters.'
                  : 'Create an account to start writing letters to the future.'}
              </p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              {mode === 'signup' && (
                <Input
                  label="Your name"
                  type="text"
                  placeholder="Tommaso Mauriello"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoComplete="name"
                />
              )}
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              />

              {error && <p className="auth-error">{error}</p>}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
              >
                {mode === 'signin' ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            <div className="auth-switch">
              {mode === 'signin' ? (
                <p>
                  New to Tomorrow?{' '}
                  <button className="auth-switch-btn" onClick={() => { setMode('signup'); setError(''); }}>
                    Create an account
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button className="auth-switch-btn" onClick={() => { setMode('signin'); setError(''); }}>
                    Sign in
                  </button>
                </p>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
