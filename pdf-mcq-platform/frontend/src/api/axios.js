// Backend এর সাথে কমিউনিকেশন করার জন্য কেন্দ্রীয় axios instance
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// প্রতিটি রিকোয়েস্টের সাথে Teacher এর JWT টোকেন (থাকলে) অটো যুক্ত করে দিচ্ছি
api.interceptors.request.use((config) => {
  const teacherInfo = localStorage.getItem("teacherInfo");
  if (teacherInfo) {
    const { token } = JSON.parse(teacherInfo);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
