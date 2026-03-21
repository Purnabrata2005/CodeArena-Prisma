
import axios from "axios";

export const getJudge0LanguageId = (language)=>{
    const languageMap = {
        "PYTHON":71,
        "JAVA":62,
        "JAVASCRIPT":63,
    }
    return languageMap[language.toUpperCase()]
}

export const submitBatch =async (submissions) => {
  const { data } = await axios.post(
    `${process.env.JUDGE0_API_URL}/submissions/batch?base64_encoded=false`,
    {
      submissions,
    },
  );

  console.log("Submission Tokens :", data);

  return data;
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const pullBatchResults =async (tokens) => {
  while (true) {
    const { data } = await axios.get(
      `${process.env.JUDGE0_API_URL}/submissions/batch`,
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
