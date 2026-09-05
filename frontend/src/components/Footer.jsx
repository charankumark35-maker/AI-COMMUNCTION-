import { BrainCircuit, Sparkles, Send, Globe, Share2, MessageCircle, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-8 border-t border-slate-800/60 relative overflow-hidden">
      {/* Subtle top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-40 bg-purple-600/8 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Top Section: Logo + 3 link columns */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-14">

          {/* Brand Info — spans 2 cols */}
          <div className="md:col-span-2 space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-purple-blue flex items-center justify-center shadow-md shadow-purple-500/20">
                <BrainCircuit className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-lg font-extrabold text-white tracking-tight">AI Coach</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
              Empowering candidates and professionals worldwide to master interview speaking, vocabulary, and communication confidence — powered by Google Gemini AI.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-2 pt-1">
              <a
                href="#"
                className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/50 hover:border-slate-600 text-slate-500 hover:text-white flex items-center justify-center transition-all duration-150"
              >
                <Globe className="w-3.5 h-3.5" />
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/50 hover:border-slate-600 text-slate-500 hover:text-white flex items-center justify-center transition-all duration-150"
              >
                <Share2 className="w-3.5 h-3.5" />
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/50 hover:border-slate-600 text-slate-500 hover:text-white flex items-center justify-center transition-all duration-150"
              >
                <MessageCircle className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-slate-200 text-xs font-bold uppercase tracking-widest mb-5">Product</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><a href="#features" className="hover:text-purple-400 transition-colors">Gemini AI Engine</a></li>
              <li><a href="#features" className="hover:text-purple-400 transition-colors">Voice Interview</a></li>
              <li><a href="#features" className="hover:text-purple-400 transition-colors">Resume Analysis</a></li>
              <li><a href="#features" className="hover:text-purple-400 transition-colors">Performance Insights</a></li>
              <li><a href="#pricing" className="hover:text-purple-400 transition-colors">Pricing Plans</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-slate-200 text-xs font-bold uppercase tracking-widest mb-5">Company</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><a href="#" className="hover:text-purple-400 transition-colors">About Us</a></li>
              <li><a href="#testimonials" className="hover:text-purple-400 transition-colors">Customers</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Press</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-slate-200 text-xs font-bold uppercase tracking-widest mb-5">Resources</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><a href="#blog" className="hover:text-purple-400 transition-colors">Interview Guide</a></li>
              <li><a href="#blog" className="hover:text-purple-400 transition-colors">STAR Technique</a></li>
              <li><a href="#how-it-works" className="hover:text-purple-400 transition-colors">How it Works</a></li>
              <li><a href="#testimonials" className="hover:text-purple-400 transition-colors">User Reviews</a></li>
              <li><Link to="/login" className="hover:text-purple-400 transition-colors">Candidate Login</Link></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800/70" />

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-4">
          {/* Copyright */}
          <div className="flex items-center gap-2">
            <span>© 2026 AI Communication Coach. All rights reserved.</span>
          </div>

          {/* Powered by badge */}
          <div className="inline-flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-full px-3 py-1.5">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span className="text-slate-400 font-medium text-[11px]">Powered by</span>
            <span className="text-white font-bold text-[11px]">Gemini AI</span>
          </div>

          {/* Legal links */}
          <div className="flex gap-5">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
