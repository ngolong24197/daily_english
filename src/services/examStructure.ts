/**
 * Exam Structure Service — Defines IELTS and TOEIC speaking test formats.
 *
 * IELTS Speaking has 3 parts; TOEIC Speaking has question groups.
 * For Sprint 5, we implement IELTS Parts 1 & 2 and TOEIC Questions 5-9.
 * Part 3 / stretch items are included as data but not yet wired into flow.
 */

import type { ModeCode } from '../types';

// ─── IELTS Speaking Test ─────────────────────────────────────────────────────

export type IELTSPartNumber = 1 | 2 | 3;

export interface IELTSPart {
  partNumber: IELTSPartNumber;
  title: string;
  description: string;
  /** Duration in seconds for the entire part */
  durationSeconds: number;
  /** For Part 2: preparation time in seconds before speaking */
  prepTimeSeconds?: number;
  /** For Part 2: speaking time in seconds */
  speakingTimeSeconds?: number;
  prompts: IELTSPrompt[];
}

export interface IELTSPrompt {
  id: string;
  partNumber: IELTSPartNumber;
  /** The question or topic card text */
  text: string;
  /** For Part 2: bullet points on the cue card */
  bulletPoints?: string[];
  /** Follow-up questions the examiner might ask */
  followUpQuestions?: string[];
  /** Suggested vocabulary / target words */
  targetWords?: string[];
  /** Register expectation */
  register: 'neutral' | 'formal';
}

export const IELTS_PARTS: IELTSPart[] = [
  {
    partNumber: 1,
    title: 'Introduction & Interview',
    description: 'The examiner asks you general questions about yourself and familiar topics. Answer naturally — there are no wrong answers.',
    durationSeconds: 270, // 4-5 minutes
    prompts: [
      {
        id: 'ielts-p1-work',
        partNumber: 1,
        text: 'Let\'s talk about what you do. Do you work or are you a student?',
        followUpQuestions: [
          'What do you like most about your work or studies?',
          'Is there anything you would like to change about your work or studies?',
        ],
        targetWords: ['approach', 'deadline', 'handle', 'figure', 'point'],
        register: 'neutral',
      },
      {
        id: 'ielts-p1-home',
        partNumber: 1,
        text: 'Let\'s talk about where you live. Can you describe your home?',
        followUpQuestions: [
          'What do you like most about your home?',
          'Is there anything you would like to change about your home?',
        ],
        targetWords: ['spot', 'carry', 'fresh', 'book', 'stand'],
        register: 'neutral',
      },
      {
        id: 'ielts-p1-hobbies',
        partNumber: 1,
        text: 'Do you have any hobbies or interests? What do you enjoy doing in your free time?',
        followUpQuestions: [
          'How did you become interested in that?',
          'Do you prefer to spend your free time alone or with others?',
        ],
        targetWords: ['get', 'run', 'pick', 'turn', 'stuff'],
        register: 'neutral',
      },
      {
        id: 'ielts-p1-food',
        partNumber: 1,
        text: 'Let\'s talk about food. What kind of food do you enjoy?',
        followUpQuestions: [
          'Do you prefer cooking at home or eating out?',
          'Has your taste in food changed over the years?',
        ],
        targetWords: ['recommend', 'order', 'seasonal', 'fresh', 'brew'],
        register: 'neutral',
      },
      {
        id: 'ielts-p1-travel',
        partNumber: 1,
        text: 'Do you like travelling? Where would you like to go that you haven\'t been?',
        followUpQuestions: [
          'What do you enjoy most about travelling?',
          'Do you prefer travelling alone or with others?',
        ],
        targetWords: ['approach', 'get', 'point', 'carry', 'turn'],
        register: 'neutral',
      },
    ],
  },
  {
    partNumber: 2,
    title: 'Individual Long Turn',
    description: 'You will receive a topic card with a question and bullet points. You have 1 minute to prepare, then you should speak for 1-2 minutes.',
    durationSeconds: 180, // 1 min prep + 2 min speaking
    prepTimeSeconds: 60,
    speakingTimeSeconds: 120,
    prompts: [
      {
        id: 'ielts-p2-describe-place',
        partNumber: 2,
        text: 'Describe a place you would like to visit.',
        bulletPoints: [
          'Where this place is',
          'What you would like to do there',
          'Why you would like to visit this place',
          'And say whether you think you will go there in the future',
        ],
        followUpQuestions: [
          'Do you think it is important to visit different places?',
        ],
        targetWords: ['approach', 'recommend', 'spot', 'figure', 'carry'],
        register: 'formal',
      },
      {
        id: 'ielts-p2-describe-challenge',
        partNumber: 2,
        text: 'Describe a challenge you have faced.',
        bulletPoints: [
          'What the challenge was',
          'When you faced it',
          'How you dealt with it',
          'And say what you learned from the experience',
        ],
        followUpQuestions: [
          'Do you think challenges help people grow?',
        ],
        targetWords: ['handle', 'approach', 'figure', 'point', 'run'],
        register: 'formal',
      },
      {
        id: 'ielts-p2-describe-skill',
        partNumber: 2,
        text: 'Describe a skill you would like to learn.',
        bulletPoints: [
          'What the skill is',
          'How you would learn it',
          'How long it would take to learn',
          'And explain why you want to learn this skill',
        ],
        followUpQuestions: [
          'Do you think it is better to learn skills alone or with a teacher?',
        ],
        targetWords: ['approach', 'point', 'pick', 'get', 'stand'],
        register: 'formal',
      },
    ],
  },
  {
    partNumber: 3,
    title: 'Two-way Discussion',
    description: 'The examiner will ask you more abstract questions related to the Part 2 topic. Express your opinions and give reasons.',
    durationSeconds: 300, // 4-5 minutes
    prompts: [
      {
        id: 'ielts-p3-travel',
        partNumber: 3,
        text: 'How important is it for people to learn about other cultures?',
        followUpQuestions: [
          'Do you think technology has made the world smaller?',
          'What are the benefits and drawbacks of international travel?',
        ],
        targetWords: ['approach', 'point', 'handle', 'figure', 'carry'],
        register: 'formal',
      },
      {
        id: 'ielts-p3-challenges',
        partNumber: 3,
        text: 'Do you think young people face more challenges today than in the past?',
        followUpQuestions: [
          'How can society better support people facing difficulties?',
          'Do you think a positive attitude can help overcome challenges?',
        ],
        targetWords: ['handle', 'approach', 'point', 'run', 'figure'],
        register: 'formal',
      },
      {
        id: 'ielts-p3-learning',
        partNumber: 3,
        text: 'Some people believe practical skills are more important than academic knowledge. What is your opinion?',
        followUpQuestions: [
          'How has technology changed the way people learn?',
          'Should schools focus more on practical skills?',
        ],
        targetWords: ['approach', 'point', 'figure', 'handle', 'pick'],
        register: 'formal',
      },
    ],
  },
];

