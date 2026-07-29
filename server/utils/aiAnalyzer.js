import dotenv from "dotenv";
dotenv.config();

export const analyzeWithGemini = async (resumeText, jobDescription) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is undefined");
    }

    const prompt = buildPrompt(resumeText, jobDescription);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2 },
        }),
      }
    );

    const data = await response.json();

    // Surface the real API error if the request failed
    if (data?.error) {
      throw new Error(
        `Gemini API error: ${data.error.message || JSON.stringify(data.error)}`
      );
    }

    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      throw new Error(
        "Empty Gemini response. Full response: " + JSON.stringify(data)
      );
    }

    try {
      const parsed = JSON.parse(
        rawText.replace(/```json/g, "").replace(/```/g, "").trim()
      );
      return parsed;
    } catch (parseErr) {
      // If parsing fails, return raw text so the user still gets feedback
      return { raw: rawText };
    }
  } catch (err) {
    return { error: err.message };
  }
};

const buildPrompt = (resumeText, jobDescription) => `
You are an ATS resume analyzer.
Return STRICT JSON only.
Do not wrap in markdown.
Do not include backticks.
Do not include explanations.
Use this exact schema:

{
  "compatibilityScore": number (0-100),
  "missingSkills": string[],
  "matchedSkills": string[],
  "optimizationTips": string[],
  "bulletPointImprovements": [
    { "original": string, "improved": string }
  ],
  "summary": string
}

Resume:
"""
${resumeText}
"""

Job Description:
"""
${jobDescription}
"""
`;
