import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BrainCircuit, LogOut, Play, TrendingUp, BookOpen, Mic, FileText,
  MessageSquare, Award, ChevronRight, User, Menu, X, Sparkles, Target, Zap, Clock,
  BarChart2, Settings, History, CheckCircle2
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ApiStatusBanner from "../components/ApiStatusBanner";
import { getDashboardAnalytics, getRecentActivity, getDashboardInsights } from "../services/api";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  BarChart, Bar, Cell
} from "recharts";

const categories = [
  {
    label: "HR Interview",
    icon: <User className="w-5 h-5 text-purple-600" />,
    desc: "Behavioral & situational questions tailored to your background",
    id: "hr-interview",
    badge: "Gemini Tailored"
  },
  {
    label: "Technical Interview",
    icon: <BookOpen className="w-5 h-5 text-blue-600" />,
    desc: "Architecture, coding & domain-specific technical questions",
    id: "technical-interview",
    badge: "Role Specific"
  },
  {
    label: "Communication Practice",
    icon: <MessageSquare className="w-5 h-5 text-emerald-600" />,
    desc: "Tone, vocabulary, clarity & executive presence drills",
    id: "communication-practice",
    badge: "Real-Time NLP"
  },
];

const ReadinessGauge = ({ score }) => {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const safeScore = score || 0;
  const strokeDashoffset = circumference - (safeScore / 100) * circumference;
  
  let colorClass = "text-emerald-500";
  if (safeScore < 40) colorClass = "text-red-500";
  else if (safeScore <= 70) colorClass = "text-amber-500";

  return (
    <div className="relative w-14 h-14 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 50 50">
        <circle
          className="text-slate-100 stroke-current"
          strokeWidth="4"
          cx="25"
          cy="25"
          r="20"
          fill="transparent"
        />
        <circle
          className={`${colorClass} stroke-current transition-all duration-1000 ease-out`}
          strokeWidth="4"
          strokeLinecap="round"
          cx="25"
          cy="25"
          r="20"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-sm font-bold text-slate-900">{Math.round(safeScore)}</span>
      </div>
    </div>
  );
};