// ─── TOEIC Speaking Test ─────────────────────────────────────────────────────

export type TOEICQuestionType = 'read-aloud' | 'describe-picture' | 'respond' | 'opinion';

export interface TOEICQuestion {
  id: string;
  questionNumber: number;
  type: TOEICQuestionType;
  /** The instruction or prompt text */
  text: string;
  /** For read-aloud: the text to read */
  passage?: string;
  /** For describe-picture: description of what the image shows */
  pictureDescription?: string;
  /** For respond/opinion: the question to answer */
  question?: string;
  /** Time allowed for preparation in seconds */
  prepTimeSeconds: number;
  /** Time allowed for response in seconds */
  responseTimeSeconds: number;
  /** Target vocabulary */
  targetWords?: string[];
  /** Register expectation */
  register: 'formal' | 'neutral';
}

export const TOEIC_QUESTIONS: TOEICQuestion[] = [
  // Questions 1-2: Read a text aloud (stretch goal for Sprint 5)
  {
    id: 'toeic-q1-read',
    questionNumber: 1,
    type: 'read-aloud',
    text: 'Read the following passage aloud.',
    passage: 'Welcome to the Grandview Conference Center. Our facility offers state-of-the-art meeting rooms, a fully equipped business center, and complimentary Wi-Fi throughout the building. Please approach the front desk if you need any assistance during your visit.',
    prepTimeSeconds: 45,
    responseTimeSeconds: 45,
    targetWords: ['approach', 'recommend', 'point', 'handle', 'figure'],
    register: 'formal',
  },
  {
    id: 'toeic-q2-read',
    questionNumber: 2,
    type: 'read-aloud',
    text: 'Read the following passage aloud.',
    passage: 'The deadline for project submissions has been extended to Friday, November 15th. All team members are expected to handle their assigned tasks and carry out the necessary reviews before the final presentation. Please contact your project manager if you have any questions.',
    prepTimeSeconds: 45,
    responseTimeSeconds: 45,
    targetWords: ['deadline', 'handle', 'carry', 'point', 'run'],
    register: 'formal',
  },

  // Questions 3-4: Describe a picture (stretch goal for Sprint 5)
  {
    id: 'toeic-q3-picture',
    questionNumber: 3,
    type: 'describe-picture',
    text: 'Describe the picture in as much detail as you can.',
    pictureDescription: 'A modern office lobby with a receptionist at the front desk. Several people are standing in small groups talking. There is a large sign on the wall that says "Welcome to Nexus Corporation." A person is carrying a briefcase toward the elevator.',
    prepTimeSeconds: 45,
    responseTimeSeconds: 30,
    targetWords: ['carry', 'point', 'stand', 'get', 'figure'],
    register: 'neutral',
  },
  {
    id: 'toeic-q4-picture',
    questionNumber: 4,
    type: 'describe-picture',
    text: 'Describe the picture in as much detail as you can.',
    pictureDescription: 'A restaurant kitchen where two chefs are preparing food. One chef is chopping vegetables while the other is checking a recipe on a tablet. There are fresh ingredients on the counter and a seasonal menu board on the wall.',
    prepTimeSeconds: 45,
    responseTimeSeconds: 30,
    targetWords: ['fresh', 'seasonal', 'recommend', 'order', 'run'],
    register: 'neutral',
  },

  // Questions 5-7: Respond to questions (Sprint 5 focus)
  {
    id: 'toeic-q5-respond',
    questionNumber: 5,
    type: 'respond',
    text: 'Respond to the following question.',
    question: 'Imagine that a colleague has asked you about your experience at a recent conference. Please describe what you found most useful about the conference and whether you would recommend it to others.',
    prepTimeSeconds: 3,
    responseTimeSeconds: 15,
    targetWords: ['recommend', 'point', 'approach', 'figure', 'handle'],
    register: 'formal',
  },
  {
    id: 'toeic-q6-respond',
    questionNumber: 6,
    type: 'respond',
    text: 'Respond to the following question.',
    question: 'Your company is considering a new approach to project management. A manager has asked for your opinion. Please explain whether you think this new approach would be beneficial and provide specific reasons.',
    prepTimeSeconds: 3,
    responseTimeSeconds: 15,
    targetWords: ['approach', 'point', 'handle', 'figure', 'run'],
    register: 'formal',
  },
  {
    id: 'toeic-q7-respond',
    questionNumber: 7,
    type: 'respond',
    text: 'Respond to the following question.',
    question: 'A friend is planning to visit your city for the first time. They have asked you for recommendations. Please suggest places they should visit and explain why those places are worth seeing.',
    prepTimeSeconds: 3,
    responseTimeSeconds: 15,
    targetWords: ['recommend', 'spot', 'point', 'carry', 'pick'],
    register: 'neutral',
  },

  // Questions 8-9: Express an opinion (Sprint 5 focus)
  {
    id: 'toeic-q8-opinion',
    questionNumber: 8,
    type: 'opinion',
    text: 'Express your opinion on the following topic.',
    question: 'Some people believe that employees should be required to attend regular training sessions to improve their skills. Others think that professional development should be optional. What is your opinion? Please provide specific reasons and examples.',
    prepTimeSeconds: 15,
    responseTimeSeconds: 60,
    targetWords: ['approach', 'point', 'handle', 'figure', 'run'],
    register: 'formal',
  },
  {
    id: 'toeic-q9-opinion',
    questionNumber: 9,
    type: 'opinion',
    text: 'Express your opinion on the following topic.',
    question: 'Do you think it is better for people to work in teams or independently? Please explain your view and give reasons for your answer.',
    prepTimeSeconds: 15,
    responseTimeSeconds: 60,
    targetWords: ['handle', 'point', 'carry', 'approach', 'figure'],
    register: 'formal',
  },
];

