/* ---- Types ---- */

export interface CopyVariants {
  concise: string;
  visual: string;
  technical: string;
  narrative: string;
}

export type CopyVariantKey = keyof CopyVariants;

export interface Project {
  id: string;
  title: string;
  slug: string;
  shortSummary: string;
  copyVariants: CopyVariants;
  visualDescription: string;
  technicalNotes: string;
  narrativeNotes: string;
  tags: string[];
  category: 'immersive' | 'ai-system' | 'design-system' | 'narrative' | 'data-viz' | 'speculative';
  medium: string;
  stack: string[];
  ambitionLevel: 1 | 2 | 3 | 4 | 5;
  sortOrder: number;
  moodGradient: string;
  moodColor: string;
  accentColor: 'amber' | 'cold';
}

export type ProfileDimension = 'visual' | 'technical' | 'narrative' | 'exploratory';

export interface BehaviorProfile {
  visual: number;
  technical: number;
  narrative: number;
  exploratory: number;
  dominant: ProfileDimension;
  confidence: number;
}

export interface Signal {
  id: string;
  type: SignalType;
  value: number;
  label: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export type SignalType =
  | 'hover-visual'
  | 'hover-technical'
  | 'hover-narrative'
  | 'hover-nav'
  | 'click-visual'
  | 'click-technical'
  | 'click-narrative'
  | 'click-nav'
  | 'click-exploratory'
  | 'dwell-section'
  | 'scroll-speed'
  | 'revisit'
  | 'nonlinear-nav'
  | 'linear-nav'
  | 'keyboard-shortcut'
  | 'command-palette'
  | 'search-technical'
  | 'search-general'
  | 'compare-mode'
  | 'entry-archive'
  | 'entry-guided'
  | 'entry-explore'
  | 'tab-visual'
  | 'tab-technical'
  | 'tab-narrative'
  | 'tab-overview'
  | 'long-read';

export interface AdaptationState {
  projectOrder: string[];
  navOrder: string[];
  copyVariant: CopyVariantKey;
  layoutDensity: 'compact' | 'spacious';
  heroEmphasis: 'cinematic' | 'analytical' | 'editorial' | 'exploratory';
  vaultUnlocked: boolean;
  recommendations: string[];
  signalLog: Signal[];
  adaptationLog: string[];
}

export interface SessionTrace {
  sessionId: string;
  profile: BehaviorProfile;
  signals: Signal[];
  duration: number;
  adaptations: string[];
  createdAt: number;
}

export interface ObserverContextType {
  profile: BehaviorProfile;
  adaptation: AdaptationState;
  signals: Signal[];
  trackEvent: (type: SignalType, label: string, value?: number, metadata?: Record<string, unknown>) => void;
  sessionDuration: number;
  projectsVisited: Set<string>;
}
