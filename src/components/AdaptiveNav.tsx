import { useObserver } from '@/engine/useObserver';
import { motion, AnimatePresence } from 'motion/react';
import { Eye } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const NAV_LABELS: Record<string, string> = {
  work: 'Work',
  systems: 'Systems',
  experiments: 'Experiments',
  notes: 'Notes',
};

const NAV_ROUTES: Record<string, string> = {
  work: '/archive',
  systems: '/archive',
  experiments: '/archive',
  notes: '/archive',
};

export default function AdaptiveNav() {
  const { adaptation, profile } = useObserver();
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 glass"
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-bone-dim hover:text-bone transition-colors duration-300"
        >
          <Eye className="w-4 h-4" strokeWidth={1.5} />
          <span className="text-sm font-medium tracking-wide">Observer</span>
        </Link>

        {/* Adaptive Nav Items */}
        {!isLanding && (
          <div className="flex items-center gap-1">
            <AnimatePresence mode="popLayout">
              {adaptation.navOrder.map((key) => (
                <motion.div
                  key={key}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    to={NAV_ROUTES[key]}
                    className="px-3 py-1.5 text-xs font-medium text-smoke-300 hover:text-bone 
                               rounded-full hover:bg-smoke-800/50 transition-all duration-300
                               tracking-wide uppercase"
                  >
                    {NAV_LABELS[key]}
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Session Trace button */}
            <Link
              to="/trace"
              className="ml-3 px-2.5 py-1.5 text-xs forensic text-cold-dim hover:text-cold 
                         border border-smoke-700 hover:border-cold-dim rounded-full
                         transition-all duration-300"
            >
              trace
            </Link>

            {/* Session indicator dot */}
            <SessionDot confidence={profile.confidence} />
          </div>
        )}
      </div>
    </motion.nav>
  );
}

function SessionDot({ confidence }: { confidence: number }) {
  const hue = confidence > 50 ? 196 : confidence > 25 ? 40 : 0;
  const opacity = Math.max(0.3, confidence / 100);

  return (
    <motion.div
      className="ml-2 w-2 h-2 rounded-full"
      style={{
        backgroundColor: `hsla(${hue}, 60%, 55%, ${opacity})`,
        boxShadow: confidence > 30 ? `0 0 8px hsla(${hue}, 60%, 55%, 0.3)` : 'none',
      }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [opacity, opacity * 1.5, opacity],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      title={`Profile confidence: ${confidence}%`}
      aria-label={`Profile confidence: ${confidence}%`}
    />
  );
}
