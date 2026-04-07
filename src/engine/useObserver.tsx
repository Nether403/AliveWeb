import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { AdaptationState, BehaviorProfile, ObserverContextType, Signal, SignalType } from '@/data/types';
import { BehaviorTracker } from './BehaviorTracker';
import { ProfileScorer } from './ProfileScorer';
import { AdaptationEngine } from './AdaptationEngine';
import { projects } from '@/data/projects';

const defaultProfile: BehaviorProfile = {
  visual: 25,
  technical: 25,
  narrative: 25,
  exploratory: 25,
  dominant: 'visual',
  confidence: 0,
};

const defaultAdaptation: AdaptationState = {
  projectOrder: projects.map(p => p.slug),
  navOrder: ['work', 'systems', 'experiments', 'notes'],
  copyVariant: 'concise',
  layoutDensity: 'spacious',
  heroEmphasis: 'cinematic',
  vaultUnlocked: false,
  recommendations: projects.slice(0, 3).map(p => p.slug),
  signalLog: [],
  adaptationLog: [],
};

const ObserverContext = createContext<ObserverContextType>({
  profile: defaultProfile,
  adaptation: defaultAdaptation,
  signals: [],
  trackEvent: () => {},
  sessionDuration: 0,
  projectsVisited: new Set(),
});

export function useObserver() {
  return useContext(ObserverContext);
}

const SESSION_START_KEY = 'observer-session-start';
const VISITED_KEY = 'observer-visited';

export function ObserverProvider({ children }: { children: ReactNode }) {
  const trackerRef = useRef(new BehaviorTracker());
  const scorerRef = useRef(new ProfileScorer());
  const engineRef = useRef(new AdaptationEngine());

  const [profile, setProfile] = useState<BehaviorProfile>(() => scorerRef.current.getProfile());
  const [adaptation, setAdaptation] = useState<AdaptationState>(defaultAdaptation);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [projectsVisited, setProjectsVisited] = useState<Set<string>>(() => {
    try {
      const stored = sessionStorage.getItem(VISITED_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });

  // Session start time
  const sessionStartRef = useRef(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_START_KEY);
      if (stored) return parseInt(stored, 10);
      const now = Date.now();
      sessionStorage.setItem(SESSION_START_KEY, String(now));
      return now;
    } catch { return Date.now(); }
  });

  // Track event callback for components
  const trackEvent = useCallback((type: SignalType, label: string, value: number = 1, metadata?: Record<string, unknown>) => {
    trackerRef.current.emit(type, label, value, metadata);

    // Track project visits
    if (metadata?.projectSlug && typeof metadata.projectSlug === 'string') {
      setProjectsVisited(prev => {
        const next = new Set(prev);
        next.add(metadata.projectSlug as string);
        try { sessionStorage.setItem(VISITED_KEY, JSON.stringify([...next])); } catch {}
        return next;
      });
    }
  }, []);

  // Subscribe to signals and update on throttled interval
  useEffect(() => {
    const tracker = trackerRef.current;
    const scorer = scorerRef.current;
    const engine = engineRef.current;

    // Process signals as they arrive
    const unsubscribe = tracker.onSignal((signal) => {
      scorer.processSignal(signal);
    });

    // Update UI state on a 2.5s throttled interval
    const interval = setInterval(() => {
      const newProfile = scorer.getProfile();
      const allSignals = tracker.getSignals();
      const newAdaptation = engine.compute(newProfile, allSignals);

      setProfile(newProfile);
      setAdaptation(newAdaptation);
      setSignals(allSignals.slice(-50));

      // Update session duration
      const start = sessionStartRef.current();
      setSessionDuration(Math.floor((Date.now() - start) / 1000));
    }, 2500);

    // Initial computation
    const initProfile = scorer.getProfile();
    const initSignals = tracker.getSignals();
    setProfile(initProfile);
    setAdaptation(engine.compute(initProfile, initSignals));
    setSignals(initSignals);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return (
    <ObserverContext.Provider value={{ profile, adaptation, signals, trackEvent, sessionDuration, projectsVisited }}>
      {children}
    </ObserverContext.Provider>
  );
}
