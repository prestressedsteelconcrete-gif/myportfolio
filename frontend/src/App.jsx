import React, { useEffect, useState } from 'react';
import PublicSite from './PublicSite.jsx';
import AdminGate from './Admin.jsx';
import { ToastProvider } from './ToastContext.jsx';

export default function App() {
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const isAdmin = hash.startsWith('#admin');

  return (
    <ToastProvider>
      {isAdmin ? <AdminGate /> : <PublicSite />}
    </ToastProvider>
  );
}
