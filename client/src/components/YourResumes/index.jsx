import React, { useState } from "react";
import { API_BASE_URL } from "../../config";
import "./index.css";

const YourResumes = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setError("");
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) {
      setError("Please select a PDF resume first");
      return;
    }
    if (!jobDescription.trim()) {
      setError("Please paste a job description");
      return;
    }

    setError("");
    setLoading(true);
    setAnalysisResult(null);

    try {
      const token = localStorage.getItem("token");

      // STEP 1: Upload Resume
      const formData = new FormData();
      formData.append("resume", selectedFile);

      const uploadResponse = await fetch(`${API_BASE_URL}/resume/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(data.error || "Upload failed");
      }

      // STEP 2: Analyze Resume (after successful upload)
      const rawData = {
        resumeText: data.text,
        jobDescription,
      };

      const analyzeResponse = await fetch(`${API_BASE_URL}/resume/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(rawData),
      });

      const analyzeData = await analyzeResponse.json();

      if (!analyzeResponse.ok) {
        throw new Error(analyzeData.error || "Analysis failed");
      }

      setAnalysisResult({ success: true, ...analyzeData });
      setShowModal(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // The Gemini response shape can vary — try each nesting level
  const report =
    analysisResult?.suggestions?.analysis ??
    analysisResult?.suggestions ??
    analysisResult;

  return (
    <div className="resume-container">
      <h2>Upload Your Resume</h2>

      <label className="field-label">Resume (PDF only)</label>
      <input type="file" accept=".pdf" onChange={handleFileChange} />

      <label className="field-label">Job Description</label>
      <textarea
        rows={8}
        placeholder="Paste the job description here..."
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
      />

      {error && <p className="error-text">{error}</p>}

      <button onClick={handleUploadAndAnalyze} disabled={loading}>
        {loading ? "Analyzing..." : "Upload & Analyze"}
      </button>

      {analysisResult?.success && !showModal && (
        <button className="secondary-btn" onClick={() => setShowModal(true)}>
          View Report
        </button>
      )}

      {showModal && analysisResult?.success && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>
              ×
            </button>
            <h2>ATS Resume Analysis Report</h2>

            <div className="score-badge">
              ATS Keyword Score: {analysisResult.atsScore}%
            </div>

            {report?.error && <p className="error-text">{report.error}</p>}
            {report?.raw && <p className="raw-text">{report.raw}</p>}

            {report?.summary && (
              <section>
                <h3>Summary</h3>
                <p>{report.summary}</p>
              </section>
            )}

            {report?.matchedSkills?.length > 0 && (
              <section>
                <h3>Matched Skills</h3>
                <ul>
                  {report.matchedSkills.map((skill, i) => (
                    <li key={i} className="tag-matched">
                      {skill}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {report?.missingSkills?.length > 0 && (
              <section>
                <h3>Missing Skills</h3>
                <ul>
                  {report.missingSkills.map((skill, i) => (
                    <li key={i} className="tag-missing">
                      {skill}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {report?.optimizationTips?.length > 0 && (
              <section>
                <h3>Optimization Tips</h3>
                <ul>
                  {report.optimizationTips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </section>
            )}

            {report?.bulletPointImprovements?.length > 0 && (
              <section>
                <h3>Bullet Point Improvements</h3>
                {report.bulletPointImprovements.map((item, i) => (
                  <div key={i} className="bullet-compare">
                    <p className="original">
                      <strong>Original:</strong> {item.original}
                    </p>
                    <p className="improved">
                      <strong>Improved:</strong> {item.improved}
                    </p>
                  </div>
                ))}
              </section>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default YourResumes;
