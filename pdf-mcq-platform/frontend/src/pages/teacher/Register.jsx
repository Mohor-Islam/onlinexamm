// Teacher Register পেজ
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", form);
      login(data);
      navigate("/teacher/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "রেজিস্ট্রেশন ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm">
      <h2 className="text-2xl font-bold mb-6 text-center">Teacher Register</h2>

      {error && (
        <div className="bg-red-100 text-red-700 text-sm px-3 py-2 rounded-lg mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          required
          placeholder="নাম"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent"
        />
        <input
          type="email"
          required
          placeholder="ইমেইল"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="পাসওয়ার্ড (কমপক্ষে ৬ ক্যারেক্টার)"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent"
        />
        <button
          disabled={loading}
          className="w-full bg-primary hover:bg-primary-dark text-white py-2.5 rounded-lg font-medium disabled:opacity-60"
        >
          {loading ? "একাউন্ট তৈরি হচ্ছে..." : "রেজিস্টার করুন"}
        </button>
      </form>

      <p className="text-sm text-center mt-5 text-gray-500">
        আগে থেকেই একাউন্ট আছে?{" "}
        <Link to="/teacher/login" className="text-primary font-medium">
          লগইন করুন
        </Link>
      </p>
    </div>
  );
}
