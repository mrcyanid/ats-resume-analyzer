import { parseResume } from "../utils/resumeParser.js";
import { extractKeywords } from "../utils/keywordExtractor.js";
import { calculateATSScore } from "../utils/atsScore.js";
import { analyzeWithGemini } from "../utils/aiAnalyzer.js";
import Resume from "../models/Resume.js";

// POST /resume/upload
export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const uint8Array = new Uint8Array(req.file.buffer);
    const text = await parseResume(Buffer.from(uint8Array));

    res.json({
      success: true,
      preview: text.slice(0, 500),
      text,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /resume/analyze
export const analyzeResume = async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription) {
      return res
        .status(400)
        .json({ error: "Missing resumeText or jobDescription" });
    }

    // Keyword-based scoring
    const jdKeywords = extractKeywords(jobDescription);
    const resumeKeywords = extractKeywords(resumeText);
    const atsScore = calculateATSScore(jdKeywords, resumeKeywords);

    // AI-powered analysis
    const suggestions = await analyzeWithGemini(resumeText, jobDescription);

    // Save to MongoDB, linked to the logged-in user
    const savedResume = await Resume.create({
      userId: req.user.id,
      text: resumeText,
      atsScore,
      suggestions,
    });

    res.json({
      success: true,
      atsScore,
      suggestions,
      resumeId: savedResume._id,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /resume/history - bonus: view past analyses
export const getResumeHistory = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    res.json({ success: true, resumes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
