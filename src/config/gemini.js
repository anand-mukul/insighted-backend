import axios from "axios";
import "dotenv/config";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const summarizeText = async (text, detailLevel = "detailed") => {
    const promptTemplates = {
        brief: `Please summarize this transcript in clear, concise bullet points: ${text}`,
        detailed: `Please create detailed notes from this transcript, including:
- Main topics and key points (with supporting details)
- Important concepts explained
- Notable examples or case studies mentioned
- Any actionable insights or takeaways
- Organize by themes or chronological order as appropriate

Original transcript: ${text}`,
        comprehensive: `Please create a comprehensive and structured summary of this transcript, including:
- Executive summary (2-3 sentences overview)
- Detailed breakdown of main topics with supporting evidence and examples
- Key quotes or statements (marked clearly)
- Technical concepts or terminology explained
- Relationships between different ideas or concepts discussed
- Actionable takeaways or conclusions
- Any questions raised or areas for further exploration
- Organize into clearly labeled sections with sub-bullets where appropriate

Original transcript: ${text}`
    };

    const selectedPrompt = promptTemplates[detailLevel] || promptTemplates.detailed;

    try {
        const response = await axios.post(
            `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
            {
                contents: [{
                    parts: [{
                        text: selectedPrompt
                    }]
                }],
                safetySettings: [{
                    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                    threshold: "BLOCK_ONLY_HIGH"
                }],
                generationConfig: {
                    temperature: 0.4,
                    topP: 0.9,
                    topK: 40,
                    maxOutputTokens: 4096 
                }
            },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            throw new Error("Invalid API response structure");
        }

        return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
        const errorMessage = error.response?.data?.error?.message || error.message;
        const errorStatus = error.response?.status || 500;
        throw new Error(`Summarization failed (${errorStatus}): ${errorMessage}`);
    }
};

// summarizeText(transcriptText, "brief"); // For shorter summaries
// summarizeText(transcriptText, "detailed"); // For detailed notes (default)
// summarizeText(transcriptText, "comprehensive"); // For very comprehensive summaries

export { summarizeText };