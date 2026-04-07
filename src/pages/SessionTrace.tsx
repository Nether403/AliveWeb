import { motion } from 'motion/react';
import { useObserver } from '@/engine/useObserver';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import type { ProfileDimension } from '@/data/types';

const DIMENSION_COLORS: Record<ProfileDimension, string> = {
  visual: '#c4973b',
  technical: '#4a7c9b',
  narrative: '#8a6abf',
  exploratory: '#4ade80',
};

const DIMENSION_LABELS: Record<ProfileDimension, string> = {
  visual: 'Visual',
  technical: 'Technical',
  narrative: 'Narrative',
  exploratory: 'Exploratory',
};

export default function SessionTrace() {
  const { profile, adaptation, signals, sessionDuration, projectsVisited } = useObserver();
  const navigate = useNavigate();
  const recentSignals = signals.slice(-15).reverse();

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      className="fixed inset-0 z-40 flex justify-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-void/60 backdrop-blur-sm"
        onClick={() => navigate(-1)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      {/* Panel */}
      <motion.div
        className="relative w-full max-w-md h-full glass-heavy overflow-y-auto"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-lg font-semibold text-bone">Session Trace</h2>
              <p className="forensic text-smoke-500 mt-0.5">
                {formatDuration(sessionDuration)} elapsed · {projectsVisited.size} projects viewed
              </p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-smoke-400 hover:text-bone rounded-lg hover:bg-smoke-800/50 transition-colors"
              aria-label="Close trace panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Score bars */}
          <div className="mb-8">
            <h3 className="forensic text-smoke-500 uppercase tracking-wider mb-4">Profile Scores</h3>
            <div className="space-y-3">
              {(['visual', 'technical', 'narrative', 'exploratory'] as ProfileDimension[]).map((dim) => (
                <ScoreBar
                  key={dim}
                  dimension={dim}
                  score={profile[dim]}
                  isDominant={profile.dominant === dim}
                />
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="forensic text-smoke-500">Dominant Mode</span>
              <span
                className="forensic font-medium"
                style={{ color: DIMENSION_COLORS[profile.dominant] }}
              >
                {DIMENSION_LABELS[profile.dominant]}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="forensic text-smoke-500">Confidence</span>
              <span className="forensic text-smoke-200">{profile.confidence}%</span>
            </div>
          </div>

          {/* Adaptation log */}
          <div className="mb-8">
            <h3 className="forensic text-smoke-500 uppercase tracking-wider mb-4">Archive Adaptations</h3>
            <div className="space-y-2">
              {adaptation.adaptationLog.map((entry, i) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-2"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <span className="w-1 h-1 rounded-full bg-cold mt-2 shrink-0" />
                  <span className="forensic text-smoke-300">{entry}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Signal log */}
          <div>
            <h3 className="forensic text-smoke-500 uppercase tracking-wider mb-4">
              Recent Signals ({signals.length} total)
            </h3>
            <div className="space-y-1.5">
              {recentSignals.length === 0 ? (
                <p className="forensic text-smoke-600">No signals recorded yet. Browse to generate data.</p>
              ) : (
                recentSignals.map((signal) => (
                  <motion.div
                    key={signal.id}
                    className="flex items-start gap-2 py-1 border-b border-smoke-800/50"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <span className="forensic text-smoke-600 shrink-0 w-16">
                      {new Date(signal.timestamp).toLocaleTimeString('en', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false,
                      })}
                    </span>
                    <span className="forensic text-smoke-300 flex-1">{signal.label}</span>
                    <span className="forensic text-smoke-600">+{signal.value.toFixed(1)}</span>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ScoreBar({ dimension, score, isDominant }: { dimension: ProfileDimension; score: number; isDominant: boolean }) {
  const color = DIMENSION_COLORS[dimension];

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span
          className="forensic"
          style={{ color: isDominant ? color : '#8a8a96' }}
        >
          {DIMENSION_LABELS[dimension]}
        </span>
        <span className="forensic text-smoke-400">{score}</span>
      </div>
      <div className="h-1.5 bg-smoke-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}
