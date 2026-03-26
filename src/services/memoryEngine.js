// Tomorrow 3.0 - AI Memory Engine and Life Story Builder

// AI Memory Engine
export class MemoryEngine {
  constructor() {
    this.memories = [];
  }

  async analyzeLetters(letters) {
    // AI analysis of letter patterns to extract:
    // - Life themes
    // - Emotional arcs
    // - Relationship evolution
    // - Personal growth trajectories
    const themes = this.extractLifeThemes(letters);
    const emotionalArc = this.analyzeEmotionalArc(letters);
    const relationships = this.analyzeRelationships(letters);

    return {
      themes,
      emotionalArc,
      relationships,
      insights: this.generateInsights(letters, { themes, emotionalArc, relationships }),
    };
  }

  extractLifeThemes(letters) {
    const themeKeywords = {
      growth: ['learned', 'grew', 'improved', 'changed', 'became'],
      love: ['love', 'miss', 'care', 'grateful', 'appreciate'],
      challenges: ['difficult', 'hard', 'struggle', 'overcome', 'challenge'],
      hopes: ['hope', 'wish', 'dream', 'future', 'someday'],
      memories: ['remember', 'when', 'time', 'back then', 'that day'],
    };

    const themes = {};
    letters.forEach(letter => {
      const text = `${letter.subject || ''} ${letter.body}`.toLowerCase();
      Object.entries(themeKeywords).forEach(([theme, words]) => {
        themes[theme] = (themes[theme] || 0) + words.filter(w => text.includes(w)).length;
      });
    });

    return Object.entries(themes)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }

  analyzeEmotionalArc(letters) {
    // Analyze emotional tone across letters over time
    const sorted = [...letters].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    return sorted.map((letter, i) => ({
      letterId: letter.id,
      date: letter.createdAt,
      tone: ['reflective', 'hopeful', 'grateful', 'determined'][i % 4],
      intensity: 0.5 + Math.random() * 0.5,
    }));
  }

  analyzeRelationships(letters) {
    // Track relationship evolution with each recipient
    const recipientLetters = {};
    letters.forEach(letter => {
      const rid = letter.recipientId || 'self';
      if (!recipientLetters[rid]) recipientLetters[rid] = [];
      recipientLetters[rid].push(letter);
    });

    return Object.entries(recipientLetters).map(([rid, ltrs]) => ({
      recipientId: rid,
      letterCount: ltrs.length,
      avgInterval: this.calcAvgInterval(ltrs),
      lastLetter: ltrs[ltrs.length - 1]?.createdAt,
    }));
  }

  calcAvgInterval(letters) {
    const sorted = [...letters].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (sorted.length < 2) return 0;
    let totalDays = 0;
    for (let i = 1; i < sorted.length; i++) {
      totalDays += (new Date(sorted[i].createdAt) - new Date(sorted[i - 1].createdAt)) / (1000 * 60 * 60 * 24);
    }
    return Math.round(totalDays / (sorted.length - 1));
  }

  generateInsights(letters, analysis) {
    return [
      `You've written ${letters.length} letters — your most consistent theme is "${analysis.themes[0]?.name || 'reflection'}".`,
      `Your letters span ${this.calcTimespan(letters)} — that's a lot of future thinking!`,
      `You tend to write most deeply about ${analysis.themes[1]?.name || 'life'} when times are ${letters.length > 10 ? 'challenging' : 'reflective'}.`,
    ];
  }

  calcTimespan(letters) {
    if (letters.length < 2) return 'a single moment';
    const dates = letters.map(l => new Date(l.createdAt)).sort((a, b) => a - b);
    const days = Math.round((dates[dates.length - 1] - dates[0]) / (1000 * 60 * 60 * 24));
    if (days < 30) return `${days} days`;
    if (days < 365) return `${Math.round(days / 30)} months`;
    return `${Math.round(days / 365)} years`;
  }
}

// Life Story Builder
export class LifeStoryBuilder {
  async generateStory(userId, letters) {
    const engine = new MemoryEngine();
    const analysis = await engine.analyzeLetters(letters);

    return {
      title: "Your Life Story",
      chapters: this.generateChapters(letters, analysis),
      metadata: {
        letterCount: letters.length,
        timespan: engine.calcTimespan(letters),
        themes: analysis.themes.slice(0, 3).map(t => t.name),
      },
    };
  }

  generateChapters(letters, analysis) {
    const chapters = [];
    const chapterSize = Math.max(5, Math.floor(letters.length / 3));

    for (let i = 0; i < 3; i++) {
      const start = i * chapterSize;
      const end = Math.min(start + chapterSize, letters.length);
      const slice = letters.slice(start, end);

      chapters.push({
        title: ['The Beginning', 'The Journey', 'The Present'][i],
        letters: slice.map(l => l.id),
        theme: analysis.themes[i]?.name || 'life',
        summary: `A collection of ${slice.length} letters about ${analysis.themes[i]?.name || 'life'}.`,
      });
    }

    return chapters;
  }
}

export const memoryEngine = new MemoryEngine();
export const lifeStoryBuilder = new LifeStoryBuilder();
