import { TranscriptionProvider } from "./provider";

export class StubTranscriber implements TranscriptionProvider {
  async transcribe({
    filePath,
  }: {
    filePath: string;
  }): Promise<{ text: string }> {
    return {
      text: `(Stub transcript from ${filePath}) We discussed timelines, blockers, and deliverables.`,
    };
  }
}
