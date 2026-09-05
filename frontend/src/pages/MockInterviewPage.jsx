import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  BrainCircuit, ChevronLeft, RefreshCw, Send, Loader2, MessageSquare,
  Sparkles, Award, ShieldCheck, Target, Zap, Clock, CheckCircle2,
  AlertCircle, ArrowRight, Play, BookOpen, User, Layers, Gauge, RotateCcw
} from "lucide-react";
import {
  startMockInterview,
  submitMockAnswer,
  finishMockInterview,
  getApiError
} from "../services/api";
import ApiStatusBanner from "../components/ApiStatusBanner";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const INTERVIEW_TYPES = [
  {
    id: "HR Interview",
    label: "HR Interview",
    desc: "Behavioral, situational, and personal background questions",
    icon: <User className="w-5 h-5 text-purple-600" />,
    badge: "Behavioral"
  },
  {
    id: "Technical Interview",
    label: "Technical Interview",
    desc: "Architecture, coding logic, and domain-specific questions",
    icon: <BookOpen className="w-5 h-5 text-blue-600" />,
    badge: "Role Specific"
  },
  {
    id: "Resume-Based Interview",
    label: "Resume-Based Interview",
    desc: "Personalized questions generated from candidate experience",
    icon: <Sparkles className="w-5 h-5 text-emerald-600" />,
    badge: "Personalized"
  },
  {
    id: "Project Interview",
    label: "Project Interview",
    desc: "System design, requirement tradeoffs, and implementation details",
    icon: <Layers className="w-5 h-5 text-amber-600" />,
    badge: "System Design"
  },
];

const DIFFICULTIES = [
  { id: "Easy", label: "Easy", desc: "Foundational questions" },
  { id: "Medium", label: "Medium", desc: "Standard industry level" },
  { id: "Hard", label: "Hard", desc: "Advanced & challenging" },
];

const QUESTION_COUNTS = [3, 5, 10];

