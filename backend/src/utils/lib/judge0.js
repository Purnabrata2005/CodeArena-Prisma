
import axios from "axios";
import {judge0Client} from "../lib/axios.judge0.js"

export const getJudge0LanguageId = (language)=>{
    const languageMap = {
        "PYTHON":71,
        "JAVA":62,
        "JAVASCRIPT":63,
    }
    return languageMap[language.toUpperCase()]
}

export const submitBatch =async (submissions) => {
  // console.log("Submission Data:", submissions);
  const { data } = await judge0Client.post(
    `/submissions/batch?base64_encoded=false`,
    { 
      submissions,
    },
  );

  // console.log("Submission Tokens :", data);

  return data;
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const pullBatchResults =async (tokens) => {
  // console.log("Tokens:", tokens);
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
    if (!result) throw new Error("No result found  for the given tokens.");
    const isAllCompleted = result.every(
      (submission) => submission.status.id !== 1 && submission.status.id !== 2,
    );
    if (isAllCompleted) return result;
    await sleep(1000); // Wait for 2 seconds before checking again
  }
};

export function getLanguageName(languageId){
  const languageMap= {
    71: "Python",
    62: "Java",
    63: "JavaScript",
    74: "TypeScript",
  };
  return languageMap[languageId] || "Unknown";
}
