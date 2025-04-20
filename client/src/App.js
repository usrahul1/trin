import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import { AuthProvider } from "./contexts/AuthContext"
import PrivateRoute from "./components/PrivateRoute"

// Pages
import HomePage from "./pages/HomePage"
import LoginPage from "./pages/LoginPage"
import SignupPage from "./pages/SignupPage"
import ProductsPage from "./pages/ProductsPage"
import NewOrderPage from "./pages/NewOrderPage"
import TrackOrderPage from "./pages/TrackOrderPage"
import AdminDashboard from "./pages/AdminDashboard"
import AdminNewProduct from "./pages/AdminNewProduct"
import AdminEditProduct from "./pages/AdminEditProduct"
import ProfilePage from "./pages/ProfilePage"
import NotFoundPage from "./pages/NotFoundPage"
import AdminLogin from "./pages/AdminLogin"
import AdminRegister from "./pages/AdminRegister"

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/orders/track" element={<TrackOrderPage />} />

          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/orders/new" element={<NewOrderPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<PrivateRoute adminOnly={true} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/products/new" element={<AdminNewProduct />} />
            <Route path="/admin/products/edit/:id" element={<AdminEditProduct />} />
          </Route>

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/register" element={<AdminRegister />} />





          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
