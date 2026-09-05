import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ChevronLeft, Clock, Award, BarChart2, ShieldCheck, Target,
  Zap, Calendar, BookOpen, Layers, User as UserIcon, Trash2, 
  RotateCcw, AlertCircle, Sparkles, X, CheckCircle2, Search,
  Eye, TrendingUp, Filter
} from "lucide-react";
import {
  getInterviewHistory,
  getInterviewDetails,
  deleteInterview,
  getInterviewPerformance,
  getApiError
} from "../services/api";
import ApiStatusBanner from "../components/ApiStatusBanner";

const FILTER_TABS = ["All", "HR", "Technical", "Resume-Based", "Project", "Voice"];

export default function InterviewHistoryPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Data state
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchHistoryAndStats();
  }, [activeTab]);

  const fetchHistoryAndStats = async () => {
    setLoading(true);
    setError("");
    try {
      const [historyRes, statsRes] = await Promise.all([
        getInterviewHistory(activeTab),
        getInterviewPerformance()
      ]);
      setHistory(historyRes.data);
      setStats(statsRes.data);
    } catch (err) {
      setError(getApiError(err, "Failed to load interview history and performance."));
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = async (id) => {
    setReportLoading(true);
    setError("");
    try {
      const res = await getInterviewDetails(id);
      setSelectedReport(res.data);
    } catch (err) {
      setError(getApiError(err, "Failed to load report details."));
    } finally {
      setReportLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    
    if (!window.confirm("Are you sure you want to delete this interview history record? This action cannot be undone.")) {
      return;
    }
    
    setDeleteLoading(true);
    try {
      await deleteInterview(id);
      if (selectedReport?.id === id) {
        setSelectedReport(null);
      }
      fetchHistoryAndStats(); // Refresh data
    } catch (err) {
      alert(getApiError(err, "Failed to delete interview record."));
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleRetake = (interviewType, e) => {
    if (e) e.stopPropagation();
    const typeLower = (interviewType || "").toLowerCase();
    if (typeLower.includes("voice")) {
      navigate("/voice-interview");
    } else if (typeLower.includes("resume")) {
      navigate("/resume-interview");
    } else {
      navigate(`/mock-interview?type=${encodeURIComponent(interviewType)}`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { 
      month: 'short', day: 'numeric', year: 'numeric', 
      hour: 'numeric', minute: '2-digit' 
    });
  };

  const getStatusBadge = (score) => {
    if (score >= 85) return <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-emerald-200">Excellent</span>;
    if (score >= 70) return <span className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-blue-200">Good</span>;
    if (score >= 50) return <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-amber-200">Average</span>;
    return <span className="bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-red-200">Needs Work</span>;
  };

  const filteredHistory = history.filter((item) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.interview_type.toLowerCase().includes(query) ||
      (item.difficulty && item.difficulty.toLowerCase().includes(query)) ||
      (item.created_at && formatDate(item.created_at).toLowerCase().includes(query))
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 px-4 sm:px-6 py-8">
      <ApiStatusBanner />

      <div className="max-w-7xl mx-auto">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-xs font-semibold mb-6"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {/* Page Title Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Clock className="w-8 h-8 text-purple-600" /> Interview History & Performance
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Review detailed AI evaluations, track score growth, and retake past interviews.
          </p>
        </div>

        {/* Top Section: Performance Analytics Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            <div className="saas-light-card p-4 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Interviews</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{stats.total_interviews}</p>
              <span className="text-[10px] text-slate-400 font-semibold mt-1">Completed</span>
            </div>
            
            <div className="saas-light-card p-4 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Average Score</span>
              <p className="text-2xl font-black text-purple-700 mt-1">{Math.round(stats.average_score)}<span className="text-xs text-slate-400 font-normal">/100</span></p>
              <span className="text-[10px] text-purple-600 font-semibold mt-1">Overall Avg</span>
            </div>

            <div className="saas-light-card p-4 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Best Score</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">{Math.round(stats.best_score)}<span className="text-xs text-slate-400 font-normal">/100</span></p>
              <span className="text-[10px] text-emerald-600 font-semibold mt-1">Personal Peak</span>
            </div>

            <div className="saas-light-card p-4 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Latest Score</span>
              <p className="text-2xl font-black text-blue-600 mt-1">{Math.round(stats.latest_score)}<span className="text-xs text-slate-400 font-normal">/100</span></p>
              <span className="text-[10px] text-blue-600 font-semibold mt-1">Most Recent</span>
            </div>

            <div className="saas-light-card p-4 flex flex-col justify-between col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Improvement</span>
              <p className="text-2xl font-black text-emerald-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                {stats.improvement_percentage > 0 ? `+${stats.improvement_percentage}%` : `${stats.improvement_percentage}%`}
              </p>
              <span className="text-[10px] text-slate-400 font-semibold mt-1">Over Sessions</span>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Left Column: History List with Filters & Search */}
          <div className="w-full md:w-5/12 lg:w-5/12 flex flex-col">
            
            {/* Search Input */}
            <div className="relative mb-4">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by interview type or difficulty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all shadow-2xs"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${
                    activeTab === tab
                      ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {error && !selectedReport && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-xs flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" /> {error}
              </div>
            )}

            {/* List */}
            <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-2 scrollbar-thin">
              {loading ? (
                <div className="flex items-center justify-center h-40 text-slate-500 text-xs gap-2 bg-white rounded-xl border border-slate-200">
                  <div className="w-5 h-5 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" /> Loading interviews...
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="text-center py-12 px-4 bg-white border border-slate-200 rounded-xl border-dashed">
                  <Search className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-xs font-bold text-slate-600">No interviews match your selection.</p>
                  <button onClick={() => navigate("/mock-interview")} className="mt-3 bg-purple-50 text-purple-700 border border-purple-200 px-4 py-2 rounded-xl text-xs font-bold hover:bg-purple-100 transition-colors">
                    Start a New Mock Interview
                  </button>
                </div>
              ) : (
                filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleViewReport(item.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedReport?.id === item.id
                        ? "bg-purple-50/90 border-purple-300 shadow-xs ring-1 ring-purple-300"
                        : "bg-white border-slate-200 hover:border-purple-300 hover:shadow-xs"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase tracking-wider">
                            {item.difficulty || "Medium"}
                          </span>
                          <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded uppercase tracking-wider">
                            {item.status || "Completed"}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm">{item.interview_type}</h3>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-black text-purple-700">{Math.round(item.overall_score)}<span className="text-xs font-normal text-slate-400">/100</span></div>
                      </div>
                    </div>

                    {/* Scores grid */}
                    <div className="grid grid-cols-3 gap-1 my-2 py-2 border-y border-slate-100 text-[10px] text-center font-medium">
                      <div>
                        <span className="text-slate-400 block">Tech</span>
                        <span className="font-bold text-blue-700">{Math.round(item.technical_score || item.overall_score)}%</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Comm</span>
                        <span className="font-bold text-purple-700">{Math.round(item.communication_score || item.overall_score)}%</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Conf</span>
                        <span className="font-bold text-emerald-700">{Math.round(item.confidence_score || item.overall_score)}%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> {formatDate(item.created_at)}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleViewReport(item.id); }}
                          className="px-2 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded text-[10px] font-bold flex items-center gap-1"
                          title="View Full Report"
                        >
                          <Eye className="w-3 h-3" /> Report
                        </button>
                        <button
                          onClick={(e) => handleRetake(item.interview_type, e)}
                          className="px-2 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded text-[10px] font-bold flex items-center gap-1"
                          title="Retake Interview"
                        >
                          <RotateCcw className="w-3 h-3" /> Retake
                        </button>
                        <button
                          onClick={(e) => handleDelete(item.id, e)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Delete History"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column: Complete Interview Report */}
          <div className="w-full md:w-7/12 lg:w-7/12">
            {reportLoading ? (
              <div className="saas-light-card bg-white h-full min-h-[500px] flex flex-col items-center justify-center p-10 text-center">
                <div className="w-8 h-8 rounded-full border-2 border-purple-600 border-t-transparent animate-spin mb-4" />
                <p className="text-slate-500 text-sm font-bold">Loading complete report...</p>
              </div>
            ) : selectedReport ? (
              <div className="saas-light-card bg-white p-0 overflow-hidden shadow-sm flex flex-col max-h-[calc(100vh-140px)]">
                
                {/* Header */}
                <div className="p-6 border-b border-slate-200 bg-slate-50/60">
                  <div className="flex items-center justify-between mb-4">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold badge-purple-light uppercase tracking-wider">
                      <Sparkles className="w-3 h-3 text-purple-600" /> AI Evaluation Report
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDelete(selectedReport.id)}
                        disabled={deleteLoading}
                        className="flex items-center gap-1 text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                      <button onClick={() => setSelectedReport(null)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg md:hidden">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                        {selectedReport.interview_type}
                      </h2>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-medium text-slate-500">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatDate(selectedReport.created_at)}</span>
                        <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5" /> {selectedReport.total_questions} Questions</span>
                        <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5" /> {selectedReport.difficulty}</span>
                        <span className="flex items-center gap-1">{getStatusBadge(selectedReport.overall_score)}</span>
                      </div>
                    </div>
                    
                    <div className="bg-white border border-slate-200 px-5 py-3 rounded-2xl text-center shadow-xs">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Overall Score</p>
                      <p className="text-3xl font-black text-slate-900 leading-none">{Math.round(selectedReport.overall_score)}<span className="text-sm text-slate-400 font-normal">/100</span></p>
                    </div>
                  </div>
                </div>

                {/* Scrollable Content */}
                <div className="p-6 overflow-y-auto flex-1 scrollbar-thin space-y-6">
                  
                  {/* Competency Scores */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Score Breakdown</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-center">
                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Technical</p>
                        <p className="text-2xl font-black text-blue-700">{Math.round(selectedReport.technical_score)}%</p>
                      </div>
                      <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl text-center">
                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Communication</p>
                        <p className="text-2xl font-black text-purple-700">{Math.round(selectedReport.communication_score)}%</p>
                      </div>
                      <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-center">
                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Confidence</p>
                        <p className="text-2xl font-black text-emerald-700">{Math.round(selectedReport.confidence_score)}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Strengths & Weaknesses */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-emerald-50/60 border border-emerald-200 p-5 rounded-xl">
                      <h3 className="font-bold text-emerald-900 mb-3 flex items-center gap-2 text-xs uppercase tracking-wider">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" /> Key Strengths
                      </h3>
                      <ul className="space-y-2 text-xs text-slate-800">
                        {selectedReport.report_data?.strengths?.map((s, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-amber-50/60 border border-amber-200 p-5 rounded-xl">
                      <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2 text-xs uppercase tracking-wider">
                        <Target className="w-4 h-4 text-amber-600" /> Areas for Improvement
                      </h3>
                      <ul className="space-y-2 text-xs text-slate-800">
                        {selectedReport.report_data?.weaknesses?.map((w, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <span>{w}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  {/* Improvement Suggestions & Recommended Topics */}
                  <div className="p-5 bg-purple-50/60 border border-purple-200 rounded-xl space-y-4">
                    <div>
                      <h3 className="font-bold text-purple-900 mb-3 flex items-center gap-2 text-xs uppercase tracking-wider">
                        <Zap className="w-4 h-4 text-purple-600" /> Improvement Suggestions
                      </h3>
                      <ul className="space-y-2 text-xs text-slate-800">
                        {selectedReport.report_data?.improvement_suggestions?.map((imp, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                            <span>{imp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {selectedReport.report_data?.recommended_topics?.length > 0 && (
                      <div className="pt-4 border-t border-purple-200">
                        <p className="text-[10px] font-bold text-purple-800 uppercase tracking-wider mb-2">Recommended Practice Topics</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedReport.report_data.recommended_topics.map((topic, i) => (
                            <span key={i} className="bg-white border border-purple-200 text-purple-700 px-2.5 py-1 rounded-md text-[11px] font-bold">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Questions & User Answers Log */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Questions & Evaluations Log</h3>
                    <div className="space-y-4">
                      {selectedReport.report_data?.evaluations?.map((item, idx) => (
                        <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-xs">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <p className="font-bold text-slate-900 leading-relaxed"><span className="text-purple-600">Q{idx + 1}:</span> {item.question}</p>
                            <span className="font-extrabold bg-white border border-slate-200 px-2.5 py-1 rounded text-purple-700 shrink-0 shadow-2xs">
                              {Math.round(item.evaluation?.score || selectedReport.overall_score)} / 100
                            </span>
                          </div>
                          
                          <div className="bg-white border border-slate-200 rounded-lg p-3 mb-3">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Your Answer</p>
                            <p className="text-slate-700 italic">"{item.answer || "No response recorded"}"</p>
                          </div>
                          
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">AI Evaluation & Feedback</p>
                            <p className="text-slate-600 font-medium leading-relaxed">{item.evaluation?.feedback_summary || "Good effort."}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                </div>

                {/* Footer Action */}
                <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
                  <button
                    onClick={() => handleRetake(selectedReport.interview_type)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-purple-blue text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-purple-500/20 hover:opacity-95 transition-opacity"
                  >
                    <RotateCcw className="w-4 h-4" /> Retake This Interview
                  </button>
                  <span className="text-[11px] text-slate-400 hidden sm:inline">Session ID: {selectedReport.session_id}</span>
                </div>

              </div>
            ) : (
              <div className="saas-light-card bg-white h-full min-h-[500px] flex flex-col items-center justify-center p-10 text-center border-dashed">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                  <BarChart2 className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-slate-600 font-bold mb-1">Select an Interview</h3>
                <p className="text-slate-400 text-xs max-w-sm">Click any interview from the history list on the left to inspect full questions, answers, and AI evaluation report.</p>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}

