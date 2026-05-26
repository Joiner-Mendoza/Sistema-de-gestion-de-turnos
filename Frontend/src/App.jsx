import React, { useContext } from "react";
import {HashRouter,Routes,Route,} from "react-router-dom";
import "./App.css";
import Dashboard from "./Pages/Dashboard";
import AuthProvider,{AuthContext} from "./context/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import { Navigate } from "react-router-dom";
import { Login } from "./Pages/Login";
import { Registro } from "./Pages/Registro";
import { FormularioCrearTurno } from "./Pages/FormularioCrearTurno";

function AppContent() {

  const {user} = useContext(AuthContext)
  const { loading } = useContext(AuthContext);

  if (loading) {

    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <p className="text-white animate-pulse">
          Cargando sesión...
        </p>
      </div>
    );
  }

  return (

    <HashRouter>
      <Routes>
        {/* Rutas publicas */}
        <Route path='/' element={<Navigate to='/login' />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard"/> : <Login />}/>
        <Route path="/registro"element={<Registro />}/>
       {/* Rutas protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/registro-nuevo-turno" element={<FormularioCrearTurno />} />
        </Route>
        {/* Redirección por defecto para cualquier ruta no encontrada */}
        <Route path='*' element={<Navigate to='/login' />} />
      </Routes>
    </HashRouter>
  );
}

function App() {

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;