import novembroConfig from './quiz-config.json';

export interface QuestionItem {
  id: number;
  question: string;
  image?: string;
  options: string[];
  correctIndex: number;
}

export interface QuizConfig {
  id?: string;
  edition: string;
  bookAuthor?: string;
  bookSubtitle?: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
    fontFamily: string;
    headingFont?: string;
    bannerImage: string;
    accentGradient?: string;
  };
  rules: {
    timePerQuestionSeconds: number;
    totalQuestions: number;
  };
  questions: QuestionItem[];
}

export const PRESET_CONFIGS: Record<string, QuizConfig> = {
  'voce-nao-deveria-estar-aqui': {
    ...(novembroConfig as QuizConfig),
    id: 'voce-nao-deveria-estar-aqui',
  },
};
