import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useObserver } from '@/engine/useObserver';
import { useCallback } from 'react';
import type { SignalType } from '@/data/types';

export default function Landing() {
  const navigate = useNavigate();
  const { trackEvent, profile } = useObserver();

  const isReturnVisitor = profile.confidence > 20;

  const adaptiveText = (() => {
    if (!isReturnVisitor) return {
      line1: "The system is not personalized by identity.",
      line2: "It is personalized by attention."
    };

    switch (profile.dominant) {
      case 'visual':
        return { line1: "You seek the surface.", line2: "The system reflects your vision." };
      case 'technical':
        return { line1: "You seek the mechanics.", line2: "The system reveals its constraints." };
      case 'narrative':
        return { line1: "You seek the context.", line2: "The system unfolds its story." };
      case 'exploratory':
        return { line1: "You seek the hidden.", line2: "The system opens its doors." };
      default:
        return { line1: "You have returned.", line2: "The system continues to adapt." };
    }
  })();

  const handleEntry = useCallback(
    (type: 'archive' | 'guided' | 'explore') => {
      const signalMap: Record<string, SignalType> = {
        archive: 'entry-archive',
        guided: 'entry-guided',
        explore: 'entry-explore',
      };
      trackEvent(signalMap[type], `Entry point: ${type}`, 3);

      if (type === 'guided') {
        navigate('/guided');
      } else {
        navigate('/archive');
      }
    },
    [trackEvent, navigate],
  );

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Ambient gradient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full ambient-drift"
          style={{
            background: 'radial-gradient(circle, rgba(196, 151, 59, 0.04) 0%, transparent 70%)',
            top: '20%',
            left: '10%',
          }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(74, 124, 155, 0.03) 0%, transparent 70%)',
            bottom: '10%',
            right: '15%',
          }}
          animate={{
            x: [0, -30, 20, 0],
            y: [0, 20, -15, 0],
            scale: [1, 1.03, 0.97, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(232, 230, 225, 0.015) 0%, transparent 60%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-2xl mx-auto px-6">
        {/* Main tagline */}
        <div className="relative min-h-[4rem]">
          <AnimatePresence mode="wait">
            <motion.p
              key={adaptiveText.line1}
              className="text-lg md:text-xl text-smoke-200 font-light leading-relaxed tracking-tight"
              initial={{ opacity: 0, filter: 'blur(4px)', y: 10 }}
              animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
              exit={{ opacity: 0, filter: 'blur(4px)', y: -10 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="text-bone">{adaptiveText.line1}</span>
              <br />
              <span className="text-smoke-400">{adaptiveText.line2}</span>
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Separator */}
        <motion.div
          className="w-12 h-px bg-smoke-600 mx-auto my-10"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        />

        {/* Entry points */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <EntryLink
            label="Enter Archive"
            onClick={() => handleEntry('archive')}
            delay={1.3}
          />
          <EntryLink
            label="Begin Guided View"
            onClick={() => handleEntry('guided')}
            delay={1.45}
            accent
          />
          <EntryLink
            label="Explore Freely"
            onClick={() => handleEntry('explore')}
            delay={1.6}
          />
        </motion.div>

        {/* Subtle footer hint */}
        <motion.p
          className="mt-16 forensic text-smoke-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2.5 }}
        >
          this archive watches how you look — shift+t to see what it sees
        </motion.p>
      </div>
    </div>
  );
}

function EntryLink({
  label,
  onClick,
  delay = 0,
  accent = false,
}: {
  label: string;
  onClick: () => void;
  delay?: number;
  accent?: boolean;
}) {
  return (
    <motion.button
      onClick={onClick}
      className={`text-sm tracking-wide transition-all duration-500 relative group
                  ${accent ? 'text-smoke-200 hover:text-amber' : 'text-smoke-400 hover:text-bone'}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2 }}
    >
      {label}
      <span
        className={`block h-px mt-1 transition-all duration-500 
                    ${accent ? 'bg-amber/40 group-hover:bg-amber w-0 group-hover:w-full' : 'bg-smoke-600 group-hover:bg-smoke-300 w-0 group-hover:w-full'}`}
      />
    </motion.button>
  );
}
