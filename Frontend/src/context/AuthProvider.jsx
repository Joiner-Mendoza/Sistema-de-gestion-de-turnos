import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);

  const [token, setToken] = useState(null);

  const [loading, setLoading] = useState(true);

  // ==========================================
  //LOCALSTORAGE
  // ==========================================
  useEffect(() => {
    // Extraemos los datos almacenados previamente
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    // Verificamos si existen ambos datos
    if (storedUser && storedToken) {

      try {

        // Convertimos el usuario de texto JSON a objeto
        const parsedUser = JSON.parse(storedUser);

        // Guardamos usuario y token en estados globales
        setUser(parsedUser);
        setToken(storedToken);

        // ==========================================
        // DEBUG DE ROLES
        // ==========================================
        // Esto te permitirá validar fácilmente
        // qué rol tiene el usuario autenticado
        console.log("Usuario autenticado:", parsedUser);
        console.log("Rol del usuario:", parsedUser.role);

      } catch (error) {

        console.error("Error al parsear al usuario del localStorage:",error);

        // limpia todo
        localStorage.clear();
      }
    }

    // Finaliza la carga inicial
    setLoading(false);

  }, []);

  // ==========================================
  // FUNCIÓN LOGIN
  // ==========================================
  const login = (userData, authToken) => {

    // Guardamos los datos en React
    setUser(userData);
    setToken(authToken);

    // ==========================================
    // GUARDAMOS DATOS EN LOCALSTORAGE
    // ==========================================
    // Esto permite mantener la sesión activa
    // aunque el usuario refresque la página

    localStorage.setItem("user",JSON.stringify(userData));

    localStorage.setItem("token",authToken);

    // ==========================================
    // VALIDACIÓN DEL ROL
    // ==========================================
    // Muy útil para desarrollo y debugging

    console.log("Login exitoso");
    console.log("Usuario:", userData);
    console.log("Rol asignado:", userData?.role);

    // ==========================================
    // EJEMPLO DE ROLES DISPONIBLES
    // ==========================================
    // ROLE_RRHH
    // ROLE_GERENTE
    // ROLE_EMPLEADO

  };

  // ==========================================
  // FUNCIÓN LOGOUT
  // ==========================================
  const logout = () => {

    // Limpiamos estados
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    // Redireccionamos al login
    window.location.href = "/#/login";
  };

  // ==========================================
  // FUNCIONES AUXILIARES DE ROLES
  // ==========================================
  // Verifica rol
  const isRRHH = user?.role === "ROLE_RRHH";


  const isGerente = user?.role === "ROLE_GERENTE";

  // Verifica si el usuario es empleado
  const isEmpleado = user?.role === "ROLE_EMPLEADO";

  // ==========================================
  // VALIDACIÓN DE PERMISOS
  // ==========================================
  // Esto te servirá muchísimo después
  // para proteger vistas rápidamente

  const canEditTurnos =
    isRRHH || isGerente;

  // ==========================================
  // PROVIDER GLOBAL
  // ==========================================
  return (

    <AuthContext.Provider
      value={{

        // Datos principales
        user,
        token,
        loading,

        // Funciones
        login,
        logout,

        // Roles rápidos
        isRRHH,
        isGerente,
        isEmpleado,

        // Permisos rápidos
        canEditTurnos

      }}
    >

      {/* Evita renderizar antes de cargar */}
      {!loading && children}

    </AuthContext.Provider>
  );
};

export default AuthProvider;