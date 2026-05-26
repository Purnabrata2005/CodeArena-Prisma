import { judge0Client } from "./axios.judge0.js";

export const getJudge0LanguageId = (language: string): number | undefined => {
  const languageMap: Record<string, number> = {
    "PYTHON": 71,
    "JAVA": 62,
    "JAVASCRIPT": 63,
  };
  return languageMap[language.toUpperCase()];
};

export const submitBatch = async (submissions: any[]): Promise<any> => {
  const { data } = await judge0Client.post(
    `/submissions/batch?base64_encoded=false`,
    { 
      submissions,
    },
  );
  return data;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const pullBatchResults = async (tokens: string[]): Promise<any[]> => {
  while (true) {
    const { data } = await judge0Client.get(
      `/submissions/batch`,
      {
        params: {
          tokens: tokens.join(","),
          base64_encoded: false,
        },
      },
    );

    const result = data.submissions;
    if (!result) throw new Error("No result found for the given tokens.");
    const isAllCompleted = result.every(
      (submission: any) => submission.status.id !== 1 && submission.status.id !== 2,
    );
    if (isAllCompleted) return result;
    await sleep(1000);
  }
};

export function getLanguageName(languageId: number): string {
  const languageMap: Record<number, string> = {
    71: "Python",
    62: "Java",
    63: "JavaScript",
    74: "TypeScript",
  };
  return languageMap[languageId] || "Unknown";
}
