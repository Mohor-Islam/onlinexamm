// মূল App - সব Route এখানে ডিফাইন করা আছে
import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

import Login from "./pages/teacher/Login";
import Register from "./pages/teacher/Register";
import Dashboard from "./pages/teacher/Dashboard";
import CreateExam from "./pages/teacher/CreateExam";
import ExamDetails from "./pages/teacher/ExamDetails";

import Join from "./pages/student/Join";
import ExamRoom from "./pages/student/ExamRoom";
import Result from "./pages/student/Result";
import PublicLeaderboard from "./pages/student/PublicLeaderboard";

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Teacher Routes */}
        <Route path="/teacher/login" element={<Login />} />
        <Route path="/teacher/register" element={<Register />} />
        <Route
          path="/teacher/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/create-exam"
          element={
            <ProtectedRoute>
              <CreateExam />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/exam/:id"
          element={
            <ProtectedRoute>
              <ExamDetails />
            </ProtectedRoute>
          }
        />

        {/* Student Routes */}
        <Route path="/exam/:examLink" element={<Join />} />
        <Route path="/exam/:examLink/room" element={<ExamRoom />} />
        <Route path="/exam/:examLink/result/:attemptId" element={<Result />} />
        <Route path="/exam/:examLink/leaderboard" element={<PublicLeaderboard />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
