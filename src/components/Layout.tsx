import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import AdaptiveNav from '@/components/AdaptiveNav';
import CommandPalette from '@/components/CommandPalette';
import FinalReveal from '@/components/FinalReveal';
import { ObserverProvider } from '@/engine/useObserver';
import { useEffect } from 'react';
import { tracker } from '@/engine/BehaviorTracker';

function LayoutInner() {
  const location = useLocation();
  const navigate = useNavigate();

  // Track navigation
  useEffect(() => {
    tracker.trackNavigation(location.pathname);
  }, [location.pathname]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Shift+T → Session Trace
      if (e.shiftKey && e.key === 'T') {
        e.preventDefault();
        tracker.emit('keyboard-shortcut', 'Shift+T: Open trace', 2);
        navigate('/trace');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <div className="grain-overlay min-h-screen">
      <AdaptiveNav />
      <CommandPalette />
      <FinalReveal />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
    </div>
  );
}

export default function Layout() {
  return (
    <ObserverProvider>
      <LayoutInner />
    </ObserverProvider>
  );
}