// ─── Exam Session State ───────────────────────────────────────────────────────

export interface ExamSessionState {
  /** Which exam type: IELTS or TOEIC */
  examType: 'ielts' | 'toeic';
  /** Current part number (IELTS) or question number (TOEIC) */
  currentStepIndex: number;
  /** Total steps in this exam session */
  totalSteps: number;
  /** Current phase: 'prep' (preparing answer) or 'speak' (speaking answer) or 'transition' */
  phase: 'prep' | 'speak' | 'transition' | 'complete';
  /** Remaining time in seconds for the current phase */
  remainingSeconds: number;
  /** The prompt/question for the current step */
  currentPrompt: IELTSPrompt | TOEICQuestion | null;
  /** Whether the exam is in timed mode (real exam) or practice mode (untimed) */
  isTimed: boolean;
  /** Timer duration: 'untimed' | 120 (2 min) | 240 (4 min) — configurable for IELTS Part 2 */
  timerDuration: 'untimed' | 120 | 240;
  /** All user responses so far */
  responses: ExamResponse[];
  /** Whether the session has been completed */
  isComplete: boolean;
}

export interface ExamResponse {
  stepIndex: number;
  promptId: string;
  /** The user's transcribed response */
  text: string;
  /** How long the user spoke in seconds */
  durationSeconds: number;
  /** Timestamp */
  timestamp: number;
}

