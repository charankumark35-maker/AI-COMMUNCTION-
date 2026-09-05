import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage       from "./pages/HomePage";
import LoginPage      from "./pages/LoginPage";
import RegisterPage   from "./pages/RegisterPage";
import DashboardPage  from "./pages/DashboardPage";
import InterviewPage     from "./pages/InterviewPage";
import ResultPage        from "./pages/ResultPage";
import VoiceInterviewPage  from "./pages/VoiceInterviewPage";
import VoiceResultPage     from "./pages/VoiceResultPage";
import ResumeInterviewPage from "./pages/ResumeInterviewPage";
import MockInterviewPage   from "./pages/MockInterviewPage";
import InterviewHistoryPage from "./pages/InterviewHistoryPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/"         element={<HomePage />}    />
          <Route path="/login"    element={<LoginPage />}   />
          <Route path="/register" element={<RegisterPage />}/>

          {/* Protected Routes */}
          <Route path="/dashboard"        element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}       />
          <Route path="/interview"        element={<ProtectedRoute><InterviewPage /></ProtectedRoute>}       />
          <Route path="/result"           element={<ProtectedRoute><ResultPage /></ProtectedRoute>}          />
          <Route path="/voice-interview"  element={<ProtectedRoute><VoiceInterviewPage /></ProtectedRoute>}   />
          <Route path="/voice-result"     element={<ProtectedRoute><VoiceResultPage /></ProtectedRoute>}     />
          <Route path="/resume-interview" element={<ProtectedRoute><ResumeInterviewPage /></ProtectedRoute>}  />
          <Route path="/mock-interview"   element={<ProtectedRoute><MockInterviewPage /></ProtectedRoute>}    />
          <Route path="/history"           element={<ProtectedRoute><InterviewHistoryPage /></ProtectedRoute>} />
          <Route path="/interview-history" element={<ProtectedRoute><InterviewHistoryPage /></ProtectedRoute>} />
          <Route path="/interview/history" element={<ProtectedRoute><InterviewHistoryPage /></ProtectedRoute>} />


          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
