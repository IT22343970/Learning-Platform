import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!user || !user.id) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;