// ─── Helper Functions ──────────────────────────────────────────────────────────

/**
 * Get the IELTS prompts for a specific part.
 */
export function getIELTSPrompts(partNumber: IELTSPartNumber): IELTSPrompt[] {
  return IELTS_PARTS.find((p) => p.partNumber === partNumber)?.prompts ?? [];
}

/**
 * Get a random IELTS prompt for a given part.
 */
export function getRandomIELTSPrompt(partNumber: IELTSPartNumber): IELTSPrompt {
  const prompts = getIELTSPrompts(partNumber);
  return prompts[Math.floor(Math.random() * prompts.length)];
}

/**
 * Get TOEIC questions of a specific type.
 */
export function getTOEICQuestionsByType(type: TOEICQuestionType): TOEICQuestion[] {
  return TOEIC_QUESTIONS.filter((q) => q.type === type);
}

/**
 * Get the TOEIC questions for a Sprint 5 practice session
 * (Questions 5-9: respond + opinion types)
 */
export function getTOEICPracticeQuestions(): TOEICQuestion[] {
  return TOEIC_QUESTIONS.filter((q) => q.type === 'respond' || q.type === 'opinion');
}

/**
 * Create an initial exam session state.
 */
export function createExamSession(
  examType: 'ielts' | 'toeic',
  options?: { isTimed?: boolean; timerDuration?: 'untimed' | 120 | 240 }
): ExamSessionState {
  const isTimed = options?.isTimed ?? true;
  const timerDuration = options?.timerDuration ?? 120;

  if (examType === 'ielts') {
    // IELTS: Part 1 and Part 2 for Sprint 5
    const prompts = [
      ...IELTS_PARTS.filter((p) => p.partNumber <= 2).flatMap((p) =>
        p.prompts.map((prompt, idx) => ({
          part: p,
          prompt,
          indexInPart: idx,
        }))
      ),
    ];
    // Select one random prompt per part
    const part1Prompt = getRandomIELTSPrompt(1);
    const part2Prompt = getRandomIELTSPrompt(2);
    const steps = [
      { prompt: part1Prompt, phase: 'speak' as const },
      { prompt: part2Prompt, phase: 'prep' as const },
    ];

    const currentPrompt = steps[0].prompt;
    const currentPart = IELTS_PARTS.find((p) => p.partNumber === (currentPrompt as IELTSPrompt).partNumber);

    return {
      examType: 'ielts',
      currentStepIndex: 0,
      totalSteps: steps.length,
      phase: 'speak',
      remainingSeconds: currentPart?.durationSeconds ?? 270,
      currentPrompt,
      isTimed,
      timerDuration,
      responses: [],
      isComplete: false,
    };
  }

  // TOEIC: Questions 5-9 for Sprint 5
  const questions = getTOEICPracticeQuestions();
  const currentPrompt = questions[0];

  return {
    examType: 'toeic',
    currentStepIndex: 0,
    totalSteps: questions.length,
    phase: 'prep',
    remainingSeconds: currentPrompt?.prepTimeSeconds ?? 3,
    currentPrompt,
    isTimed,
    timerDuration,
    responses: [],
    isComplete: false,
  };
}

