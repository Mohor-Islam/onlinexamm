// শুধু লগইন করা Teacher যেন Dashboard/CreateExam পেজে ঢুকতে পারে, তার জন্য Route Guard
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { teacher } = useAuth();
  if (!teacher) {
    return <Navigate to="/teacher/login" replace />;
  }
  return children;
}
