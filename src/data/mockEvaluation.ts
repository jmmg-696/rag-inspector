import type { EvalMetric, EvalRun } from "../types/domain";

export const mockEvalMetrics: EvalMetric[] = [
  {
    id: "answer-relevance",
    label: "Answer Relevance",
    value: 0.91,
    description: "Is the generated answer on-topic for the question?",
  },
  {
    id: "context-relevance",
    label: "Context Relevance",
    value: 0.87,
    description: "Are the retrieved chunks relevant to the question?",
  },
  {
    id: "faithfulness",
    label: "Faithfulness",
    value: 0.94,
    description: "Is every claim in the answer supported by the context?",
  },
  {
    id: "retrieval-precision",
    label: "Retrieval Precision",
    value: 0.89,
    description: "How many retrieved chunks were actually used?",
  },
];

export const mockEvalRuns: EvalRun[] = [
  {
    id: "eval-01",
    question: "What is the approval process?",
    expected: "Approval workflow with roles",
    retrieved: "5 chunks · top 0.94",
    score: 0.94,
    status: "pass",
  },
  {
    id: "eval-02",
    question: "Who can approve a request?",
    expected: "Designated approver and delegation rules",
    retrieved: "4 chunks · top 0.91",
    score: 0.91,
    status: "pass",
  },
  {
    id: "eval-03",
    question: "How long should a request take?",
    expected: "SLA of five business days",
    retrieved: "3 chunks · top 0.89",
    score: 0.88,
    status: "pass",
  },
  {
    id: "eval-04",
    question: "What happens after approval?",
    expected: "Execution and ticket closure",
    retrieved: "5 chunks · top 0.83",
    score: 0.79,
    status: "warn",
  },
  {
    id: "eval-05",
    question: "Which portal do interns use?",
    expected: "Interns use the internal portal",
    retrieved: "2 chunks · top 0.71",
    score: 0.62,
    status: "fail",
  },
  {
    id: "eval-06",
    question: "Is remote work allowed on Fridays?",
    expected: "Not covered by the indexed documents",
    retrieved: "1 chunk · top 0.44",
    score: 0.38,
    status: "fail",
  },
];