/**
 * Advance to the next step in the exam.
 */
export function advanceExamStep(
  state: ExamSessionState,
  userResponse: string
): ExamSessionState {
  const response: ExamResponse = {
    stepIndex: state.currentStepIndex,
    promptId: state.currentPrompt?.id ?? '',
    text: userResponse,
    durationSeconds: 0, // Will be filled by timer
    timestamp: Date.now(),
  };

  const newResponses = [...state.responses, response];
  const nextStepIndex = state.currentStepIndex + 1;

  if (state.examType === 'ielts') {
    const allSteps: IELTSPrompt[] = [
      getRandomIELTSPrompt(1),
      getRandomIELTSPrompt(2),
    ];

    if (nextStepIndex >= allSteps.length) {
      return {
        ...state,
        responses: newResponses,
        isComplete: true,
        phase: 'complete',
      };
    }

    const nextPrompt = allSteps[nextStepIndex];
    const nextPart = IELTS_PARTS.find((p) => p.partNumber === nextPrompt.partNumber);

    if (nextPrompt.partNumber === 2) {
      return {
        ...state,
        currentStepIndex: nextStepIndex,
        currentPrompt: nextPrompt,
        phase: 'prep',
        remainingSeconds: nextPart?.prepTimeSeconds ?? 60,
        responses: newResponses,
      };
    }

    return {
      ...state,
      currentStepIndex: nextStepIndex,
      currentPrompt: nextPrompt,
      phase: 'speak',
      remainingSeconds: nextPart?.durationSeconds ?? 270,
      responses: newResponses,
    };
  }

  // TOEIC
  const questions = getTOEICPracticeQuestions();

  if (nextStepIndex >= questions.length) {
    return {
      ...state,
      responses: newResponses,
      isComplete: true,
      phase: 'complete',
    };
  }

  const nextQuestion = questions[nextStepIndex];
  return {
    ...state,
    currentStepIndex: nextStepIndex,
    currentPrompt: nextQuestion,
    phase: 'prep',
    remainingSeconds: nextQuestion.prepTimeSeconds,
    responses: newResponses,
  };
}

/**
 * Transition from prep phase to speak phase.
 */
export function transitionToSpeakPhase(state: ExamSessionState): ExamSessionState {
  if (state.examType === 'ielts') {
    const prompt = state.currentPrompt as IELTSPrompt;
    const part = IELTS_PARTS.find((p) => p.partNumber === prompt.partNumber);

    if (prompt.partNumber === 2) {
      return {
        ...state,
        phase: 'speak',
        remainingSeconds: part?.speakingTimeSeconds ?? 120,
      };
    }
    return {
      ...state,
      phase: 'speak',
      remainingSeconds: part?.durationSeconds ?? 270,
    };
  }

  // TOEIC
  const question = state.currentPrompt as TOEICQuestion;
  return {
    ...state,
    phase: 'speak',
    remainingSeconds: question.responseTimeSeconds,
  };
}

/**
 * Get the transition message between parts/questions.
 */
export function getExamTransitionMessage(examType: 'ielts' | 'toeic', stepIndex: number): string {
  if (examType === 'ielts') {
    if (stepIndex === 0) {
      return 'Let\'s begin with Part 1. The examiner will ask you some general questions about yourself.';
    }
    if (stepIndex === 1) {
      return 'Now let\'s move to Part 2. You will receive a topic card. You have 1 minute to prepare, then speak for 1-2 minutes.';
    }
    return 'Let\'s continue to the next part.';
  }

  return `Question ${stepIndex + 5} of 9. Take a moment to prepare your response.`;
}

/**
 * Get exam-specific conversation prompts for structured practice.
 * These replace the casual conversation when in exam mode.
 */
