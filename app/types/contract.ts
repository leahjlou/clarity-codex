export interface Contract {
  rank: number;
  contract: string;
  calls: number;
  analysis: {
    summary: string;
    explanation: string;
    tags: string[];
  };
}
