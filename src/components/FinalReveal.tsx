import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useObserver } from '@/engine/useObserver';
import { X, Eye } from 'lucide-react';

export default function FinalReveal() {
  const { profile, sessionDuration, projectsVisited } = useObserver();
  const [isReady, setIsReady] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Trigger criteria: 3+ minutes (180s) OR 3+ projects visited
    if (!hasShown && (sessionDuration > 180 || projectsVisited.size >= 3) && profile.confidence > 25) {
      setIsReady(true);
    }
  }, [sessionDuration, projectsVisited.size, profile.confidence, hasShown]);

  const handleOpen = () => {
    setIsOpen(true);
    setIsReady(false); // Hide the prompt
    setHasShown(true);
  };

  return (
    <>
      {/* Prompt Notification */}
      <AnimatePresence>
        {isReady && !isOpen && (
          <motion.div
            className="fixed bottom-6 right-6 z-50 glass border border-amber/30 rounded-lg p-4 shadow-lg shadow-amber/5 max-w-sm"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.5, type: 'spring' }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-bone flex items-center gap-2">
                  <Eye className="w-4 h-4 text-amber" />
                  Observation Complete
                </p>
                <p className="text-xs text-smoke-300 mt-1">
                  The system has assembled a behavioral profile based on your session.
                </p>
                <button
                  onClick={handleOpen}
                  className="text-xs text-amber hover:text-amber-glow mt-3 font-medium transition-colors"
                >
                  [ View Analysis ]
                </button>
              </div>
              <button
                onClick={() => {
                  setIsReady(false);
                  setHasShown(true);
                }}
                className="text-smoke-500 hover:text-smoke-300 transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Screen Reveal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[100] bg-void flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
              <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] rounded-full bg-amber blur-[100px]" />
              <div className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] rounded-full bg-cold blur-[100px]" />
            </div>

            <div className="relative z-10 w-full max-w-3xl glass p-8 md:p-12 border border-smoke-800 rounded-2xl">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-6 right-6 text-smoke-500 hover:text-bone transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="space-y-8">
                {/* Header Sequence */}
                <div className="text-center">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 1 }}
                  >
                    <Eye className="w-8 h-8 text-smoke-500 mx-auto mb-4" />
                    <h2 className="text-xl md:text-2xl text-smoke-300 font-light mb-2">
                      Session Readout
                    </h2>
                  </motion.div>

                  <motion.h1
                    className="text-4xl md:text-5xl font-bold text-bone tracking-tight"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5, duration: 1 }}
                  >
                    Dominant Mode: <span className="capitalize text-amber-glow">{profile.dominant}</span>
                  </motion.h1>
                </div>

                <div className="h-px bg-smoke-800 w-full max-w-lg mx-auto" />

                {/* Analysis Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto pt-4">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 2.5, duration: 0.8 }}
                  >
                    <p className="forensic text-xs text-smoke-500 uppercase tracking-widest mb-2">Attention Targets</p>
                    <ul className="space-y-3">
                      <li className="flex items-center justify-between text-sm">
                        <span className="text-smoke-300">Visual Aesthetic</span>
                        <span className="text-bone forensic">{Math.round(profile.visual)}%</span>
                      </li>
                      <li className="flex items-center justify-between text-sm">
                        <span className="text-smoke-300">Technical Depth</span>
                        <span className="text-bone forensic">{Math.round(profile.technical)}%</span>
                      </li>
                      <li className="flex items-center justify-between text-sm">
                        <span className="text-smoke-300">Narrative Context</span>
                        <span className="text-bone forensic">{Math.round(profile.narrative)}%</span>
                      </li>
                      <li className="flex items-center justify-between text-sm">
                        <span className="text-smoke-300">Exploratory Intent</span>
                        <span className="text-bone forensic">{Math.round(profile.exploratory)}%</span>
                      </li>
                    </ul>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 3.5, duration: 0.8 }}
                    className="space-y-4"
                  >
                    <div>
                      <p className="forensic text-xs text-smoke-500 uppercase tracking-widest mb-1">Session Duration</p>
                      <p className="text-bone text-lg font-medium">{Math.floor(sessionDuration / 60)}m {sessionDuration % 60}s</p>
                    </div>
                    <div>
                      <p className="forensic text-xs text-smoke-500 uppercase tracking-widest mb-1">Items Inspected</p>
                      <p className="text-bone text-lg font-medium">{projectsVisited.size} Projects</p>
                    </div>
                  </motion.div>
                </div>

                {/* Final Concluding Line */}
                <motion.div
                  className="pt-12 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 5.5, duration: 2 }}
                >
                  <p className="text-lg md:text-xl text-smoke-300 font-light italic">
                    "This archive does not know who you are.
                    <br />
                    Only how you look."
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
