export type AIOutputs = {
  summary: string;
  actionItems: { owner?: string; task: string; due?: string }[];
  decisions: string[];
};

export interface AIProvider {
  summarizeAndExtract(input: {
    transcript: string;
    title?: string;
  }): Promise<AIOutputs>;
}
