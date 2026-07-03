import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useVaultStore } from '@/store/vaultStore';
import LockScreen from '@/pages/LockScreen';
import Vault from '@/pages/Vault';
import Generator from '@/pages/Generator';
import Settings from '@/pages/Settings';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import ToastContainer from '@/components/ToastContainer';

function AppRoutes() {
  const location = useLocation();
  const isLocked = useVaultStore(s => s.isLocked);
  const currentAccount = useVaultStore(s => s.currentAccount);
  const settings = useVaultStore(s => s.settings);
  const lock = useVaultStore(s => s.lock);

  // 自动锁定
  useEffect(() => {
    if (isLocked || settings.autoLockMinutes === 0 || !currentAccount) return;
    const ms = settings.autoLockMinutes * 60 * 1000;
    const timer = setTimeout(() => {
      lock();
    }, ms);
    return () => clearTimeout(timer);
  }, [isLocked, settings.autoLockMinutes, lock, location.pathname, currentAccount]);

  // 未解锁时显示锁屏
  if (isLocked || !currentAccount) {
    return <LockScreen />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <Routes>
        <Route path="/vault" element={<Vault />} />
        <Route path="/generator" element={<Generator />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/vault" replace />} />
      </Routes>
      <MobileNav />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
      <ToastContainer />
    </Router>
  );
}
