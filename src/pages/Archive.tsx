import { useMemo } from 'react';
import { motion } from 'motion/react';
import { useObserver } from '@/engine/useObserver';
import { projects, getProjectBySlug } from '@/data/projects';
import ProjectCard from '@/components/ProjectCard';

export default function Archive() {
  const { adaptation, profile } = useObserver();

  // Order projects based on adaptation engine
  const orderedProjects = useMemo(() => {
    return adaptation.projectOrder
      .map((slug) => getProjectBySlug(slug))
      .filter(Boolean) as typeof projects;
  }, [adaptation.projectOrder]);

  // Get recommendation titles
  const recommendations = useMemo(() => {
    return adaptation.recommendations
      .map((slug) => getProjectBySlug(slug))
      .filter(Boolean) as typeof projects;
  }, [adaptation.recommendations]);

  return (
    <div className="min-h-screen pt-20 pb-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Recommendations band */}
        {profile.confidence > 10 && (
          <motion.div
            className="mb-10"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="forensic text-smoke-500 mb-2">Surfacing for you:</p>
            <div className="flex flex-wrap gap-3">
              {recommendations.map((project) => (
                <motion.span
                  key={project.slug}
                  className="text-sm text-smoke-200 hover:text-amber transition-colors duration-300 cursor-pointer"
                  whileHover={{ x: 4 }}
                >
                  {project.title}
                  <span className="text-smoke-600 ml-1.5">→</span>
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Archive header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-semibold text-bone mb-1.5">Archive</h1>
          <p className="text-sm text-smoke-400">
            {profile.confidence > 20
              ? `Ordered by ${profile.dominant} affinity · ${orderedProjects.length} projects`
              : `${orderedProjects.length} projects · browsing shapes order`}
          </p>
        </motion.div>

        {/* Project grid */}
        <motion.div
          className={`grid gap-5 ${
            adaptation.layoutDensity === 'compact'
              ? 'grid-cols-1 md:grid-cols-3'
              : 'grid-cols-1 md:grid-cols-2'
          }`}
          layout
        >
          {orderedProjects.map((project, index) => (
            <ProjectCard key={project.slug} project={project} index={index} />
          ))}
        </motion.div>

        {/* Vault teaser — only visible when unlocked */}
        {adaptation.vaultUnlocked && (
          <motion.div
            className="mt-16 pt-12 border-t border-smoke-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 rounded-full bg-cold animate-soft-pulse" />
              <p className="forensic text-cold">Vault unlocked — exploratory threshold exceeded</p>
            </div>
            <div className="glass rounded-xl p-8 text-center">
              <h2 className="text-xl font-semibold text-bone mb-3">Field Notes</h2>
              <p className="text-sm text-smoke-400 max-w-md mx-auto">
                Experimental fragments, unfinished thoughts, and speculative sketches.
                These exist at the edges of the practice — visible only to those who explore beyond the main path.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
