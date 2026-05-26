import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { AuthContext } from "../context/AuthProvider";
import "../styles/login.css";

function Login() {

  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [numIdentificacion, setNumIdentificacion] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  
  const [time, setTime] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // anti spam click
    if (loading) return;
    const errors = {};
    if (!numIdentificacion) errors.numIdentificacion = "La identificación es requerida";
    if (!password) errors.password = "La contraseña es requerida";
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      setLoading(true);
      setTime(0);

      const response = await axios.post(`${API_URL}/login`, {
        numIdentificacion: numIdentificacion,
        password,
      });

      const token = response.data.token;
      const userFromBackend = response.data.user; 

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userFromBackend));

      login(userFromBackend, token);

      Swal.fire({
        title: "Sesión exitosa",
        text: `Bienvenido, ${userFromBackend.name || userFromBackend.username}`,
        icon: "success",
        timer: 1200,
        showConfirmButton: false,
        background: "#111827",
        color: "#fff"
      });

      navigate("/dashboard");

    } catch (error) {
      console.error("Error al iniciar sesión:", error);

   
      Swal.fire({
        title: "Error",
        text: "Número de identificación o contraseña incorrectos",
        icon: "Error al iniciar sesión",
        background: "#111827",
        color: "#fff"
      });

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen flex items-center justify-center py-12 px-6 aptmo-container">
      
      <div className="w-full max-w-md bg-gray-800/40 border border-gray-700 shadow-2xl backdrop-blur-md rounded-[2rem] p-10 aptmo">
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-white tracking-tight">
            Iniciar sesión
          </h2>
          <p className="text-indigo-400 text-xs font-bold mt-2 tracking-[0.2em]">
            Gestion de Horarios
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>

          {/* IDENTIFICACIÓN */}
          <div>
            <label className="block text-sm font-medium text-white ml-1 mb-2">
              Identificación
            </label>
            <input
              type="text"
              value={numIdentificacion}
              disabled={loading}
              placeholder="Número de cédula"
              onChange={(e) => setNumIdentificacion(e.target.value)}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white focus:border-indigo-500 transition-all placeholder:text-gray-500"
            />
            {fieldErrors.numIdentificacion && (
              <p className="text-red-400 text-[10px] mt-2 ml-1 font-bold uppercase tracking-wider">
                {fieldErrors.numIdentificacion}
              </p>
            )}
          </div>

          {/* CONTRASEÑA */}
          <div>
            <label className="block text-sm font-medium text-white ml-1 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              disabled={loading}
              placeholder="**********"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white focus:border-indigo-500 transition-all placeholder:text-gray-500"
            />
            {fieldErrors.password && (
              <p className="text-red-400 text-[10px] mt-2 ml-1 font-bold uppercase tracking-wider">
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* BOTÓN  */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 font-black text-white rounded-xl shadow-lg uppercase tracking-widest text-xs transition-all mt-4 
            ${loading 
              ? "bg-gray-600 cursor-not-allowed" 
              : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20 cursor-pointer"
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Entrando... 
              </div>
            ) : (
              "Entrar "
            )}
          </button>

        </form>

        <p className="text-center text-gray-400 text-[10px] mt-8 font-bold uppercase tracking-[0.15em]">
          ¿No tienes cuenta?{" "}
          <Link to="/registro" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4 decoration-2">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}

export { Login };