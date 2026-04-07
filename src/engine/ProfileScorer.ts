import type { BehaviorProfile, ProfileDimension, Signal, SignalType } from '@/data/types';

/** Weight configuration — maps signal types to score adjustments per dimension */
const SIGNAL_WEIGHTS: Record<SignalType, Partial<Record<ProfileDimension, number>>> = {
  'hover-visual': { visual: 3 },
  'hover-technical': { technical: 3 },
  'hover-narrative': { narrative: 3 },
  'hover-nav': { exploratory: 1 },
  'click-visual': { visual: 4 },
  'click-technical': { technical: 4 },
  'click-narrative': { narrative: 4 },
  'click-nav': { exploratory: 2 },
  'click-exploratory': { exploratory: 4 },
  'dwell-section': { narrative: 1 },
  'scroll-speed': {},
  'revisit': { technical: 2, narrative: 1 },
  'nonlinear-nav': { exploratory: 3 },
  'linear-nav': { narrative: 1 },
  'keyboard-shortcut': { technical: 2, exploratory: 2 },
  'command-palette': { exploratory: 3, technical: 2 },
  'search-technical': { technical: 4 },
  'search-general': { exploratory: 2 },
  'compare-mode': { technical: 5 },
  'entry-archive': { technical: 1 },
  'entry-guided': { narrative: 2 },
  'entry-explore': { exploratory: 3 },
  'tab-visual': { visual: 5 },
  'tab-technical': { technical: 5 },
  'tab-narrative': { narrative: 5 },
  'tab-overview': {},
  'long-read': { narrative: 4 },
};

/** Temporal decay — signals older than this (ms) get halved */
const DECAY_THRESHOLD_MS = 60000;

const STORAGE_KEY = 'observer-profile';

/**
 * ProfileScorer — deterministic scoring system maintaining four weighted dimensions.
 */
export class ProfileScorer {
  private rawScores = { visual: 0, technical: 0, narrative: 0, exploratory: 0 };
  private signalHistory: Array<{ signal: Signal; appliedAt: number }> = [];

  constructor() {
    this.restore();
  }

  /** Process a new signal and update scores */
  processSignal(signal: Signal) {
    const weights = SIGNAL_WEIGHTS[signal.type];
    if (!weights) return;

    const entry = { signal, appliedAt: Date.now() };
    this.signalHistory.push(entry);

    // Apply weights
    for (const [dim, weight] of Object.entries(weights)) {
      const dimension = dim as ProfileDimension;
      const scaledWeight = weight * Math.min(signal.value, 10); // Cap extreme values
      this.rawScores[dimension] += scaledWeight;
    }

    // Apply temporal decay on recalc
    this.applyDecay();
    this.persist();
  }

  /** Get the current behavioral profile */
  getProfile(): BehaviorProfile {
    const { visual, technical, narrative, exploratory } = this.rawScores;
    const total = visual + technical + narrative + exploratory;

    // Normalize to 0-100 range
    const normalize = (score: number) => {
      if (total === 0) return 25; // Equal distribution when no data
      return Math.min(100, Math.round((score / total) * 100));
    };

    const normalized = {
      visual: normalize(visual),
      technical: normalize(technical),
      narrative: normalize(narrative),
      exploratory: normalize(exploratory),
    };

    // Determine dominant dimension
    const entries = Object.entries(normalized) as Array<[ProfileDimension, number]>;
    entries.sort((a, b) => b[1] - a[1]);
    const dominant = entries[0][0];

    // Confidence: how differentiated is the dominant score from the rest?
    const maxScore = entries[0][1];
    const secondScore = entries[1][1];
    const confidence = total > 0 ? Math.min(100, Math.round(((maxScore - secondScore) / 100) * 200 + (total > 20 ? 30 : 0))) : 0;

    return {
      ...normalized,
      dominant,
      confidence: Math.min(100, confidence),
    };
  }

  /** Reset all scores */
  reset() {
    this.rawScores = { visual: 0, technical: 0, narrative: 0, exploratory: 0 };
    this.signalHistory = [];
    sessionStorage.removeItem(STORAGE_KEY);
  }

  /** Get raw scores for debugging */
  getRawScores() {
    return { ...this.rawScores };
  }

  private applyDecay() {
    const now = Date.now();
    // Rebuild scores with decay applied
    const decayed = { visual: 0, technical: 0, narrative: 0, exploratory: 0 };

    for (const { signal, appliedAt } of this.signalHistory) {
      const age = now - appliedAt;
      const decayFactor = age > DECAY_THRESHOLD_MS ? 0.5 : 1;
      const weights = SIGNAL_WEIGHTS[signal.type];
      if (!weights) continue;

      for (const [dim, weight] of Object.entries(weights)) {
        const dimension = dim as ProfileDimension;
        const scaledWeight = weight * Math.min(signal.value, 10) * decayFactor;
        decayed[dimension] += scaledWeight;
      }
    }

    this.rawScores = decayed;
  }

  private persist() {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          rawScores: this.rawScores,
          signalHistory: this.signalHistory.slice(-200), // Keep last 200
        }),
      );
    } catch {
      // sessionStorage may be unavailable
    }
  }

  private restore() {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.rawScores = data.rawScores || this.rawScores;
        this.signalHistory = data.signalHistory || [];
      }
    } catch {
      // Ignore
    }
  }
}
