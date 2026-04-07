import { motion } from 'motion/react';
import { useObserver } from '@/engine/useObserver';
import { useNavigate } from 'react-router-dom';
import { Lock, Unlock, ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Vault() {
  const { adaptation, trackEvent } = useObserver();
  const navigate = useNavigate();
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    trackEvent('entry-explore', 'Visited Vault', 4);
    // Simulate unlock animation if they just arrived
    if (adaptation.vaultUnlocked) {
      setTimeout(() => setIsUnlocked(true), 800);
    }
  }, [adaptation.vaultUnlocked, trackEvent]);

  if (!adaptation.vaultUnlocked && !isUnlocked) {
    return (
      <div className="min-h-screen pt-32 px-6 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md space-y-6"
        >
          <div className="w-16 h-16 rounded-full bg-smoke-900 border border-smoke-800 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6 text-smoke-500" />
          </div>
          <h1 className="text-2xl font-bold text-bone">Classified Archive</h1>
          <p className="text-smoke-400 leading-relaxed text-sm">
            This area contains experimental fragments and field notes. It is only accessible to visitors demonstrating sufficiently high exploratory intent.
          </p>
          <button
            onClick={() => navigate('/archive')}
            className="text-sm forensic text-smoke-300 hover:text-amber transition-colors mt-8 inline-block"
          >
            ← Return to Archive
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16 px-6 relative">
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(circle at 50% -20%, rgba(196, 151, 59, 0.05) 0%, transparent 70%)'
      }} />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.button
          onClick={() => navigate('/archive')}
          className="flex items-center gap-2 text-smoke-400 hover:text-bone transition-colors mb-8 text-sm group"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Archive
        </motion.button>

        <motion.div
          className="mb-12 flex items-center gap-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="w-12 h-12 rounded-full border border-amber/30 bg-amber/5 flex items-center justify-center text-amber relative">
            <motion.div
              initial={{ rotateY: 0 }}
              animate={{ rotateY: isUnlocked ? 180 : 0 }}
              transition={{ duration: 0.6 }}
              onAnimationComplete={() => setIsUnlocked(true)}
            >
              {isUnlocked ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </motion.div>
            <motion.div
              className="absolute inset-0 rounded-full border border-amber"
              initial={{ scale: 1, opacity: 1 }}
              animate={isUnlocked ? { scale: 1.5, opacity: 0 } : {}}
              transition={{ duration: 0.8 }}
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-bone">The Vault</h1>
            <p className="text-smoke-400 forensic text-sm uppercase tracking-wider mt-1 text-amber/80">
              Clearance Granted
            </p>
          </div>
        </motion.div>

        <div className="space-y-8">
          <VaultItem
            date="2026.04.01"
            title="Fragment: Attentional Drift"
            content="Observation: Users rarely consume information linearly. They scan for anchors. If we track the anchors, we map the mind. The next iteration of the engine should weight non-linear movement higher."
            delay={0.2}
          />
          <VaultItem
            date="2026.03.15"
            title="Anomaly in Profile Scoring"
            content="A sequence of rapid clicks on technical terms usually indicates high technical intent. However, a specific user demonstrated this pattern followed immediately by abandoning the session. Conclusion: Technical frustration looks identical to technical curiosity until the exit occurs."
            delay={0.3}
          />
          <VaultItem
            date="2026.02.28"
            title="The Observer Pattern"
            content="To be watched changes behavior. If the user knows the site is adapting, they begin to 'play' the adapting engine. They try to trick it. This meta-game is the true portfolio."
            delay={0.4}
          />
        </div>
      </div>
    </div>
  );
}

function VaultItem({ date, title, content, delay }: { date: string, title: string, content: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className="glass p-6 rounded-xl border border-smoke-800/50 relative overflow-hidden group hover:border-amber/20 transition-colors"
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber/20 group-hover:bg-amber/60 transition-colors" />
      <div className="flex items-center gap-4 mb-3">
        <span className="forensic text-xs text-smoke-500 bg-smoke-900 px-2 py-0.5 rounded">{date}</span>
        <h3 className="text-lg font-medium text-bone group-hover:text-amber-glow transition-colors">{title}</h3>
      </div>
      <p className="text-smoke-300 text-sm leading-relaxed max-w-3xl">
        {content}
      </p>
    </motion.div>
  );
}
