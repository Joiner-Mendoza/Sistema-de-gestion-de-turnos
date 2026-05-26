import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthProvider";

export default function ProtectedRoute() {
    const token = localStorage.getItem("token");
    const { user, loading } = useContext(AuthContext);
    if (loading) return (
        <div className="text-white">Cargando...</div>
    );
    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }
    return <Outlet />;
}