export default function MockInterviewPage() {
  const navigate = useNavigate();

  // Setup state
  const [step, setStep] = useState("setup"); // setup | interview | feedback | report
  const [selectedType, setSelectedType] = useState("HR Interview");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Medium");
  const [selectedCount, setSelectedCount] = useState(5);

  // Live session state
  const [sessionId, setSessionId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answerText, setAnswerText] = useState("");
  const [evaluations, setEvaluations] = useState([]); // List of { question, answer, evaluation }
  const [currentEval, setCurrentEval] = useState(null); // Last question evaluation
  const [nextQuestionData, setNextQuestionData] = useState(null);

  // Final Report state
  const [finalReport, setFinalReport] = useState(null);

  // Status state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Response timer
  useEffect(() => {
    let interval;
    if (step === "interview" && !loading) {
      interval = setInterval(() => setTimeElapsed((prev) => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, loading]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // 1. Start Interview Session
  const handleStartInterview = async () => {
    setLoading(true);
    setError("");
    setTimeElapsed(0);
    setEvaluations([]);
    setCurrentIndex(1);
    setAnswerText("");

    try {
      const res = await startMockInterview(selectedType, selectedDifficulty, selectedCount);
      setSessionId(res.data.session_id);
      setCurrentQuestion(res.data.question);
      setStep("interview");
    } catch (err) {
      setError(getApiError(err, "Failed to start mock interview. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  // 2. Submit Question Answer
  const handleSubmitAnswer = async () => {
    if (!answerText.trim()) {
      setError("Please write your answer response before submitting.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        session_id: sessionId,
        interview_type: selectedType,
        difficulty: selectedDifficulty,
        question_index: currentIndex,
        total_questions: selectedCount,
        question_text: currentQuestion?.question_text,
        answer_text: answerText,
        previous_questions: evaluations.map(e => e.question)
      };

      const res = await submitMockAnswer(payload);
      const evalData = res.data.evaluation;
      const nextQ = res.data.next_question;

      // Save evaluation item
      const newEvalRecord = {
        question_index: currentIndex,
        question: currentQuestion?.question_text,
        answer: answerText,
        evaluation: evalData
      };

      const updatedEvaluations = [...evaluations, newEvalRecord];
      setEvaluations(updatedEvaluations);
      setCurrentEval(evalData);
      setNextQuestionData(nextQ);

      if (res.data.is_finished || currentIndex >= selectedCount) {
        // Generate final performance report directly
        await generateReport(updatedEvaluations);
      } else {
        setStep("feedback");
      }
    } catch (err) {
      setError(getApiError(err, "Failed to evaluate your answer. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  // 3. Move to Next Question
  const handleNextQuestion = () => {
    if (nextQuestionData) {
      setCurrentQuestion(nextQuestionData);
      setCurrentIndex((prev) => prev + 1);
      setAnswerText("");
      setNextQuestionData(null);
      setCurrentEval(null);
      setTimeElapsed(0);
      setStep("interview");
    } else {
      generateReport(evaluations);
    }
  };

  // 4. Generate Final Report
  const generateReport = async (evalList) => {
    setLoading(true);
    setError("");
    try {
      const res = await finishMockInterview({
        session_id: sessionId || "session_mock",
        interview_type: selectedType,
        difficulty: selectedDifficulty,
        evaluations: evalList || evaluations
      });
      setFinalReport(res.data);
      setStep("report");
    } catch (err) {
      setError(getApiError(err, "Failed to generate interview report. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  // 5. Restart Interview
  const handleRestart = () => {
    setStep("setup");
    setSessionId(null);
    setCurrentQuestion(null);
    setAnswerText("");
    setEvaluations([]);
    setCurrentEval(null);
    setFinalReport(null);
    setError("");
    setTimeElapsed(0);
  };

  const wordCount = answerText.split(/\s+/).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 px-4 sm:px-6 py-8">
      <ApiStatusBanner />

      <div className="max-w-4xl mx-auto">
        
        {/* Navigation Header */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-xs font-semibold mb-6"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {/* ── STEP 1: INTERVIEW SETUP SCREEN ──────────────────────────────── */}
        {step === "setup" && (
          <div className="space-y-8 animate-fade-in">
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-purple-blue flex items-center justify-center text-white shadow-md">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold badge-purple-light uppercase tracking-wider mb-1">
                  <Sparkles className="w-3 h-3 text-purple-600" /> Multi-Round AI Simulator
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  AI Mock Interview Setup
                </h1>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                {error}
              </div>
            )}

            {/* 1. Select Interview Type */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                1. Select Interview Type
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {INTERVIEW_TYPES.map((type) => (
                  <div
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`saas-light-card p-5 cursor-pointer border transition-all ${
                      selectedType === type.id
                        ? "border-purple-500 bg-purple-50/50 shadow-xs"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        {type.icon}
                      </div>
                      <span className="text-[10px] font-bold badge-purple-light px-2.5 py-0.5 rounded-full uppercase">
                        {type.badge}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base mb-1">{type.label}</h3>
                    <p className="text-slate-500 text-xs">{type.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Select Difficulty */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                2. Select Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-4">
                {DIFFICULTIES.map((diff) => (
                  <button
                    key={diff.id}
                    onClick={() => setSelectedDifficulty(diff.id)}
                    className={`py-3 px-4 rounded-xl text-xs font-bold transition-all border text-center ${
                      selectedDifficulty === diff.id
                        ? "bg-gradient-purple-blue text-white border-transparent shadow-xs"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div>{diff.label}</div>
                    <div className="text-[10px] font-normal opacity-80 mt-0.5">{diff.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Select Number of Questions */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                3. Number of Questions
              </label>
              <div className="flex gap-4">
                {QUESTION_COUNTS.map((count) => (
                  <button
                    key={count}
                    onClick={() => setSelectedCount(count)}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all border text-center ${
                      selectedCount === count
                        ? "bg-purple-100 text-purple-800 border-purple-300 font-extrabold shadow-2xs"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {count} Questions
                  </button>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStartInterview}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-purple-blue hover:bg-gradient-purple-blue-hover text-white disabled:opacity-50 py-4 rounded-xl font-bold text-sm shadow-md shadow-purple-500/20 transition-all hover:-translate-y-0.5"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Generating Interview Session with Gemini AI...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-white" /> Start AI Mock Interview
                </>
              )}
            </button>

          </div>
        )}

        {/* ── STEP 2: LIVE QUESTION & ANSWER SESSION ───────────────────────── */}
        {step === "interview" && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Header & Progress Indicator */}
            <div className="saas-light-card p-5 bg-white border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold badge-purple-light px-2.5 py-0.5 rounded-full uppercase">
                    {selectedType}
                  </span>
                  <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full uppercase">
                    {selectedDifficulty}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900">
                  Question {currentIndex} of {selectedCount}
                </h2>
              </div>

              <div className="flex items-center gap-4">
                {/* Timer */}
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold text-slate-700">
                  <Clock className="w-4 h-4 text-purple-600" />
                  {formatTime(timeElapsed)}
                </div>

                <button
                  onClick={() => generateReport(evaluations)}
                  className="text-xs font-bold text-red-600 hover:text-red-800 transition-colors"
                >
                  End Early
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-purple-blue h-full rounded-full transition-all duration-500"
                style={{ width: `${(currentIndex / selectedCount) * 100}%` }}
              />
            </div>

            {/* Question Display Card */}
            <div className="saas-light-card p-8 border-purple-200 bg-white relative overflow-hidden shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-600" /> Prompt #{currentIndex}
                </span>
                <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {currentQuestion?.focus_area || selectedType}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-relaxed">
                {currentQuestion?.question_text || "Loading question prompt..."}
              </h3>
            </div>

            {/* Answer Text Box */}
            <div className="saas-light-card p-6 bg-white border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-purple-600" /> Your Response
                </label>
                <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded border ${
                  wordCount >= 25 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
                }`}>
                  {wordCount} words
                </span>
              </div>

              <textarea
                rows={8}
                placeholder="Type your response here... Gemini AI will evaluate answer quality, technical accuracy, relevance, communication clarity, and confidence."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-xs leading-relaxed resize-none shadow-inner"
                value={answerText}
                onChange={(e) => { setAnswerText(e.target.value); setError(""); }}
              />

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  {error}
                </div>
              )}

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleSubmitAnswer}
                  disabled={loading || !answerText.trim()}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-purple-blue hover:bg-gradient-purple-blue-hover text-white disabled:opacity-50 py-3.5 rounded-xl font-bold text-xs shadow-md shadow-purple-500/20 transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Evaluating Answer with Gemini...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Submit Answer for AI Feedback
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ── STEP 3: QUESTION EVALUATION FEEDBACK POPUP ───────────────────── */}
        {step === "feedback" && currentEval && (
          <div className="space-y-6 animate-fade-in">
            
            <div className="saas-light-card p-6 bg-white border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base font-bold text-slate-900">Question #{currentIndex} Evaluated</h3>
                </div>
                <span className="text-xs font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
                  Score: {Math.round(currentEval.score)} / 100
                </span>
              </div>

              <p className="text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 italic">
                "{currentEval.feedback_summary}"
              </p>

              {/* Sub Scores Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 text-center">
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Relevance</p>
                  <p className="text-xl font-extrabold text-purple-600">{Math.round(currentEval.relevance_score)}%</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Technical</p>
                  <p className="text-xl font-extrabold text-blue-600">{Math.round(currentEval.technical_correctness)}%</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Communication</p>
                  <p className="text-xl font-extrabold text-cyan-600">{Math.round(currentEval.communication_score)}%</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Confidence</p>
                  <p className="text-xl font-extrabold text-emerald-600">{Math.round(currentEval.confidence_score)}%</p>
                </div>
              </div>

              {/* Pointers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Strengths
                  </span>
                  {currentEval.strengths?.map((s, i) => (
                    <p key={i} className="text-emerald-800">• {s}</p>
                  ))}
                </div>

                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-amber-900 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-amber-600" /> Areas for Improvement
                  </span>
                  {currentEval.improvements?.map((imp, i) => (
                    <p key={i} className="text-amber-800">• {imp}</p>
                  ))}
                </div>
              </div>

              <button
                onClick={handleNextQuestion}
                className="w-full flex items-center justify-center gap-2 bg-gradient-purple-blue hover:bg-gradient-purple-blue-hover text-white py-3.5 rounded-xl font-bold text-xs shadow-md transition-all"
              >
                <span>Proceed to Question #{currentIndex + 1}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* ── STEP 4: FINAL INTERVIEW PERFORMANCE REPORT ─────────────────────── */}
        {step === "report" && finalReport && (
          <div className="space-y-8 animate-fade-in">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-purple-blue flex items-center justify-center text-white shadow-md">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold badge-purple-light uppercase tracking-wider mb-1">
                    <Sparkles className="w-3 h-3 text-purple-600" /> Gemini AI Performance Report
                  </div>
                  <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    Interview Performance Report
                  </h1>
                </div>
              </div>

              <button
                onClick={handleRestart}
                className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 px-4 py-2 rounded-xl text-xs font-bold transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Restart Interview
              </button>
            </div>

            {/* Score Grid & Radar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Overall Score Card */}
              <div className="saas-light-card p-8 border-purple-200 bg-white flex flex-col items-center justify-center text-center shadow-md">
                <Award className="w-12 h-12 text-amber-500 mb-3" />
                <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-1">Overall Mock Score</p>
                <div className="text-6xl font-black text-slate-900 tracking-tight mb-2">
                  {Math.round(finalReport.overall_score)}<span className="text-2xl text-slate-400 font-normal">/100</span>
                </div>
                <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs px-3 py-1 rounded-full font-bold">
                  {finalReport.overall_score >= 80 ? "Passed Mock Interview 🎉" : "Good Attempt 👍"}
                </span>
              </div>

              {/* Sub Scores */}
              <div className="md:col-span-2 saas-light-card p-6 bg-white border-slate-200 flex flex-col justify-between">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Competency Breakdown</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl">
                    <p className="text-xs font-bold text-slate-500">Communication</p>
                    <p className="text-3xl font-extrabold text-purple-700">{Math.round(finalReport.communication_score)}%</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                    <p className="text-xs font-bold text-slate-500">Technical</p>
                    <p className="text-3xl font-extrabold text-blue-700">{Math.round(finalReport.technical_score)}%</p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                    <p className="text-xs font-bold text-slate-500">Confidence</p>
                    <p className="text-3xl font-extrabold text-emerald-700">{Math.round(finalReport.confidence_score)}%</p>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 mt-4 italic text-center">
                  Completed {evaluations.length} question rounds under {selectedDifficulty} difficulty settings.
                </p>
              </div>

            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="saas-light-card p-6 border-emerald-200 bg-emerald-50/60">
                <h3 className="font-bold text-emerald-900 mb-4 flex items-center gap-2 text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Key Strengths Observed
                </h3>
                <ul className="space-y-2 text-xs text-slate-800">
                  {finalReport.strengths?.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="saas-light-card p-6 border-amber-200 bg-amber-50/60">
                <h3 className="font-bold text-amber-900 mb-4 flex items-center gap-2 text-xs uppercase tracking-wider">
                  <Target className="w-4 h-4 text-amber-600" /> Areas to Work On
                </h3>
                <ul className="space-y-2 text-xs text-slate-800">
                  {finalReport.weaknesses?.map((w, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Recommendations & Practice Topics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="saas-light-card p-6 bg-white border-slate-200">
                <h3 className="font-bold text-purple-800 mb-4 flex items-center gap-2 text-xs uppercase tracking-wider">
                  <Zap className="w-4 h-4 text-purple-600" /> Improvement Suggestions
                </h3>
                <ul className="space-y-2 text-xs text-slate-700">
                  {finalReport.improvement_suggestions?.map((imp, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="saas-light-card p-6 bg-white border-slate-200">
                <h3 className="font-bold text-blue-800 mb-4 flex items-center gap-2 text-xs uppercase tracking-wider">
                  <BookOpen className="w-4 h-4 text-blue-600" /> Recommended Topics to Practice
                </h3>
                <div className="flex flex-wrap gap-2">
                  {finalReport.recommended_topics?.map((topic, idx) => (
                    <span key={idx} className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 border border-blue-200 text-blue-800">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Per-Question Answer Breakdown */}
            <div className="saas-light-card p-6 bg-white border-slate-200">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-xs uppercase tracking-wider">
                <MessageSquare className="w-4 h-4 text-purple-600" /> Per-Question Performance Log
              </h3>
              <div className="space-y-4">
                {evaluations.map((item, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-700">Q{idx + 1}: {item.question}</span>
                      <span className="font-bold text-slate-900 bg-white border border-slate-200 px-2.5 py-0.5 rounded-md">
                        Score: {Math.round(item.evaluation?.score || 80)} / 100
                      </span>
                    </div>
                    <p className="text-slate-600 italic bg-white p-3 rounded-xl border border-slate-200">
                      "{item.answer}"
                    </p>
                    <p className="text-slate-500 font-medium">
                      Feedback: {item.evaluation?.feedback_summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-200">
              <button
                onClick={handleRestart}
                className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-slate-100 border border-slate-200 py-3.5 rounded-xl font-bold transition-all text-xs text-slate-800"
              >
                <RotateCcw className="w-4 h-4" /> Start Another Mock Interview
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-purple-blue text-white py-3.5 rounded-xl font-bold transition-all shadow-md text-xs"
              >
                Return to Dashboard
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
