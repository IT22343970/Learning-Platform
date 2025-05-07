import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUserManagement from "./pages/AdminUserManagement";
import AdminAddUser from "./pages/AdminAddUser";
import AdminBlockedUsers from "./pages/AdminBlockedUsers";
import GroupCreate from "./pages/GroupCreate";
import GroupsPage from "./pages/GroupsPage";
import ReportedPosts from "./pages/admin/ReportedPosts"; // Import the ReportedPosts page
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute"; // Update this line
import Header from "./components/Header"; // Import the Header component

function App() {
  const AdminRoute = ({ children }) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!user || !user.id) {
      return <Navigate to="/login" />;
    }

    if (user.role !== "ROLE_ADMIN") {
      return <Navigate to="/" />;
    }

    return children;
  };

  // Create a user route that doesn't immediately redirect
  const UserAwareRoute = ({ children }) => {
    // This doesn't force a redirect - component will handle display accordingly
    return children;
  };

  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        {/* Include Header only once here */}
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUserManagement />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users/add"
            element={
              <AdminRoute>
                <AdminAddUser />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users/blocked"
            element={
              <AdminRoute>
                <AdminBlockedUsers />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <AdminRoute>
                <ReportedPosts />
              </AdminRoute>
            }
          />
          <Route
            path="/groups/create"
            element={
              <PrivateRoute>
                <GroupCreate />
              </PrivateRoute>
            }
          />
          <Route
            path="/groups"
            element={
              <PrivateRoute>
                <GroupsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/groups/:type"
            element={
              <PrivateRoute>
                <GroupsPage />
              </PrivateRoute>
            }
          />
          {/* Profile Routes */}
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile/:userId"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/edit-profile"
            element={
              <PrivateRoute>
                <EditProfile />
              </PrivateRoute>
            }
          />
          {/* Add other routes as needed */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
