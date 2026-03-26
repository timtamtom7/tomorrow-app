// Platform Ecosystem and API - Tomorrow

const API_BASE = 'https://api.tomorrow.app/v1';

// REST API Client
export class TomorrowAPI {
  constructor(token) {
    this.token = token;
  }

  async fetchLetters(limit = 50) {
    const res = await fetch(`${API_BASE}/letters?limit=${limit}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    return res.json();
  }

  async createLetter(letter) {
    const res = await fetch(`${API_BASE}/letters`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(letter),
    });
    return res.json();
  }

  async scheduleDelivery(letterId, delivery) {
    const res = await fetch(`${API_BASE}/letters/${letterId}/deliver`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(delivery),
    });
    return res.json();
  }

  async getMilestones() {
    const res = await fetch(`${API_BASE}/milestones`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    return res.json();
  }
}

// Legacy Export Service
export class LegacyExportService {
  async exportAllLetters(userId, format = 'pdf') {
    console.log(`Exporting all letters for ${userId} as ${format}`);
    return { success: true, downloadUrl: '#', format };
  }

  async exportToPDF(letterIds) {
    return { success: true, letterIds, estimatedPages: letterIds.length * 2 };
  }

  async exportToMarkdown(letterIds) {
    return { success: true, letterIds, estimatedSize: '10KB' };
  }

  async createTimeCapsule(letters, openDate) {
    return {
      id: Date.now(),
      letters,
      openDate,
      sealed: true,
      status: 'sealed',
    };
  }
}

// Personal Legacy Standard
export const LEGACY_STANDARD = {
  name: 'Tomorrow Legacy Format',
  version: '1.0',
  spec: {
    letter: {
      required: ['id', 'author', 'recipient', 'body', 'createdAt'],
      optional: ['subject', 'deliveryDate', 'attachments', 'tags', 'milestones'],
    },
    recipient: {
      required: ['id', 'name', 'type'],
      optional: ['email', 'dob', 'relationship', 'avatar'],
    },
  },
};

// Timeline Sync
export const TIMELINE_INTEGRATIONS = {
  applePhotos: { name: 'Apple Photos', status: 'planned' },
  googleTimeline: { name: 'Google Timeline', status: 'planned' },
  obsidian: { name: 'Obsidian', status: 'planned' },
};
