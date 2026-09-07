// উপরের Navigation Bar - Dark Mode toggle এবং Teacher Login/Logout বাটন সহ
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const { teacher, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="flex items-center justify-between px-4 sm:px-8 py-3 bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-30">
      <Link to="/" className="font-bold text-lg text-primary dark:text-indigo-300">
        📝 MCQ Exam Platform
      </Link>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleDarkMode}
          aria-label="Toggle dark mode"
          className="text-xl px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {darkMode ? "☀️" : "🌙"}
        </button>

        {teacher ? (
          <>
            <Link
              to="/teacher/dashboard"
              className="hidden sm:inline text-sm font-medium hover:text-primary"
            >
              ড্যাশবোর্ড
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg"
            >
              লগআউট
            </button>
          </>
        ) : (
          <Link
            to="/teacher/login"
            className="text-sm bg-primary hover:bg-primary-dark text-white px-3 py-1.5 rounded-lg"
          >
            Teacher Login
          </Link>
        )}
      </div>
    </nav>
  );
}
