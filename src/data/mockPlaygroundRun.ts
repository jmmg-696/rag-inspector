import { mockAnswer, mockDefaultQuestion, mockSources } from "./mockQueries";
import type { RagRunResult } from "../types/domain";

export function getRagRun(question: string): RagRunResult {
  const isDemoQuestion =
    question.trim().toLowerCase() === mockDefaultQuestion.toLowerCase();
  return {
    answer: {
      ...mockAnswer,
      text: isDemoQuestion
        ? mockAnswer.text
        : `Based on your indexed documents, this answer would be generated from the retrieved chunks for “${question.trim()}”. Answers are mocked in this prototype — the real local pipeline ships in a later phase.`,
    },
    sources: mockSources,
  };
}
