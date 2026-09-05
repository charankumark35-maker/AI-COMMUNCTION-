import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FileText, ChevronLeft, Upload, Loader2, CheckCircle2,
  AlertCircle, Brain, ChevronRight, Tag, FolderOpen, Sparkles,
  Award, ShieldCheck, Target, Zap, GraduationCap
} from "lucide-react";
import { uploadResume, analyzeResume, getApiError } from "../services/api";

const CAT_COLORS = {
  "Programming Languages": "bg-purple-100 text-purple-700 border-purple-200",
  "Web Frameworks":        "bg-blue-100 text-blue-700 border-blue-200",
  "Databases & Cloud":     "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Soft Skills":           "bg-amber-100 text-amber-700 border-amber-200",
  "HR":                    "bg-purple-100 text-purple-700 border-purple-200",
  "Technical":             "bg-blue-100 text-blue-700 border-blue-200",
  "Project-based":         "bg-cyan-100 text-cyan-700 border-cyan-200",
  "Skill-based":           "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const defaultColor = "bg-slate-100 text-slate-700 border-slate-200";

export default function ResumeInterviewPage() {
  const navigate = useNavigate();

  const [file, setFile]           = useState(null);
  const [dragOver, setDragOver]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [progress, setProgress]   = useState(0);
  const [error, setError]         = useState("");
  const [successMsg, setSuccess] = useState("");
  const [result, setResult]       = useState(null);   // full resume analysis data
  const [activeQ, setActiveQ]     = useState(null);   // selected question index

  const inputRef = useRef(null);

  const handleFile = (f) => {
    if (!f) return;
    const nameLower = f.name.toLowerCase();
    if (!nameLower.endsWith(".pdf") && !nameLower.endsWith(".docx")) {
      setError("Only PDF (.pdf) and Word (.docx) files are supported.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5 MB limit. Please upload a smaller document.");
      return;
    }
    setFile(f);
    setError("");
    setSuccess("");
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleUploadAndAnalyze = async () => {
    if (!file) { setError("Please select a PDF or DOCX resume first."); return; }
    setLoading(true);
    setProgress(15);
    setError("");
    setSuccess("");

    try {
      // Step 1: Upload file & extract text
      setProgress(40);
      const res = await uploadResume(file);
      setProgress(75);

      const rawText = res.data?.raw_text;
      const resumeId = res.data?.resume_id;

      // Step 2: Trigger full Gemini AI resume analysis
      let fullAnalysis = res.data?.analysis;
      if (!fullAnalysis) {
        const analyzeRes = await analyzeResume({ resume_id: resumeId, raw_text: rawText, filename: file.name });
        fullAnalysis = analyzeRes.data;
      }

      setProgress(100);
      setResult({
        resume_id: resumeId,
        filename: file.name,
        raw_text: rawText,
        ...fullAnalysis
      });
      setSuccess("Resume analyzed successfully!");
    } catch (err) {
      setError(getApiError(err, "Failed to parse and analyze resume. Please try another PDF or DOCX file."));
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const handlePractice = (q) => {
    navigate("/interview", {
      state: { prefillQuestion: q.question, category: q.category || q.type || "Resume Interview" },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Navigation */}
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-xs font-semibold mb-6">
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-purple-blue flex items-center justify-center text-white shadow-md">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">AI Resume Analyzer & Question Generator</h1>
            <p className="text-slate-500 text-xs">Upload your PDF or DOCX resume — Gemini AI evaluates quality, identifies skill gaps, and generates targeted questions</p>
          </div>
        </div>

        {!result ? (
          <>
            {/* Drop Zone */}
            <div
              id="resume-dropzone"
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={`relative cursor-pointer border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 mb-6 ${
                dragOver
                  ? "border-purple-500 bg-purple-50"
                  : file
                    ? "border-emerald-500 bg-emerald-50/50"
                    : "border-slate-300 hover:border-purple-400 bg-white hover:bg-slate-50/50"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.docx"
                className="hidden"
                onChange={(e) => handleFile(e.target.files[0])}
                id="resume-file-input"
              />

              <div className="flex flex-col items-center gap-4">
                {file ? (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-base">{file.name}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{(file.size / 1024).toFixed(1)} KB · Ready to analyze</p>
                    </div>
                    <span className="text-[11px] font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-full uppercase">
                      {file.name.endsWith('.docx') ? 'DOCX Document' : 'PDF Document'}
                    </span>
                    <p className="text-xs text-slate-400">Click to change file</p>
                  </>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Upload className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-base mb-1">Drag and drop your resume file here</p>
                      <p className="text-slate-500 text-xs">Supports PDF (.pdf) and Word (.docx) formats up to 5 MB</p>
                    </div>
                    <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-500 mt-2">
                      <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> PDF & DOCX</span>
                      <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Instant Parsing</span>
                      <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Gemini AI</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Upload Progress Bar */}
            {loading && (
              <div className="mb-6 space-y-2">
                <div className="flex justify-between text-xs font-bold text-purple-700">
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Analyzing resume with Gemini AI...
                  </span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-purple-blue h-full rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="mb-5 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3.5 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                {error}
              </div>
            )}

            {/* Analyze Resume Button */}
            <button
              id="upload-resume-btn"
              onClick={handleUploadAndAnalyze}
              disabled={!file || loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-purple-blue hover:bg-gradient-purple-blue-hover text-white disabled:opacity-40 disabled:cursor-not-allowed py-4 rounded-xl font-bold transition-all text-xs shadow-md shadow-purple-500/20"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Processing &amp; Generating Questions...</>
              ) : (
                <><Brain className="w-4 h-4" /> Analyze Resume &amp; Generate AI Questions</>
              )}
            </button>
          </>
        ) : (
          /* Results Dashboard View */
          <>
            {/* Success Notification Banner */}
            {successMsg && (
              <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-emerald-900 font-bold text-xs">{successMsg}</p>
                  <p className="text-emerald-700 text-[11px] mt-0.5">{result.filename}</p>
                </div>
              </div>
            )}

            {/* 1. Resume Score Card */}
            <div className="saas-light-card p-8 mb-8 border-purple-200 bg-white relative overflow-hidden shadow-md shadow-purple-500/5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                
                <div className="text-center md:border-r md:border-slate-200 md:pr-6">
                  <Award className="w-12 h-12 text-amber-500 mx-auto mb-2" />
                  <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-1">Resume Quality Score</p>
                  <div className="text-5xl font-black text-slate-900 tracking-tight">
                    {result.resume_score?.overall_score || 85}<span className="text-xl text-slate-400 font-normal">/100</span>
                  </div>
                  <span className="mt-2 inline-block text-[11px] font-bold text-purple-700 bg-purple-100 px-3 py-0.5 rounded-full">
                    Evaluated by Gemini AI
                  </span>
                </div>

                <div className="md:col-span-2 space-y-4">
                  {/* Strengths */}
                  <div>
                    <h4 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 uppercase tracking-wider mb-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" /> Resume Strengths
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {result.resume_score?.strengths?.map((s, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Improvement Suggestions */}
                  <div>
                    <h4 className="text-xs font-bold text-purple-800 flex items-center gap-1.5 uppercase tracking-wider mb-2">
                      <Zap className="w-4 h-4 text-purple-600" /> Recommendations
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {result.resume_score?.improvement_suggestions?.map((s, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

              </div>
            </div>

            {/* 2. Extracted Data Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              
              {/* Skills Analysis */}
              <div className="saas-light-card p-6 bg-white border-slate-200">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-xs uppercase tracking-wider">
                  <Tag className="w-4 h-4 text-purple-600" /> Extracted Skill Profile
                </h3>
                {result.extracted_data?.skills && Object.keys(result.extracted_data.skills).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(result.extracted_data.skills).map(([cat, skills]) => (
                      <div key={cat}>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">{cat}</p>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(skills) && skills.map((s) => (
                            <span key={s} className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${CAT_COLORS[cat] || defaultColor}`}>
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Skills extracted and cataloged.</p>
                )}
              </div>

              {/* Experience & Projects */}
              <div className="saas-light-card p-6 bg-white border-slate-200 space-y-4">
                <div>
                  <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2 text-xs uppercase tracking-wider">
                    <FolderOpen className="w-4 h-4 text-blue-600" /> Projects Detected
                  </h3>
                  <div className="space-y-2">
                    {result.extracted_data?.projects?.map((p, i) => (
                      <div key={i} className="flex items-start gap-2 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700">
                        <span className="text-purple-600 font-bold shrink-0">{i + 1}.</span>
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {result.extracted_data?.education?.length > 0 && (
                  <div>
                    <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2 text-xs uppercase tracking-wider pt-2 border-t border-slate-100">
                      <GraduationCap className="w-4 h-4 text-emerald-600" /> Education
                    </h3>
                    <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      {result.extracted_data.education.join(" · ")}
                    </p>
                  </div>
                )}
              </div>

            </div>

            {/* 3. Skill Gap Analysis */}
            {result.skill_gap_analysis && (
              <div className="saas-light-card p-6 mb-8 bg-white border-slate-200">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-xs uppercase tracking-wider">
                  <Target className="w-4 h-4 text-purple-600" /> AI Skill Gap Analysis
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                    <p className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2">Verified Current Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.skill_gap_analysis.current_skills?.map((s) => (
                        <span key={s} className="bg-white text-emerald-700 text-[11px] font-bold px-2 py-0.5 rounded border border-emerald-300">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2">Potential Skill Gaps</p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.skill_gap_analysis.missing_skills?.map((s) => (
                        <span key={s} className="bg-white text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded border border-amber-300">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2">Recommended Learning</p>
                    <ul className="space-y-1 text-xs text-blue-800">
                      {result.skill_gap_analysis.recommended_learning_areas?.map((area, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <Sparkles className="w-3 h-3 text-blue-600 shrink-0 mt-0.5" />
                          <span>{area}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Categorized AI Generated Questions */}
            <div className="saas-light-card p-6 mb-8 bg-white border-slate-200">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-slate-900 flex items-center gap-2 text-xs uppercase tracking-wider">
                  <Brain className="w-4 h-4 text-purple-600" /> Generated AI Interview Questions
                </h2>
                <span className="text-xs font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
                  {result.questions?.length || 0} Tailored Questions
                </span>
              </div>

              <div className="space-y-3">
                {result.questions?.map((q, i) => (
                  <div
                    key={i}
                    className={`border rounded-2xl p-4 transition-all cursor-pointer ${
                      activeQ === i
                        ? "border-purple-400 bg-purple-50/60 shadow-xs"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                    }`}
                    onClick={() => setActiveQ(activeQ === i ? null : i)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                          CAT_COLORS[q.type] || CAT_COLORS[q.category] || defaultColor
                        }`}>
                          {i + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                              CAT_COLORS[q.type] || CAT_COLORS[q.category] || defaultColor
                            }`}>
                              {q.type || q.category || "HR"}
                            </span>
                            {q.focus_area && (
                              <span className="text-[10px] text-slate-500 font-mono">
                                Focus: {q.focus_area}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-bold text-slate-900 leading-relaxed">{q.question}</p>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${activeQ === i ? "rotate-90 text-purple-600" : ""}`} />
                    </div>

                    {activeQ === i && (
                      <div className="mt-4 pt-4 border-t border-slate-200/80 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500 font-medium">
                          Practice answering this question with Gemini AI feedback
                        </span>
                        <button
                          id={`practice-q-${i}`}
                          onClick={(e) => { e.stopPropagation(); handlePractice(q); }}
                          className="flex items-center gap-1.5 text-xs bg-gradient-purple-blue text-white px-4 py-2 rounded-xl transition-all font-bold shadow-2xs hover:shadow-xs"
                        >
                          Practice this Prompt <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => { setResult(null); setFile(null); setSuccess(""); }}
                className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-slate-100 border border-slate-200 py-3.5 rounded-xl font-bold transition-all text-xs text-slate-800"
              >
                <Upload className="w-4 h-4" /> Upload Another Resume (PDF / DOCX)
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-purple-blue text-white py-3.5 rounded-xl font-bold transition-all shadow-md text-xs"
              >
                Return to Dashboard
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
