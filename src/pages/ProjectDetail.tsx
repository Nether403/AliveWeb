import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useObserver } from '@/engine/useObserver';
import { getProjectBySlug } from '@/data/projects';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { CopyVariantKey } from '@/data/types';

const TABS = [
  { key: 'overview' as const, label: 'Overview' },
  { key: 'visual' as const, label: 'Visual' },
  { key: 'technical' as const, label: 'Technical' },
  { key: 'narrative' as const, label: 'Process' },
];

type TabKey = 'overview' | 'visual' | 'technical' | 'narrative';

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { adaptation, trackEvent, profile } = useObserver();
  const project = slug ? getProjectBySlug(slug) : undefined;

  // Determine default tab based on profile
  const defaultTab = useMemo((): TabKey => {
    if (profile.confidence < 15) return 'overview';
    const map: Record<string, TabKey> = {
      visual: 'visual',
      technical: 'technical',
      narrative: 'narrative',
      exploratory: 'overview',
    };
    return map[profile.dominant] || 'overview';
  }, [profile.dominant, profile.confidence]);

  const [activeTab, setActiveTab] = useState<TabKey>(defaultTab);

  // Track project visit
  useEffect(() => {
    if (project) {
      trackEvent('click-visual', `Viewed project: ${project.title}`, 2, { projectSlug: project.slug });
    }
  }, [project, trackEvent]);

  const handleTabChange = useCallback(
    (tab: TabKey) => {
      setActiveTab(tab);
      const signalMap: Record<TabKey, 'tab-overview' | 'tab-visual' | 'tab-technical' | 'tab-narrative'> = {
        overview: 'tab-overview',
        visual: 'tab-visual',
        technical: 'tab-technical',
        narrative: 'tab-narrative',
      };
      trackEvent(signalMap[tab], `Opened ${tab} tab on ${project?.title}`, 3);
    },
    [trackEvent, project],
  );

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-smoke-400">Project not found.</p>
      </div>
    );
  }

  const copyVariant: CopyVariantKey = adaptation.copyVariant as CopyVariantKey;

  return (
    <div className="min-h-screen pt-20 pb-16 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Back navigation */}
        <motion.button
          onClick={() => navigate('/archive')}
          className="flex items-center gap-2 text-smoke-400 hover:text-bone transition-colors mb-8
                     text-sm group"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Archive
        </motion.button>

        {/* Hero section */}
        <motion.div
          layoutId={`project-${project.slug}`}
          className="rounded-xl overflow-hidden mb-8"
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Mood visual area */}
          <div
            className="h-64 md:h-80 relative"
            style={{ background: project.moodGradient }}
          >
            <motion.div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 50% 50%, ${project.moodColor}44 0%, transparent 70%)`,
              }}
              animate={{ scale: [1, 1.05, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 12, repeat: Infinity }}
            />

            {/* Title overlay */}
            <div className="absolute inset-0 flex flex-col justify-end p-8 bg-gradient-to-t from-void/80 via-transparent to-transparent">
              <motion.span
                className="forensic text-smoke-400 uppercase tracking-widest mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {project.category.replace('-', ' ')} · {project.medium}
              </motion.span>
              <motion.h1
                className="text-3xl md:text-4xl font-bold text-bone"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {project.title}
              </motion.h1>
            </div>
          </div>
        </motion.div>

        {/* Content area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main content */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="flex gap-1 mb-8 border-b border-smoke-800 pb-px">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`px-4 py-2.5 text-sm font-medium transition-all duration-300 relative
                    ${activeTab === tab.key
                      ? 'text-bone'
                      : 'text-smoke-400 hover:text-smoke-200'
                    }`}
                >
                  {tab.label}
                  {activeTab === tab.key && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-px bg-amber"
                      layoutId="tab-indicator"
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="text-smoke-200 leading-relaxed"
              >
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    <div className="relative min-h-[3rem]">
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.p
                          key={copyVariant}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.3, ease: 'easeOut' }}
                          className="text-lg text-bone/90 leading-relaxed"
                        >
                          {project.copyVariants[copyVariant] || project.copyVariants.concise}
                        </motion.p>
                      </AnimatePresence>
                    </div>
                    <p className="text-sm text-smoke-400">{project.shortSummary}</p>
                  </div>
                )}
                {activeTab === 'visual' && (
                  <div className="space-y-4">
                    <p className="text-lg text-bone/90 leading-relaxed">{project.copyVariants.visual}</p>
                    <div
                      className="h-48 rounded-lg mt-6"
                      style={{ background: project.moodGradient }}
                    />
                  </div>
                )}
                {activeTab === 'technical' && (
                  <div className="space-y-4">
                    <p className="text-bone/90 leading-relaxed">{project.copyVariants.technical}</p>
                    <div className="mt-6 p-4 bg-smoke-900 rounded-lg border border-smoke-800">
                      <p className="forensic text-smoke-300">{project.technicalNotes}</p>
                    </div>
                  </div>
                )}
                {activeTab === 'narrative' && (
                  <div className="space-y-4">
                    <p className="text-bone/90 leading-relaxed italic">{project.copyVariants.narrative}</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Metadata sidebar */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="glass rounded-xl p-5 space-y-5">
              <MetaField label="Medium" value={project.medium} />
              <MetaField label="Category" value={project.category.replace('-', ' ')} />
              <div>
                <p className="forensic text-smoke-500 uppercase tracking-wider mb-2">Stack</p>
                <div className="flex flex-wrap gap-1.5">
                  {project.stack.map((tech) => (
                    <span key={tech} className="forensic px-2 py-0.5 bg-smoke-800 rounded text-smoke-300">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="forensic text-smoke-500 uppercase tracking-wider mb-2">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <span key={tag} className="forensic px-2 py-0.5 bg-smoke-800/50 rounded text-smoke-400">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="forensic text-smoke-500 uppercase tracking-wider mb-2">Ambition</p>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-5 rounded-sm"
                      style={{
                        backgroundColor: i < project.ambitionLevel
                          ? (project.accentColor === 'amber' ? '#c4973b' : '#4a7c9b')
                          : '#2c2c34',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function MetaField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="forensic text-smoke-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm text-smoke-200 capitalize">{value}</p>
    </div>
  );
}
