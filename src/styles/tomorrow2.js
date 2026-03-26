// Tomorrow 2.0 Design System - Warm Timeless Theme

export const warmTheme = {
  colors: {
    background: '#FDF8F3',
    surface: '#FFFFFF',
    surfaceElevated: '#FAF5EE',
    primary: '#8B4513', // warm brown
    accent: '#D4A574', // warm tan
    textPrimary: '#2C1810',
    textSecondary: '#6B4D3A',
    textTertiary: '#9B7B6B',
    border: '#E8DDD4',
    error: '#C0392B',
    success: '#27AE60',
  },
  typography: {
    display: { fontFamily: "'Georgia', serif", fontSize: '40px', fontWeight: '700' },
    heading1: { fontFamily: "'Georgia', serif", fontSize: '28px', fontWeight: '600' },
    heading2: { fontFamily: "'Georgia', serif", fontSize: '22px', fontWeight: '600' },
    body: { fontFamily: "'Inter', -apple-system, sans-serif", fontSize: '16px', fontWeight: '400', lineHeight: '1.6' },
    caption: { fontFamily: "'Inter', -apple-system, sans-serif", fontSize: '13px', fontWeight: '400' },
    handwriting: { fontFamily: "'Indie Flower', cursive", fontSize: '18px', lineHeight: '1.5' },
  },
  spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px', xxl: '48px' },
  borderRadius: { sm: '4px', md: '8px', lg: '12px', xl: '16px', pill: '999px' },
};

// Life Milestone Detection Service
export class MilestoneService {
  constructor() {
    this.milestones = [];
  }

  detectMilestones(letters) {
    // Detect life milestones from letter patterns:
    // - Wedding/relationship milestones
    // - Career changes
    // - Moves/travel
    // - Family events
    // - Personal achievements
    return this.analyzePatterns(letters);
  }

  analyzePatterns(letters) {
    const detected = [];
    const themes = this.extractThemes(letters);

    if (themes.birthday?.length >= 3) detected.push({ type: 'birthday', label: 'Birthday Reflection', count: themes.birthday.length });
    if (themes.career?.length >= 2) detected.push({ type: 'career', label: 'Career Milestone', count: themes.career.length });
    if (themes.travel?.length >= 3) detected.push({ type: 'travel', label: 'Travel Journal', count: themes.travel.length });
    if (themes.relationship?.length >= 2) detected.push({ type: 'relationship', label: 'Relationship Milestone', count: themes.relationship.length });

    return detected;
  }

  extractThemes(letters) {
    const themes = { birthday: [], career: [], travel: [], relationship: [] };
    const keywords = {
      birthday: ['birthday', 'born', 'year older', 'milestone'],
      career: ['job', 'promotion', 'career', 'work', 'new role'],
      travel: ['travel', 'trip', 'journey', 'flight', 'abroad'],
      relationship: ['love', 'wedding', 'married', 'partner', 'together'],
    };

    letters.forEach(letter => {
      const text = `${letter.subject} ${letter.body}`.toLowerCase();
      Object.entries(keywords).forEach(([theme, words]) => {
        if (words.some(w => text.includes(w))) themes[theme].push(letter.id);
      });
    });

    return themes;
  }

  getUpcomingMilestones(recipients) {
    // Predict upcoming milestones based on recipient relationships
    return recipients.map(r => ({
      recipientId: r.id,
      nextMilestone: 'Birthday',
      daysUntil: this.daysUntilBirthday(r.dob),
    }));
  }

  daysUntilBirthday(dob) {
    if (!dob) return null;
    const today = new Date();
    const [month, day] = dob.split('-').map(Number);
    const thisYear = new Date(today.getFullYear(), month - 1, day);
    return Math.ceil((thisYear - today) / (1000 * 60 * 60 * 24));
  }
}

export const milestoneService = new MilestoneService();
