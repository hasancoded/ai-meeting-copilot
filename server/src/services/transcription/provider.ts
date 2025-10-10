export interface TranscriptionProvider {
  transcribe(input: { filePath: string }): Promise<{ text: string }>;
}
