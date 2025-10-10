import { AIOutputs, AIProvider } from "./provider";

export class StubProvider implements AIProvider {
  async summarizeAndExtract({
    transcript,
    title,
  }: {
    transcript: string;
    title?: string;
  }): Promise<AIOutputs> {
    // deterministic, fast stub for dev
    return {
      summary: `Summary for ${title ?? "meeting"}: ${transcript.slice(
        0,
        120
      )}...`,
      actionItems: [
        {
          owner: "You",
          task: "Draft follow-up email to client",
          due: "Tomorrow",
        },
        { owner: "Dev", task: "Create Jira ticket for bug #123" },
      ],
      decisions: [
        "Ship MVP by Friday",
        "Switch to SQLite for dev, Postgres for prod",
      ],
    };
  }
}
