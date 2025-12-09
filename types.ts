export interface TokenCandidate {
  id: number;
  word: string;
  baseLogit: number; // The raw score from the model before softmax/temp
}
