import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  BrainCircuit, ChevronLeft, RefreshCw, Send, Loader2, MessageSquare,
  Sparkles, Lightbulb, Mic, Timer, Gauge, CheckCircle2, AlertCircle
} from "lucide-react";
import { generateQuestion, analyzeAnswer, getApiError } from "../services/api";
import ApiStatusBanner from "../components/ApiStatusBanner";

const difficulties = [
  { id: "easy", label: "Beginner", badge: "bg-emerald-100 text-emerald-700" },
  { id: "medium", label: "Intermediate", badge: "bg-blue-100 text-blue-700" },
  { id: "hard", label: "Advanced", badge: "bg-purple-100 text-purple-700" },
];

export default function InterviewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category") || "HR Interview";

  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [loadingQ, setLoadingQ] = useState(false);
  const [loadingA, setLoadingA] = useState(false);
  const [error, setError] = useState("");
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isRecording, setIsRecording] = useState(false);

  const fetchQuestion = async () => {
    setLoadingQ(true);
    setError("");
    setAnswer("");
    setTimeElapsed(0);
    try {
      const res = await generateQuestion(category);
      setQuestion(res.data);
    } catch (err) {
      setError(getApiError(err, "Failed to generate question. Please try again."));
    } finally {
      setLoadingQ(false);
    }
  };

  useEffect(() => {
    fetchQuestion();
    // eslint-disable-next-line
  }, [category]);

  // Timer logic
  useEffect(() => {
    let interval;
    if (question && !loadingA) {
      interval = setInterval(() => setTimeElapsed((prev) => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [question, loadingA]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    if (!answer.trim()) {
      setError("Please write your response before submitting for analysis.");
      return;
    }
    setLoadingA(true);
    setError("");
    try {
      const res = await analyzeAnswer(question?.question_text || category, answer);
      navigate("/result", { state: { result: res.data, question: question?.question_text } });
    } catch (err) {
      setError(getApiError(err, "Failed to analyze your answer. Please try again."));
    } finally {
      setLoadingA(false);
    }
  };

  const wordCount = answer.split(/\s+/).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 px-4 sm:px-6 py-8">
      <ApiStatusBanner />
      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Navigation */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-xs font-semibold mb-6"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 badge-purple-light px-3 py-1 rounded-full text-xs font-bold mb-2">
              <BrainCircuit className="w-3.5 h-3.5 text-purple-600" />
              {category}
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              AI Practice Session
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Timer Widget */}
            <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-mono text-slate-700 shadow-2xs">
              <Timer className="w-4 h-4 text-emerald-600" />
              <span className="font-bold">{formatTime(timeElapsed)}</span>
            </div>

            {/* Skip / New Question Button */}
            <button
              id="refresh-question"
              onClick={fetchQuestion}
              disabled={loadingQ}
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingQ ? "animate-spin" : ""}`} />
              Skip Prompt
            </button>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Difficulty Selector Bar */}
            <div className="saas-light-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                <Gauge className="w-4 h-4 text-purple-600" /> Difficulty Level:
              </div>
              <div className="flex gap-2">
                {difficulties.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDifficulty(d.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                      difficulty === d.id
                        ? `${d.badge} border-current shadow-2xs`
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Display Card */}
            <div className="saas-light-card p-8 border-purple-200 bg-white relative overflow-hidden shadow-md shadow-purple-500/5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-600" /> Gemini Interview Question
                </span>
                <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  ID: {question?.id || '---'}
                </span>
              </div>

              {loadingQ ? (
                <div className="flex items-center justify-center gap-3 py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                  <span className="text-slate-500 text-sm font-medium">Generating interview scenario...</span>
                </div>
              ) : (
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                  {question?.question_text || "Loading prompt..."}
                </h2>
              )}
            </div>

            {/* Answer Textarea Card */}
            <div className="saas-light-card p-6 shadow-sm relative">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                <label htmlFor="answer-input" className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-purple-600" /> Your Answer
                </label>
                
                <div className="flex items-center gap-3">
                  {/* Voice Toggle Button */}
                  <button 
                    onClick={() => setIsRecording(!isRecording)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      isRecording
                        ? 'bg-red-50 text-red-600 border-red-300 animate-pulse'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                    {isRecording ? 'Recording Voice...' : 'Voice Input'}
                  </button>

                  <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded border ${
                    wordCount >= 30 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}>
                    {wordCount} words
                  </span>
                </div>
              </div>

              <textarea
                id="answer-input"
                rows={8}
                placeholder="Type your structured response here. Be specific, articulate, and clear. Gemini AI will evaluate your grammar, vocabulary quality, confidence, tone, and overall STAR structure..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm leading-relaxed resize-none shadow-inner"
                value={answer}
                onChange={(e) => {
                  setAnswer(e.target.value);
                  setError("");
                }}
              />

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  {error}
                </div>
              )}

              <button
                id="submit-answer"
                onClick={handleSubmit}
                disabled={loadingA || loadingQ || !answer.trim()}
                className="mt-6 w-full btn-primary text-sm py-4"
              >
                {loadingA ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Analyzing Response with Gemini AI...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-white" /> Submit for AI Analysis
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Sidebar Tips Framework */}
          <div className="space-y-6">
            <div className="saas-light-card p-6 border-slate-200">
              <h3 className="text-xs font-bold text-purple-700 mb-4 flex items-center gap-2 uppercase tracking-wider">
                <Lightbulb className="w-4 h-4 text-amber-500" /> STAR Method Framework
              </h3>
              <p className="text-slate-600 text-xs leading-relaxed mb-5">
                Structure your behavioral answers with confidence using these 4 components:
              </p>
              <ul className="space-y-3.5 text-xs text-slate-700">
                <li className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 font-bold flex items-center justify-center shrink-0">S</div>
                  <div><strong className="text-slate-900 block mb-0.5">Situation</strong>Set the context and background.</div>
                </li>
                <li className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">T</div>
                  <div><strong className="text-slate-900 block mb-0.5">Task</strong>Describe your goal or challenge.</div>
                </li>
                <li className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-lg bg-cyan-100 text-cyan-700 font-bold flex items-center justify-center shrink-0">A</div>
                  <div><strong className="text-slate-900 block mb-0.5">Action</strong>Explain the exact steps you took.</div>
                </li>
                <li className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0">R</div>
                  <div><strong className="text-slate-900 block mb-0.5">Result</strong>Share the measurable outcome achieved.</div>
                </li>
              </ul>
            </div>

            <div className="bg-purple-50 border border-purple-200/80 rounded-2xl p-5 text-xs space-y-2">
              <span className="font-bold text-purple-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-purple-600" /> AI Coach Pro Tip
              </span>
              <p className="text-purple-900 leading-relaxed">
                Aim for responses between 50 to 150 words. Gemini AI checks for tone clarity, grammar precision, and action-oriented vocabulary.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
