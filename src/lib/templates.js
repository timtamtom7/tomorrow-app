// Letter Templates — pre-written prompts to help users start writing
export const LETTER_TEMPLATES = [
  {
    id: 'future-self-1yr',
    title: 'Letter to My Future Self (1 Year)',
    icon: '✦',
    recipientType: 'me',
    description: 'A check-in with who you\'ll be in a year.',
    placeholder: "Dear Future Me,\n\nIt's {date}. Right now, I'm sitting here thinking about who you are and what your life looks like.\n\nThe thing I most want you to know right now is...\n\nI'm currently working on...\n\nSomething I'm proud of right now is...\n\nI'm worried about...\n\nWhat I hope you've figured out by now...\n\nOne thing I want to always remember is...",
    prompts: [
      "What's something you're looking forward to in a year?",
      "What would you tell your future self right now?",
      "What habits or relationships do you want to carry forward?",
    ],
  },
  {
    id: 'future-self-5yr',
    title: 'Letter to My Future Self (5 Years)',
    icon: '✦',
    recipientType: 'me',
    description: 'A deeper letter to who you\'ll become.',
    placeholder: "Dear Future Me,\n\nIt's {date} — five years from now. I can barely imagine what your life looks like.\n\nRight now, at this moment, I'm...\n\nThe biggest thing on my mind is...\n\nSomething I hope you've grown past...\n\nSomething I hope you've held onto...\n\nIf you're facing a hard moment, please remember this: ...\n\nI believe you've accomplished...\n\nOne thing I want you to know: ...",
    prompts: [
      "Where do you hope to be in 5 years?",
      "What would you regret not doing in the next 5 years?",
      "Who do you want to become?",
    ],
  },
  {
    id: 'child-born-2026',
    title: 'Letter to My Child (Born 2026)',
    icon: '👶',
    recipientType: 'other',
    description: 'Written now, read when your child turns 18.',
    relationship: 'child',
    placeholder: "My Dearest Child,\n\nI'm writing this before I've even met you. Right now, you're still a hope, a dream, a possibility — or maybe you're already on your way into this world.\n\nThe world I'm writing from is...\n\nWhat I want you to know about the person I am right now...\n\nMy hopes for who you'll become...\n\nThe things I want to teach you, even before I know you...\n\nWhat I want you to remember, no matter what...\n\nI love you because...",
    prompts: [
      "What kind of world do you hope they'll grow up in?",
      "What values do you most want to pass on?",
      "What would you want your child to know about you right now?",
    ],
  },
  {
    id: 'child-18-birthday',
    title: 'Letter to My Child on Their 18th Birthday',
    icon: '🎂',
    recipientType: 'other',
    description: 'A milestone letter for when they become an adult.',
    relationship: 'child',
    placeholder: "Sweet Eighteen,\n\nToday you turn eighteen. I remember writing this when you were small — before I knew the sound of your laugh, the way you'd scrunch your nose, the person you'd grow into.\n\nThe moment I found out I was going to be your parent...\n\nWhat you've taught me about love...\n\nMy favorite memory of you growing up...\n\nSomething I'm still figuring out as a parent...\n\nThe advice I wish I'd given you earlier...\n\nOne thing I hope you always know: ...",
    prompts: [
      "What do you want them to know about their childhood?",
      "What do you hope they've become?",
      "What would you want them to know about you as their parent?",
    ],
  },
  {
    id: 'partner-anniversary',
    title: 'Letter to My Partner (Anniversary)',
    icon: '💌',
    recipientType: 'other',
    description: 'A love letter to mark your shared journey.',
    relationship: 'partner',
    placeholder: "My Dear,\n\nI'm writing this to be read on our anniversary. Right now, as I write this, I feel...\n\nThe thing I love most about us is...\n\nA moment I'll never forget is...\n\nSomething I'm grateful for in you...\n\nSomething I want us to keep building together...\n\nThe promise I want to make to you...\n\nI love you because...",
    prompts: [
      "What do you love most about your relationship?",
      "What's a favorite memory you share?",
      "What do you hope for your future together?",
    ],
  },
  {
    id: 'partner-future',
    title: 'Letter to My Future Partner',
    icon: '💌',
    recipientType: 'other',
    description: 'Written before you\'ve met, for when you do.',
    relationship: 'partner',
    placeholder: "To You, Whoever You Are,\n\nI don't know your name yet. I don't know what your laugh sounds like or how you take your coffee. But I believe you're out there.\n\nThe things I'm working on in myself right now...\n\nWhat I hope to bring to our life together...\n\nThe kind of partner I want to be for you...\n\nWhat I'm looking forward to about finding you...\n\nOne thing I want you to know about who I am right now...",
    prompts: [
      "What kind of partner do you want to be?",
      "What are you working on personally before you meet them?",
      "What do you hope your future relationship looks like?",
    ],
  },
  {
    id: 'past-self',
    title: 'Letter to My Past Self',
    icon: '⏪',
    recipientType: 'me',
    description: 'Advice and love for who you used to be.',
    placeholder: "Dear Past Me,\n\nI'm writing this from the future. You've done things I couldn't have imagined. You're stronger than you know.\n\nRight now, you're going through...\n\nI want you to know that...\n\nWhat I'd tell you if I could go back...\n\nSomething you did that changed everything...\n\nPlease don't be so hard on yourself about...\n\nThe thing that saved me was...",
    prompts: [
      "What would you tell your past self about a hard moment?",
      "What advice would you give your younger self?",
      "What do you want your past self to know about how things turned out?",
    ],
  },
  {
    id: 'parent-legacy',
    title: 'Letter to My Parent (Legacy)',
    icon: '🌳',
    recipientType: 'other',
    description: 'Words of gratitude and love for a parent.',
    relationship: 'parent',
    placeholder: "Dear Mom / Dad,\n\nI'm writing this to you, not from the past but about the future — for your children, for your grandchildren, for anyone who carries your story forward.\n\nWhat you taught me about love...\n\nA memory I'll always treasure...\n\nSomething I inherited from you that I'm proud of...\n\nWhat I want to pass on because of you...\n\nWhat I wish I could tell you right now...\n\nYou made me who I am because...",
    prompts: [
      "What did your parent teach you that you want to pass on?",
      "What do you most appreciate about them?",
      "What would you want future generations to know about them?",
    ],
  },
  {
    id: 'gratitude',
    title: 'A Letter of Gratitude',
    icon: '🙏',
    recipientType: 'me',
    description: 'Capture what you\'re thankful for right now.',
    placeholder: "Dear Life,\n\nRight now, in this moment, I want to record what I'm grateful for.\n\nI'm grateful for...\n\nSomeone who made a difference in my life recently...\n\nSomething I almost didn't notice that I'm glad exists...\n\nA small joy I want to remember...\n\nSomething that seems ordinary but feels like a gift...\n\nThe thing I'm most grateful for in myself right now is...",
    prompts: [
      "Who are you most grateful for right now?",
      "What's something you stopped taking for granted?",
      "What small thing brought you joy recently?",
    ],
  },
  {
    id: 'hard-times',
    title: 'Letter to Myself During Hard Times',
    icon: '🔥',
    recipientType: 'me',
    description: 'Words for a future version of yourself in the middle of a storm.',
    placeholder: "Dear Future Me,\n\nIf you're reading this, things are hard right now. I want you to know — you will get through this.\n\nRight now, as I write this, the hardest thing is...\n\nWhat I want you to remember when things feel impossible...\n\nOne thing that got me through difficult times before...\n\nWhat I want you to do right now if everything feels like too much...\n\nSomething that is true, no matter how dark it feels...\n\nThe thing I want you to hold onto is...",
    prompts: [
      "What would you tell a close friend going through the same thing?",
      "What small step could you take right now?",
      "What is one thing you can control right now?",
    ],
  },
];

export function getTemplateById(id) {
  return LETTER_TEMPLATES.find(t => t.id === id) || null;
}

export function getTemplatesByRecipientType(type) {
  if (type === 'other') return LETTER_TEMPLATES.filter(t => t.recipientType === 'other');
  if (type === 'me') return LETTER_TEMPLATES.filter(t => t.recipientType === 'me');
  return LETTER_TEMPLATES;
}
