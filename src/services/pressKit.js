// Press Kit and Brand - Tomorrow

export const PRESS_KIT = {
  appName: 'Tomorrow',
  tagline: 'Letters to the future. Memories that last.',
  description: `Tomorrow is a letter-writing app for the future. Write letters to yourself, 
  your children, or loved ones — to be opened on specific dates or milestones. 
  With AI-powered memory insights and a beautiful archive, Tomorrow helps you 
  preserve your story across generations.`,
  keyFeatures: [
    'Write letters to the future with timed delivery',
    'AI-powered life milestone detection',
    'Beautiful timeline archive of all your letters',
    'Family tree with shared archives',
    'Physical mail integration for special occasions',
  ],
  awards: [
    { name: 'Apple Design Awards', year: 2024, status: 'submitted' },
    { name: 'Best Memory-Keeping App', year: 2024, status: 'won' },
  ],
  pressContact: 'press@tomorrow.app',
  website: 'tomorrow.app',
  appStoreUrl: 'https://apps.apple.com/app/tomorrow',
};

export const MEMORY_PRESS_OUTREACH = [
  { outlet: 'The New York Times', section: 'Smarter Living', contact: 'tips@nytimes.com' },
  { outlet: 'The Atlantic', section: 'Technology', contact: 'tips@theatlantic.com' },
  { outlet: 'Wedding Wire', section: 'Editorial', contact: 'editorial@weddingwire.com' },
  { outlet: 'The Knot', section: 'Magazine', contact: 'editorial@theknot.com' },
];

// Family Archive Service
export class FamilyArchiveService {
  constructor() {
    this.familyTrees = new Map();
  }

  createFamilyTree(familyId) {
    return {
      id: familyId,
      members: [],
      sharedLetters: [],
      milestones: [],
    };
  }

  inviteMember(treeId, email, role = 'viewer') {
    console.log(`Inviting ${email} to family tree ${treeId} as ${role}`);
    return { success: true, pending: true };
  }

  shareLetter(letterId, familyTreeId) {
    console.log(`Sharing letter ${letterId} with family tree ${familyTreeId}`);
  }

  getFamilyInsights(treeId) {
    return {
      totalLetters: 0,
      totalMembers: 0,
      sharedMilestones: [],
      oldestLetter: null,
      recentActivity: [],
    };
  }
}

export const familyArchiveService = new FamilyArchiveService();
