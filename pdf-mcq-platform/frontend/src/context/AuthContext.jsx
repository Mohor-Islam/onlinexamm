// Teacher এর লগইন স্টেট গোটা অ্যাপে শেয়ার করার Context
import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [teacher, setTeacher] = useState(() => {
    const saved = localStorage.getItem("teacherInfo");
    return saved ? JSON.parse(saved) : null;
  });

  // লগইন/রেজিস্টার সফল হলে এই ফাংশন কল হবে
  const login = (data) => {
    localStorage.setItem("teacherInfo", JSON.stringify(data));
    setTeacher(data);
  };

  const logout = () => {
    localStorage.removeItem("teacherInfo");
    setTeacher(null);
  };

  return (
    <AuthContext.Provider value={{ teacher, login, logout }}>{children}</AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
