import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  BrainCircuit, User, Mail, Lock, GraduationCap, BarChart2,
  Loader2, ArrowRight, CheckCircle2, AlertCircle, Sparkles,
  Users, Zap, Target, TrendingUp, Star
} from "lucide-react";
import { registerUser, getApiError } from "../services/api";
import ApiStatusBanner from "../components/ApiStatusBanner";

/* ---------- left panel data ---------- */
const FEATURES = [
  {
    icon: Zap,
    title: "Instant AI Feedback",
    desc: "Get scored on every response in real time",
  },
  {
    icon: Target,
    title: "Role-specific Coaching",
    desc: "Practice questions tuned to your target position",
  },
  {
    icon: TrendingUp,
    title: "Track Your Growth",
    desc: "Visualise score trends across all your sessions",
  },
];

/* Avatar initials for social proof stack */
const AVATARS = [
  { initials: "SR", from: "from-blue-400", to: "to-indigo-500" },
  { initials: "MK", from: "from-indigo-400", to: "to-purple-500" },
  { initials: "TL", from: "from-purple-400", to: "to-pink-400" },
  { initials: "AJ", from: "from-sky-400", to: "to-blue-500" },
];

/* Form fields metadata for the progress feel */
const STEPS = ["Account", "Profile", "Preferences"];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", password: "",
    education: "", skill_level: "Beginner", target_role: "",
  });

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    setError("");
    try {
      await registerUser(form);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(getApiError(err, "Registration failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  /* ── success screen ── */
  if (success) {
    return (
      <div className="min-h-screen bg-mesh-light flex items-center justify-center px-4">
        <div className="saas-light-card p-10 max-w-sm w-full text-center border-emerald-200 bg-white rounded-3xl shadow-xl animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Account Created!</h2>
          <p className="text-slate-500 text-xs mb-6">Redirecting you to sign in…</p>
          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh-light flex items-stretch relative overflow-hidden">
      <ApiStatusBanner />

      {/* decorative blur blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[560px] h-[560px] rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-indigo-400/20 blur-3xl" />
      </div>

      {/* ═══════════════════ LEFT PANEL ═══════════════════ */}
      <div
        className="hidden lg:flex lg:w-[48%] xl:w-[45%] relative flex-col justify-between p-12 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #3b82f6 0%, #4f46e5 50%, #7c3aed 100%)",
        }}
      >
        {/* inner glow blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-100px] right-[-60px] w-[380px] h-[380px] rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-[-80px] left-[-40px] w-[320px] h-[320px] rounded-full bg-blue-300/20 blur-3xl" />
        </div>

        {/* grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />

        {/* logo */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold text-white tracking-tight">AI Coach</span>
          </Link>
        </div>

        {/* hero copy */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-10">
          {/* social proof */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex -space-x-2">
              {AVATARS.map((a) => (
                <div
                  key={a.initials}
                  className={`w-8 h-8 rounded-full bg-gradient-to-br ${a.from} ${a.to} flex items-center justify-center text-white text-[10px] font-bold border-2 border-white/30 shadow`}
                >
                  {a.initials}
                </div>
              ))}
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Join 10,000+ professionals</p>
              <div className="flex items-center gap-1 mt-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-white/60 text-xs ml-1">4.9 / 5</span>
              </div>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/25 text-white/90 text-xs font-semibold w-fit mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            Free to start · No card needed
          </div>

          <h2 className="text-4xl xl:text-[2.7rem] font-extrabold text-white leading-tight tracking-tight mb-4">
            Land your<br />
            <span className="text-white/70">dream role.</span>
          </h2>
          <p className="text-white/65 text-sm leading-relaxed max-w-xs mb-10">
            Personalised AI coaching that adapts to your skill level and target role —
            so every practice session counts.
          </p>

          {/* feature list */}
          <div className="space-y-5">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0 text-white">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{title}</p>
                  <p className="text-white/55 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* bottom stat bar */}
        <div className="relative z-10 grid grid-cols-3 gap-3">
          {[
            { value: "10K+", label: "Professionals" },
            { value: "98%", label: "Satisfaction" },
            { value: "2 wks", label: "Avg. improvement" },
          ].map(({ value, label }) => (
            <div key={label} className="saas-light-card bg-white/10 border-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-white font-extrabold text-lg">{value}</p>
              <p className="text-white/55 text-xs">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════ RIGHT PANEL — FORM ═══════════════════ */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 sm:px-10 lg:px-14 xl:px-20 overflow-y-auto">
        <div className="w-full max-w-lg animate-fade-in">

          {/* mobile logo */}
          <div className="flex flex-col items-center mb-6 lg:hidden">
            <Link to="/" className="inline-flex items-center gap-3 group mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-purple-blue flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">AI Coach</span>
            </Link>
          </div>

          {/* heading */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold badge-purple-light mb-4">
              <Users className="w-3.5 h-3.5 text-purple-600" /> Join 10,000+ professionals
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
              Create your free account
            </h1>
            <p className="text-slate-500 text-sm">
              Start improving your interview speaking &amp; vocabulary with Gemini AI
            </p>
          </div>

          {/* progress indicator */}
          <div className="flex items-center gap-2 mb-7">
            {STEPS.map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                      i === 0
                        ? "bg-gradient-purple-blue text-white border-transparent"
                        : "bg-slate-100 text-slate-400 border-slate-200"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span className={`text-xs font-semibold ${i === 0 ? "text-purple-700" : "text-slate-400"}`}>
                    {step}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="h-px w-8 bg-slate-200" />
                )}
              </div>
            ))}
          </div>

          {/* card */}
          <div className="saas-light-card border-slate-200/90 rounded-3xl p-8 shadow-xl bg-white/90 backdrop-blur-md">

            {error && (
              <div className="mb-5 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3.5 text-xs">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>

              {/* Name + Email row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label htmlFor="reg-name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      id="reg-name" name="name" type="text" required placeholder="Alex Rivera"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm"
                      value={form.name} onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="reg-email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      id="reg-email" name="email" type="email" required placeholder="you@example.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm"
                      value={form.email} onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="reg-password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    id="reg-password" name="password" type="password" required placeholder="At least 6 characters"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm"
                    value={form.password} onChange={handleChange}
                  />
                </div>
                {/* password strength hint */}
                {form.password.length > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex gap-1 flex-1">
                      {[2, 4, 6, 8].map((threshold) => (
                        <div
                          key={threshold}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            form.password.length >= threshold
                              ? form.password.length < 6
                                ? "bg-amber-400"
                                : "bg-emerald-500"
                              : "bg-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`text-[10px] font-semibold ${
                      form.password.length < 6 ? "text-amber-500" : "text-emerald-600"
                    }`}>
                      {form.password.length < 6 ? "Too short" : "Good"}
                    </span>
                  </div>
                )}
              </div>

              {/* Education + Target Role row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Education */}
                <div>
                  <label htmlFor="reg-education" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Education <span className="text-slate-400 font-normal lowercase">(optional)</span>
                  </label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      id="reg-education" name="education" type="text" placeholder="B.Tech, MBA…"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm"
                      value={form.education} onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Target Role */}
                <div>
                  <label htmlFor="reg-target-role" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Target Role <span className="text-slate-400 font-normal lowercase">(optional)</span>
                  </label>
                  <div className="relative">
                    <BrainCircuit className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      id="reg-target-role" name="target_role" type="text" placeholder="Software Engineer…"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm"
                      value={form.target_role || ""} onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Skill Level */}
              <div>
                <label htmlFor="reg-skill-level" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Current Skill Level
                </label>
                <div className="relative">
                  <BarChart2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <select
                    id="reg-skill-level" name="skill_level"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm appearance-none"
                    value={form.skill_level} onChange={handleChange}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              {/* Submit */}
              <button
                id="reg-submit" type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-purple-blue hover:bg-gradient-purple-blue-hover disabled:opacity-60 disabled:cursor-not-allowed py-3.5 rounded-xl font-bold transition-all text-sm text-white shadow-md shadow-purple-500/20 mt-1"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Creating Account…</>
                ) : (
                  <>Create Free Account <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            <p className="text-center text-slate-500 text-xs mt-6 font-medium">
              Already have an account?{" "}
              <Link to="/login" className="text-purple-600 hover:text-purple-800 font-bold transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          {/* trust line */}
          <p className="text-center text-slate-400 text-xs mt-6">
            Free forever · No credit card required · Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
}
