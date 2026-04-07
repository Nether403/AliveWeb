import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useObserver } from '@/engine/useObserver';
import { projects } from '@/data/projects';
import type { Project } from '@/data/types';
import { ArrowLeft, Check, ChevronDown, GitCompare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Compare() {
  const navigate = useNavigate();
  const { trackEvent } = useObserver();
  const [projectLeftSlug, setProjectLeftSlug] = useState<string>(projects[0].slug);
  const [projectRightSlug, setProjectRightSlug] = useState<string>(projects[1].slug);

  const leftProject = projects.find(p => p.slug === projectLeftSlug) || projects[0];
  const rightProject = projects.find(p => p.slug === projectRightSlug) || projects[1];

  const handleSelectLeft = (slug: string) => {
    setProjectLeftSlug(slug);
    trackEvent('click-technical', `Compared (Left): ${slug}`, 2);
  };

  const handleSelectRight = (slug: string) => {
    setProjectRightSlug(slug);
    trackEvent('click-technical', `Compared (Right): ${slug}`, 2);
  };

  return (
    <div className="min-h-screen pt-20 pb-16 px-6">
      <div className="max-w-6xl mx-auto">
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

        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <GitCompare className="w-5 h-5 text-smoke-400" />
            <h1 className="text-2xl md:text-3xl font-bold text-bone">System Comparison</h1>
          </div>
          <p className="text-smoke-400 forensic text-sm uppercase tracking-wider">
            Technical Analysis Mode Active
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-4 relative">
          {/* Mobile vs Divider */}
          <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 
                          w-8 h-8 rounded-full bg-void border border-smoke-800 items-center justify-center">
            <span className="text-xs forensic text-smoke-500">VS</span>
          </div>

          <ColumnSelector
            selectedSlug={projectLeftSlug}
            onSelect={handleSelectLeft}
            otherSlug={projectRightSlug}
            project={leftProject}
            delay={0.2}
          />

          <ColumnSelector
            selectedSlug={projectRightSlug}
            onSelect={handleSelectRight}
            otherSlug={projectLeftSlug}
            project={rightProject}
            delay={0.3}
          />
        </div>
      </div>
    </div>
  );
}

function ColumnSelector({
  selectedSlug,
  onSelect,
  otherSlug,
  project,
  delay
}: {
  selectedSlug: string;
  onSelect: (slug: string) => void;
  otherSlug: string;
  project: Project;
  delay: number;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      className="flex flex-col gap-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Selector */}
      <div className="relative z-20">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-4 glass rounded-xl border border-smoke-800 hover:border-smoke-600 transition-colors text-left"
        >
          <div>
            <p className="text-sm font-medium text-bone">{project.title}</p>
            <p className="text-xs text-smoke-400 forensic uppercase tracking-wider mt-1">
              {project.category.replace('-', ' ')}
            </p>
          </div>
          <ChevronDown className={`w-4 h-4 text-smoke-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="absolute top-calc(100%+8px) inset-x-0 glass border border-smoke-800 rounded-xl overflow-hidden shadow-2xl"
              initial={{ opacity: 0, scaleY: 0.9, transformOrigin: 'top' }}
              animate={{ opacity: 1, scaleY: 1 }}
              exit={{ opacity: 0, scaleY: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              {projects.map(p => (
                <button
                  key={p.slug}
                  disabled={p.slug === otherSlug}
                  onClick={() => {
                    onSelect(p.slug);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 text-sm text-left transition-colors
                    ${p.slug === selectedSlug ? 'bg-smoke-800/50 text-bone' : 'text-smoke-300 hover:bg-smoke-900'}
                    ${p.slug === otherSlug ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  {p.title}
                  {p.slug === selectedSlug && <Check className="w-4 h-4 text-emerald-500" />}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Project Data */}
      <div className="glass rounded-xl p-6 border border-smoke-800 flex-1 space-y-6">
        <div>
          <p className="forensic text-xs text-smoke-500 uppercase tracking-widest mb-3">Copy / Technical</p>
          <div className="relative min-h-[6rem]">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.p
                key={project.slug}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.3 }}
                className="text-smoke-200 text-sm leading-relaxed"
              >
                {project.copyVariants.technical}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        <div>
          <p className="forensic text-xs text-smoke-500 uppercase tracking-widest mb-3">Stack</p>
          <div className="flex flex-wrap gap-2">
            {project.stack.map(tech => (
              <span key={tech} className="forensic px-2 py-1 bg-smoke-900 rounded border border-smoke-800 text-smoke-300 text-xs text-center min-w-[70px]">
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="forensic text-xs text-smoke-500 uppercase tracking-widest mb-3">Medium & Approach</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-smoke-900 rounded border border-smoke-800">
              <p className="text-xs text-smoke-500 mb-1">Medium</p>
              <p className="text-sm text-bone capitalize">{project.medium}</p>
            </div>
            <div className="p-3 bg-smoke-900 rounded border border-smoke-800">
              <p className="text-xs text-smoke-500 mb-1">Category</p>
              <p className="text-sm text-bone capitalize">{project.category.replace('-', ' ')}</p>
            </div>
          </div>
        </div>

        <div>
          <p className="forensic text-xs text-smoke-500 uppercase tracking-widest mb-3">Ambition Level</p>
          <div className="flex gap-1.5 h-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm border border-smoke-800/50"
                style={{
                  backgroundColor: i < project.ambitionLevel
                    ? (project.accentColor === 'amber' ? '#c4973b' : '#4a7c9b')
                    : '#0a0a0c',
                }}
              />
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-smoke-800">
          <p className="text-xs italic text-smoke-400">
            "{project.technicalNotes}"
          </p>
        </div>
      </div>
    </motion.div>
  );
}
