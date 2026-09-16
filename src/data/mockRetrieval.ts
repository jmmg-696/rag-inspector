import type { RetrievedChunk } from "../types/domain";

export const mockRetrievalQuery = "What is the approval process?";

export const mockIndexedChunkCount = 1482;

export const mockRetrievalSettings = {
  topK: 5,
  threshold: 0.6,
  embedding: "BGE-M3",
  index: "Qdrant · HNSW",
};

export const mockRetrievedChunks: RetrievedChunk[] = [
  {
    id: "ch-01",
    rank: 1,
    document: "Approval Process.pdf",
    page: 14,
    similarity: 0.94,
    text: "The responsible area must review each request before it is forwarded to the designated approver for final sign-off. Requests that are incomplete or missing supporting information are returned to the requester with a reason.",
  },
  {
    id: "ch-02",
    rank: 2,
    document: "Company Procedures.pdf",
    page: 8,
    similarity: 0.89,
    text: "Requests require approval from a designated approver before they can be executed or scheduled. The approval must be recorded in the tracking system together with the date and the responsible area.",
  },
  {
    id: "ch-03",
    rank: 3,
    document: "Employee Handbook.pdf",
    page: 21,
    similarity: 0.83,
    text: "Employees can open a request through the internal portal. The system notifies the responsible area automatically and keeps track of the status until the request is approved or rejected.",
  },
  {
    id: "ch-04",
    rank: 4,
    document: "Security Policy.pdf",
    page: 9,
    similarity: 0.71,
    text: "Access to approval tools is granted per role. Approvers must enable two-factor authentication and review pending requests within five business days of assignment.",
  },
  {
    id: "ch-05",
    rank: 5,
    document: "Approval Process.pdf",
    page: 17,
    similarity: 0.66,
    text: "After approval, the responsible area executes the request and closes the ticket. Delegated approvals are allowed only in writing and for a limited period of time.",
  },
];
