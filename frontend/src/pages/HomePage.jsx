import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BrainCircuit, Mic, FileText, BarChart3, ArrowRight,
  Sparkles, CheckCircle2, Play, Star,
  ChevronRight, Clock
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import DemoModal from "../components/DemoModal";

const features = [
  {
    id: "gemini-ai",
    icon: <BrainCircuit className="w-6 h-6 text-purple-600" />,
    title: "1. Gemini AI Intelligence",
    description: "AI-powered grammar, vocabulary, confidence, and communication analysis.",
    badge: "Core AI Engine",
    color: "from-purple-500/10 to-indigo-500/10",
    border: "border-purple-200"
  },
  {
    id: "voice-simulation",
    icon: <Mic className="w-6 h-6 text-blue-600" />,
    title: "2. Voice Interview Simulation",
    description: "Speech-to-text, filler word detection, pronunciation and fluency tracking.",
    badge: "Real-time Voice",
    color: "from-blue-500/10 to-cyan-500/10",
    border: "border-blue-200"
  },
  {
    id: "resume-questions",
    icon: <FileText className="w-6 h-6 text-emerald-600" />,
    title: "3. Resume-Based Questions",
    description: "Upload resume and generate personalized interview questions.",
    badge: "PDF Analysis",
    color: "from-emerald-500/10 to-teal-500/10",
    border: "border-emerald-200"
  },
  {
    id: "ai-insights",
    icon: <BarChart3 className="w-6 h-6 text-amber-600" />,
    title: "4. AI Performance Insights",
    description: "Track progress and get improvement recommendations.",
    badge: "Actionable Growth",
    color: "from-amber-500/10 to-orange-500/10",
    border: "border-amber-200"
  },
];

const howItWorksSteps = [
  {
    step: "01",
    title: "Choose Practice Mode",
    desc: "Select HR behavioral questions, technical drills, voice speech practice, or upload your PDF resume.",
  },
  {
    step: "02",
    title: "Answer & Speak Naturally",
    desc: "Respond using text or real-time voice speech recording with our interactive timer interface.",
  },
  {
    step: "03",
    title: "Receive Gemini Feedback",
    desc: "Get instant score breakdowns, grammar corrections, vocabulary suggestions, and confidence metrics.",
  },
];

