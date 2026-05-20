import type { ModeCode, Mode } from '../types';

export const MODES: Record<ModeCode, Mode> = {
  survival: {
    code: 'survival',
    display_name: 'Survival',
    track_type: 'daily_speaking',
    description: 'Navigate daily life — doctor, grocery, small talk',
    is_premium: false,
  },
  professional: {
    code: 'professional',
    display_name: 'Professional',
    track_type: 'daily_speaking',
    description: 'Excel at work — meetings, email, presentations',
    is_premium: true,
  },
  social: {
    code: 'social',
    display_name: 'Social',
    track_type: 'daily_speaking',
    description: 'Connect with people — slang, memes, gaming',
    is_premium: true,
  },
  ielts: {
    code: 'ielts',
    display_name: 'IELTS',
    track_type: 'exam_prep',
    description: 'Prepare for IELTS — formal, structured, accuracy-focused',
    is_premium: true,
  },
  toeic: {
    code: 'toeic',
    display_name: 'TOEIC',
    track_type: 'exam_prep',
    description: 'Prepare for TOEIC — business English, structured',
    is_premium: true,
  },
};