export function getExamConversationSteps(
  examType: 'ielts' | 'toeic'
): import('./mockData').ConversationStep[] {
  if (examType === 'ielts') {
    return [
      {
        npcText: 'Good morning. My name is Alex, and I will be your examiner today. Can you tell me, what do you do — do you work or are you a student?',
        branches: [
          {
            matchPatterns: ['work', 'student', 'study', 'job', 'university', 'school', 'college'],
            npcText: 'Thank you. And what do you enjoy most about your work or studies?',
            hintLevel1: 'Try: I work as a... / I am a student at...',
            hintLevel2: 'Try saying: I currently work as a software developer, and I enjoy the problem-solving aspect of it.',
          },
          {
            matchPatterns: ['not sure', 'between', 'looking'],
            npcText: 'I understand. Let me ask you about your hobbies instead. What do you enjoy doing in your free time?',
            hintLevel1: 'Try: I am currently...',
            hintLevel2: 'Try saying: I am currently between jobs, but I enjoy reading and learning new things.',
          },
        ],
        fallbackNpcText: 'No problem. Let me ask you about something else. What do you like to do in your free time?',
        hintLevel1: 'Try: I am a... / I work as a...',
        hintLevel2: 'Try saying: I work as a teacher, and I find it very rewarding.',
      },
      {
        npcText: 'That is interesting. Now, let me ask you about something different. Can you describe a place you would like to visit? You should say: where it is, what you would like to do there, and why you would like to visit.',
        branches: [
          {
            matchPatterns: ['country', 'city', 'place', 'visit', 'travel', 'would like', 'because', 'enjoy'],
            npcText: 'That sounds like a wonderful place to visit. Do you think you will actually go there in the future?',
            hintLevel1: 'Try: I would like to visit... because...',
            hintLevel2: 'Try saying: I would like to visit Japan because I am fascinated by the culture and the approach to craftsmanship there.',
          },
        ],
        fallbackNpcText: 'Thank you for that. Let me ask you a follow-up question. Do you think travelling is important for personal growth?',
        hintLevel1: 'Try: I would like to visit...',
        hintLevel2: 'Try saying: I would really like to visit Italy because of the history and the food.',
      },
      {
        npcText: 'Thank you. That is the end of the speaking test. You did well — I appreciated how you handled the questions thoughtfully.',
        branches: [],
        fallbackNpcText: '',
        hintLevel1: 'Try: Thank you...',
        hintLevel2: 'Try saying: Thank you for the opportunity.',
      },
    ];
  }

  // TOEIC conversation steps
  return [
    {
      npcText: 'Hello. I would like to ask you a few questions. First, imagine that a colleague has asked you about your experience at a recent conference. Please describe what you found most useful and whether you would recommend it.',
      branches: [
        {
          matchPatterns: ['recommend', 'useful', 'learned', 'found', 'because', 'approach', 'point'],
          npcText: 'Thank you. Now, your company is considering a new approach to project management. A manager has asked for your opinion. Please explain whether you think this new approach would be beneficial.',
          hintLevel1: 'Try: I would recommend this conference because...',
          hintLevel2: 'Try saying: I would recommend the conference because the sessions on project management offered a new approach that I found very useful.',
        },
      ],
      fallbackNpcText: 'Thank you. Let me ask you another question. Your company is considering a new approach to project management. Do you think it would be beneficial?',
      hintLevel1: 'Try: I would recommend...',
      hintLevel2: 'Try saying: I would recommend it because the keynote presentations made some excellent points about modern approaches.',
    },
    {
      npcText: 'Now, please express your opinion on the following topic. Some people believe that employees should be required to attend regular training sessions. Others think professional development should be optional. What is your opinion? Please provide specific reasons.',
      branches: [
        {
          matchPatterns: ['think', 'believe', 'opinion', 'because', 'however', 'approach', 'point'],
          npcText: 'Thank you for sharing your perspective. That concludes the speaking portion of the practice.',
          hintLevel1: 'Try: In my opinion, I think...',
          hintLevel2: 'Try saying: In my opinion, I believe professional development should be encouraged rather than required. My approach to this is that people learn better when they choose to participate.',
        },
      ],
      fallbackNpcText: 'Thank you. That concludes the speaking portion of the practice.',
      hintLevel1: 'Try: I think that...',
      hintLevel2: 'Try saying: I think that professional development should be encouraged, not required. The main point is that people learn better when they are motivated.',
    },
  ];
}