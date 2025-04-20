import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const PrivateRoute = ({ adminOnly = false }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/admin/login" replace />;
  }

  if (adminOnly && currentUser.email !== "trineshch7@gmail.com") {
    return (
      <div className="text-center mt-20 text-xl text-red-600">
         Access Denied: You are not authorized to view this page.
      </div>
    );
  }

  return <Outlet />;
};

export default PrivateRoute;
