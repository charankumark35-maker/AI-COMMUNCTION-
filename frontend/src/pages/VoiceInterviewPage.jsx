import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ChevronLeft, Mic, MicOff, Square,
  Send, RefreshCw, Loader2, AlertCircle, Sparkles
} from "lucide-react";
import { generateQuestion, analyzeVoice } from "../services/api";

const CATEGORIES = ["HR Interview", "Technical Interview", "Communication Practice"];

function WaveformBars({ active }) {
  return (
    <div className="flex items-end gap-1.5 h-12">
      {Array.from({ length: 14 }).map((_, i) => (
        <div
          key={i}
          className={`w-1.5 rounded-full transition-all duration-200 ${
            active ? "bg-red-500" : "bg-slate-300"
          }`}
          style={{
            height: active ? `${16 + Math.random() * 32}px` : "10px",
            animationDelay: `${i * 50}ms`,
          }}
        />
      ))}
    </div>
  );
}

export default function VoiceInterviewPage() {
  const navigate = useNavigate();

  const [category, setCategory]       = useState("HR Interview");
  const [question, setQuestion]       = useState(null);
  const [transcript, setTranscript]   = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [loadingQ, setLoadingQ]       = useState(false);
  const [loadingA, setLoadingA]       = useState(false);
  const [error, setError]             = useState("");

  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
  }, []);

  const fetchQuestion = useCallback(async () => {
    setLoadingQ(true);
    setError("");
    setTranscript("");
    try {
      const res = await generateQuestion(category);
      setQuestion(res.data);
    } catch {
      setError("Failed to generate question. Please try again.");
    } finally {
      setLoadingQ(false);
    }
  }, [category]);

  useEffect(() => { fetchQuestion(); }, [fetchQuestion]);

  const startRecording = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous      = true;
    recognition.interimResults  = true;
    recognition.lang            = "en-US";

    let finalTranscript = "";

    recognition.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalTranscript += t + " ";
        else interim = t;
      }
      setTranscript(finalTranscript + interim);
    };

    recognition.onerror = (e) => {
      setError(`Microphone error: ${e.error}. Please allow microphone access.`);
      setIsRecording(false);
    };

    recognition.onend = () => setIsRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    setError("");
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  const toggleRecording = () =>
    isRecording ? stopRecording() : startRecording();

  const handleSubmit = async () => {
    if (!transcript.trim()) {
      setError("No speech detected. Please record your answer first.");
      return;
    }
    setLoadingA(true);
    setError("");
    try {
      const res = await analyzeVoice(question?.question_text || category, transcript);
      navigate("/voice-result", {
        state: { result: res.data, question: question?.question_text, transcript },
      });
    } catch {
      setError("Analysis failed. Please try again.");
    } finally {
      setLoadingA(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Back */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-xs font-semibold mb-6"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-purple-blue flex items-center justify-center text-white shadow-md">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Voice Interview Simulation</h1>
            <p className="text-slate-500 text-xs">Speak your response naturally — Gemini evaluates pacing and fluency</p>
          </div>
        </div>

        {/* Browser Warning */}
        {!isSupported && (
          <div className="mb-6 flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 text-xs font-medium">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-600" />
            <div>
              <strong>Voice recognition not supported in this browser.</strong>
              <p className="text-amber-700 mt-0.5">
                Please use Google Chrome or Microsoft Edge for speech-to-text.
              </p>
            </div>
          </div>
        )}

        {/* Category Picker */}
        <div className="mb-6">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">Select Interview Category</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                id={`cat-${cat.toLowerCase().replace(/ /g, "-")}`}
                onClick={() => { setCategory(cat); setTranscript(""); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  category === cat
                    ? "bg-gradient-purple-blue text-white border-transparent shadow-xs"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Question Card */}
        <div className="saas-light-card p-8 mb-6 border-purple-200 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-purple-600" /> AI Question
            </div>
            <button
              id="refresh-voice-q"
              onClick={fetchQuestion}
              disabled={loadingQ}
              className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-purple-700 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingQ ? "animate-spin" : ""}`} />
              New Question
            </button>
          </div>
          {loadingQ ? (
            <div className="flex items-center gap-3 py-4">
              <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
              <span className="text-slate-500 text-xs">Generating speech scenario...</span>
            </div>
          ) : (
            <p className="text-xl md:text-2xl font-bold text-slate-900 leading-relaxed">
              {question?.question_text || "Loading prompt..."}
            </p>
          )}
        </div>

        {/* Recording Controls */}
        <div className="saas-light-card p-8 mb-6 bg-white border-slate-200">
          <div className="flex flex-col items-center gap-6">
            <WaveformBars active={isRecording} />

            <button
              id="record-btn"
              onClick={toggleRecording}
              disabled={!isSupported && !isRecording}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl ${
                isRecording
                  ? "bg-red-500 hover:bg-red-600 animate-pulse text-white shadow-red-500/30"
                  : "bg-gradient-purple-blue hover:bg-gradient-purple-blue-hover text-white shadow-purple-500/20 hover:scale-105"
              }`}
            >
              {isRecording ? <Square className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
            </button>

            <p className="text-xs font-semibold text-slate-600">
              {isRecording ? (
                <span className="text-red-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Recording live speech... Click to stop
                </span>
              ) : transcript ? "Recording completed" : "Click microphone button to begin speaking"}
            </p>
          </div>

          {/* Transcript Preview */}
          {transcript && (
            <div className="mt-6 border-t border-slate-100 pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Live Speech Transcript</p>
                <button
                  onClick={() => setTranscript("")}
                  className="text-xs font-semibold text-red-600 hover:text-red-800 transition-colors flex items-center gap-1"
                >
                  <MicOff className="w-3.5 h-3.5" /> Clear
                </button>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed bg-slate-50 border border-slate-200 rounded-xl p-4 italic">
                "{transcript}"
              </p>
              <p className="text-right text-[11px] font-mono text-slate-500 mt-2">
                {transcript.split(/\s+/).filter(Boolean).length} words spoken
              </p>
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              {error}
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          id="submit-voice"
          onClick={handleSubmit}
          disabled={loadingA || isRecording || !transcript.trim()}
          className="w-full flex items-center justify-center gap-2 bg-gradient-purple-blue hover:bg-gradient-purple-blue-hover text-white disabled:opacity-40 disabled:cursor-not-allowed py-4 rounded-xl font-bold transition-all text-xs shadow-md shadow-purple-500/20"
        >
          {loadingA ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Analysing Speech with Gemini...</>
          ) : (
            <><Send className="w-4 h-4" /> Submit Voice Answer for Analysis</>
          )}
        </button>
      </div>
    </div>
  );
}
