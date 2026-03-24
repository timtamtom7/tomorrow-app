import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signOut } from '../lib/auth';
import Button from './ui/Button';
import './Navbar.css';

export default function Navbar({ showWrite = true }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="navbar-logo-mark">✦</span>
          <span className="navbar-logo-text">Tomorrow</span>
        </Link>

        <div className="navbar-actions">
          {user ? (
            <>
              <Link to="/pricing" className="navbar-link">Pricing</Link>
              <Link to="/app" className="navbar-link">
                Your Letters
              </Link>
              <Link to="/app/recipients" className="navbar-link">
                Recipients
              </Link>
              <Link to="/write" className="navbar-write">
                <Button variant="primary" size="sm">
                  Write a Letter
                </Button>
              </Link>
              <button className="navbar-avatar" onClick={handleSignOut} title="Sign out">
                <span>{user.displayName?.[0] || user.email?.[0] || '?'}</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/pricing" className="navbar-link">Pricing</Link>
              <Link to="/auth" className="navbar-link">Sign In</Link>
              {showWrite && (
                <Link to="/write">
                  <Button variant="primary" size="sm">Write a Letter</Button>
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
