import { summarizeText } from "../config/gemini.js";

const generateSummary = async (transcript) => {
  try {
    return await summarizeText(transcript, "detailed");
  } catch (error) {
    throw new Error(`Summary generation failed: ${error.message}`);
  }
};

export { generateSummary };
