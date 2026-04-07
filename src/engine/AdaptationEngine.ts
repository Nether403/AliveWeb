import type { AdaptationState, BehaviorProfile, CopyVariantKey, Signal } from '@/data/types';
import { projects } from '@/data/projects';

/** Category affinities per profile dimension */
const CATEGORY_AFFINITY: Record<string, Record<string, number>> = {
  visual: { immersive: 5, 'data-viz': 4, narrative: 3, speculative: 2, 'design-system': 2, 'ai-system': 1 },
  technical: { 'ai-system': 5, 'design-system': 4, 'data-viz': 3, immersive: 2, speculative: 2, narrative: 1 },
  narrative: { narrative: 5, speculative: 4, immersive: 3, 'ai-system': 2, 'data-viz': 2, 'design-system': 1 },
  exploratory: { speculative: 5, narrative: 4, immersive: 3, 'data-viz': 3, 'ai-system': 2, 'design-system': 2 },
};

/** Nav items with their profile-aligned labels */
const NAV_ITEMS = [
  { key: 'work', label: 'Work', profiles: ['visual', 'narrative'] },
  { key: 'systems', label: 'Systems', profiles: ['technical'] },
  { key: 'experiments', label: 'Experiments', profiles: ['exploratory'] },
  { key: 'notes', label: 'Notes', profiles: ['narrative', 'exploratory'] },
];

/**
 * AdaptationEngine — translates behavioral profile into concrete UI directives.
 */
export class AdaptationEngine {
  /** Compute the full adaptation state from a profile and signal history */
  compute(profile: BehaviorProfile, signals: Signal[]): AdaptationState {
    return {
      projectOrder: this.computeProjectOrder(profile),
      navOrder: this.computeNavOrder(profile),
      copyVariant: this.computeCopyVariant(profile),
      layoutDensity: this.computeLayoutDensity(profile),
      heroEmphasis: this.computeHeroEmphasis(profile),
      vaultUnlocked: profile.exploratory >= 60,
      recommendations: this.computeRecommendations(profile),
      signalLog: signals.slice(-30),
      adaptationLog: this.computeAdaptationLog(profile),
    };
  }

  private computeProjectOrder(profile: BehaviorProfile): string[] {
    const scored = projects.map((project) => {
      const affinity = CATEGORY_AFFINITY[profile.dominant]?.[project.category] ?? 0;

      // Weighted score based on all dimensions, not just dominant
      let score = affinity * 10;
      const dimensions = ['visual', 'technical', 'narrative', 'exploratory'] as const;
      for (const dim of dimensions) {
        const catAffinity = CATEGORY_AFFINITY[dim]?.[project.category] ?? 0;
        score += catAffinity * (profile[dim] / 100);
      }

      return { slug: project.slug, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.map((s) => s.slug);
  }

  private computeNavOrder(profile: BehaviorProfile): string[] {
    const scored = NAV_ITEMS.map((item) => {
      let score = 0;
      for (const p of item.profiles) {
        score += profile[p as keyof BehaviorProfile] as number;
      }
      return { key: item.key, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.map((s) => s.key);
  }

  private computeCopyVariant(profile: BehaviorProfile): CopyVariantKey {
    if (profile.confidence < 15) return 'concise'; // Not enough data yet
    return profile.dominant as CopyVariantKey;
  }

  private computeLayoutDensity(profile: BehaviorProfile): 'compact' | 'spacious' {
    // Technical users prefer density; visual/narrative prefer space
    return profile.technical > 40 ? 'compact' : 'spacious';
  }

  private computeHeroEmphasis(profile: BehaviorProfile): 'cinematic' | 'analytical' | 'editorial' | 'exploratory' {
    const map: Record<string, 'cinematic' | 'analytical' | 'editorial' | 'exploratory'> = {
      visual: 'cinematic',
      technical: 'analytical',
      narrative: 'editorial',
      exploratory: 'exploratory',
    };
    return map[profile.dominant] || 'cinematic';
  }

  private computeRecommendations(profile: BehaviorProfile): string[] {
    return this.computeProjectOrder(profile).slice(0, 3);
  }

  private computeAdaptationLog(profile: BehaviorProfile): string[] {
    const log: string[] = [];

    log.push(`Dominant profile: ${profile.dominant} (${profile[profile.dominant]}%)`);

    const topProjects = this.computeProjectOrder(profile).slice(0, 3);
    log.push(`Project order: ${topProjects.join(', ')} promoted`);

    const variant = this.computeCopyVariant(profile);
    log.push(`Copy framing: ${variant}`);

    const density = this.computeLayoutDensity(profile);
    log.push(`Layout density: ${density}`);

    const nav = this.computeNavOrder(profile);
    log.push(`Navigation: ${nav[0]} in position 1`);

    if (profile.exploratory >= 60) {
      log.push('Vault: UNLOCKED');
    }

    return log;
  }
}
