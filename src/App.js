import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import QueriesPage from "./pages/QueriesPage";
import TrialsPage from "./pages/TrialsPage";
import TeacherApplicationsPage from "./pages/TeacherApplicationsPage";
import OthersPage from "./pages/OthersPage";
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/queries" element={<QueriesPage />} />
        <Route path="/trials" element={<TrialsPage />} />
        <Route path="/teachers" element={<TeacherApplicationsPage />} />
        <Route path="/others" element={<OthersPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
