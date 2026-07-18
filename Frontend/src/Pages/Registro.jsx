import React,{ useEffect, useState } from "react";

import { EyeDropperIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import axios from "axios";
// Importamios swetalert2 para mostrar mensajes de error
import Swal from "sweetalert2";//comanbdo para instalar: npm install sweetalert2
import { useContext } from "react";
import { AuthContext } from "../context/AuthProvider";


function Registro() { 
  const navigate = useNavigate();
  // obtenemos al ususario logueado para validar su rol
  const { user } = useContext(AuthContext);
  

// variable para la url del backend
  const API_URL = import.meta.env.VITE_API_URL;
// Estados para cada campo del formulario
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [numIdentificacion , setNumIdentificacion] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(""); 
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role,setRole] = useState("ROLE_EMPLEADO");
  //estado para el manejo de errores
  const [fieldErrors, setFieldErrors] = useState({});
  // useEfect  para generar el nomrbe de usuario
  // useEffect(()=> {
  //   const generateUser = `${name}${lastName}`.replace(/\s+/g, "");
  //   setNumIdentificacion(generateUser)
  // },[name, lastName]); 
  const [loading, setLoading] = useState(false);

const sendRegister = async (e) => {
  e.preventDefault();
  if (loading) return; // anti spam click 
  setFieldErrors({});
// ######### validaciones #########
const errors = {};// creo los distintos mensajes si los campos estan vacios

if (!name.trim()) {
  errors.name = "El campo es obligatorio";
}else if (name.trim().length < 3){
  errors.name = "El nombre debe tener al menos 3 caracteres"
}

if (!lastName.trim()) {
  errors.lastName = "El campo es obligatorio";
}else if(lastName.trim().length < 3){
  errors.lastName = "El apellido debe tener al menos 3 caracteres"
}
// este solo permitira  numeros
if (!numIdentificacion.trim()) {
  errors.numIdentificacion = "El campo es obligatorio";
}else if (!/^\d+$/.test(numIdentificacion.trim())) {
  errors.numIdentificacion = "El número de identificación debe contener solo números";
}

if (!email.trim()) {
  errors.email = "El campo es obligatorio";
}else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
  errors.email = "El correo electrónico no es válido";
}

if (!phone.trim()) {
  errors.phone = "El campo es obligatorio";
}else if (!/^\+?\d{10,15}$/.test(phone.trim())) {
  errors.phone = "El número telefónico no es válido";
} 

if (!password.trim()) {
  errors.password = "El campo es obligatorio";
}else if(password.trim().length < 6){
  errors.password = "La contraseña debe tener al menos 6 caracteres"
}else if (!/(?=.*[A-Z])/.test(password.trim())) {
  errors.password = "La contraseña debe contener al menos una letra mayúscula";
}

if (!confirmPassword.trim()) {
  errors.confirmPassword = "El campo es obligatorio";
}else if(confirmPassword.trim().length < 6){
  errors.confirmPassword = "La contraseña debe tener al menos 6 caracteres"
}
if (password !== confirmPassword) {
  errors.confirmPassword = "Las contraseñas no coinciden";
}else if (!/(?=.*[A-Z])/.test(confirmPassword.trim())) {
  errors.confirmPassword = "La contraseña debe contener al menos una letra mayúscula";
}
// ######### validaciones #########
if (Object.keys(errors).length > 0) {
  setFieldErrors(errors);
  return; // Si hay errores, no se envía el formulario
}
  try {
    const dataToSend = {
      name,
      lastName,
      numIdentificacion,
      email,
      cellphone: phone,
      password,
      confirmPassword,
      // pasamos el rol seleccionado, por defecto es ROLE_EMPLEADO pero si el usuario logueado es gerente o rrhh podra elegir el rol del nuevo usuario
      role:(user?.role === "ROLE_GERENTE" || user?.role === "ROLE_RRHH") ? role : "ROLE_EMPLEADO"
    };
    // console.log("Venv", API_URL);
    const response = await axios.post(`${API_URL}/register`,dataToSend);
    Swal.fire({ 
      icon: "success",
      title: "Registro exitoso"
    });
    navigate("/login");

  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error en registro"
    });
    // console.log("Error en el registro:", error.response?.data?.error || error.message);
  };
  }
  return (
    <div className="bg-gray-900 min-h-screen py-12 px-6">
      <div className="mx-auto max-w-2xl">

        <form className="space-y-8" onSubmit={sendRegister}>
          
          {/* TITULO */}
          <div>
            <h2 className="text-2xl font-bold text-white">
                   Registro de Usuario
            </h2>
          </div>

          {/* NOMBRE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            <div>
              <label className="block text-sm font-medium text-white">
                Nombre
              </label>

              <input
                type="text"
                className="mt-2 w-full rounded-md bg-white/5 px-3 py-2 text-white outline outline-1 outline-white/10 focus:outline-indigo-500"
                value={name}
                onChange={(e) => setName(e.target.value)}

              />
                  {fieldErrors.name && (
                  <span className="error-message" style={{ color: "#fff" }}>
                    {fieldErrors.name}
                  </span>
                )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white">
                Apellido
              </label>

              <input
                type="text"
                className="mt-2 w-full rounded-md bg-white/5 px-3 py-2 text-white outline outline-1 outline-white/10 focus:outline-indigo-500"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
                  {fieldErrors.lastName && (
                  <span className="error-message" style={{ color: "#fff" }}>
                    {fieldErrors.lastName}
                  </span>
                )}
            </div>
            {/* NUMERO DE IDENTIFICACIO */}
            <div>
              <label className="block text-sm font-medium text-white">
                Numero de identificación 
              </label>
                
              <input
                type="text"
                className="mt-2 w-full rounded-md bg-white/5 px-3 py-2 text-white outline outline-1 outline-white/10 focus:outline-indigo-500"
                value={numIdentificacion}
                // Solo permite números en el campo de número de identificación
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) {
                    setNumIdentificacion(value);
                  }
                }}
              />
                  {fieldErrors.numIdentificacion && (
                  <span className="error-message" style={{ color: "#fff" }}>
                    {fieldErrors.numIdentificacion}
                  </span>
                )}
            </div>

          </div>

          {/* EMAIL */}
          <div>
            <label className="block text-sm font-medium text-white">
              Correo electrónico
            </label>

            <input
              type="text"
              className="mt-2 w-full rounded-md bg-white/5 px-3 py-2 text-white outline outline-1 outline-white/10 focus:outline-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}

            />
              {fieldErrors.email && ( 
                  <span className="error-message" style={{ color: "#fff" }}>
                    {fieldErrors.email}
                  </span>
              )}

          </div>

          {/* TELEFONO */}
          <div>
            <label className="block text-sm font-medium text-white">
              Número telefónico
            </label>

            <input
              type="tel"
              inputMode="numeric"
              placeholder="+52 555 123 4567"
              className="mt-2 w-full rounded-md bg-white/5 px-3 py-2 text-white outline outline-1 outline-white/10 focus:outline-indigo-500"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            {(fieldErrors.phone && (
                  <span className="error-message" style={{ color: "#fff" }}> 
                    {fieldErrors.phone}
                  </span>
            ))}
          </div>
          {(user?.role === "ROLE_GERENTE" ||
            user?.role === "ROLE_RRHH") && (

            <div>
              <label className="block text-sm font-medium text-white">
                Asignar Rol
              </label>

              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-2 w-full rounded-md bg-gray-800 px-3 py-2 text-white outline outline-1 outline-white/10 focus:outline-indigo-500"
              >
                <option value="ROLE_EMPLEADO">
                  Empleado
                </option>

                {(user?.role === "ROLE_RRHH") && (
                  <option value="ROLE_RRHH">
                  RR.HH
                </option>
                )}

                <option value="ROLE_GERENTE">
                  Gerente
                </option>
              </select>
            </div>
          )}
         {/* CONTRASEÑA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            <div>
              <label className="block text-sm font-medium text-white">
                Contraseña
              </label>

              <input
                type="password"
                autoComplete="new-password"
                className="mt-2 w-full rounded-md bg-white/5 px-3 py-2 text-white outline outline-1 outline-white/10 focus:outline-indigo-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {fieldErrors.password && (
                  <span className="error-message" style={{ color: "#fff" }}>
                    {fieldErrors.password}
                  </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white">
                Confirmar contraseña
              </label>

              <input
                type="password"
                autoComplete="new-password"
                className="mt-2 w-full rounded-md bg-white/5 px-3 py-2 text-white outline outline-1 outline-white/10 focus:outline-indigo-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {fieldErrors.confirmPassword && (
                  <span className="error-message" style={{ color: "#fff" }}>
                    {fieldErrors.confirmPassword}
                  </span>
              )}
            </div>

          </div>

          {/* BOTONES */}
          <div className="flex justify-end gap-4 pt-6">

            <button
              type="button"
              className="bg-indigo-500 hover:bg-indigo-400 px-4 py-2 rounded-md text-white font-semibold"
              onClick={() => navigate("/login")}
            >
              Cancelar
            </button>
              
          <button
            type="button"
            onClick={sendRegister}
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
                Registrando... 
              </div>
            ) : (
              "Registrarse "
            )}
          </button>

          </div>

        </form>

      </div>
    </div>
  );
}

export { Registro };