export interface Contract {
  rank: number;
  contract: string;
  calls: number;
  source: string;
  analysis: {
    summary: string;
    explanation: string;
    tags: string[];
  };
}