const ScoreCard = ({ label, value, subtext, icon, trend, customVisual }) => (
  <div className="saas-light-card p-6 flex flex-col justify-between">
    <div className="flex items-center justify-between mb-4">
      <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">{label}</span>
      <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-100 text-purple-700">{icon}</div>
    </div>
    <div className="flex items-center justify-between">
      <div>
        <div className="flex items-baseline gap-3 mb-2">
          <div className="text-3xl font-extrabold text-slate-900">
            {value}
          </div>
          {trend && (
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> {trend}
            </span>
          )}
        </div>
        <p className="text-slate-500 text-xs">{subtext}</p>
      </div>
      {customVisual && (
        <div className="flex-shrink-0">
          {customVisual}
        </div>
      )}
    </div>
  </div>
);

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");
  
  const [analytics, setAnalytics] = useState(null);
  const [activities, setActivities] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, activitiesRes, insightsRes] = await Promise.allSettled([
        getDashboardAnalytics(),
        getRecentActivity(),
        getDashboardInsights()
      ]);
      
      if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value.data);
      if (activitiesRes.status === 'fulfilled') setActivities(activitiesRes.value.data);
      if (insightsRes.status === 'fulfilled') setInsights(insightsRes.value.data);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const sidebarNavItems = [
    { label: "Dashboard", icon: <TrendingUp className="w-4 h-4" />, action: () => setActiveTab("Dashboard") },
    { label: "Practice Interview", icon: <Play className="w-4 h-4 text-purple-600" />, action: () => navigate("/interview") },
    { label: "Voice Interview", icon: <Mic className="w-4 h-4 text-blue-600" />, action: () => navigate("/voice-interview") },
    { label: "Resume Review", icon: <FileText className="w-4 h-4 text-emerald-600" />, action: () => navigate("/resume-interview") },
    { label: "Mock Interview", icon: <Target className="w-4 h-4 text-amber-600" />, action: () => navigate("/mock-interview") },
    { label: "History", icon: <History className="w-4 h-4 text-slate-600" />, action: () => navigate("/history") },
    { label: "Analytics", icon: <BarChart2 className="w-4 h-4 text-indigo-600" />, action: () => setActiveTab("Analytics") },
    { label: "Settings", icon: <Settings className="w-4 h-4 text-slate-500" />, action: () => setActiveTab("Settings") },
  ];

  const BAR_COLORS = ['#7c3aed', '#2563eb', '#059669', '#f59e0b', '#ec4899'];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row relative">
      <ApiStatusBanner />

      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between px-5 py-4 bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-purple-blue flex items-center justify-center">
            <BrainCircuit className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-extrabold text-slate-900">AI Coach</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-700"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky md:top-0 left-0 top-[61px] md:top-0 h-[calc(100vh-61px)] md:h-screen w-64 bg-white border-r border-slate-200 flex flex-col justify-between z-40 transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div>
          {/* Sidebar Header Brand */}
          <div
            className="hidden md:flex items-center gap-3 p-6 border-b border-slate-100 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-purple-blue flex items-center justify-center shadow-md shadow-purple-500/20">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-extrabold text-slate-900 tracking-tight block leading-none">AI Coach</span>
              <span className="text-[10px] text-purple-600 font-bold tracking-wider uppercase">Pro Dashboard</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1">
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Navigation</p>
            {sidebarNavItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  setMobileOpen(false);
                  item.action();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === item.label
                    ? "bg-purple-50 text-purple-700 border border-purple-200/80 shadow-2xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* User Footer Profile */}
        <div className="p-4 border-t border-slate-100 space-y-3 bg-slate-50/60">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-gradient-purple-blue text-white flex items-center justify-center text-sm font-bold shadow-xs">
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
              <p className="text-[11px] text-slate-500 truncate">{user.target_role || "Candidate"}</p>
            </div>
          </div>
          <button
            id="logout-btn"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="flex-1 p-6 sm:p-10 min-h-screen max-w-7xl mx-auto w-full relative z-10 overflow-hidden">
        
        {/* Welcome Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold badge-purple-light">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Google Gemini AI Active
              </div>
              {analytics?.readiness_score && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Readiness: {Math.round(analytics.readiness_score)}%
                </div>
              )}
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Dashboard Overview
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Welcome back, {user.name?.split(" ")[0]}! Track your communication metrics and practice modules.
            </p>
          </div>
          
          <button
            onClick={() => navigate("/interview")}
            className="btn-primary text-xs py-3 px-6"
          >
            <Zap className="w-4 h-4" /> Start Free Practice
          </button>
        </div>

        {/* Interview Performance Metrics Cards Row */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-purple-600" /> Interview Performance
          </h2>
          <button
            onClick={() => navigate("/history")}
            className="text-xs font-bold text-purple-600 hover:text-purple-800 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
          >
            <Clock className="w-3.5 h-3.5" /> View History
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          <ScoreCard
            label="Readiness Score"
            value={analytics ? `${Math.round(analytics.readiness_score || 0)}` : "--"}
            subtext="AI readiness evaluation"
            icon={<Target className="w-5 h-5" />}
            customVisual={analytics ? <ReadinessGauge score={analytics.readiness_score} /> : null}
          />
          <ScoreCard
            label="Total Interviews"
            value={analytics ? analytics.total_interviews : "--"}
            subtext="Sessions completed"
            icon={<CheckCircle2 className="w-5 h-5" />}
          />
          <ScoreCard
            label="Average Score"
            value={analytics ? `${Math.round(analytics.average_score || 0)} / 100` : "--"}
            subtext="Overall mean score"
            icon={<Award className="w-5 h-5" />}
          />
          <ScoreCard
            label="Best Score"
            value={analytics ? `${Math.round(analytics.best_score || 0)} / 100` : "--"}
            subtext="Highest performance"
            icon={<Sparkles className="w-5 h-5" />}
          />
          <ScoreCard
            label="Improvement"
            value={analytics ? `${analytics.improvement_percentage > 0 ? '+' : ''}${analytics.improvement_percentage}%` : "--"}
            subtext="Since first interview"
            icon={<TrendingUp className="w-5 h-5" />}
            trend={analytics?.improvement_percentage > 0 ? "Up" : null}
          />
          <ScoreCard
            label="Practice Sessions"
            value={analytics ? analytics.total_practice_sessions : "--"}
            subtext="Modules completed"
            icon={<Play className="w-5 h-5" />}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          
          {/* Progress Chart (2/3 width) */}
          <div className="saas-light-card p-6 lg:col-span-2 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-600" /> Score Progression Over Time
              </h3>
            </div>
            <div className="min-h-[280px] w-full">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={analytics?.progress_data || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                    itemStyle={{ color: '#7c3aed', fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#7c3aed" strokeWidth={3} dot={{ fill: '#7c3aed', strokeWidth: 2, r: 4 }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Skill Radar Chart (1/3 width) */}
          <div className="saas-light-card p-6 flex flex-col justify-between">
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-600" /> Skill Breakdown
            </h3>
            <div className="min-h-[240px] w-full flex-1 flex items-center justify-center">
              {(analytics?.skill_data && analytics.skill_data.length > 0) ? (
                <ResponsiveContainer width="100%" height={240}>
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={analytics.skill_data}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="skill" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} />
                    <Radar name="Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-slate-400 italic">Not enough data to display.</p>
              )}
            </div>
          </div>

        </div>

        {/* Second Row: Bar Chart & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          
          {/* Interview Type Distribution (2/3 width) */}
          <div className="saas-light-card p-6 lg:col-span-2 flex flex-col justify-between">
            <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-emerald-600" /> Scores by Interview Type
            </h3>
            <div className="min-h-[240px] w-full">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={analytics?.interview_type_data || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="type" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  />
                  <Bar dataKey="avg_score" radius={[4, 4, 0, 0]}>
                    {(analytics?.interview_type_data || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Insights Panel (1/3 width) */}
          <div className="saas-light-card p-6 flex flex-col justify-between h-full">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-purple-600" /> AI Insights
              </h3>
              
              {insights ? (
                <>
                  <div className="space-y-3 mb-6">
                    {insights.insights?.map((insight, idx) => (
                      <div key={idx} className="flex gap-2 text-sm text-slate-700">
                        <div className="mt-0.5 flex-shrink-0"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></div>
                        <p className="leading-snug">{insight}</p>
                      </div>
                    ))}
                  </div>
                  
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Recommendations</h4>
                  <div className="space-y-2">
                    {insights.recommendations?.map((rec, idx) => (
                      <div key={idx} className="flex gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <Target className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <p>{rec}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-xs text-slate-400 italic">Complete more interviews to generate insights.</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Third Row: Recent Activity & Quick Practice Promo */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          
          {/* Recent Activity Feed (2/3 width) */}
          <div className="saas-light-card p-6 lg:col-span-2 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600" /> Recent Activity
              </h3>
              <button onClick={() => navigate("/history")} className="text-xs font-bold text-purple-600 hover:text-purple-800">View All</button>
            </div>
            
            <div className="flex-1">
              {activities.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No recent activity found.</p>
              ) : (
                <div className="relative border-l border-slate-200 ml-3 space-y-6 pb-2">
                  {activities.map((item, idx) => {
                    let Icon = Clock;
                    let iconColor = "text-slate-500";
                    let bgColor = "bg-slate-100";
                    
                    if (item.type === "interview") {
                      Icon = Target; iconColor = "text-purple-600"; bgColor = "bg-purple-100";
                    } else if (item.type === "practice") {
                      Icon = MessageSquare; iconColor = "text-blue-600"; bgColor = "bg-blue-100";
                    } else if (item.type === "resume") {
                      Icon = FileText; iconColor = "text-emerald-600"; bgColor = "bg-emerald-100";
                    }

                    return (
                      <div key={item.id || idx} className="relative pl-6">
                        <div className={`absolute -left-3.5 top-0 w-7 h-7 rounded-full flex items-center justify-center border-2 border-white ${bgColor}`}>
                          <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
                        </div>
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 hover:shadow-sm transition-shadow">
                          <div className="flex justify-between items-start mb-1">
                            <p className="text-sm font-bold text-slate-900">{item.title}</p>
                            {item.score !== null && item.score !== undefined && (
                              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                                {Math.round(item.score)} / 100
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 mb-2">{item.subtitle}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {new Date(item.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Quick Practice Promo (1/3 width) */}
          <div className="bg-gradient-purple-blue text-white rounded-2xl p-6 flex flex-col justify-between shadow-md h-full">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-white/20 text-white mb-4">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> AI Resume Match
              </div>
              <h3 className="text-xl font-extrabold mb-2">Upload Your PDF Resume</h3>
              <p className="text-purple-100 text-xs leading-relaxed">
                Generate personalized, job-tailored interview questions directly from your background.
              </p>
            </div>

            <button
              onClick={() => navigate("/resume-interview")}
              className="mt-6 w-full btn-secondary py-3 text-xs border-transparent text-violet-700 hover:text-violet-800"
            >
              <FileText className="w-4 h-4" /> Start Resume Review
            </button>
          </div>

        </div>

        {/* Practice Training Modules */}
        <div>
          <h2 className="font-bold text-slate-900 text-lg mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" /> Interactive Practice Modules
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <div
                key={cat.label}
                id={`practice-${cat.id}`}
                onClick={() => navigate(`/interview?category=${encodeURIComponent(cat.label)}`)}
                className="saas-light-card saas-light-card-hover cursor-pointer p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      {cat.icon}
                    </div>
                    <span className="text-[10px] font-bold badge-purple-light px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {cat.badge}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-2">{cat.label}</h3>
                  <p className="text-slate-600 text-xs leading-relaxed mb-6">{cat.desc}</p>
                </div>
                
                <div className="flex items-center gap-2 text-xs font-bold text-purple-700 group">
                  <span>Start Practice Session</span>
                  <ChevronRight className="w-4 h-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}

