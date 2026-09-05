import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BrainCircuit, Menu, X, Sparkles, ArrowRight, User, Zap } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ onOpenDemo }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Home", href: "#hero" },
    { label: "Features", href: "#features" },
    { label: "How it Works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "Blog", href: "#blog" },
  ];

  const handleNavClick = (href) => {
    setMobileMenuOpen(false);
    if (location.pathname !== "/") {
      navigate("/" + href);
      return;
    }
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass-nav-light shadow-lg shadow-slate-900/5 py-2.5 border-b border-white/60"
          : "bg-white/60 backdrop-blur-xl py-3.5 border-b border-slate-100/80"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-8">

        {/* Brand Logo */}
        <div
          onClick={() => {
            if (location.pathname === "/") {
              window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
              navigate("/");
            }
          }}
          className="flex items-center gap-2.5 cursor-pointer group flex-shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-purple-blue flex items-center justify-center shadow-md shadow-purple-500/25 group-hover:scale-105 group-hover:shadow-purple-500/40 transition-all duration-200">
            <BrainCircuit className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[1.1rem] font-extrabold text-slate-900 tracking-tight leading-none font-sans">
              AI Coach
            </span>
            <span className="inline-flex items-center gap-1 bg-gradient-to-r from-purple-600/10 to-blue-500/10 border border-purple-200/60 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
              <Zap className="w-2.5 h-2.5" />
              Pro
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNavClick(link.href)}
              className="px-3.5 py-2 text-[0.8rem] font-semibold text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100/70 transition-all duration-150 whitespace-nowrap tracking-wide"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Desktop Right Side CTA */}
        <div className="hidden md:flex items-center gap-3 flex-shrink-0">
          {user ? (
            <button
              onClick={() => navigate("/dashboard")}
              className="btn-primary py-2 px-5 text-sm"
            >
              <User className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="btn-secondary py-2 px-5 text-sm border-slate-200"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate("/register")}
                className="btn-primary py-2 px-5 text-sm"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-100 px-4 pt-4 pb-6 shadow-xl shadow-slate-900/10 animate-fade-in">
          <nav className="flex flex-col space-y-0.5 mb-4">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.href)}
                className="text-left px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-purple-700 hover:bg-purple-50/70 rounded-xl transition-colors"
              >
                {link.label}
              </button>
            ))}
          </nav>
          <div className="pt-4 border-t border-slate-100/80 flex flex-col gap-2.5">
            {user ? (
              <button
                onClick={() => { setMobileMenuOpen(false); navigate("/dashboard"); }}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-purple-blue text-white py-3 rounded-xl text-sm font-semibold shadow-md shadow-purple-500/20"
              >
                <User className="w-4 h-4" />
                Go to Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => { setMobileMenuOpen(false); navigate("/login"); }}
                  className="w-full text-center text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); navigate("/register"); }}
                  className="w-full inline-flex items-center justify-center gap-1.5 bg-gradient-purple-blue text-white py-3 rounded-xl text-sm font-semibold shadow-md shadow-purple-500/20"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
