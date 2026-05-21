import type { ModeCode, WordModeEntry } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Mock Word Data — Mode-Aware Entries
// ─────────────────────────────────────────────────────────────────────────────

export interface MockWord {
  id: string;
  lemma: string;
  pos: string;
  modeEntries: Partial<Record<ModeCode, WordModeEntry>>;
  isNew: boolean;
}

export interface MockScene {
  id: string;
  title: string;
  description: string;
  dialogueText: string;
  newWords: MockWord[];
  reviewWords: MockWord[];
  modeCode: ModeCode;
}

// ─────────────────────────────────────────────────────────────────────────────
// Word definitions — 22 words with 2-3 mode entries each
// ─────────────────────────────────────────────────────────────────────────────

export const WORDS: Record<string, MockWord> = {
  // --- Cafe / Daily Life words ---
  'word-brew': {
    id: 'word-brew',
    lemma: 'brew',
    pos: 'noun',
    isNew: true,
    modeEntries: {
      survival: {
        id: 'wme-brew-survival',
        word_id: 'word-brew',
        mode_code: 'survival',
        meaning_context:
          'When coffee is freshly made, people call it a fresh brew. It means a cup of coffee that was just prepared.',
        register: 'neutral',
        example_sentence: "I'll try the fresh brew.",
        example_context: 'At a cafe, ordering coffee',
        audio_id: null,
      },
      professional: {
        id: 'wme-brew-professional',
        word_id: 'word-brew',
        mode_code: 'professional',
        meaning_context:
          'In a work setting, "brew" can mean a plan or idea being developed, or it can refer to the office coffee.',
        register: 'neutral',
        example_sentence: "There's a new project brewing in the marketing team.",
        example_context: 'At the office, discussing new projects',
        audio_id: null,
      },
      social: {
        id: 'wme-brew-social',
        word_id: 'word-brew',
        mode_code: 'social',
        meaning_context:
          'Among friends, "brew" often just means beer or coffee — super casual.',
        register: 'informal',
        example_sentence: "Let's grab a brew after the game.",
        example_context: 'Hanging out with friends after a sports game',
        audio_id: null,
      },
    },
  },

  'word-recommend': {
    id: 'word-recommend',
    lemma: 'recommend',
    pos: 'verb',
    isNew: true,
    modeEntries: {
      survival: {
        id: 'wme-recommend-survival',
        word_id: 'word-recommend',
        mode_code: 'survival',
        meaning_context:
          'To recommend means to suggest something you think someone would like. A barista recommends drinks they think you will enjoy.',
        register: 'neutral',
        example_sentence: 'Can you recommend something?',
        example_context: 'At a cafe, asking for a suggestion',
        audio_id: null,
      },
      professional: {
        id: 'wme-recommend-professional',
        word_id: 'word-recommend',
        mode_code: 'professional',
        meaning_context:
          'In a work context, "recommend" means to formally suggest a course of action or endorse someone.',
        register: 'formal',
        example_sentence: 'I recommend we proceed with the second option.',
        example_context: 'In a meeting, presenting your opinion',
        audio_id: null,
      },
      ielts: {
        id: 'wme-recommend-ielts',
        word_id: 'word-recommend',
        mode_code: 'ielts',
        meaning_context:
          'In academic and formal contexts, "recommend" is used to make suggestions or give advice. It is a key word for expressing opinions in IELTS Speaking.',
        register: 'formal',
        example_sentence: 'I would strongly recommend that visitors explore the historical district.',
        example_context: 'Answering an IELTS Part 2 question about places to visit',
        audio_id: null,
      },
      toeic: {
        id: 'wme-recommend-toeic',
        word_id: 'word-recommend',
        mode_code: 'toeic',
        meaning_context:
          'In business English, "recommend" is used to suggest products, services, or courses of action. Essential for TOEIC opinion questions.',
        register: 'formal',
        example_sentence: 'I would recommend this approach because it has proven effective in similar situations.',
        example_context: 'Expressing an opinion in a TOEIC speaking task',
        audio_id: null,
      },
      social: {
        id: 'wme-recommend-social',
        word_id: 'word-recommend',
        mode_code: 'social',
        meaning_context:
          'When chatting with friends, "recommend" is more casual — just telling someone about something good.',
        register: 'informal',
        example_sentence: "I'd totally recommend that show — it's so good!",
        example_context: 'Chatting with friends about TV shows',
        audio_id: null,
      },
    },
  },

  'word-seasonal': {
    id: 'word-seasonal',
    lemma: 'seasonal',
    pos: 'adjective',
    isNew: true,
    modeEntries: {
      survival: {
        id: 'wme-seasonal-survival',
        word_id: 'word-seasonal',
        mode_code: 'survival',
        meaning_context:
          'Seasonal means available only during a certain time of year. A seasonal special is a drink or food that changes with the seasons.',
        register: 'neutral',
        example_sentence: 'The seasonal blend is really popular right now.',
        example_context: 'At a cafe, hearing about limited-time options',
        audio_id: null,
      },
      professional: {
        id: 'wme-seasonal-professional',
        word_id: 'word-seasonal',
        mode_code: 'professional',
        meaning_context:
          'In business, "seasonal" refers to patterns that change with the time of year — like seasonal sales or hiring.',
        register: 'neutral',
        example_sentence: 'We see a seasonal dip in sales every January.',
        example_context: 'Reviewing quarterly business data',
        audio_id: null,
      },
    },
  },

  'word-fresh': {
    id: 'word-fresh',
    lemma: 'fresh',
    pos: 'adjective',
    isNew: true,
    modeEntries: {
      survival: {
        id: 'wme-fresh-survival',
        word_id: 'word-fresh',
        mode_code: 'survival',
        meaning_context:
          'Fresh means newly made or recently prepared. When a barista says "fresh brew," the coffee was just made.',
        register: 'neutral',
        example_sentence: "I'd like a fresh brew, please.",
        example_context: 'Ordering at a cafe',
        audio_id: null,
      },
      professional: {
        id: 'wme-fresh-professional',
        word_id: 'word-fresh',
        mode_code: 'professional',
        meaning_context:
          'At work, "fresh" can mean new ideas, a new perspective, or recent information.',
        register: 'neutral',
        example_sentence: "Let's look at this with fresh eyes tomorrow.",
        example_context: 'Discussing a problem at work',
        audio_id: null,
      },
      social: {
        id: 'wme-fresh-social',
        word_id: 'word-fresh',
        mode_code: 'social',
        meaning_context:
          'With friends, "fresh" can mean something is cool, new, or exciting — or that someone is being rude ("getting fresh").',
        register: 'informal',
        example_sentence: "That's a fresh look! Where'd you get that?",
        example_context: 'Complimenting a friend on their outfit',
        audio_id: null,
      },
    },
  },

  'word-order': {
    id: 'word-order',
    lemma: 'order',
    pos: 'verb',
    isNew: true,
    modeEntries: {
      survival: {
        id: 'wme-order-survival',
        word_id: 'word-order',
        mode_code: 'survival',
        meaning_context:
          'To order means to tell the server what you want. At a cafe, you order the food or drink you would like.',
        register: 'neutral',
        example_sentence: "I'd like to order a coffee, please.",
        example_context: 'At a cafe, telling the barista what you want',
        audio_id: null,
      },
      professional: {
        id: 'wme-order-professional',
        word_id: 'word-order',
        mode_code: 'professional',
        meaning_context:
          'In a work setting, "order" can mean to request supplies, or to organize and arrange things.',
        register: 'neutral',
        example_sentence: 'We need to order more supplies for the project.',
        example_context: 'Office supply planning',
        audio_id: null,
      },
      social: {
        id: 'wme-order-social',
        word_id: 'word-order',
        mode_code: 'social',
        meaning_context:
          'When hanging out, "order" is casual — just saying what you want at a restaurant.',
        register: 'informal',
        example_sentence: "I'll order for us — you want the usual?",
        example_context: 'Deciding what to eat with friends',
        audio_id: null,
      },
    },
  },

  'word-get': {
    id: 'word-get',
    lemma: 'get',
    pos: 'verb',
    isNew: false,
    modeEntries: {
      survival: {
        id: 'wme-get-survival',
        word_id: 'word-get',
        mode_code: 'survival',
        meaning_context:
          'At a cafe, "get" means to order or buy something. It is a casual way to say you want something.',
        register: 'informal',
        example_sentence: 'Can I get a coffee to go?',
        example_context: 'At a cafe, ordering casually',
        audio_id: null,
      },
      professional: {
        id: 'wme-get-professional',
        word_id: 'word-get',
        mode_code: 'professional',
        meaning_context:
          'At work, "get" often means to understand or to receive information. It can also mean to arrange or organize.',
        register: 'neutral',
        example_sentence: "I'll get back to you on that by tomorrow.",
        example_context: 'In a meeting, promising to follow up',
        audio_id: null,
      },
      social: {
        id: 'wme-get-social',
        word_id: 'word-get',
        mode_code: 'social',
        meaning_context:
          'With friends, "get" is super versatile — it can mean understand ("I get it"), receive ("got it"), or even empathize ("I got you").',
        register: 'informal',
        example_sentence: "I got you — no worries!",
        example_context: 'Reassuring a friend',
        audio_id: null,
      },
    },
  },

  'word-would-like': {
    id: 'word-would-like',
    lemma: 'would like',
    pos: 'phrase',
    isNew: false,
    modeEntries: {
      survival: {
        id: 'wme-wouldlike-survival',
        word_id: 'word-would-like',
        mode_code: 'survival',
        meaning_context:
          '"Would like" is a polite way to say what you want. It is more formal than "want" but very common in everyday situations.',
        register: 'neutral',
        example_sentence: "I'd like to try the seasonal special.",
        example_context: 'At a cafe, ordering politely',
        audio_id: null,
      },
      professional: {
        id: 'wme-wouldlike-professional',
        word_id: 'word-would-like',
        mode_code: 'professional',
        meaning_context:
          'In meetings, "would like" is the polite way to express preferences or requests.',
        register: 'formal',
        example_sentence: 'I would like to suggest an alternative approach.',
        example_context: 'In a meeting, proposing a change',
        audio_id: null,
      },
    },
  },

  // --- New words for multiple scenes ---

  'word-appointment': {
    id: 'word-appointment',
    lemma: 'appointment',
    pos: 'noun',
    isNew: true,
    modeEntries: {
      survival: {
        id: 'wme-appointment-survival',
        word_id: 'word-appointment',
        mode_code: 'survival',
        meaning_context:
          'An appointment is a planned meeting, usually with a doctor, dentist, or official office.',
        register: 'neutral',
        example_sentence: 'I need to make an appointment with the doctor.',
        example_context: 'Calling a doctor to schedule a visit',
        audio_id: null,
      },
      professional: {
        id: 'wme-appointment-professional',
        word_id: 'word-appointment',
        mode_code: 'professional',
        meaning_context:
          'At work, an appointment is a scheduled meeting, often with a client or colleague.',
        register: 'formal',
        example_sentence: 'I have an appointment with the client at 3 PM.',
        example_context: 'Discussing your schedule at work',
        audio_id: null,
      },
    },
  },

  'word-deadline': {
    id: 'word-deadline',
    lemma: 'deadline',
    pos: 'noun',
    isNew: true,
    modeEntries: {
      survival: {
        id: 'wme-deadline-survival',
        word_id: 'word-deadline',
        mode_code: 'survival',
        meaning_context:
          'A deadline is the last moment something must be done by. You encounter deadlines for applications, bills, and appointments.',
        register: 'neutral',
        example_sentence: 'The application deadline is Friday.',
        example_context: 'Reading an important letter',
        audio_id: null,
      },
      professional: {
        id: 'wme-deadline-professional',
        word_id: 'word-deadline',
        mode_code: 'professional',
        meaning_context:
          'At work, a deadline is the date or time by which a project, task, or deliverable must be completed.',
        register: 'formal',
        example_sentence: "We need to meet the deadline for the client's report.",
        example_context: 'Discussing project timelines in a meeting',
        audio_id: null,
      },
      social: {
        id: 'wme-deadline-social',
        word_id: 'word-deadline',
        mode_code: 'social',
        meaning_context:
          'With friends, "deadline" can be used jokingly or seriously — like the last day to sign up for something fun.',
        register: 'informal',
        example_sentence: "The sign-up deadline is tonight — don't miss it!",
        example_context: 'Reminding friends about event registration',
        audio_id: null,
      },
    },
  },

  'word-carry': {
    id: 'word-carry',
    lemma: 'carry',
    pos: 'verb',
    isNew: true,
    modeEntries: {
      survival: {
        id: 'wme-carry-survival',
        word_id: 'word-carry',
        mode_code: 'survival',
        meaning_context:
          'To carry means to hold something and move with it. You carry bags, groceries, or your phone.',
        register: 'neutral',
        example_sentence: 'Can you help me carry these bags?',
        example_context: 'Shopping and needing help with bags',
        audio_id: null,
      },
      professional: {
        id: 'wme-carry-professional',
        word_id: 'word-carry',
        mode_code: 'professional',
        meaning_context:
          'At work, "carry" often means to take responsibility for something or to include something.',
        register: 'neutral',
        example_sentence: 'This report carries a lot of weight with the board.',
        example_context: 'Discussing the importance of a document',
        audio_id: null,
      },
      social: {
        id: 'wme-carry-social',
        word_id: 'word-carry',
        mode_code: 'social',
        meaning_context:
          'In gaming and social contexts, "carry" means to take responsibility for winning when others are struggling.',
        register: 'informal',
        example_sentence: "Don't worry, I'll carry this team!",
        example_context: 'Playing an online game with friends',
        audio_id: null,
      },
    },
  },

  'word-stuff': {
    id: 'word-stuff',
    lemma: 'stuff',
    pos: 'noun',
    isNew: true,
    modeEntries: {
      survival: {
        id: 'wme-stuff-survival',
        word_id: 'word-stuff',
        mode_code: 'survival',
        meaning_context:
          '"Stuff" is a very common informal word that means "things" — you can use it when you do not know the exact word.',
        register: 'informal',
        example_sentence: 'Where can I put my stuff?',
        example_context: 'Arriving at a new place, looking for a spot for belongings',
        audio_id: null,
      },
      professional: {
        id: 'wme-stuff-professional',
        word_id: 'word-stuff',
        mode_code: 'professional',
        meaning_context:
          'At work, "stuff" is too informal for formal communication. Use "materials," "items," or "matters" instead.',
        register: 'informal',
        example_sentence: "I need to review the stuff from yesterday's meeting.",
        example_context: 'Catching up on work (casual office talk)',
        audio_id: null,
      },
      social: {
        id: 'wme-stuff-social',
        word_id: 'word-stuff',
        mode_code: 'social',
        meaning_context:
          'With friends, "stuff" is perfectly normal — it is the most casual way to refer to things, activities, or situations.',
        register: 'informal',
        example_sentence: "We did fun stuff all weekend.",
        example_context: 'Telling a friend about your weekend',
        audio_id: null,
      },
    },
  },

  'word-approach': {
    id: 'word-approach',
    lemma: 'approach',
    pos: 'verb',
    isNew: true,
    modeEntries: {
      survival: {
        id: 'wme-approach-survival',
        word_id: 'word-approach',
        mode_code: 'survival',
        meaning_context:
          'To approach means to come closer to something or someone. You approach a counter, a door, or a person.',
        register: 'neutral',
        example_sentence: 'She approached the counter to order.',
        example_context: 'Walking up to a service counter',
        audio_id: null,
      },
      professional: {
        id: 'wme-approach-professional',
        word_id: 'word-approach',
        mode_code: 'professional',
        meaning_context:
          'At work, "approach" often means a method or way of dealing with something, or to contact someone about a topic.',
        register: 'formal',
        example_sentence: 'We need a different approach to this problem.',
        example_context: 'Brainstorming solutions in a meeting',
        audio_id: null,
      },
      ielts: {
        id: 'wme-approach-ielts',
        word_id: 'word-approach',
        mode_code: 'ielts',
        meaning_context:
          'In academic English, "approach" refers to a method of dealing with a topic or problem. It is essential for IELTS Part 3 discussions where you need to analyze different perspectives.',
        register: 'formal',
        example_sentence: 'There are several approaches to tackling environmental issues.',
        example_context: 'Discussing solutions in an IELTS Part 3 discussion',
        audio_id: null,
      },
      toeic: {
        id: 'wme-approach-toeic',
        word_id: 'word-approach',
        mode_code: 'toeic',
        meaning_context:
          'In business English, "approach" means a method or strategy. Commonly used in TOEIC to discuss business strategies and management styles.',
        register: 'formal',
        example_sentence: 'The company has adopted a new approach to customer service.',
        example_context: 'Describing a business strategy in a TOEIC response',
        audio_id: null,
      },
    },
  },

  'word-run': {
    id: 'word-run',
    lemma: 'run',
    pos: 'verb',
    isNew: true,
    modeEntries: {
      survival: {
        id: 'wme-run-survival',
        word_id: 'word-run',
        mode_code: 'survival',
        meaning_context:
          'To run means to move quickly on foot. You might run to catch a bus or run when you are late.',
        register: 'neutral',
        example_sentence: 'I had to run to catch the bus.',
        example_context: 'Running to catch public transport',
        audio_id: null,
      },
      professional: {
        id: 'wme-run-professional',
        word_id: 'word-run',
        mode_code: 'professional',
        meaning_context:
          'At work, "run" means to manage, operate, or lead something — like running a meeting or running a project.',
        register: 'neutral',
        example_sentence: 'She runs the marketing department.',
        example_context: 'Describing someone who leads a team',
        audio_id: null,
      },
      social: {
        id: 'wme-run-social',
        word_id: 'word-run',
        mode_code: 'social',
        meaning_context:
          'With friends, "run" has tons of casual uses — run errands, run into someone, or "I gotta run" meaning leaving.',
        register: 'informal',
        example_sentence: "I gotta run — see you later!",
        example_context: 'Ending a casual hangout',
        audio_id: null,
      },
    },
  },

  'word-handle': {
    id: 'word-handle',
    lemma: 'handle',
    pos: 'verb',
    isNew: true,
    modeEntries: {
      survival: {
        id: 'wme-handle-survival',
        word_id: 'word-handle',
        mode_code: 'survival',
        meaning_context:
          'To handle means to deal with or take care of something. You handle a problem, a situation, or a task.',
        register: 'neutral',
        example_sentence: 'Can you handle this? I need to step out.',
        example_context: 'Asking someone to take care of something',
        audio_id: null,
      },
      professional: {
        id: 'wme-handle-professional',
        word_id: 'word-handle',
        mode_code: 'professional',
        meaning_context:
          'At work, "handle" means to manage or take responsibility for a situation, client, or project.',
        register: 'neutral',
        example_sentence: 'Let me handle the client call this afternoon.',
        example_context: 'Offering to take on a task at work',
        audio_id: null,
      },
    },
  },

  'word-figure': {
    id: 'word-figure',
    lemma: 'figure',
    pos: 'verb',
    isNew: true,
    modeEntries: {
      survival: {
        id: 'wme-figure-survival',
        word_id: 'word-figure',
        mode_code: 'survival',
        meaning_context:
          'To figure out means to understand or solve something. You figure out directions, a problem, or how something works.',
        register: 'informal',
        example_sentence: "I can't figure out how to get there.",
        example_context: 'Trying to understand directions',
        audio_id: null,
      },
      professional: {
        id: 'wme-figure-professional',
        word_id: 'word-figure',
        mode_code: 'professional',
        meaning_context:
          'At work, "figure" can mean to calculate or to understand data. A "figure" is also a number in a report.',
        register: 'neutral',
        example_sentence: 'The figures show an increase in revenue.',
        example_context: 'Reviewing a financial report',
        audio_id: null,
      },
      social: {
        id: 'wme-figure-social',
        word_id: 'word-figure',
        mode_code: 'social',
        meaning_context:
          'With friends, "figure out" is super common — it just means to understand or solve something casual.',
        register: 'informal',
        example_sentence: "I figured out what to get her for her birthday!",
        example_context: 'Planning a surprise for a friend',
        audio_id: null,
      },
    },
  },

  'word-spot': {
    id: 'word-spot',
    lemma: 'spot',
    pos: 'noun',
    isNew: true,
    modeEntries: {
      survival: {
        id: 'wme-spot-survival',
        word_id: 'word-spot',
        mode_code: 'survival',
        meaning_context:
          'A spot is a particular place or location. You find a spot to sit, a parking spot, or a meeting spot.',
        register: 'neutral',
        example_sentence: 'Is this spot taken?',
        example_context: 'Looking for a seat at a cafe',
        audio_id: null,
      },
      professional: {
        id: 'wme-spot-professional',
        word_id: 'word-spot',
        mode_code: 'professional',
        meaning_context:
          'At work, "spot" can mean to notice or identify something, like spotting an error in a document.',
        register: 'neutral',
        example_sentence: 'Can you spot any issues in this report?',
        example_context: 'Reviewing a document with a colleague',
        audio_id: null,
      },
      social: {
        id: 'wme-spot-social',
        word_id: 'word-spot',
        mode_code: 'social',
        meaning_context:
          'With friends, "spot" is casual for a place or to notice something — "nice spot" or "spot on" (exactly right).',
        register: 'informal',
        example_sentence: 'This is a great spot for lunch!',
        example_context: 'Finding a good restaurant with friends',
        audio_id: null,
      },
    },
  },

  'word-turn': {
    id: 'word-turn',
    lemma: 'turn',
    pos: 'verb',
    isNew: true,
    modeEntries: {
      survival: {
        id: 'wme-turn-survival',
        word_id: 'word-turn',
        mode_code: 'survival',
        meaning_context:
          'To turn means to change direction. You turn left, turn right, or turn around when navigating.',
        register: 'neutral',
        example_sentence: 'Turn left at the next street.',
        example_context: 'Following directions to a new place',
        audio_id: null,
      },
      professional: {
        id: 'wme-turn-professional',
        word_id: 'word-turn',
        mode_code: 'professional',
        meaning_context:
          'At work, "turn" often means to hand over or pass something along — like turning in a report or turning a project over.',
        register: 'neutral',
        example_sentence: 'Please turn in your report by Friday.',
        example_context: 'Setting a deadline at work',
        audio_id: null,
      },
      social: {
        id: 'wme-turn-social',
        word_id: 'word-turn',
        mode_code: 'social',
        meaning_context:
          'With friends, "your turn" is about taking turns in a game or activity.',
        register: 'informal',
        example_sentence: "It's your turn to pick the movie!",
        example_context: 'Deciding what to watch with friends',
        audio_id: null,
      },
    },
  },

  'word-book': {
    id: 'word-book',
    lemma: 'book',
    pos: 'verb',
    isNew: true,
    modeEntries: {
      survival: {
        id: 'wme-book-survival',
        word_id: 'word-book',
        mode_code: 'survival',
        meaning_context:
          'To book means to reserve or arrange something in advance — a table, a ticket, an appointment.',
        register: 'neutral',
        example_sentence: 'I need to book a table for tonight.',
        example_context: 'Making a restaurant reservation',
        audio_id: null,
      },
      professional: {
        id: 'wme-book-professional',
        word_id: 'word-book',
        mode_code: 'professional',
        meaning_context:
          'At work, "book" means to schedule a meeting or reserve resources like conference rooms.',
        register: 'neutral',
        example_sentence: "Can you book the conference room for 2 PM?",
        example_context: 'Scheduling a meeting at the office',
        audio_id: null,
      },
    },
  },

  'word-strike': {
    id: 'word-strike',
    lemma: 'strike',
    pos: 'verb',
    isNew: true,
    modeEntries: {
      survival: {
        id: 'wme-strike-survival',
        word_id: 'word-strike',
        mode_code: 'survival',
        meaning_context:
          'To strike means to hit. In news, a strike is when workers stop working to demand better conditions.',
        register: 'neutral',
        example_sentence: 'The bus workers are on strike this week.',
        example_context: 'Reading news about transit disruptions',
        audio_id: null,
      },
      professional: {
        id: 'wme-strike-professional',
        word_id: 'word-strike',
        mode_code: 'professional',
        meaning_context:
          'At work, "strike" can refer to a labor action, or to remove something from a document.',
        register: 'formal',
        example_sentence: 'Please strike that paragraph from the contract.',
        example_context: 'Editing a formal document',
        audio_id: null,
      },
    },
  },

  'word-point': {
    id: 'word-point',
    lemma: 'point',
    pos: 'noun',
    isNew: true,
    modeEntries: {
      survival: {
        id: 'wme-point-survival',
        word_id: 'word-point',
        mode_code: 'survival',
        meaning_context:
          'A point is a specific idea or detail. "What is your point?" means "what are you trying to say?"',
        register: 'neutral',
        example_sentence: "I don't get the point of this form.",
        example_context: 'Filling out paperwork at an office',
        audio_id: null,
      },
      professional: {
        id: 'wme-point-professional',
        word_id: 'word-point',
        mode_code: 'professional',
        meaning_context:
          'In meetings, "point" means a key idea or argument in a discussion.',
        register: 'formal',
        example_sentence: 'That is a very good point.',
        example_context: 'Agreeing with a colleague in a meeting',
        audio_id: null,
      },
      social: {
        id: 'wme-point-social',
        word_id: 'word-point',
        mode_code: 'social',
        meaning_context:
          'With friends, "point" is casual — "good point" (you are right) or "what is the point?" (why bother?).',
        register: 'informal',
        example_sentence: "Good point — I didn't think of that!",
        example_context: 'Chatting with friends about plans',
        audio_id: null,
      },
    },
  },

  'word-charge': {
    id: 'word-charge',
    lemma: 'charge',
    pos: 'verb',
    isNew: true,
    modeEntries: {
      survival: {
        id: 'wme-charge-survival',
        word_id: 'word-charge',
        mode_code: 'survival',
        meaning_context:
          'To charge means to ask for payment. You get charged at a store, a restaurant, or for services.',
        register: 'neutral',
        example_sentence: 'Will they charge extra for delivery?',
        example_context: 'Asking about fees at a store',
        audio_id: null,
      },
      professional: {
        id: 'wme-charge-professional',
        word_id: 'word-charge',
        mode_code: 'professional',
        meaning_context:
          'At work, "charge" can mean to take responsibility or to bill someone for services.',
        register: 'formal',
        example_sentence: 'She is in charge of the new project.',
        example_context: 'Assigning project leadership',
        audio_id: null,
      },
    },
  },

  'word-stand': {
    id: 'word-stand',
    lemma: 'stand',
    pos: 'verb',
    isNew: true,
    modeEntries: {
      survival: {
        id: 'wme-stand-survival',
        word_id: 'word-stand',
        mode_code: 'survival',
        meaning_context:
          'To stand means to be upright on your feet. You stand in line, stand at a counter, or stand on a bus.',
        register: 'neutral',
        example_sentence: 'We had to stand the whole way on the train.',
        example_context: 'Taking public transportation',
        audio_id: null,
      },
      professional: {
        id: 'wme-stand-professional',
        word_id: 'word-stand',
        mode_code: 'professional',
        meaning_context:
          'At work, "stand" means to hold a position or represent something — like "this stands for our values."',
        register: 'neutral',
        example_sentence: 'Our company stands for quality and trust.',
        example_context: 'Describing company values',
        audio_id: null,
      },
      social: {
        id: 'wme-stand-social',
        word_id: 'word-stand',
        mode_code: 'social',
        meaning_context:
          'With friends, "can not stand" means you really dislike something. "Stand" can also mean to tolerate.',
        register: 'informal',
        example_sentence: "I can't stand spicy food!",
        example_context: 'Discussing food preferences with friends',
        audio_id: null,
      },
    },
  },

  'word-pick': {
    id: 'word-pick',
    lemma: 'pick',
    pos: 'verb',
    isNew: true,
    modeEntries: {
      survival: {
        id: 'wme-pick-survival',
        word_id: 'word-pick',
        mode_code: 'survival',
        meaning_context:
          'To pick means to choose or select something. You pick a meal from a menu, pick a seat, or pick up an item.',
        register: 'neutral',
        example_sentence: 'You can pick any seat you like.',
        example_context: 'Choosing where to sit',
        audio_id: null,
      },
      professional: {
        id: 'wme-pick-professional',
        word_id: 'word-pick',
        mode_code: 'professional',
        meaning_context:
          'At work, "pick" means to choose or select from options, often more casual than "select" or "choose."',
        register: 'neutral',
        example_sentence: "Let's pick the best option and move forward.",
        example_context: 'Deciding on a solution in a meeting',
        audio_id: null,
      },
    },
  },

  'word-take': {
    id: 'word-take',
    lemma: 'take',
    pos: 'verb',
    isNew: false,
    modeEntries: {
      survival: {
        id: 'wme-take-survival',
        word_id: 'word-take',
        mode_code: 'survival',
        meaning_context:
          'To take means to grab, accept, or use something. You take a bus, take a seat, take your time.',
        register: 'neutral',
        example_sentence: 'Take the next bus on Main Street.',
        example_context: 'Getting directions at a bus stop',
        audio_id: null,
      },
      professional: {
        id: 'wme-take-professional',
        word_id: 'word-take',
        mode_code: 'professional',
        meaning_context:
          'At work, "take" is very common — take notes, take responsibility, take a meeting, take the lead.',
        register: 'neutral',
        example_sentence: 'Can you take notes during the meeting?',
        example_context: 'Asking a colleague to document a meeting',
        audio_id: null,
      },
      social: {
        id: 'wme-take-social',
        word_id: 'word-take',
        mode_code: 'social',
        meaning_context:
          'With friends, "take" is everywhere — take a break, take a photo, take it easy.',
        register: 'informal',
        example_sentence: "Let's take a selfie!",
        example_context: 'Hanging out and taking photos',
        audio_id: null,
      },
      ielts: {
        id: 'wme-take-ielts',
        word_id: 'word-take',
        mode_code: 'ielts',
        meaning_context:
          'In formal and academic English, "take" appears in phrases like "take into account," "take responsibility for," and "take measures." These structures demonstrate advanced vocabulary usage.',
        register: 'formal',
        example_sentence: 'We must take into account the various factors that contribute to this issue.',
        example_context: 'Discussing a complex topic in an IELTS Speaking test',
        audio_id: null,
      },
      toeic: {
        id: 'wme-take-toeic',
        word_id: 'word-take',
        mode_code: 'toeic',
        meaning_context:
          'In business English, "take" is used formally: "take action," "take measures," "take responsibility." These phrases are common in TOEIC contexts like meetings, reports, and emails.',
        register: 'formal',
        example_sentence: 'The company will take measures to address the issue promptly.',
        example_context: 'Discussing company policy in a TOEIC speaking task',
        audio_id: null,
      },
    },
  },

  // --- Sprint 6: Professional track expansion words ---

  'word-follow-up': {
    id: 'word-follow-up',
    lemma: 'follow up',
    pos: 'phrase',
    isNew: true,
    modeEntries: {
      professional: {
        id: 'wme-followup-professional',
        word_id: 'word-follow-up',
        mode_code: 'professional',
        meaning_context:
          'In a professional context, "follow up" means to check back on something, send a reminder, or take the next step after a meeting or conversation. It shows initiative and reliability.',
        register: 'formal',
        example_sentence: "I'd like to follow up on the email I sent yesterday.",
        example_context: 'Writing an email follow-up after a meeting',
        audio_id: null,
      },
    },
  },

  'word-feedback': {
    id: 'word-feedback',
    lemma: 'feedback',
    pos: 'noun',
    isNew: true,
    modeEntries: {
      professional: {
        id: 'wme-feedback-professional',
        word_id: 'word-feedback',
        mode_code: 'professional',
        meaning_context:
          '"Feedback" means comments or evaluation about your work or performance. In professional settings, giving and receiving feedback is essential for growth.',
        register: 'formal',
        example_sentence: 'Could you provide feedback on the draft by Friday?',
        example_context: 'Requesting input on a document from a colleague',
        audio_id: null,
      },
    },
  },

  'word-contribute': {
    id: 'word-contribute',
    lemma: 'contribute',
    pos: 'verb',
    isNew: true,
    modeEntries: {
      professional: {
        id: 'wme-contribute-professional',
        word_id: 'word-contribute',
        mode_code: 'professional',
        meaning_context:
          'To contribute means to add value by sharing ideas, effort, or resources. In meetings, contributing means speaking up and sharing your perspective.',
        register: 'formal',
        example_sentence: 'I would like to contribute a few points to the discussion.',
        example_context: 'Speaking up in a team meeting',
        audio_id: null,
      },
    },
  },

  'word-network': {
    id: 'word-network',
    lemma: 'network',
    pos: 'verb',
    isNew: true,
    modeEntries: {
      professional: {
        id: 'wme-network-professional',
        word_id: 'word-network',
        mode_code: 'professional',
        meaning_context:
          'To network means to build professional relationships by meeting and connecting with people in your field. Networking events, conferences, and LinkedIn are common ways to network.',
        register: 'formal',
        example_sentence: "It's important to network at industry events.",
        example_context: 'Attending a professional conference',
        audio_id: null,
      },
    },
  },

  'word-summarize': {
    id: 'word-summarize',
    lemma: 'summarize',
    pos: 'verb',
    isNew: true,
    modeEntries: {
      professional: {
        id: 'wme-summarize-professional',
        word_id: 'word-summarize',
        mode_code: 'professional',
        meaning_context:
          'To summarize means to give a brief statement of the main points. In professional settings, summarizing shows clarity and helps everyone stay aligned.',
        register: 'formal',
        example_sentence: 'Let me summarize the key takeaways from today.',
        example_context: 'Wrapping up a meeting',
        audio_id: null,
      },
    },
  },

  // --- Sprint 6: Social track expansion words ---

  'word-vibe': {
    id: 'word-vibe',
    lemma: 'vibe',
    pos: 'noun',
    isNew: true,
    modeEntries: {
      social: {
        id: 'wme-vibe-social',
        word_id: 'word-vibe',
        mode_code: 'social',
        meaning_context:
          '"Vibe" is a super casual word for the feeling or atmosphere of a place or situation. You can say a place has good vibes, bad vibes, or a chill vibe.',
        register: 'informal',
        example_sentence: "This place has such a good vibe!",
        example_context: 'Walking into a restaurant with friends',
        audio_id: null,
      },
    },
  },

  'word-crash': {
    id: 'word-crash',
    lemma: 'crash',
    pos: 'verb',
    isNew: true,
    modeEntries: {
      social: {
        id: 'wme-crash-social',
        word_id: 'word-crash',
        mode_code: 'social',
        meaning_context:
          'With friends, "crash" means to show up somewhere uninvited or unplanned. You can crash a party, crash at someone\'s place (stay over), or a game can crash (stop working).',
        register: 'informal',
        example_sentence: "Can I crash at your place tonight?",
        example_context: 'Hanging out late with friends',
        audio_id: null,
      },
    },
  },

  'word-spoiler': {
    id: 'word-spoiler',
    lemma: 'spoiler',
    pos: 'noun',
    isNew: true,
    modeEntries: {
      social: {
        id: 'wme-spoiler-social',
        word_id: 'word-spoiler',
        mode_code: 'social',
        meaning_context:
          'A "spoiler" is information that reveals what happens in a movie, show, or game. People say "no spoilers!" when they haven\'t seen something yet.',
        register: 'informal',
        example_sentence: "No spoilers! I haven't seen the finale yet.",
        example_context: 'Talking about a TV show with friends',
        audio_id: null,
      },
    },
  },

  'word-trend': {
    id: 'word-trend',
    lemma: 'trend',
    pos: 'noun',
    isNew: true,
    modeEntries: {
      social: {
        id: 'wme-trend-social',
        word_id: 'word-trend',
        mode_code: 'social',
        meaning_context:
          'A "trend" is something that is popular right now. Social media trends, fashion trends, or food trends — it\'s what everyone is talking about or doing.',
        register: 'informal',
        example_sentence: "Have you seen that trend on TikTok?",
        example_context: 'Discussing social media with friends',
        audio_id: null,
      },
    },
  },

  'word-binge': {
    id: 'word-binge',
    lemma: 'binge',
    pos: 'verb',
    isNew: true,
    modeEntries: {
      social: {
        id: 'wme-binge-social',
        word_id: 'word-binge',
        mode_code: 'social',
        meaning_context:
          '"Binge" means to watch, play, or consume a lot of something all at once. Binge-watching a show means watching many episodes back-to-back.',
        register: 'informal',
        example_sentence: "I binged the whole season last night!",
        example_context: 'Talking about a TV show with friends',
        audio_id: null,
      },
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Scenes — Mode-aware
// ─────────────────────────────────────────────────────────────────────────────

export const SCENES: Record<string, MockScene> = {
  'scene-cafe-survival': {
    id: 'scene-cafe-survival',
    title: 'Ordering at a Cafe',
    description: 'You are at a cozy cafe. The barista greets you and asks what you would like to order.',
    dialogueText:
      '"Good morning! What can I get for you today? We have a fresh brew and some seasonal specials."',
    modeCode: 'survival',
    newWords: [
      WORDS['word-brew'],
      WORDS['word-recommend'],
      WORDS['word-seasonal'],
      WORDS['word-fresh'],
      WORDS['word-order'],
    ],
    reviewWords: [WORDS['word-get'], WORDS['word-would-like']],
  },
  'scene-cafe-professional': {
    id: 'scene-cafe-professional',
    title: 'Coffee Meeting at the Office',
    description:
      'You are at a coffee meeting with a colleague. Discuss project plans over coffee and practice professional language.',
    dialogueText:
      '"Great to catch up! Shall we talk about the project while we grab our coffee?"',
    modeCode: 'professional',
    newWords: [
      WORDS['word-deadline'],
      WORDS['word-approach'],
      WORDS['word-handle'],
      WORDS['word-figure'],
      WORDS['word-point'],
    ],
    reviewWords: [WORDS['word-get'], WORDS['word-recommend']],
  },
  'scene-cafe-social': {
    id: 'scene-cafe-social',
    title: 'Coffee with Friends',
    description: 'You are meeting friends at a cafe. Casual chat, jokes, and relaxed conversation.',
    dialogueText: '"Hey! Over here! Grab a seat — I already got us a table."',
    modeCode: 'social',
    newWords: [WORDS['word-stuff'], WORDS['word-carry'], WORDS['word-spot'], WORDS['word-turn'], WORDS['word-stand']],
    reviewWords: [WORDS['word-get'], WORDS['word-fresh']],
  },
  'scene-doctor-survival': {
    id: 'scene-doctor-survival',
    title: 'At the Doctor',
    description: 'You are at a doctor appointment. Practice explaining how you feel and understanding instructions.',
    dialogueText: '"Hello, I am Dr. Kim. What brings you in today?"',
    modeCode: 'survival',
    newWords: [WORDS['word-appointment'], WORDS['word-charge'], WORDS['word-book'], WORDS['word-strike'], WORDS['word-pick']],
    reviewWords: [WORDS['word-take'], WORDS['word-run']],
  },

  // Professional track — Meeting scene
  'scene-meeting-professional': {
    id: 'scene-meeting-professional',
    title: 'Team Meeting at the Office',
    description: 'You are in a team meeting at work. Practice discussing project updates, giving opinions, and handling deadlines.',
    dialogueText: '"Good morning, everyone. Let\'s get started. I\'d like to hear an update on the project."',
    modeCode: 'professional',
    newWords: [WORDS['word-deadline'], WORDS['word-approach'], WORDS['word-handle'], WORDS['word-figure'], WORDS['word-point']],
    reviewWords: [WORDS['word-get'], WORDS['word-recommend']],
  },

  // Social track — Hanging Out scene
  'scene-hanging-out-social': {
    id: 'scene-hanging-out-social',
    title: 'Hanging Out with Friends',
    description: 'You are chilling with friends at someone\'s place. Casual conversation, jokes, and gaming talk.',
    dialogueText: '"Hey, come on in! We were just about to order some food. What are you in the mood for?"',
    modeCode: 'social',
    newWords: [WORDS['word-stuff'], WORDS['word-carry'], WORDS['word-spot'], WORDS['word-turn'], WORDS['word-stand']],
    reviewWords: [WORDS['word-get'], WORDS['word-fresh']],
  },

  // IELTS track — Exam Practice scene
  'scene-ielts-practice': {
    id: 'scene-ielts-practice',
    title: 'IELTS Speaking Practice',
    description: 'Practice your IELTS Speaking test. Answer formal questions about familiar topics, then speak at length on a given topic.',
    dialogueText: '"Good morning. My name is Alex, and I will be your examiner today. Let\'s begin with Part 1. Can you tell me about what you do?"',
    modeCode: 'ielts',
    newWords: [WORDS['word-approach'], WORDS['word-recommend'], WORDS['word-handle'], WORDS['word-point'], WORDS['word-figure']],
    reviewWords: [WORDS['word-get'], WORDS['word-take']],
  },

  // TOEIC track — Exam Practice scene
  'scene-toeic-practice': {
    id: 'scene-toeic-practice',
    title: 'TOEIC Speaking Practice',
    description: 'Practice your TOEIC Speaking test. Respond to questions about workplace situations and express your opinion clearly.',
    dialogueText: '"Hello. I would like to ask you a few questions about workplace scenarios. Please respond as clearly and completely as you can."',
    modeCode: 'toeic',
    newWords: [WORDS['word-approach'], WORDS['word-recommend'], WORDS['word-handle'], WORDS['word-deadline'], WORDS['word-point']],
    reviewWords: [WORDS['word-get'], WORDS['word-take']],
  },

  // ─── Sprint 6: Professional track expansion scenes ───

  'scene-email-followup-professional': {
    id: 'scene-email-followup-professional',
    title: 'Email Follow-up Conversation',
    description: 'You are following up on an email with a colleague. Practice professional language for checking in, clarifying points, and confirming next steps.',
    dialogueText: '"I got your email — thanks for sending that over. I had a few thoughts I wanted to share."',
    modeCode: 'professional',
    newWords: [WORDS['word-follow-up'], WORDS['word-feedback'], WORDS['word-contribute'], WORDS['word-summarize'], WORDS['word-point']],
    reviewWords: [WORDS['word-get'], WORDS['word-approach']],
  },

  'scene-performance-review-professional': {
    id: 'scene-performance-review-professional',
    title: 'Performance Review Discussion',
    description: 'You are in a performance review meeting with your manager. Practice discussing your achievements, receiving feedback, and setting goals.',
    dialogueText: '"Thanks for coming in. I would like to go over your progress this quarter and discuss where we can support your growth."',
    modeCode: 'professional',
    newWords: [WORDS['word-feedback'], WORDS['word-handle'], WORDS['word-figure'], WORDS['word-charge'], WORDS['word-point']],
    reviewWords: [WORDS['word-get'], WORDS['word-recommend']],
  },

  'scene-networking-conference-professional': {
    id: 'scene-networking-conference-professional',
    title: 'Networking at a Conference',
    description: 'You are at a professional conference. Practice introducing yourself, exchanging ideas, and building connections with new colleagues.',
    dialogueText: '"Hi there! I don\'t think we\'ve met — I\'m Alex from the product team. What brings you to the conference?"',
    modeCode: 'professional',
    newWords: [WORDS['word-network'], WORDS['word-approach'], WORDS['word-contribute'], WORDS['word-recommend'], WORDS['word-follow-up']],
    reviewWords: [WORDS['word-get'], WORDS['word-handle']],
  },

  // ─── Sprint 6: Social track expansion scenes ───

  'scene-gaming-social': {
    id: 'scene-gaming-social',
    title: 'Gaming Session Online',
    description: 'You are playing an online game with friends. Practice casual gaming language, callouts, and team coordination.',
    dialogueText: '"Yo, you online? We\'re starting a match in like two minutes — jump in!"',
    modeCode: 'social',
    newWords: [WORDS['word-carry'], WORDS['word-crash'], WORDS['word-vibe'], WORDS['word-run'], WORDS['word-figure']],
    reviewWords: [WORDS['word-get'], WORDS['word-stuff']],
  },

  'scene-movie-night-social': {
    id: 'scene-movie-night-social',
    title: 'Movie Night Discussion',
    description: 'You are discussing movies and shows with friends. Practice sharing opinions, recommending things, and reacting to spoilers.',
    dialogueText: '"Okay, what are we watching tonight? I vote for something I can binge."',
    modeCode: 'social',
    newWords: [WORDS['word-binge'], WORDS['word-spoiler'], WORDS['word-recommend'], WORDS['word-spot'], WORDS['word-turn']],
    reviewWords: [WORDS['word-get'], WORDS['word-fresh']],
  },

  'scene-social-media-social': {
    id: 'scene-social-media-social',
    title: 'Social Media Trends',
    description: 'You are chatting with friends about what is trending online. Practice casual language for sharing, reacting, and discussing internet culture.',
    dialogueText: '"Did you see that trend going around? It is everywhere right now."',
    modeCode: 'social',
    newWords: [WORDS['word-trend'], WORDS['word-vibe'], WORDS['word-stuff'], WORDS['word-stand'], WORDS['word-pick']],
    reviewWords: [WORDS['word-get'], WORDS['word-point']],
  },
};

// Scene selection by mood and mode
export function getSceneForMoodAndMode(mood: string, mode: ModeCode): MockScene {
  // Map mood and mode to the most appropriate scene.
  // Context-aware scene selection: work-related moods map to meeting scene for professional,
  // social moods map to hanging-out scene for social, etc.
  const moodSceneMap: Record<string, Record<ModeCode, string>> = {
    good: { survival: 'scene-cafe-survival', professional: 'scene-cafe-professional', social: 'scene-hanging-out-social', ielts: 'scene-ielts-practice', toeic: 'scene-toeic-practice' },
    okay: { survival: 'scene-cafe-survival', professional: 'scene-cafe-professional', social: 'scene-hanging-out-social', ielts: 'scene-ielts-practice', toeic: 'scene-toeic-practice' },
    rough: { survival: 'scene-doctor-survival', professional: 'scene-meeting-professional', social: 'scene-hanging-out-social', ielts: 'scene-ielts-practice', toeic: 'scene-toeic-practice' },
    busy: { survival: 'scene-cafe-survival', professional: 'scene-meeting-professional', social: 'scene-hanging-out-social', ielts: 'scene-ielts-practice', toeic: 'scene-toeic-practice' },
    focused: { survival: 'scene-cafe-survival', professional: 'scene-meeting-professional', social: 'scene-hanging-out-social', ielts: 'scene-ielts-practice', toeic: 'scene-toeic-practice' },
    email: { survival: 'scene-cafe-survival', professional: 'scene-email-followup-professional', social: 'scene-hanging-out-social', ielts: 'scene-ielts-practice', toeic: 'scene-toeic-practice' },
    review: { survival: 'scene-cafe-survival', professional: 'scene-performance-review-professional', social: 'scene-hanging-out-social', ielts: 'scene-ielts-practice', toeic: 'scene-toeic-practice' },
    conference: { survival: 'scene-cafe-survival', professional: 'scene-networking-conference-professional', social: 'scene-hanging-out-social', ielts: 'scene-ielts-practice', toeic: 'scene-toeic-practice' },
    gaming: { survival: 'scene-cafe-survival', professional: 'scene-meeting-professional', social: 'scene-gaming-social', ielts: 'scene-ielts-practice', toeic: 'scene-toeic-practice' },
    movie: { survival: 'scene-cafe-survival', professional: 'scene-meeting-professional', social: 'scene-movie-night-social', ielts: 'scene-ielts-practice', toeic: 'scene-toeic-practice' },
    trending: { survival: 'scene-cafe-survival', professional: 'scene-meeting-professional', social: 'scene-social-media-social', ielts: 'scene-ielts-practice', toeic: 'scene-toeic-practice' },
  };

  const lowerMood = mood.toLowerCase();
  // Also check the response text for context keywords
  const contextScene = getSceneFromResponseText(lowerMood, mode);
  if (contextScene) return contextScene;

  const sceneId = moodSceneMap[lowerMood]?.[mode] ?? 'scene-cafe-survival';
  return SCENES[sceneId] ?? SCENES['scene-cafe-survival'];
}

/**
 * Detect context from a free-form response string and return the best scene.
 * This enables context-aware scene selection when the user types or speaks
 * a response that contains context clues (e.g., "work was stressful" -> meeting).
 */
function getSceneFromResponseText(response: string, mode: ModeCode): MockScene | null {
  const workKeywords = ['work', 'office', 'meeting', 'boss', 'project', 'deadline', 'client', 'email', 'presentation'];
  const socialKeywords = ['friend', 'party', 'game', 'gaming', 'hang', 'movie', 'chill', 'fun', 'play'];
  const healthKeywords = ['doctor', 'sick', 'hospital', 'medicine', 'pain', 'headache', 'appointment'];
  const studyKeywords = ['study', 'test', 'exam', 'class', 'school', 'practice', 'homework'];
  const emailKeywords = ['email', 'follow up', 'followup', 'reply', 'send'];
  const reviewKeywords = ['review', 'feedback', 'performance', 'evaluation', 'assessment'];
  const conferenceKeywords = ['conference', 'networking', 'network', 'event', 'seminar'];
  const gamingKeywords = ['gaming', 'game', 'online', 'match', 'stream'];
  const movieKeywords = ['movie', 'show', 'netflix', 'watch', 'binge', 'episode'];
  const trendingKeywords = ['trend', 'tiktok', 'instagram', 'viral', 'social media', 'meme'];

  if (mode === 'professional' || mode === 'ielts' || mode === 'toeic') {
    if (emailKeywords.some((k) => response.includes(k))) {
      if (mode === 'ielts') return SCENES['scene-ielts-practice'] ?? null;
      if (mode === 'toeic') return SCENES['scene-toeic-practice'] ?? null;
      return SCENES['scene-email-followup-professional'] ?? null;
    }
    if (reviewKeywords.some((k) => response.includes(k))) {
      if (mode === 'ielts') return SCENES['scene-ielts-practice'] ?? null;
      if (mode === 'toeic') return SCENES['scene-toeic-practice'] ?? null;
      return SCENES['scene-performance-review-professional'] ?? null;
    }
    if (conferenceKeywords.some((k) => response.includes(k))) {
      if (mode === 'ielts') return SCENES['scene-ielts-practice'] ?? null;
      if (mode === 'toeic') return SCENES['scene-toeic-practice'] ?? null;
      return SCENES['scene-networking-conference-professional'] ?? null;
    }
    if (workKeywords.some((k) => response.includes(k))) {
      if (mode === 'ielts') return SCENES['scene-ielts-practice'] ?? null;
      if (mode === 'toeic') return SCENES['scene-toeic-practice'] ?? null;
      return SCENES['scene-meeting-professional'] ?? null;
    }
  }
  if (mode === 'social') {
    if (gamingKeywords.some((k) => response.includes(k))) {
      return SCENES['scene-gaming-social'] ?? null;
    }
    if (movieKeywords.some((k) => response.includes(k))) {
      return SCENES['scene-movie-night-social'] ?? null;
    }
    if (trendingKeywords.some((k) => response.includes(k))) {
      return SCENES['scene-social-media-social'] ?? null;
    }
    if (socialKeywords.some((k) => response.includes(k))) {
      return SCENES['scene-hanging-out-social'] ?? null;
    }
  }
  if (mode === 'survival') {
    if (healthKeywords.some((k) => response.includes(k))) {
      return SCENES['scene-doctor-survival'] ?? null;
    }
  }
  if (studyKeywords.some((k) => response.includes(k))) {
    if (mode === 'ielts') {
      return SCENES['scene-ielts-practice'] ?? null;
    }
    if (mode === 'toeic') {
      return SCENES['scene-toeic-practice'] ?? null;
    }
  }

  return null;
}

// Backwards compatibility
export const CAFE_SCENE = SCENES['scene-cafe-survival'];

export const SCENE_BY_MOOD: Record<string, MockScene> = {
  good: SCENES['scene-cafe-survival'],
  okay: SCENES['scene-cafe-survival'],
  rough: SCENES['scene-doctor-survival'],
  busy: SCENES['scene-cafe-survival'],
  'it was good': SCENES['scene-cafe-survival'],
  'pretty busy': SCENES['scene-cafe-survival'],
  'not great': SCENES['scene-doctor-survival'],
  default: SCENES['scene-cafe-survival'],
};

// ─────────────────────────────────────────────────────────────────────────────
// Conversation Scripts
// ─────────────────────────────────────────────────────────────────────────────

export interface ConversationBranch {
  matchPatterns: string[];
  npcText: string;
  hintLevel1: string;
  hintLevel2: string;
}

export interface ConversationStep {
  npcText: string;
  branches: ConversationBranch[];
  fallbackNpcText: string;
  hintLevel1: string;
  hintLevel2: string;
  reviewWordHint?: string;
}

export const CAFE_CONVERSATION: ConversationStep[] = [
  {
    npcText: 'Hi there! What can I get for you today?',
    branches: [
      {
        matchPatterns: ['would like', "i'd like", 'order', 'get', 'have'],
        npcText: 'Great choice! We have a fresh brew today. Would you like to hear about our seasonal specials too?',
        hintLevel1: 'Try: I would like...',
        hintLevel2: "Try saying: I'd like to order a coffee, please.",
      },
      {
        matchPatterns: ['recommend', 'suggest', 'what do you'],
        npcText: 'Our fresh brew is really popular! And we have a seasonal blend with cinnamon and orange. Want to try one of those?',
        hintLevel1: 'Try: Can you recommend...',
        hintLevel2: 'Try saying: Can you recommend something good today?',
      },
    ],
    fallbackNpcText: 'No worries! Our fresh brew is really popular. Would you like to try that?',
    hintLevel1: 'Try: I would like...',
    hintLevel2: "Try saying: I'd like to get a coffee, please.",
  },
  {
    npcText: 'So, would you like the fresh brew or something else?',
    branches: [
      {
        matchPatterns: ['fresh', 'brew', 'yes', 'sure'],
        npcText: 'One fresh brew coming up! You know, a lot of regulars order the seasonal blend too. It has a nice warm flavor. Want to add that?',
        hintLevel1: 'Try: I will try the...',
        hintLevel2: "Try saying: I'll try the fresh brew, please.",
      },
      {
        matchPatterns: ['seasonal', 'special', 'cinnamon', 'orange', 'blend'],
        npcText: 'Nice! The seasonal blend has cinnamon and orange notes. It is really warming for this time of year. Shall I make that for you?',
        hintLevel1: 'Try: I would like the...',
        hintLevel2: 'Try saying: I would like the seasonal blend, please.',
      },
    ],
    fallbackNpcText: 'How about I recommend the fresh brew? It is one of our best sellers.',
    hintLevel1: 'Try: The fresh brew sounds...',
    hintLevel2: 'Try saying: The fresh brew sounds great.',
  },
  {
    npcText: 'Since you mentioned you had a busy day, this is a nice spot to take a break. By the way, can I get you anything else? Maybe a pastry to go with that?',
    branches: [
      {
        matchPatterns: ['yes', 'sure', 'please', 'pastry', 'muffin', 'cake'],
        npcText: 'We have some fresh croissants today! I will add one to your order. Is there anything else you would like?',
        hintLevel1: 'Try: Yes, I would...',
        hintLevel2: 'Try saying: Yes, I would like a croissant, please.',
      },
      {
        matchPatterns: ['no', 'that', 'fine', 'good', 'thanks', 'okay'],
        npcText: 'All right! Your order will be ready in just a moment. It was really nice talking with you!',
        hintLevel1: 'Try: That sounds...',
        hintLevel2: 'Try saying: That sounds good, thank you.',
      },
    ],
    fallbackNpcText: 'No problem at all! Your drink will be ready shortly. It was great chatting with you!',
    hintLevel1: 'Try: No, that is...',
    hintLevel2: 'Try saying: No, that is all. Thank you!',
  },
  {
    npcText: 'Here is your order! Enjoy your drink and have a wonderful rest of your day. Come back anytime!',
    branches: [],
    fallbackNpcText: '',
    hintLevel1: 'Try: Thank you...',
    hintLevel2: 'Try saying: Thank you! Have a great day too.',
  },
];

export const PROFESSIONAL_CONVERSATION: ConversationStep[] = [
  {
    npcText: 'Great to see you! Before we dive in, how has your week been? Anything exciting happening?',
    branches: [
      {
        matchPatterns: ['busy', 'project', 'deadline', 'meeting', 'work'],
        npcText: 'I hear you. We have a deadline coming up on our end too. Speaking of which — did you get a chance to review the approach document I sent?',
        hintLevel1: 'Try: It has been busy...',
        hintLevel2: 'Try saying: It has been busy with the project deadline.',
      },
      {
        matchPatterns: ['good', 'great', 'fine', 'okay', 'well'],
        npcText: 'Glad to hear it! So, I wanted to handle a few things today. First — did you get my email about the deadline change?',
        hintLevel1: 'Try: It was good...',
        hintLevel2: 'Try saying: It was good! Ready to discuss the project.',
      },
    ],
    fallbackNpcText: 'No worries if you do not want to get into it! So, let me run you through the key points from the project update.',
    hintLevel1: 'Try: It was...',
    hintLevel2: 'Try saying: It was pretty good, thanks!',
    reviewWordHint: "You learned 'get' meaning 'to order' — here it means 'to understand or receive'!",
  },
  {
    npcText: 'So what do you think about the new approach? I figure we could handle the client side differently this time.',
    branches: [
      {
        matchPatterns: ['agree', 'think', 'approach', 'point', 'handle', 'yes'],
        npcText: 'Good point! I think we can handle this more efficiently. Let me take the lead on the client presentation — would that work?',
        hintLevel1: 'Try: I think the approach...',
        hintLevel2: 'Try saying: I think the new approach makes a good point about efficiency.',
      },
      {
        matchPatterns: ['deadline', 'time', 'rush', 'concern', 'worried'],
        npcText: 'Fair enough — the deadline is tight. But I figure if we handle it in phases, we can make it work. What do you think?',
        hintLevel1: 'Try: The deadline is...',
        hintLevel2: 'Try saying: The deadline is a concern, but the approach could work.',
      },
    ],
    fallbackNpcText: 'No worries if you need time to think it over. The main point is that we have a new deadline to meet.',
    hintLevel1: 'Try: I think...',
    hintLevel2: 'Try saying: I think we should approach this differently.',
  },
  {
    npcText: 'One last thing — can you take the lead on the follow-up report? The figures need to be ready by Thursday.',
    branches: [
      {
        matchPatterns: ['yes', 'sure', 'take', 'handle', 'will', 'can'],
        npcText: 'Excellent. I will get back to you with the latest figures by tomorrow. Great working with you on this!',
        hintLevel1: 'Try: Yes, I can...',
        hintLevel2: 'Try saying: Yes, I can handle the follow-up report.',
      },
      {
        matchPatterns: ['not sure', 'busy', 'need help', 'maybe'],
        npcText: 'No problem — I can take point on some of it. We will figure it out together.',
        hintLevel1: 'Try: I am not sure I can...',
        hintLevel2: 'Try saying: I might need some help with the deadline.',
      },
    ],
    fallbackNpcText: 'Take your time. If you need any figures or help, just let me know. We can handle this!',
    hintLevel1: 'Try: I can...',
    hintLevel2: 'Try saying: I can take care of the report by Thursday.',
  },
  {
    npcText: 'That was a productive meeting. Thanks for your time — I will send you the action items shortly.',
    branches: [],
    fallbackNpcText: '',
    hintLevel1: 'Try: Thank you...',
    hintLevel2: 'Try saying: Thanks! I will get back to you on those items.',
  },
];

export const SOCIAL_CONVERSATION: ConversationStep[] = [
  {
    npcText: "Hey, come on in! We were just about to order some food. What are you in the mood for?",
    branches: [
      {
        matchPatterns: ['pizza', 'burger', 'chinese', 'thai', 'mexican', 'sushi', 'food', 'eat', 'order', 'stuff'],
        npcText: "Nice, that sounds dope! Yeah, let's get some stuff ordered. You grab a spot on the couch — this place is a great spot to chill.",
        hintLevel1: 'Try: I feel like...',
        hintLevel2: "Try saying: I'm down for pizza. Let's order!",
      },
      {
        matchPatterns: ['not sure', 'whatever', 'anything', 'you pick', 'don care', 'no cap'],
        npcText: "No worries, I'll just order the usual — pizza and wings. You cool with that? By the way, nice spot on the couch!",
        hintLevel1: 'Try: Whatever you...',
        hintLevel2: "Try saying: Whatever you want is cool with me.",
      },
    ],
    fallbackNpcText: "No stress! I'll just order a bunch of stuff. We always get too much anyway. Grab a seat — this is a great spot!",
    hintLevel1: 'Try: I am in the mood for...',
    hintLevel2: "Try saying: I'm in the mood for pizza, I guess.",
    reviewWordHint: "You learned 'get' meaning 'to order' — here it means 'to understand or have'!",
  },
  {
    npcText: "So did you carry the team last night in the game? I heard you were absolutely carrying!",
    branches: [
      {
        matchPatterns: ['carry', 'carried', 'won', 'win', 'game', 'play', 'play'],
        npcText: "No cap, that was a wild game! I turned in early though — couldn't stand staying up another round. Anyway, want to run a quick game while we wait for food?",
        hintLevel1: 'Try: Yeah, I carried...',
        hintLevel2: "Try saying: Yeah, I carried the team last night!",
      },
      {
        matchPatterns: ['no', 'did not', 'lost', 'terrible', 'bad', 'rough'],
        npcText: "Aw, that's rough! No worries though, every game can't be a carry. Next time you'll turn it around. Hey, want to run a quick game while we wait for food?",
        hintLevel1: 'Try: No, it was...',
        hintLevel2: "Try saying: Nah, I didn't do great. But it was still fun!",
      },
    ],
    fallbackNpcText: "All good! Hey, want to run a quick game while we wait for the food? I figure we got time for a couple rounds.",
    hintLevel1: 'Try: Yeah, it was...',
    hintLevel2: "Try saying: Yeah, it was pretty fun!",
  },
  {
    npcText: "Hey, can you figure out how to connect the controller? I can't stand when this stuff doesn't work.",
    branches: [
      {
        matchPatterns: ['figure', 'figure out', 'try', 'sure', 'turn', 'button', 'connect'],
        npcText: "Awesome, thanks! While you do that, I'll grab the snacks. This is exactly the kind of stuff that makes hanging out fun, right?",
        hintLevel1: 'Try: I can figure out...',
        hintLevel2: "Try saying: Let me figure out how to connect it.",
      },
      {
        matchPatterns: ['no', 'can not', 'not sure', 'try', 'different'],
        npcText: "No worries, we can just use the phone instead. I can't stand when tech doesn't cooperate! Let me grab the snacks at least.",
        hintLevel1: 'Try: I am not sure...',
        hintLevel2: "Try saying: I'm not sure I can figure it out, but let me try.",
      },
    ],
    fallbackNpcText: "All good, we'll figure it out! Let me grab the snacks real quick.",
    hintLevel1: 'Try: Let me try...',
    hintLevel2: "Try saying: Let me try to figure it out.",
  },
  {
    npcText: "That was a great time! We should do this more often. Same spot next week?",
    branches: [],
    fallbackNpcText: '',
    hintLevel1: 'Try: Yeah, sounds...',
    hintLevel2: "Try saying: Yeah, that was fun! Same spot next week for sure.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// IELTS Conversation — Formal, structured, examiner tone
// ─────────────────────────────────────────────────────────────────────────────

export const IELTS_CONVERSATION: ConversationStep[] = [
  {
    npcText: 'Good morning. My name is Alex, and I will be your examiner today. Let us begin with Part 1. Can you tell me, what do you do — do you work or are you a student?',
    branches: [
      {
        matchPatterns: ['work', 'student', 'study', 'job', 'university', 'school', 'college', 'profession', 'career'],
        npcText: 'Thank you. What do you enjoy most about your work or studies? Please elaborate on your answer.',
        hintLevel1: 'Try: I enjoy most about my work/studies...',
        hintLevel2: 'Try saying: What I enjoy most about my work is the opportunity to approach problems from different perspectives.',
      },
      {
        matchPatterns: ['not sure', 'between', 'looking', 'searching'],
        npcText: 'I understand. Let me ask you about something else. What are your hobbies? What do you like to do in your free time?',
        hintLevel1: 'Try: I am currently...',
        hintLevel2: 'Try saying: I am currently between opportunities, but I enjoy reading and learning new approaches to problem-solving.',
      },
    ],
    fallbackNpcText: 'Thank you for sharing that. Let me ask you: what do you enjoy doing in your free time?',
    hintLevel1: 'Try: I work as a... / I am a student at...',
    hintLevel2: 'Try saying: I work as a software developer, and I find the work quite rewarding because it allows me to figure out creative solutions.',
  },
  {
    npcText: 'That is interesting. Now, let me ask you about something different. Can you describe a place you would like to visit? You should say: where it is, what you would like to do there, and why you would like to visit.',
    branches: [
      {
        matchPatterns: ['country', 'city', 'place', 'visit', 'travel', 'would like', 'because', 'enjoy', 'culture', 'history', 'experience'],
        npcText: 'That sounds like a wonderful place. Do you think you will actually go there in the future? Why or why not?',
        hintLevel1: 'Try: I would like to visit... because...',
        hintLevel2: 'Try saying: I would really like to visit Japan because I am fascinated by the culture and the approach to craftsmanship there.',
      },
    ],
    fallbackNpcText: 'Thank you for that. Let me ask you a follow-up question: do you think it is important for people to visit different places?',
    hintLevel1: 'Try: I would like to visit...',
    hintLevel2: 'Try saying: I would like to visit Italy because of the rich history and the approach to art and architecture.',
  },
  {
    npcText: 'Thank you. That is the end of the speaking practice. You handled the questions thoughtfully, and I appreciate your responses.',
    branches: [],
    fallbackNpcText: '',
    hintLevel1: 'Try: Thank you...',
    hintLevel2: 'Try saying: Thank you for the opportunity. I found the questions quite interesting to handle.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// TOEIC Conversation — Business English, structured opinion responses
// ─────────────────────────────────────────────────────────────────────────────

export const TOEIC_CONVERSATION: ConversationStep[] = [
  {
    npcText: 'Hello. I would like to ask you a few questions. First, imagine that a colleague has asked you about your experience at a recent conference. Please describe what you found most useful and whether you would recommend it to others.',
    branches: [
      {
        matchPatterns: ['recommend', 'useful', 'learned', 'found', 'because', 'approach', 'point', 'session', 'presentation', 'networking'],
        npcText: 'Thank you. Now, your company is considering a new approach to project management. A manager has asked for your opinion. Please explain whether you think this new approach would be beneficial.',
        hintLevel1: 'Try: I would recommend this conference because...',
        hintLevel2: 'Try saying: I would recommend the conference because the sessions on project management offered a new approach that I found very useful in my work.',
      },
    ],
    fallbackNpcText: 'Thank you. Now let me ask you another question. Your company is considering a new approach to project management. Do you think it would be beneficial?',
    hintLevel1: 'Try: I would recommend...',
    hintLevel2: 'Try saying: I would recommend it because the presentations made some excellent points about modern approaches to project management.',
  },
  {
    npcText: 'Thank you. Now please express your opinion on the following topic. Some people believe that employees should be required to attend regular training sessions. Others think professional development should be optional. What is your opinion? Please provide specific reasons.',
    branches: [
      {
        matchPatterns: ['think', 'believe', 'opinion', 'because', 'however', 'approach', 'point', 'beneficial', 'support', 'consider'],
        npcText: 'Thank you for sharing your perspective. That concludes the speaking portion of this practice session.',
        hintLevel1: 'Try: In my opinion, I think...',
        hintLevel2: 'Try saying: In my opinion, I believe professional development should be encouraged rather than required. My approach to this is that people learn better when they choose to participate.',
      },
    ],
    fallbackNpcText: 'Thank you. That concludes the speaking portion of this practice session.',
    hintLevel1: 'Try: I think that...',
    hintLevel2: 'Try saying: I think that professional development should be encouraged, not required. The main point is that people learn better when they handle their own growth approach.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Sprint 6: Professional track expansion conversations
// ─────────────────────────────────────────────────────────────────────────────

export const EMAIL_FOLLOWUP_CONVERSATION: ConversationStep[] = [
  {
    npcText: "I got your email — thanks for sending that over. I had a few thoughts I wanted to share. Did you have a chance to review the figures I attached?",
    branches: [
      {
        matchPatterns: ['yes', 'review', 'look', 'read', 'saw', 'check', 'figure'],
        npcText: "Great. I'd like to follow up on a couple of points. The data suggests we should adjust our approach. What do you think?",
        hintLevel1: 'Try: Yes, I reviewed...',
        hintLevel2: "Try saying: Yes, I reviewed the figures. They look clear.",
      },
      {
        matchPatterns: ['no', 'not yet', 'haven', 'busy', 'later'],
        npcText: "No problem — I can summarize the key points for you. I'd like to follow up on the deadline change and get your feedback. Does that work?",
        hintLevel1: 'Try: Not yet, but I will...',
        hintLevel2: "Try saying: I haven't had a chance yet, but I'll look at it today.",
      },
    ],
    fallbackNpcText: "No worries! Let me summarize the key takeaways. I'd like to follow up on the timeline and get your input.",
    hintLevel1: 'Try: I saw the...',
    hintLevel2: "Try saying: I saw the email but haven't reviewed the figures yet.",
  },
  {
    npcText: "I'd like to follow up on the timeline. Could you contribute any feedback on the revised schedule? The client is waiting on our response.",
    branches: [
      {
        matchPatterns: ['feedback', 'contribute', 'point', 'think', 'suggest', 'schedule', 'deadline'],
        npcText: "That's a good point. Let me summarize what we have so far — we'll follow up with the client by end of day. Can you handle the follow-up email?",
        hintLevel1: 'Try: I think the schedule...',
        hintLevel2: "Try saying: I think the schedule works, but I'd like to contribute a point about the deadline.",
      },
      {
        matchPatterns: ['need', 'time', 'more', 'discuss', 'tomorrow'],
        npcText: "Understood. I can summarize what we have so far and follow up with you tomorrow. The key point is that we need to respond by Friday.",
        hintLevel1: 'Try: I need more time...',
        hintLevel2: "Try saying: I'd like to contribute, but I need a bit more time to review.",
      },
    ],
    fallbackNpcText: "That's fine. Let me summarize the key points — I'll follow up with you once the client responds.",
    hintLevel1: 'Try: I can provide...',
    hintLevel2: "Try saying: I can provide feedback on the schedule by tomorrow.",
  },
  {
    npcText: "Let me summarize — we'll follow up with the client, you'll contribute your feedback by Thursday, and I'll handle the final report. Does that sound right?",
    branches: [
      {
        matchPatterns: ['yes', 'right', 'sounds', 'good', 'agree', 'perfect'],
        npcText: "Excellent. I'll follow up with you once the client responds. Thanks for handling this — I think our approach is solid.",
        hintLevel1: 'Try: Yes, that sounds...',
        hintLevel2: "Try saying: Yes, that sounds right. I'll contribute my feedback by Thursday.",
      },
    ],
    fallbackNpcText: "No worries — I'll follow up with you on the details. Thanks for your time!",
    hintLevel1: 'Try: That sounds...',
    hintLevel2: "Try saying: That sounds good. I'll get back to you soon.",
  },
];

export const PERFORMANCE_REVIEW_CONVERSATION: ConversationStep[] = [
  {
    npcText: "Thanks for coming in. I'd like to go over your progress this quarter and discuss where we can support your growth. How would you summarize your contributions?",
    branches: [
      {
        matchPatterns: ['project', 'handle', 'complete', 'finish', 'contribute', 'team', 'lead'],
        npcText: "I'd like to point out some specific areas. You handled the client project well, and your figures show real improvement. How do you feel about your approach to deadlines?",
        hintLevel1: 'Try: I handled...',
        hintLevel2: "Try saying: I handled the client project and contributed to the team's goals.",
      },
      {
        matchPatterns: ['learn', 'improve', 'challenge', 'figure', 'grow', 'develop'],
        npcText: "I appreciate the honesty. Let me share some feedback — you've shown great initiative, and I think we can figure out a plan to help you grow further. What areas would you like to focus on?",
        hintLevel1: 'Try: I learned...',
        hintLevel2: "Try saying: I've learned a lot this quarter, but I'd like to figure out how to improve my time management.",
      },
    ],
    fallbackNpcText: "That's a good start. Let me share some feedback from the team's perspective. You've been reliable, and I'd like to help you take on more responsibility.",
    hintLevel1: 'Try: I contributed by...',
    hintLevel2: "Try saying: I contributed by handling several projects and learning new skills.",
  },
  {
    npcText: "I'd like to give you some feedback. You've been strong on client communication, but I think you could take charge of more projects. How would you feel about leading the next one?",
    branches: [
      {
        matchPatterns: ['charge', 'lead', 'handle', 'yes', 'ready', 'would like', 'take'],
        npcText: "Excellent. I have confidence you can handle it. In terms of feedback, I'd also recommend you work on summarizing your points more concisely in meetings. Does that make sense?",
        hintLevel1: 'Try: I would like to...',
        hintLevel2: "Try saying: I would like to take charge of the next project. I'm ready for it.",
      },
      {
        matchPatterns: ['not sure', 'need', 'help', 'support', 'think', 'concern'],
        npcText: "That's fair. Let me handle the project overview, and you can take point on specific tasks. I figure this approach will help you build confidence. What do you think?",
        hintLevel1: 'Try: I might need...',
        hintLevel2: "Try saying: I think I'd like some support at first, but I can handle more over time.",
      },
    ],
    fallbackNpcText: "No pressure. I can handle the project overview while you figure out your comfort level. The key point is that we want you to grow.",
    hintLevel1: 'Try: I think I can...',
    hintLevel2: "Try saying: I think I can handle it with some guidance.",
  },
  {
    npcText: "To summarize — you've made good progress, and I'd like to see you take on more leadership. Let's follow up in two weeks to figure out your next steps. Sound good?",
    branches: [],
    fallbackNpcText: '',
    hintLevel1: 'Try: That sounds...',
    hintLevel2: "Try saying: That sounds great. I'd like to follow up on those next steps.",
  },
];

export const NETWORKING_CONFERENCE_CONVERSATION: ConversationStep[] = [
  {
    npcText: "Hi there! I don't think we've met — I'm Alex from the product team. What brings you to the conference?",
    branches: [
      {
        matchPatterns: ['learn', 'network', 'meet', 'connect', 'present', 'session', 'talk'],
        npcText: "That's great! I'm here to network as well. Let me recommend the session on product trends — it's a good one. What area do you work in?",
        hintLevel1: 'Try: I am here to...',
        hintLevel2: "Try saying: I'm here to network and learn about new approaches in the industry.",
      },
      {
        matchPatterns: ['first', 'time', 'new', 'colleague', 'company'],
        npcText: "Welcome! Conferences are a great way to connect with people. I'd like to recommend a few sessions that might be relevant to your work. What's your role?",
        hintLevel1: 'Try: It is my first...',
        hintLevel2: "Try saying: It's my first time here. I'd like to network and meet new colleagues.",
      },
    ],
    fallbackNpcText: "Nice to meet you! I'm sure you'll find some great sessions. I'd recommend checking out the networking lunch later.",
    hintLevel1: 'Try: I am...',
    hintLevel2: "Try saying: I'm here to network and learn about industry trends.",
  },
  {
    npcText: "I'd like to approach this from a different angle — what would you say is the biggest challenge in your field right now? I figure it would be great to contribute ideas together.",
    branches: [
      {
        matchPatterns: ['challenge', 'think', 'believe', 'point', 'approach', 'would say', 'handle'],
        npcText: "That's a thoughtful point. I think we could approach it collaboratively. Would you like to follow up after the conference? I'd like to connect on LinkedIn.",
        hintLevel1: 'Try: I think the challenge is...',
        hintLevel2: "Try saying: I think the biggest challenge is handling rapid changes. I'd like to hear your approach.",
      },
      {
        matchPatterns: ['not sure', 'hard', 'difficult', 'agree', 'interesting'],
        npcText: "Good insight. Let me share my perspective — I think the key is to approach these challenges with a clear plan. Would you like to follow up and discuss more?",
        hintLevel1: 'Try: I am not sure, but...',
        hintLevel2: "Try saying: I'm not sure about the biggest one, but I'd like to contribute ideas.",
      },
    ],
    fallbackNpcText: "That's an interesting question. I'd like to follow up with you on that — shall we exchange contact information?",
    hintLevel1: 'Try: I would say...',
    hintLevel2: "Try saying: I'd say the biggest challenge is keeping up with new trends.",
  },
  {
    npcText: "It was great connecting with you. Let me summarize — we should follow up after the conference and continue this conversation. I'll send you a connection request. It was a pleasure meeting you!",
    branches: [],
    fallbackNpcText: '',
    hintLevel1: 'Try: Great meeting you...',
    hintLevel2: "Try saying: Great meeting you! I'd like to follow up and continue our discussion.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Sprint 6: Social track expansion conversations
// ─────────────────────────────────────────────────────────────────────────────

export const GAMING_CONVERSATION: ConversationStep[] = [
  {
    npcText: "Yo, you online? We're starting a match in like two minutes — jump in!",
    branches: [
      {
        matchPatterns: ['yeah', 'ready', 'let', 'go', 'join', 'down', 'online', 'in'],
        npcText: "Let's go! Pick your character — I'll carry if we need it, but the vibe's chill tonight. No pressure!",
        hintLevel1: 'Try: Yeah, I am...',
        hintLevel2: "Try saying: Yeah, I'm in! Let's do this.",
      },
      {
        matchPatterns: ['no', 'later', 'busy', 'can not', 'not now', 'maybe', 'one sec'],
        npcText: "All good, no rush! We'll probably be on for a while. Hit me up when you're free and I'll figure out what lobby we're in.",
        hintLevel1: 'Try: Maybe later...',
        hintLevel2: "Try saying: I can't right now, but maybe in a bit!",
      },
    ],
    fallbackNpcText: "No worries, take your time! We'll be here. The vibe tonight is super chill.",
    hintLevel1: 'Try: I am...',
    hintLevel2: "Try saying: I'm down! Let me jump in.",
  },
  {
    npcText: "Dude, that last round was wild! You totally carried the team. What happened on that last play?",
    branches: [
      {
        matchPatterns: ['carry', 'carried', 'won', 'play', 'run', 'clutch', 'figured'],
        npcText: "No cap, that was clutch! I crashed out early though — couldn't stand that final push. You figured out the strategy though, nice!",
        hintLevel1: 'Try: I carried by...',
        hintLevel2: "Try saying: I carried by figuring out their strategy!",
      },
      {
        matchPatterns: ['no', 'lucky', 'almost', 'close', 'barely', 'not really'],
        npcText: "Nah, you're being too humble! That play was sick. Anyway, the next round's about to start — you running the same character?",
        hintLevel1: 'Try: It was just...',
        hintLevel2: "Try saying: Honestly, I just got lucky! But it was fun.",
      },
    ],
    fallbackNpcText: "Either way, that was a vibe! Ready for the next round?",
    hintLevel1: 'Try: It was...',
    hintLevel2: "Try saying: It was pretty wild! I figured out their pattern.",
  },
  {
    npcText: "Hey, the game's about to crash — servers have been running so stuff this week. Wanna run another one or take a break?",
    branches: [
      {
        matchPatterns: ['another', 'run', 'play', 'one more', 'break', 'chill', 'stuff'],
        npcText: "Let's run one more! I can't stand when the servers are like this, but the vibe's still good. Good game though!",
        hintLevel1: 'Try: Let\'s run...',
        hintLevel2: "Try saying: Let's run one more before we crash for the night!",
      },
    ],
    fallbackNpcText: "All good either way! That was fun stuff. Same time tomorrow?",
    hintLevel1: 'Try: Let\'s...',
    hintLevel2: "Try saying: Let's take a break. This stuff is crashing anyway!",
  },
];

export const MOVIE_NIGHT_CONVERSATION: ConversationStep[] = [
  {
    npcText: "Okay, what are we watching tonight? I vote for something I can binge — any suggestions?",
    branches: [
      {
        matchPatterns: ['recommend', 'how about', 'watch', 'movie', 'show', 'series', 'action', 'comedy', 'drama'],
        npcText: "Ooh, that's a solid pick! But no spoilers — I haven't seen the ending yet. You want to binge it or just one episode?",
        hintLevel1: 'Try: How about...',
        hintLevel2: "Try saying: How about that new action series? I'd recommend it!",
      },
      {
        matchPatterns: ['no', 'whatever', 'you pick', 'anything', 'don', 'mind'],
        npcText: "No worries, I'll pick! There's this trending show everyone's been binge-watching. You cool with that?",
        hintLevel1: 'Try: Whatever you...',
        hintLevel2: "Try saying: I don't mind — whatever you want to watch is cool!",
      },
    ],
    fallbackNpcText: "We'll figure it out! There's always something good to binge. Any genre you're feeling?",
    hintLevel1: 'Try: I feel like...',
    hintLevel2: "Try saying: I feel like something funny. What do you recommend?",
  },
  {
    npcText: "Wait, turn around — there's a spoiler alert! Don't tell me what happens! Okay, let me just hit play... what's your favorite part so far?",
    branches: [
      {
        matchPatterns: ['favorite', 'part', 'scene', 'character', 'moment', 'love', 'best'],
        npcText: "Right?! The vibe of this show is so good. Oh, this is the spot where it gets really good — you're gonna love what happens next. No spoilers though!",
        hintLevel1: 'Try: My favorite part is...',
        hintLevel2: "Try saying: My favorite part is when the main character figures out the mystery.",
      },
      {
        matchPatterns: ['haven', 'just', 'started', 'beginning', 'first', 'new'],
        npcText: "Oh, you're in for such a treat! The first season is spot on. Trust me, it only gets better. Just wait until you see what happens!",
        hintLevel1: 'Try: I just started...',
        hintLevel2: "Try saying: I just started, so no spoilers please!",
      },
    ],
    fallbackNpcText: "This show has such a great vibe. You're going to love it!",
    hintLevel1: 'Try: I like...',
    hintLevel2: "Try saying: I love the characters so far. It's a great pick!",
  },
  {
    npcText: "That was so good! I can't believe that ending. You want to watch another episode or is it time to call it a night? Same spot tomorrow?",
    branches: [],
    fallbackNpcText: '',
    hintLevel1: 'Try: Yeah, let\'s...',
    hintLevel2: "Try saying: Yeah, same spot tomorrow! That was a great binge.",
  },
];

export const SOCIAL_MEDIA_CONVERSATION: ConversationStep[] = [
  {
    npcText: "Did you see that trend going around? It is everywhere right now. What do you think about it?",
    branches: [
      {
        matchPatterns: ['trend', 'viral', 'funny', 'cool', 'weird', 'seen', 'yes', 'yeah'],
        npcText: "Right?! The vibe of that stuff is so random. I can't stand some of the takes though — people pick the weirdest things to trend. You got a favorite one?",
        hintLevel1: 'Try: Yeah, I saw...',
        hintLevel2: "Try saying: Yeah, I saw that trend! Some of it is pretty funny.",
      },
      {
        matchPatterns: ['no', 'miss', 'haven', 'what', 'tell', 'don'],
        npcText: "Oh, you've got to check it out! I'll send you the link — it's this stuff that's been trending all week. Pick any one and you'll see why people can't stand scrolling past it.",
        hintLevel1: 'Try: No, I haven\'t...',
        hintLevel2: "Try saying: No, I haven't seen it. What's the trend about?",
      },
    ],
    fallbackNpcText: "It's all over social media right now. You'll spot it eventually!",
    hintLevel1: 'Try: I think...',
    hintLevel2: "Try saying: I think trends can be pretty funny sometimes!",
  },
  {
    npcText: "Okay but what about that other stuff going around? Some people are obsessed and others can't stand it. Where do you land?",
    branches: [
      {
        matchPatterns: ['love', 'like', 'into', 'vibe', 'cool', 'fun', 'good'],
        npcText: "I get that! The vibe is definitely unique. I figured you'd pick that side. What's the next trend you think will blow up?",
        hintLevel1: 'Try: I actually like...',
        hintLevel2: "Try saying: I actually like it — the vibe is different and fun.",
      },
      {
        matchPatterns: ['hate', 'stand', 'can\'t', 'not', 'over', 'annoying', 'much'],
        npcText: "Valid! Some of that stuff is so over the top. I can't stand the cringy ones either. But it's still fun to spot what picks up traction, right?",
        hintLevel1: 'Try: I can\'t stand...',
        hintLevel2: "Try saying: I can't stand some of it, but a few picks are okay.",
      },
    ],
    fallbackNpcText: "Fair point! Trends come and go — it's all about what you pick up along the way.",
    hintLevel1: 'Try: I think it\'s...',
    hintLevel2: "Try saying: I think it depends on the trend. Some stuff is great, some I can't stand.",
  },
  {
    npcText: "Anyway, we should pick something to watch later. I'll figure out what's trending on streaming. Same time tomorrow?",
    branches: [],
    fallbackNpcText: '',
    hintLevel1: 'Try: Sounds good...',
    hintLevel2: "Try saying: Sounds good! Same time tomorrow for sure.",
  },
];