const pricingPlans = [
  {
    name: "Free Practice",
    price: "$0",
    period: "forever",
    desc: "Perfect for getting started and exploring AI interview preparation.",
    features: [
      "5 Text interview practice sessions",
      "Basic Gemini AI score breakdown",
      "STAR framework structure guidance",
      "Standard response feedback",
    ],
    cta: "Start Free Practice",
    popular: false,
  },
  {
    name: "Pro Coach",
    price: "$19",
    period: "per month",
    desc: "Everything you need to ace top-tier company interviews with confidence.",
    features: [
      "Unlimited AI interview practice",
      "Full Voice Interview & Speech analytics",
      "Filler word & pacing detection",
      "PDF Resume-based question generator",
      "Comprehensive performance trend analytics",
      "Detailed grammar & vocabulary diffs",
    ],
    cta: "Get Started Pro",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$49",
    period: "per month",
    desc: "Custom role-tailored coaching for teams, bootcamps, and universities.",
    features: [
      "Everything in Pro Coach",
      "Custom company interview rubrics",
      "Mock multi-round interview series",
      "Priority Gemini AI processing",
      "Dedicated account management",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const testimonials = [
  {
    name: "Alex Rivera",
    role: "Senior Software Engineer",
    company: "Landed at Tech Leader",
    comment: "The Gemini AI feedback was astonishingly precise. It identified filler words I didn't even realize I was saying during technical interview practice.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    rating: 5,
  },
  {
    name: "Sarah Jenkins",
    role: "Product Manager",
    company: "Fintech Startup",
    comment: "Uploading my resume to generate custom interview questions was a game changer. I felt 10x more confident in my actual behavioral rounds.",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    rating: 5,
  },
  {
    name: "David Chen",
    role: "Management Consultant",
    company: "Top Tier Firm",
    comment: "The voice metrics and pace analysis helped me slow down and structure my executive answers using the STAR technique flawlessly.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    rating: 5,
  },
];

const blogArticles = [
  {
    title: "How to Eliminate Filler Words and Speak with Authority",
    category: "Voice & Speech",
    readTime: "4 min read",
    desc: "Learn why words like 'um', 'uh', and 'like' undermine candidate confidence and how to replace them with deliberate pauses.",
  },
  {
    title: "Mastering the STAR Method for Behavioral Interviews",
    category: "Interview Strategy",
    readTime: "6 min read",
    desc: "A step-by-step guide to structuring Situation, Task, Action, and Result responses to impress recruiters.",
  },
  {
    title: "Tailoring Your Interview Answers to Your Resume",
    category: "Resume Tips",
    readTime: "5 min read",
    desc: "How AI tools extract key accomplishments from your PDF resume and convert them into compelling narrative answers.",
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans overflow-x-hidden">
      
      {/* Navigation */}
      <Navbar onOpenDemo={() => setDemoOpen(true)} />

      {/* Hero Section */}
      <section id="hero" className="relative pt-32 sm:pt-40 pb-20 px-4 sm:px-6 lg:px-8 bg-mesh-light overflow-hidden">
        
        {/* Background Decorative Blurs */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-purple-400/10 blur-[130px] rounded-full pointer-events-none z-0" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-400/10 blur-[100px] rounded-full pointer-events-none z-0" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 badge-purple-light px-4 py-1.5 rounded-full text-xs font-semibold shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>Next-Gen AI Communication & Interview Platform</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Master Your Interview & Communication Skills with <span className="text-gradient-purple-blue">AI</span>
              </h1>

              {/* Subtitle */}
              <p className="text-slate-600 text-lg sm:text-xl font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Practice realistic interviews, improve speaking confidence, and receive AI-powered feedback.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center pt-2">
                <button
                  onClick={() => navigate("/register")}
                  className="w-full sm:w-auto btn-primary py-4 px-8"
                >
                  <span>Start Free Practice</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setDemoOpen(true)}
                  className="w-full sm:w-auto btn-secondary py-4 px-8"
                >
                  <Play className="w-4 h-4 text-violet-600 fill-violet-600" />
                  <span>Watch Demo</span>
                </button>
              </div>

              {/* User Rating & Social Proof */}
              <div className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <div className="flex -space-x-2">
                  <img className="w-9 h-9 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="User" />
                  <img className="w-9 h-9 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" alt="User" />
                  <img className="w-9 h-9 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80" alt="User" />
                  <img className="w-9 h-9 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" alt="User" />
                </div>
                
                <div className="text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                    <span className="text-xs font-bold text-slate-800 ml-1">4.9/5 rating</span>
                  </div>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Trusted by 10,000+ job seekers & professionals worldwide
                  </p>
                </div>
              </div>

            </div>

            {/* Right Side: Sleek Interactive AI SaaS Preview Card */}
            <div className="lg:col-span-5 relative">
              <div className="saas-light-card p-3 rounded-3xl shadow-xl shadow-purple-500/10 border-slate-200/90 relative overflow-hidden bg-white/90 backdrop-blur-md">
                
                {/* Mock Window Header */}
                <div className="bg-slate-900 text-white rounded-2xl p-6 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    </div>
                    <span className="text-[11px] font-mono text-purple-300 bg-purple-950/60 px-2.5 py-1 rounded-md border border-purple-800/40 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" /> Gemini AI Engine Active
                    </span>
                  </div>

                  {/* AI Interaction Mockup */}
                  <div className="space-y-4 text-xs font-sans">
                    <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/60 space-y-2">
                      <div className="flex items-center justify-between text-slate-400 text-[10px]">
                        <span className="font-semibold text-purple-400">AI INTERVIEW PROMPT</span>
                        <span>HR Behavioral</span>
                      </div>
                      <p className="text-slate-200 font-medium">
                        "Describe a situation where you had to convey technical ideas to non-technical stakeholders."
                      </p>
                    </div>

                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/40 space-y-2">
                      <div className="flex items-center justify-between text-slate-400 text-[10px]">
                        <span className="font-semibold text-cyan-400">YOUR VOICE RESPONSE</span>
                        <span className="text-emerald-400 font-mono">0 filler words</span>
                      </div>
                      <p className="text-slate-300 italic">
                        "I broke down our cloud architecture into relatable visual diagrams and focused on business value metrics..."
                      </p>
                    </div>

                    {/* AI Feedback Score pill preview */}
                    <div className="bg-gradient-to-r from-purple-900/60 to-indigo-900/60 rounded-xl p-4 border border-purple-500/30 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-purple-200 font-semibold uppercase tracking-wider">Overall Gemini Score</p>
                        <p className="text-2xl font-extrabold text-white">92 <span className="text-xs text-purple-300 font-normal">/ 100</span></p>
                      </div>
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs px-3 py-1 rounded-full font-bold">
                        Excellent Delivery 💪
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Sub-stats */}
                <div className="p-4 grid grid-cols-3 gap-3 text-center">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                    <p className="text-[10px] text-slate-500 font-medium">Grammar Score</p>
                    <p className="text-sm font-extrabold text-purple-600">95%</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                    <p className="text-[10px] text-slate-500 font-medium">Vocabulary</p>
                    <p className="text-sm font-extrabold text-blue-600">88%</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                    <p className="text-[10px] text-slate-500 font-medium">Confidence</p>
                    <p className="text-sm font-extrabold text-emerald-600">91%</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-y border-slate-200/80 relative">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="badge-purple-light text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Core Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Powerful AI Features Designed for Your Career Success
            </h2>
            <p className="text-slate-600 text-base font-normal">
              Everything you need to prepare, practice, and polish your communication skills before stepping into high-stakes interviews.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div
                key={f.id}
                className={`saas-light-card saas-light-card-hover p-7 flex flex-col justify-between border ${f.border} relative overflow-hidden group`}
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${f.color} rounded-full blur-2xl pointer-events-none`} />

                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 shadow-xs group-hover:scale-110 transition-transform">
                      {f.icon}
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {f.badge}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-lg mb-2 group-hover:text-purple-700 transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed font-normal">
                    {f.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-purple-700">
                  <span>Learn more</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Simple 3-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              How AI Communication Coach Works
            </h2>
            <p className="text-slate-600 text-base">
              Start improving your communication skills in less than 2 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorksSteps.map((s, idx) => (
              <div key={s.step} className="saas-light-card p-8 relative flex flex-col justify-between">
                <div>
                  <span className="text-4xl font-extrabold text-purple-600/30 block mb-4 font-mono">
                    {s.step}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{s.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{s.desc}</p>
                </div>
                <div className="mt-8 flex items-center gap-2 text-xs font-semibold text-purple-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Instant Execution</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <span className="badge-purple-light text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Transparent Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Invest in Your Interview Success
            </h2>
            <p className="text-slate-600 text-base">
              Choose the plan that fits your job search timeline and career goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`saas-light-card p-8 flex flex-col justify-between relative ${
                  plan.popular
                    ? "border-2 border-purple-500 shadow-xl shadow-purple-500/10 scale-105 bg-white z-10"
                    : "border border-slate-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-purple-blue text-white text-[11px] font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    Most Popular
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                  <p className="text-slate-500 text-xs mb-6 min-h-[32px]">{plan.desc}</p>
                  
                  <div className="mb-6">
                    <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
                    <span className="text-slate-500 text-xs ml-1">/ {plan.period}</span>
                  </div>

                  <ul className="space-y-3.5 mb-8">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-3 text-xs text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => navigate("/register")}
                  className={`w-full py-3.5 ${
                    plan.popular
                      ? "btn-primary shadow-lg shadow-violet-500/20"
                      : "btn-secondary"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Success Stories
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Loved by Candidates & Professionals
            </h2>
            <p className="text-slate-600 text-base">
              Here is what users say about their AI coaching transformation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div key={t.name} className="saas-light-card p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-4">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed italic mb-6">
                    "{t.comment}"
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <img className="w-10 h-10 rounded-full object-cover border border-slate-200" src={t.avatar} alt={t.name} />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{t.name}</h4>
                    <p className="text-[11px] text-slate-500">{t.role} · {t.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Blog Section */}
      <section id="blog" className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-16">
            <div>
              <span className="badge-purple-light text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">
                Communication Insights
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Latest Articles & Interview Tips
              </h2>
            </div>
            <button className="text-xs font-bold text-purple-700 hover:text-purple-900 inline-flex items-center gap-1">
              <span>Explore all articles</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogArticles.map((art) => (
              <div key={art.title} className="saas-light-card saas-light-card-hover p-6 flex flex-col justify-between cursor-pointer">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                    <span className="font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md">{art.category}</span>
                    <span className="flex items-center gap-1 font-mono"><Clock className="w-3 h-3" /> {art.readTime}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mb-2 hover:text-purple-700 transition-colors">{art.title}</h3>
                  <p className="text-slate-600 text-xs leading-relaxed">{art.desc}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-semibold text-purple-700 flex items-center gap-1">
                  <span>Read full guide</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Final Call to Action Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-purple-blue text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Ready to Ace Your Next Job Interview?</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Start Practice with AI Today.
          </h2>

          <p className="text-purple-100 text-base sm:text-lg max-w-xl mx-auto font-light leading-relaxed">
            Join thousands of candidates improving their speaking confidence, speech clarity, and behavioral answer scores with Gemini AI.
          </p>

          <div className="pt-4">
            <button
              onClick={() => navigate("/register")}
              className="btn-secondary py-4 px-8 text-sm hover:scale-105"
            >
              <span>Get Started Free Now</span>
              <ArrowRight className="w-4 h-4 text-violet-700" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Demo Video/Interactive Modal */}
      <DemoModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />

    </div>
  );
}
