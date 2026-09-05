import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  BrainCircuit, Mail, Lock, ArrowRight, Loader2, AlertCircle,
  Sparkles, CheckCircle2, Mic, BarChart3, Shield, Star
} from "lucide-react";
import { loginUser, getApiError } from "../services/api";
import { useAuth } from "../context/AuthContext";
import ApiStatusBanner from "../components/ApiStatusBanner";

/* ---------- decorative left panel feature data ---------- */
const FEATURES = [
  {
    icon: Mic,
    title: "AI-Powered Speech Analysis",
    desc: "Real-time feedback on clarity, filler words, and pacing",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking Dashboard",
    desc: "Watch your communication scores improve over time",
  },
  {
    icon: Shield,
    title: "Interview Ready in Days",
    desc: "Personalised drills curated for your target role",
  },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const from = location.state?.from?.pathname || "/dashboard";

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await loginUser(form);
      setSuccess(true);
      login(res.data.access_token);
      setTimeout(() => navigate(from, { replace: true }), 800);
    } catch (err) {
      setError(getApiError(err, "Incorrect email or password. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mesh-light flex items-stretch relative overflow-hidden">
      <ApiStatusBanner />

      {/* decorative blur blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full bg-purple-400/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[480px] h-[480px] rounded-full bg-blue-400/20 blur-3xl" />
      </div>

      {/* LEFT PANEL */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] relative flex-col justify-between p-12 bg-gradient-purple-blue overflow-hidden">
        {/* inner glow blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-80px] left-[-80px] w-[400px] h-[400px] rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-[-60px] right-[-60px] w-[350px] h-[350px] rounded-full bg-indigo-300/20 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-purple-300/10 blur-2xl" />
        </div>

        {/* grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* top logo */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold text-white tracking-tight">AI Coach</span>
          </Link>
        </div>

        {/* main copy */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/25 text-white/90 text-xs font-semibold w-fit mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Powered by Gemini AI
          </div>

          <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight tracking-tight mb-4">
            Speak with<br />
            <span className="text-white/70">confidence.</span>
          </h2>
          <p className="text-white/70 text-sm leading-relaxed max-w-sm mb-10">
            AI-driven communication coaching that gives you real interview-ready skills —
            not just tips.
          </p>

          {/* feature bullets */}
          <div className="space-y-5">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0 text-white">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{title}</p>
                  <p className="text-white/60 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* testimonial card */}
        <div className="relative z-10 saas-light-card bg-white/10 border-white/20 backdrop-blur-sm rounded-2xl p-5">
          <div className="flex gap-0.5 mb-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <p className="text-white/90 text-sm italic leading-relaxed mb-4">
            "My interview confidence went from a 4 to a 9 in two weeks. The AI feedback
            was brutally honest and incredibly useful."
          </p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-300 to-indigo-400 flex items-center justify-center text-white text-xs font-bold">
              AR
            </div>
            <div>
              <p className="text-white font-semibold text-xs">Alex Rivera</p>
              <p className="text-white/50 text-xs">Software Engineer · Google</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL — FORM */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-14 sm:px-10 lg:px-16 xl:px-24">
        <div className="w-full max-w-md animate-fade-in">

          {/* mobile logo */}
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <Link to="/" className="inline-flex items-center gap-3 group mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-purple-blue flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">AI Coach</span>
            </Link>
          </div>

          {/* heading row */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold badge-purple-light mb-4">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Powered by Gemini AI
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
              Welcome back
            </h1>
            <p className="text-slate-500 text-sm">
              Sign in to resume your AI communication practice
            </p>
          </div>

          {/* card */}
          <div className="saas-light-card border-slate-200/90 rounded-3xl p-8 shadow-xl bg-white/90 backdrop-blur-md">

            {success && (
              <div className="mb-6 flex items-start gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3.5 text-xs font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                Signed in successfully! Redirecting to dashboard…
              </div>
            )}

            {error && (
              <div className="mb-6 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3.5 text-xs">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>

              {/* Email */}
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="candidate@example.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="login-password"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    id="login-password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm"
                    value={form.password}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-purple-blue hover:bg-gradient-purple-blue-hover disabled:opacity-60 disabled:cursor-not-allowed py-3.5 rounded-xl font-bold transition-all shadow-md shadow-purple-500/20 text-sm text-white mt-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Authenticating…
                  </>
                ) : (
                  <>
                    Sign In to Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-slate-500 text-xs mt-6 font-medium">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="text-purple-600 hover:text-purple-800 font-bold transition-colors">
                Create one free
              </Link>
            </p>
          </div>

          {/* trust line */}
          <p className="text-center text-slate-400 text-xs mt-6">
            Secured with industry-standard encryption · No credit card required
          </p>
        </div>
      </div>
    </div>
  );
}
