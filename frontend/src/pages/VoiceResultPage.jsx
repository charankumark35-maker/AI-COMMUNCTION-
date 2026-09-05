import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, RefreshCw, CheckCircle, AlertCircle,
  TrendingUp, MessageSquare, BookOpen, Award, Mic, Gauge, CheckCircle2
} from "lucide-react";

const ScoreRing = ({ score, label, color, icon }) => {
  const radius = 36;
  const circ   = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 88 88">
          <circle cx="44" cy="44" r={radius} stroke="#e2e8f0" strokeWidth="8" fill="none" />
          <circle cx="44" cy="44" r={radius} stroke={color} strokeWidth="8" fill="none"
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
            className="transition-all duration-1000" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-extrabold text-slate-900">{score}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 text-xs font-semibold text-slate-600">
        {icon} {label}
      </div>
    </div>
  );
};

const TONE_CFG = {
  confident: { color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", label: "Confident Delivery 💪" },
  neutral:   { color: "text-amber-700",   bg: "bg-amber-50 border-amber-200",   label: "Neutral Tone 😐"   },
  hesitant:  { color: "text-red-700",     bg: "bg-red-50 border-red-200",       label: "Hesitant Phrasing 😟"  },
};

export default function VoiceResultPage() {
  const { state }  = useLocation();
  const navigate   = useNavigate();
  const result     = state?.result;
  const question   = state?.question;
  const transcript = state?.transcript;

  if (!result) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-center px-4">
        <div>
          <p className="text-slate-500 mb-4 text-xs font-semibold">No results found. Please complete a voice interview session first.</p>
          <Link to="/voice-interview" className="text-purple-600 hover:text-purple-800 font-bold text-xs">Go to Voice Session</Link>
        </div>
      </div>
    );
  }

  const { speech_feedback: sf, feedback } = result;
  const tone = TONE_CFG[feedback?.tone] || TONE_CFG.neutral;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 px-4 py-8">
      <div className="max-w-3xl mx-auto">

        <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-xs font-semibold mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-purple-blue flex items-center justify-center text-white shadow-md">
            <Mic className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Voice Analysis Complete</h1>
            <p className="text-slate-500 text-xs">Speech metrics & Gemini AI NLP feedback</p>
          </div>
        </div>

        {/* Question */}
        {question && (
          <div className="saas-light-card p-5 mb-6 border-slate-200 bg-white">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Evaluated Question</p>
            <p className="text-slate-900 text-sm font-semibold leading-relaxed">{question}</p>
          </div>
        )}

        {/* Transcript reviewed */}
        {transcript && (
          <div className="saas-light-card p-5 mb-6 border-slate-200 bg-white">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Your Spoken Answer</p>
            <p className="text-slate-700 text-xs leading-relaxed italic bg-slate-50 p-3 rounded-lg border border-slate-200">
              "{transcript}"
            </p>
          </div>
        )}

        {/* Overall Score */}
        <div className="bg-gradient-purple-blue text-white rounded-2xl p-6 mb-6 flex items-center justify-between shadow-md">
          <div>
            <p className="text-purple-100 text-xs font-bold uppercase tracking-wider mb-1">Overall Voice Score</p>
            <div className="text-5xl font-extrabold">
              {result.overall_score} <span className="text-base font-normal text-purple-200">/ 100</span>
            </div>
          </div>
          <Award className="w-14 h-14 text-white/30" />
        </div>

        {/* Score Rings */}
        <div className="saas-light-card p-8 mb-6 bg-white border-slate-200">
          <h2 className="font-bold text-slate-900 mb-6 flex items-center gap-2 text-xs uppercase tracking-wider">
            <TrendingUp className="w-4 h-4 text-purple-600" /> Speech Metric Breakdown
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 justify-items-center">
            <ScoreRing score={result.grammar_score}    label="Grammar"    color="#7c3aed" icon={<BookOpen className="w-3 h-3" />} />
            <ScoreRing score={result.vocabulary_score} label="Vocabulary"  color="#2563eb" icon={<MessageSquare className="w-3 h-3" />} />
            <ScoreRing score={result.confidence_score} label="Confidence"  color="#059669" icon={<TrendingUp className="w-3 h-3" />} />
            <ScoreRing score={result.pace_score}       label="Pace"        color="#d97706" icon={<Gauge className="w-3 h-3" />} />
          </div>
        </div>

        {/* Tone */}
        <div className={`saas-light-card p-5 mb-6 border ${tone.bg}`}>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Detected Communication Tone</p>
          <p className={`text-base font-extrabold ${tone.color}`}>{tone.label}</p>
        </div>

        {/* Speech Metrics */}
        <div className="saas-light-card p-6 mb-6 bg-white border-slate-200">
          <h2 className="font-bold text-slate-900 mb-5 flex items-center gap-2 text-xs uppercase tracking-wider">
            <Mic className="w-4 h-4 text-purple-600" /> Voice Delivery Metrics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Words Spoken",   value: sf?.word_count },
              { label: "Filler Words",   value: sf?.filler_count },
              { label: "Filler Ratio",   value: `${sf?.filler_ratio_pct}%` },
              { label: "Clarity Bonus",  value: `+${sf?.clarity_bonus}` },
            ].map((m) => (
              <div key={m.label} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-center">
                <p className="text-xl font-extrabold text-slate-900 mb-0.5">{m.value}</p>
                <p className="text-[11px] font-semibold text-slate-500">{m.label}</p>
              </div>
            ))}
          </div>

          <div className={`mt-4 rounded-xl p-3 text-xs flex items-center gap-2 border font-medium ${
            sf?.filler_count === 0 ? "bg-emerald-50 text-emerald-800 border-emerald-200"
            : "bg-amber-50 text-amber-800 border-amber-200"
          }`}>
            {sf?.filler_count === 0
              ? <><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Zero filler words — crisp & professional speech!</>
              : <><AlertCircle className="w-4 h-4 text-amber-600" /> Fillers detected: <span className="font-mono font-bold">{sf?.fillers_detected?.join(", ")}</span></>
            }
          </div>
          
          <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 flex items-center gap-2">
            <Gauge className="w-4 h-4 text-orange-500 shrink-0" />
            <span>Pacing Assessment: <strong>{sf?.pace_assessment}</strong></span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate("/voice-interview")}
            className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-slate-100 border border-slate-200 py-3.5 rounded-xl font-bold transition-all text-xs text-slate-800"
          >
            <RefreshCw className="w-4 h-4" /> Practice Another Voice Prompt
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-purple-blue text-white py-3.5 rounded-xl font-bold transition-all shadow-md text-xs"
          >
            <TrendingUp className="w-4 h-4" /> View Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
