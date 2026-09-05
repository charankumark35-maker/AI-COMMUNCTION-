import { X, Play, BrainCircuit, Sparkles, CheckCircle2, Mic, Volume2 } from "lucide-react";
import { useState } from "react";

export default function DemoModal({ isOpen, onClose }) {
  const [activeStep, setActiveStep] = useState(1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 p-6 text-white flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Interactive Platform Demo</h3>
              <p className="text-purple-100 text-xs">See how Gemini AI analyzes your interview answers in real-time</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Demo Content */}
        <div className="p-6 md:p-8 space-y-6">
          
          {/* Step Selector */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { num: 1, label: "1. Question Selection" },
              { num: 2, label: "2. Voice & Text Input" },
              { num: 3, label: "3. AI Evaluation" },
            ].map((step) => (
              <button
                key={step.num}
                onClick={() => setActiveStep(step.num)}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                  activeStep === step.num
                    ? "bg-purple-50 text-purple-700 border-purple-300 shadow-sm"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {step.label}
              </button>
            ))}
          </div>

          {/* Step Displays */}
          {activeStep === 1 && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-full uppercase tracking-wider">HR Interview Module</span>
                <span className="text-xs text-slate-500 font-mono">Gemini-Pro Model</span>
              </div>
              <h4 className="text-lg font-bold text-slate-900 leading-snug">
                "Tell me about a time you managed a high-pressure project deadline under tight constraints."
              </h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                The Gemini AI dynamically selects or generates questions tailored specifically to your target role, seniority level, and industry standard interview practices.
              </p>
            </div>
          )}

          {activeStep === 2 && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full uppercase tracking-wider">Speech & Audio Processing</span>
                <span className="text-xs text-slate-500 font-mono">Real-time Web Speech</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-inner flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center animate-pulse">
                    <Mic className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Voice Recording Active...</p>
                    <p className="text-[11px] text-slate-500 font-mono">Transcript: "In my previous project, we faced a critical deadline..."</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400 font-mono">00:42</span>
              </div>
              <p className="text-slate-600 text-xs">
                Captures transcript text while simultaneously tracking pacing, filler words (like "um", "ah", "you know"), and pronunciation clarity.
              </p>
            </div>
          )}

          {activeStep === 3 && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">AI Analysis Dashboard</span>
                <span className="text-xs font-bold text-purple-700">Overall Score: 88 / 100</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <p className="text-xs text-slate-500 font-medium">Grammar</p>
                  <p className="text-xl font-extrabold text-purple-600">92%</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <p className="text-xs text-slate-500 font-medium">Vocabulary</p>
                  <p className="text-xl font-extrabold text-blue-600">85%</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <p className="text-xs text-slate-500 font-medium">Confidence</p>
                  <p className="text-xl font-extrabold text-emerald-600">87%</p>
                </div>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Structured response using the STAR method effectively!</span>
              </div>
            </div>
          )}

          {/* Footer controls */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400 font-medium">Step {activeStep} of 3</span>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl"
              >
                Close Demo
              </button>
              <button
                onClick={() => {
                  onClose();
                  window.location.href = "/register";
                }}
                className="px-5 py-2 text-xs font-semibold bg-gradient-purple-blue text-white rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                Try Free Practice Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
