import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  BrainCircuit, ArrowLeft, RefreshCw, CheckCircle2, AlertCircle, TrendingUp, MessageSquare,
  BookOpen, Award, Sparkles, ShieldCheck, Target, Lightbulb, Zap
} from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const toneConfig = {
  confident: { color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", label: "Confident & Articulate 💪" },
  neutral: { color: "text-amber-700", bg: "bg-amber-50 border-amber-200", label: "Neutral Delivery 😐" },
  hesitant: { color: "text-red-700", bg: "bg-red-50 border-red-200", label: "Hesitant Phrasing 😟" },
};

export default function ResultPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const result = state?.result;
  const question = state?.question;

  if (!result) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-center px-4">
        <div className="saas-light-card p-10 max-w-md border-slate-200">
          <BrainCircuit className="w-12 h-12 text-purple-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">No Report Data Found</h2>
          <p className="text-slate-600 mb-8 text-xs">Please complete an interview practice session to view your AI performance report.</p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 bg-gradient-purple-blue text-white px-6 py-3 rounded-xl font-bold text-xs shadow-md transition-all"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const grammarScore = result.scores?.grammar_score ?? result.grammar_score ?? 80;
  const vocabularyScore = result.scores?.vocabulary_score ?? result.vocabulary_score ?? 80;
  const confidenceScore = result.scores?.confidence_score ?? result.confidence_score ?? 80;
  const overallScore = result.scores?.overall_score ?? result.overall_score ?? 80;

  const feedback = result.feedback || {};
  const tone = toneConfig[feedback?.tone] || toneConfig.neutral;

  const getScoreLabel = (s) => (s >= 85 ? "Excellent Performance" : s >= 70 ? "Good Performance" : s >= 50 ? "Needs Practice" : "Requires Improvement");
  const overallLabel = getScoreLabel(overallScore);

  const chartData = [
    { subject: 'Grammar', A: grammarScore, fullMark: 100 },
    { subject: 'Vocabulary', A: vocabularyScore, fullMark: 100 },
    { subject: 'Confidence', A: confidenceScore, fullMark: 100 },
    { subject: 'Overall', A: overallScore, fullMark: 100 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 px-4 sm:px-6 py-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Navigation */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-xs font-semibold mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-purple-blue flex items-center justify-center shadow-md shadow-purple-500/20">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold badge-purple-light mb-1 uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-purple-600" /> AI Report Dashboard
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">AI Evaluation Report</h1>
            </div>
          </div>
        </div>

        {/* Question Reviewed Card */}
        {question && (
          <div className="saas-light-card p-6 mb-8 border-slate-200 bg-white shadow-xs">
            <p className="text-[10px] font-bold text-purple-700 uppercase tracking-wider mb-2 flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5" /> Evaluated Interview Prompt
            </p>
            <p className="text-slate-800 text-lg leading-relaxed font-semibold">"{question}"</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Main Overall Score Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="saas-light-card p-8 border-purple-200 bg-white flex flex-col items-center justify-center text-center relative overflow-hidden shadow-md shadow-purple-500/5">
              <Award className="w-12 h-12 text-amber-500 mb-3 drop-shadow-sm" />
              <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-2">Overall Score</p>
              <div className="text-6xl font-black text-slate-900 tracking-tight mb-2">
                {Math.round(overallScore)}<span className="text-2xl text-slate-400 font-normal">/100</span>
              </div>
              <p className="text-emerald-800 text-xs font-bold bg-emerald-100 px-3.5 py-1 rounded-full border border-emerald-200">
                {overallLabel}
              </p>
            </div>

            {/* Radar Chart */}
            <div className="saas-light-card p-6 border-slate-200 h-64 bg-white">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">Performance Radar</h3>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Score" dataKey="A" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.25} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Communication Tone */}
            <div className={`saas-light-card p-5 border ${tone.bg}`}>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Detected Tone</p>
              <p className={`text-lg font-extrabold ${tone.color}`}>{tone.label}</p>
            </div>
          </div>

          {/* Score Cards Breakdown */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="grid grid-cols-3 gap-4">
              <div className="saas-light-card p-5 border-slate-200 bg-white">
                <BookOpen className="w-5 h-5 text-purple-600 mb-2" />
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Grammar</p>
                <p className="text-3xl font-extrabold text-slate-900">{Math.round(grammarScore)}</p>
              </div>
              <div className="saas-light-card p-5 border-slate-200 bg-white">
                <MessageSquare className="w-5 h-5 text-blue-600 mb-2" />
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Vocabulary</p>
                <p className="text-3xl font-extrabold text-slate-900">{Math.round(vocabularyScore)}</p>
              </div>
              <div className="saas-light-card p-5 border-slate-200 bg-white">
                <TrendingUp className="w-5 h-5 text-emerald-600 mb-2" />
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Confidence</p>
                <p className="text-3xl font-extrabold text-slate-900">{Math.round(confidenceScore)}</p>
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Strengths */}
              <div className="saas-light-card p-6 border-emerald-200 bg-emerald-50/60">
                <h3 className="font-bold text-emerald-800 mb-4 flex items-center gap-2 text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Key Strengths
                </h3>
                {feedback?.strengths?.length > 0 ? (
                  <ul className="space-y-3">
                    {feedback.strengths.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-relaxed font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-xs text-slate-500">No specific strengths detected.</p>}
              </div>

              {/* Weaknesses */}
              <div className="saas-light-card p-6 border-amber-200 bg-amber-50/60">
                <h3 className="font-bold text-amber-800 mb-4 flex items-center gap-2 text-xs uppercase tracking-wider">
                  <Target className="w-4 h-4 text-amber-600" /> Areas to Improve
                </h3>
                {feedback?.weaknesses?.length > 0 ? (
                  <ul className="space-y-3">
                    {feedback.weaknesses.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span className="leading-relaxed font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-xs text-slate-500">No major weaknesses detected.</p>}
              </div>

            </div>

            {/* Suggestions Card */}
            {feedback?.improvement_suggestions?.length > 0 && (
              <div className="saas-light-card p-6 border-purple-200 bg-white">
                <h3 className="font-bold text-purple-800 mb-4 flex items-center gap-2 text-xs uppercase tracking-wider">
                  <Zap className="w-4 h-4 text-purple-600" /> Actionable AI Recommendations
                </h3>
                <div className="grid gap-3">
                  {feedback.improvement_suggestions.map((item, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex gap-3.5 items-start">
                      <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold shrink-0">
                        {idx + 1}
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed pt-0.5">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Detailed Feedback Sections: Grammar Diffs & Vocabulary Upgrades */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          
          {/* Grammar Mistakes */}
          <div className="saas-light-card p-6 border-slate-200 bg-white">
            <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2 text-xs uppercase tracking-wider">
              <BookOpen className="w-4 h-4 text-red-600" /> Grammar Corrections
            </h3>
            {feedback?.grammar_mistakes?.length > 0 ? (
              <div className="space-y-3">
                {feedback.grammar_mistakes.map((m, i) => (
                  <div key={i} className="bg-red-50/70 border border-red-200 rounded-xl p-4 text-xs">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="text-red-700 font-mono bg-red-100 px-2 py-0.5 rounded border border-red-200 line-through">
                        {m.error}
                      </span>
                      <span className="text-slate-400 font-bold">→</span>
                      <span className="text-emerald-700 font-mono bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                        {m.correction}
                      </span>
                    </div>
                    <p className="text-slate-600 text-xs mt-2">{m.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 text-emerald-800 text-xs font-semibold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Flawless grammar! No mistakes detected by Gemini.</span>
              </div>
            )}
          </div>

          {/* Vocabulary Suggestions */}
          <div className="saas-light-card p-6 border-slate-200 bg-white">
            <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2 text-xs uppercase tracking-wider">
              <Lightbulb className="w-4 h-4 text-amber-500" /> Vocabulary Upgrades
            </h3>
            {feedback?.vocabulary_suggestions?.length > 0 ? (
              <div className="space-y-3">
                {feedback.vocabulary_suggestions.map((v, i) => (
                  <div key={i} className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 text-xs">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-500">Instead of:</span>
                        <span className="text-amber-800 font-mono bg-amber-100 px-2 py-0.5 rounded border border-amber-200">{v.word}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs flex-wrap">
                        <span className="text-slate-500">Try using:</span>
                        {v.suggestions?.map((s) => (
                          <span key={s} className="text-purple-700 font-mono bg-purple-100 px-2 py-0.5 rounded border border-purple-200 font-bold">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 text-emerald-800 text-xs font-semibold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Excellent vocabulary choices used throughout!</span>
              </div>
            )}
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-200">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-slate-100 border border-slate-200 py-4 rounded-xl font-bold transition-all text-xs text-slate-800"
          >
            <RefreshCw className="w-4 h-4" /> Practice Another Prompt
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-purple-blue text-white py-4 rounded-xl font-bold transition-all shadow-md text-xs"
          >
            <TrendingUp className="w-4 h-4" /> Return to Dashboard
          </button>
        </div>

      </div>
    </div>
  );
}
