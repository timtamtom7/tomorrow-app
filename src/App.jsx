import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home/Home';
import Write from './pages/Write/Write';
import Dashboard from './pages/Dashboard/Dashboard';
import LetterDetail from './pages/LetterDetail/LetterDetail';
import ReadLetter from './pages/ReadLetter/ReadLetter';
import Auth from './pages/Auth/Auth';
import Settings from './pages/Settings/Settings';
import './styles/global.css';

function ThemeInit() {
  useEffect(() => {
    const saved = localStorage.getItem('tomorrow-theme');
    const preferred = saved || 'dark';
    document.documentElement.setAttribute('data-theme', preferred);
  }, []);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeInit />
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/write" element={<Write />} />
          <Route path="/app" element={<Dashboard />} />
          <Route path="/app/letters/:id" element={<LetterDetail />} />
          <Route path="/letter/:id" element={<ReadLetter />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
