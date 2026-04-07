import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function GuidedView() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div
        className="text-center max-w-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="forensic text-cold-dim uppercase tracking-widest mb-4">Coming Soon</p>
        <h1 className="text-2xl font-semibold text-bone mb-4">Guided View</h1>
        <p className="text-smoke-400 leading-relaxed mb-8">
          A curated walkthrough through select projects — the system chooses what to show you
          based on how you've looked so far. This mode is still being calibrated.
        </p>
        <Link
          to="/archive"
          className="text-sm text-amber hover:text-amber-glow transition-colors underline underline-offset-4"
        >
          Enter the archive instead →
        </Link>
      </motion.div>
    </div>
  );
}
