import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home/HomePage";
import Dashboard from "./pages/Dashboard/DashboardPage";
import Login from "./pages/Login/LoginPage";
// import Register from './pages/Register'
import { LanguageProvider } from "./lib/LanguageContext";
import { ThemeProvider } from "./lib/ThemeContext";
import Profile from "./pages/Profile/ProfilePage";
import MyTask from "./pages/MyTasks/MyTasksPage";
import ManageUsers from "./pages/ManageUser/ManageUserPage";
import Projects from "./pages/ManageProject/ManageProjectPage";
import AllTasks from "./pages/AllTasks/AllTasksPage";
import Reports from "./pages/Reports/ReportsPage";
import About from "./pages/About/AboutPage";
import Contract from "./pages/Contract/ContractPage";
import Activity from "./pages/Activity/ActivityPage";
import MyActivity from "./pages/MyActivity/MyActivityPage";
import ProtectedRoute from "./components/ProtectedRoute";
import SessionTimeoutHandler from "./components/SessionTimeoutHandler";
import ResetPassword from "./pages/ResetPassword/ResetPasswordPage";
import ResetPasswordFirstTime from "./pages/ResetPasswordFirstTime/ResetPasswordFirstTimePage";
import PersonalTask from "./pages/PersonalTask/PersonalTaskPage";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "scrollRestoration" in window.history
    ) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/**
 * คอมโพเนนต์หลักของระบบ (App Component)
 */
function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <BrowserRouter>
          <ScrollToTop />
          <SessionTimeoutHandler />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/Home" element={<Home />} />
            <Route path="/About" element={<About />} />
            <Route path="/Contract" element={<Contract />} />
            <Route path="/login" element={<Login />} />
            <Route path="/ResetPassword" element={<ResetPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/reset-password-first-time"
              element={<ResetPasswordFirstTime />}
            />
            {/* <Route path='/register' element={<Register />} /> */}

            {/* Protected Routes */}
            <Route
              path="/Dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/MyTasks"
              element={
                <ProtectedRoute>
                  <MyTask />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ManageUsers"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ManageUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/PersonalTask"
              element={
                <ProtectedRoute>
                  <PersonalTask />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Projects"
              element={
                <ProtectedRoute>
                  <Projects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/AllTasks"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AllTasks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Reports"
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Activity"
              element={
                <ProtectedRoute>
                  <Activity />
                </ProtectedRoute>
              }
            />
            <Route
              path="/MyActivity"
              element={
                <ProtectedRoute>
                  <MyActivity />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
