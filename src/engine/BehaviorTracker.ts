import type { Signal, SignalType } from '@/data/types';

let signalCounter = 0;

/**
 * BehaviorTracker — accumulates raw behavioral signals from user interactions.
 * Signals are typed events with values that feed into the ProfileScorer.
 */
export class BehaviorTracker {
  private signals: Signal[] = [];
  private sectionEntryTimes: Map<string, number> = new Map();
  private hoverStartTimes: Map<string, number> = new Map();
  private lastScrollY = 0;
  private lastScrollTime = 0;
  private scrollSpeeds: number[] = [];
  private visitedPages: string[] = [];
  private listeners: Array<(signal: Signal) => void> = [];

  constructor() {
    this.setupScrollTracking();
  }

  /** Subscribe to new signals */
  onSignal(callback: (signal: Signal) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  /** Emit a signal from external code (click handlers, route changes, etc.) */
  emit(type: SignalType, label: string, value: number = 1, metadata?: Record<string, unknown>) {
    const signal: Signal = {
      id: `sig-${++signalCounter}`,
      type,
      value,
      label,
      timestamp: Date.now(),
      metadata,
    };
    this.signals.push(signal);
    this.listeners.forEach((l) => l(signal));
  }

  /** Track when a section becomes visible */
  enterSection(sectionId: string) {
    this.sectionEntryTimes.set(sectionId, Date.now());
  }

  /** Track when a section leaves view, emit dwell-time signal */
  leaveSection(sectionId: string, category: string = 'general') {
    const entryTime = this.sectionEntryTimes.get(sectionId);
    if (entryTime) {
      const dwellMs = Date.now() - entryTime;
      const dwellSec = dwellMs / 1000;
      this.sectionEntryTimes.delete(sectionId);

      if (dwellSec > 1) {
        this.emit('dwell-section', `Viewed ${sectionId} for ${dwellSec.toFixed(1)}s`, dwellSec, {
          sectionId,
          category,
        });

        // Long reads get a bonus signal
        if (dwellSec > 15) {
          this.emit('long-read', `Extended reading on ${sectionId}`, dwellSec);
        }
      }
    }
  }

  /** Track hover start on classified elements */
  hoverStart(elementId: string) {
    this.hoverStartTimes.set(elementId, Date.now());
  }

  /** Track hover end, emit appropriate signal based on element type */
  hoverEnd(elementId: string, elementType: 'visual' | 'technical' | 'narrative' | 'nav') {
    const startTime = this.hoverStartTimes.get(elementId);
    if (startTime) {
      const durationSec = (Date.now() - startTime) / 1000;
      this.hoverStartTimes.delete(elementId);

      if (durationSec > 0.5) {
        const signalType: SignalType = `hover-${elementType}`;
        this.emit(signalType, `Hovered on ${elementType} content for ${durationSec.toFixed(1)}s`, durationSec);
      }
    }
  }

  /** Track page navigation patterns */
  trackNavigation(path: string) {
    const isRevisit = this.visitedPages.includes(path);
    this.visitedPages.push(path);

    if (isRevisit) {
      this.emit('revisit', `Returned to ${path}`, 1, { path });
    }

    // Detect non-linear navigation (jumping around vs. sequential)
    if (this.visitedPages.length > 2) {
      const last3 = this.visitedPages.slice(-3);
      const isSequential = this.isSequentialNavigation(last3);
      if (!isSequential) {
        this.emit('nonlinear-nav', 'Non-linear navigation detected', 1);
      }
    }
  }

  /** Get all accumulated signals */
  getSignals(): Signal[] {
    return [...this.signals];
  }

  /** Get recent signals within time window */
  getRecentSignals(windowMs: number = 30000): Signal[] {
    const cutoff = Date.now() - windowMs;
    return this.signals.filter((s) => s.timestamp > cutoff);
  }

  /** Get average scroll speed */
  getAverageScrollSpeed(): number {
    if (this.scrollSpeeds.length === 0) return 0;
    const recent = this.scrollSpeeds.slice(-20);
    return recent.reduce((a, b) => a + b, 0) / recent.length;
  }

  private setupScrollTracking() {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const now = Date.now();
      const deltaY = Math.abs(window.scrollY - this.lastScrollY);
      const deltaTime = now - this.lastScrollTime;

      if (deltaTime > 50 && deltaTime < 2000) {
        const speed = deltaY / (deltaTime / 1000); // px/sec
        this.scrollSpeeds.push(speed);

        // Keep only last 50 measurements
        if (this.scrollSpeeds.length > 50) {
          this.scrollSpeeds.shift();
        }
      }

      this.lastScrollY = window.scrollY;
      this.lastScrollTime = now;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  private isSequentialNavigation(paths: string[]): boolean {
    // Simple heuristic: if paths follow a predictable order (e.g., /project/1, /project/2, /project/3)
    // For our case, sequential = visiting archive then a project then back to archive
    const archivePattern = paths.some((p) => p === '/archive' || p === '/');
    const projectPattern = paths.some((p) => p.startsWith('/project/'));
    return archivePattern && projectPattern && !paths.every((p) => p.startsWith('/project/'));
  }

  destroy() {
    this.listeners = [];
    this.signals = [];
  }
}

export const tracker = new BehaviorTracker();
