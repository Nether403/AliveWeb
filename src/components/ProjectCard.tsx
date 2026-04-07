import { useObserver } from '@/engine/useObserver';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import type { Project, CopyVariantKey } from '@/data/types';

interface ProjectCardProps {
  project: Project;
  index: number;
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  const { adaptation, trackEvent } = useObserver();
  const navigate = useNavigate();
  const copyKey: CopyVariantKey = adaptation.copyVariant;
  const copy = project.copyVariants[copyKey] || project.copyVariants.concise;
  const truncatedCopy = copy.length > 180 ? copy.slice(0, 180) + '…' : copy;

  const handleClick = useCallback(() => {
    trackEvent('click-visual', `Clicked project: ${project.title}`, 1, { projectSlug: project.slug });
    navigate(`/project/${project.slug}`);
  }, [trackEvent, project, navigate]);

  const handleMouseEnter = useCallback(() => {
    trackEvent(
      project.category === 'ai-system' || project.category === 'design-system' ? 'hover-technical' : 'hover-visual',
      `Hovered on ${project.title}`,
      2,
    );
  }, [trackEvent, project]);

  return (
    <motion.article
      layout
      layoutId={`project-${project.slug}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        layout: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
        opacity: { duration: 0.4, delay: index * 0.08 },
        y: { duration: 0.5, delay: index * 0.08 },
      }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      className="group relative cursor-pointer rounded-xl overflow-hidden
                 border border-bone-ghost hover:border-smoke-500
                 transition-all duration-500"
      role="link"
      tabIndex={0}
      aria-label={`View project: ${project.title}`}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }}
    >
      {/* Mood gradient visual area */}
      <div
        className="h-44 relative overflow-hidden"
        style={{ background: project.moodGradient }}
      >
        {/* Subtle animated pattern */}
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 30% 50%, ${project.moodColor}88 0%, transparent 60%)`,
          }}
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
        />

        {/* Category tag */}
        <div className="absolute top-4 left-4">
          <span className="forensic px-2.5 py-1 rounded-full bg-void/60 backdrop-blur-sm
                          text-smoke-200 border border-bone-ghost">
            {project.category.replace('-', ' ')}
          </span>
        </div>

        {/* Ambition indicator */}
        <div className="absolute top-4 right-4 flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="w-1 h-3 rounded-full transition-colors duration-300"
              style={{
                backgroundColor: i < project.ambitionLevel
                  ? project.accentColor === 'amber' ? '#c4973b' : '#4a7c9b'
                  : '#2c2c34',
              }}
            />
          ))}
        </div>

        {/* Hover glow */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          style={{
            background: `radial-gradient(ellipse at 50% 100%, ${
              project.accentColor === 'amber' ? 'rgba(196, 151, 59, 0.15)' : 'rgba(74, 124, 155, 0.15)'
            } 0%, transparent 70%)`,
          }}
        />
      </div>

      {/* Content */}
      <div className="p-5 bg-void-surface/80">
        <h3 className="text-lg font-semibold text-bone mb-1.5 group-hover:text-amber-glow transition-colors duration-300">
          {project.title}
        </h3>

        <div className="text-sm text-smoke-300 leading-relaxed mb-4 min-h-[3.5rem] relative">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.p
              key={copyKey}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {truncatedCopy}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Stack tags */}
        <div className="flex flex-wrap gap-1.5">
          {project.stack.slice(0, 4).map((tech) => (
            <span
              key={tech}
              className="forensic px-2 py-0.5 rounded bg-smoke-800/60 text-smoke-400 
                         group-hover:text-smoke-200 transition-colors duration-300"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom accent line */}
      <div
        className="h-px w-0 group-hover:w-full transition-all duration-700 ease-out"
        style={{
          backgroundColor: project.accentColor === 'amber' ? '#c4973b' : '#4a7c9b',
        }}
      />
    </motion.article>
  );
}
