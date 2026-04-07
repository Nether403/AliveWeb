import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useObserver } from '@/engine/useObserver';
import { projects } from '@/data/projects';
import { Search, Command, ArrowRight, User, GitCompare } from 'lucide-react';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { trackEvent, profile } = useObserver();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => {
          if (!prev) trackEvent('keyboard-shortcut', 'Cmd+K opened command palette', 1);
          return !prev;
        });
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, trackEvent]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const filteredProjects = projects.filter((p) => {
    const q = query.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.tags.some((tag) => tag.toLowerCase().includes(q)) ||
      p.stack.some((tech) => tech.toLowerCase().includes(q))
    );
  });

  const handleSelectProject = (slug: string, title: string) => {
    trackEvent('click-technical', `Searched and navigated to ${title}`, 3);
    setIsOpen(false);
    navigate(`/project/${slug}`);
  };

  const handleGlobalCommand = (path: string, label: string) => {
    trackEvent('click-technical', `Executed command: ${label}`, 3);
    setIsOpen(false);
    navigate(path);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-void/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              className="bg-void-surface/90 border border-smoke-800 rounded-xl overflow-hidden shadow-2xl w-full max-w-xl shadow-amber-glow/5 pointer-events-auto"
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {/* Search Header */}
              <div className="px-4 py-3 border-b border-smoke-800 flex items-center gap-3">
                <Search className="w-5 h-5 text-smoke-500" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search projects, tags, or commands..."
                  className="flex-1 bg-transparent text-bone placeholder:text-smoke-600 focus:outline-none"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <div className="flex gap-1.5 border border-smoke-800 rounded px-1.5 py-0.5 bg-smoke-900/50">
                  <Command className="w-3.5 h-3.5 text-smoke-500 gap-1" />
                  <span className="text-xs text-smoke-500 font-medium font-sans">K</span>
                </div>
              </div>

              {/* Results Body */}
              <div className="max-h-[60vh] overflow-y-auto p-2">
                {/* Global Commands Section */}
                {(!query || 'trace session adaptations'.includes(query.toLowerCase())) && (
                  <div className="mb-4">
                    <p className="px-2 py-1.5 text-xs font-semibold text-smoke-500 uppercase tracking-widest forensic">
                      System
                    </p>
                    <button
                      onClick={() => handleGlobalCommand('/trace', 'Session Trace')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-smoke-800/60 transition-colors text-left group"
                    >
                      <User className="w-4 h-4 text-smoke-400 group-hover:text-amber transition-colors" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-bone group-hover:text-amber transition-colors">
                          View Session Trace
                        </p>
                        <p className="text-xs text-smoke-400 mt-0.5">
                          Analyze behavioral profile ({profile.dominant} mode dominant)
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-smoke-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <button
                      onClick={() => handleGlobalCommand('/compare', 'Compare Mode')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-smoke-800/60 transition-colors text-left group mt-1"
                    >
                      <GitCompare className="w-4 h-4 text-smoke-400 group-hover:text-amber transition-colors" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-bone group-hover:text-amber transition-colors">
                          Compare Projects
                        </p>
                        <p className="text-xs text-smoke-400 mt-0.5">
                          Technical side-by-side analysis
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-smoke-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </div>
                )}

                {/* Projects Section */}
                <div>
                  <p className="px-2 py-1.5 text-xs font-semibold text-smoke-500 uppercase tracking-widest forensic">
                    Projects
                  </p>
                  {filteredProjects.length === 0 ? (
                    <p className="px-3 py-4 text-sm text-smoke-500 text-center">No projects found.</p>
                  ) : (
                    filteredProjects.map((p) => (
                      <button
                        key={p.slug}
                        onClick={() => handleSelectProject(p.slug, p.title)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-smoke-800/60 transition-colors text-left group"
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: p.accentColor === 'amber' ? '#c4973b' : '#4a7c9b' }}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-bone">{p.title}</p>
                          <p className="text-xs text-smoke-400 mt-0.5 capitalize">
                            {p.category.replace('-', ' ')}
                          </p>
                        </div>
                        <div className="hidden sm:flex flex-wrap gap-1">
                          {p.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="text-[10px] uppercase forensic px-1.5 py-0.5 bg-smoke-900 text-smoke-500 rounded border border-smoke-800">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
