import React, { useState, useEffect } from "react";
import { FaExchangeAlt, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaSearch, FaCommentDots, FaClock, FaCalendarAlt } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";

function SolicitudesTable() {
  const API_URL = import.meta.env.VITE_API_URL;

  // Estados del componente
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 7; // Paginación idéntica

  const user = JSON.parse(localStorage.getItem("user"));

  // ==========================================
  // End point
  // ==========================================
  const cargarSolicitudes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/solicitud-cambio`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSolicitudes(response.data);
    } catch (error) {
      console.error("Error al obtener solicitudes:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudieron cargar las solicitudes de cambio.",
        icon: "error",
        confirmButtonColor: "#4f46e5"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  // ==========================================
  // HELPERS DE FORMATO (Idénticos a TurnosTable)
  // ==========================================
  const formatTipo = (tipo) => {
    return tipo ? tipo.replace("_", " ") : "CAMBIO";
  };

  // ==========================================
  // ACCIÓN: GESTIONAR SOLICITUD (APROBAR/RECHAZAR)
  // ==========================================
  // ######################## INICIO DE INTEGRACIÓN: NUEVA LÓGICA DE DECISIÓN JERÁRQUICA (RRHH Y GERENTE)
  const manejarDecision = async (id, accionElegida) => {
    // Determinar el nuevo estado objetivo según el rol y la acción
    let nuevoEstado = "";
    let palabraAccion = "";

    if (accionElegida === "APROBAR") {
      if (user?.role === "ROLE_RRHH") {
        nuevoEstado = "PRE_APROBADO";
        palabraAccion = "pre-aprobar ";
      } else if (user?.role === "ROLE_GERENTE") {
        nuevoEstado = "APROBADO";
        palabraAccion = "dar la aprobación final a";
      }
    } else if (accionElegida === "RECHAZADO") {
      nuevoEstado = "RECHAZADO";
      palabraAccion = "rechazar";
    }

    const { value: observacion } = await Swal.fire({
      title: `¿Deseas ${palabraAccion} esta solicitud?`,
      input: "textarea" ,
      inputLabel: "Añade una observación (opcional)",
      inputPlaceholder: "Escribe tus comentarios aquí...",
      showCancelButton: true,
      confirmButtonColor: accionElegida === "APROBAR" ? "#16a34a" : "#dc2626",
      cancelButtonColor: "#4b5563",
      confirmButtonText: accionElegida === "APROBAR" ? "Sí, Continuar" : "Sí, Rechazar",
      cancelButtonText: "Cancelar",
    });

    if (observacion !== undefined) {
      try {
        const token = localStorage.getItem("token");
        const payload = { estado: nuevoEstado };
        
        if (user?.role === "ROLE_GERENTE") {
          payload.observacionGerente = observacion;
        } else if (user?.role === "ROLE_RRHH") {
          payload.observacionRrhh = observacion;
        }

        await axios.put(`${API_URL}/solicitud-cambio/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        let mensajeExito = `Solicitud procesada como ${nuevoEstado.toLowerCase()}!`;
        if (nuevoEstado === "PRE_APROBADO") {
          mensajeExito = "Solicitud pre-aprobada con éxito. Queda en espera del Gerente.";
        }

        Swal.fire({
          title: "¡Proceso Completado!",
          text: mensajeExito,
          icon: "success",
          confirmButtonColor: "#4f46e5",
        });

        cargarSolicitudes();
      } catch (error) {
        console.error("Error al procesar la solicitud:", error);
        Swal.fire({
          title: "Error",
          text: "No se pudo actualizar el estado.",
          icon: "error"
        });
      }
    }
  };
  // ######################## FIN DE INTEGRACIÓN

  // ==========================================
  // FILTRADO Y PAGINACIÓN
  // ==========================================
  const filteredSolicitudes = solicitudes.filter((sol) => {
    const term = search.toLowerCase();
    return (
      sol.motivo?.toLowerCase().includes(term) ||
      sol.estado?.toLowerCase().includes(term) ||
      sol.employeeCc?.toString().includes(term) ||
      sol.id?.toString().includes(term)
    );
  });

  const totalPages = Math.ceil(filteredSolicitudes.length / perPage);
  const paginatedSolicitudes = filteredSolicitudes.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  // Stats dinámicas para las tarjetas superiores
  const stats = {
    total: solicitudes.length,
    aprobadas: solicitudes.filter(s => s.estado === "APROBADO").length,
    pendientes: solicitudes.filter(s => s.estado === "PENDIENTE" || s.estado === "PRE_APROBADO").length,
    rechazadas: solicitudes.filter(s => s.estado === "RECHAZADO").length
  };

  return (
    <div className="w-full bg-gray-100 p-6 table">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Solicitudes de Cambio</h1>
      </div>

      {/* CARDS ESTADÍSTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-md p-5 border-l-4 border-indigo-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-semibold uppercase">Total Solicitudes</p>
              <h2 className="text-3xl font-bold text-gray-800">{stats.total}</h2>
            </div>
            <FaCalendarAlt className="text-4xl text-indigo-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-5 border-l-4 border-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-semibold uppercase">Aprobadas</p>
              <h2 className="text-3xl font-bold text-gray-800">{stats.aprobadas}</h2>
            </div>
            <FaCheckCircle className="text-4xl text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-5 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-semibold uppercase">En Revisión</p>
              <h2 className="text-3xl font-bold text-gray-800">{stats.pendientes}</h2>
            </div>
            <FaClock className="text-4xl text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-5 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-semibold uppercase">Rechazadas</p>
              <h2 className="text-3xl font-bold text-gray-800">{stats.rechazadas}</h2>
            </div>
            <FaTimesCircle className="text-4xl text-red-500" />
          </div>
        </div>
      </div>

      {/* CONTENEDOR TABLA PRINCIPAL */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between p-5 border-b gap-4">
          <h2 className="text-2xl font-bold text-gray-700">Tabla de Solicitudes</h2>
          
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por motivo, ID o estado..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full md:w-auto pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 border-blue-300 transition"
            />
          </div>
        </div>

        {/* 1. VISTA DISPOSITIVOS MÓVILES */}
        <div className="block md:hidden p-4 space-y-4 bg-gray-50">
          {loading ? (
            <p className="text-center text-gray-500 py-4">Cargando solicitudes...</p>
          ) : paginatedSolicitudes.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No hay solicitudes encontradas.</p>
          ) : (
            paginatedSolicitudes.map((sol) => (
              <div key={sol.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-indigo-600 font-mono">ID Solicitud: #{sol.id}</span>
                  {/* ######################## INICIO DE INTEGRACIÓN: BADGE DE ESTADOS JERÁRQUICOS MÓVIL */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      sol.estado === "APROBADO" ? "bg-green-100 text-green-700" : 
                      sol.estado === "PRE_APROBADO" ? "bg-amber-100 text-amber-700" :
                      sol.estado === "PENDIENTE" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {sol.estado === "PRE_APROBADO" ? "PRE-APROBADO" : (sol.estado || "PENDIENTE")}
                  </span>
                  {/* ######################## FIN DE INTEGRACIÓN */}
                </div>
                
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="text-gray-400 text-xs block">Empleado CC:</span> <span className="font-medium text-gray-800">{sol.employeeCc}</span></p>
                  <p><span className="text-gray-400 text-xs block">Tipo de cambio:</span> <span className="font-medium text-gray-800 uppercase text-xs bg-gray-100 px-2 py-0.5 rounded">{formatTipo(sol.tipoSolicitud)}</span></p>
                  <p><span className="text-gray-400 text-xs block">Fecha Propuesta:</span> <span className="font-medium text-gray-800">{sol.fechaPropuesta || "—"}</span></p>
                  <p><span className="text-gray-400 text-xs block">Motivo:</span> <span className="text-gray-700 font-medium">{sol.motivo}</span></p>
                  {sol.comentario && (
                    <p className="bg-gray-50 p-2 rounded-lg border border-dashed text-xs italic text-gray-500 mt-1 flex items-center gap-1">
                      <FaCommentDots className="text-gray-400" /> {sol.comentario}
                    </p>
                  )}
                </div>

                {/* ACCIONES MÓVIL */}
                {/* ########################  */}
                {((user?.role === "ROLE_RRHH" && sol.estado === "PENDIENTE") || 
                  (user?.role === "ROLE_GERENTE" && sol.estado === "PRE_APROBADO")) && (
                  <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => manejarDecision(sol.id, "APROBAR")}
                      className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl flex items-center justify-center gap-1 text-xs font-bold transition"
                    >
                      <FaCheckCircle /> {user?.role === "ROLE_RRHH" ? "Pre-Aprobar" : "Finalizar"}
                    </button>
                    <button
                      onClick={() => manejarDecision(sol.id, "RECHAZADO")}
                      className="bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl flex items-center justify-center gap-1 text-xs font-bold transition"
                    >
                      <FaTimesCircle /> Rechazar
                    </button>
                  </div>
                )}
                {/* ######################## FIN  */}
              </div>
            ))
          )}
        </div>

        {/* 2. VISTA ESCRITORIO */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left">ID</th>
                <th className="px-6 py-4 text-left">Empleado CC</th>
                <th className="px-6 py-4 text-left">Tipo</th>
                <th className="px-6 py-4 text-left">Motivo </th>
                <th className="px-6 py-4 text-left">Fecha Propuesta</th>
                <th className="px-6 py-4 text-center">Estado</th>
                {(user?.role === "ROLE_GERENTE" || user?.role === "ROLE_RRHH") && (
                  <th className="px-6 py-4 text-center">Acciones</th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500 font-medium">Cargando solicitudes...</td>
                </tr>
              ) : paginatedSolicitudes.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500 font-medium">No hay solicitudes registradas.</td>
                </tr>
              ) : (
                paginatedSolicitudes.map((sol, index) => ( 
                  <tr
                    key={sol.id}
                    className={`border-b hover:bg-gray-50 transition ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-6 py-4 font-bold text-gray-700 font-mono">#{sol.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">ID: {sol.employeeCc}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold bg-gray-100 text-gray-600 border px-2 py-0.5 rounded uppercase">
                        {formatTipo(sol.tipoSolicitud)}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="font-medium text-gray-800 truncate" title={sol.motivo}>
                        {sol.motivo}
                      </div>
                      {sol.comentario && (
                        <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5" title={sol.comentario}>
                          <FaCommentDots className="text-gray-400" /> {sol.comentario}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{sol.fechaPropuesta || "—"}</td>
                    
                    <td className="px-6 py-4 text-center">
                      {/* ######################## INICIO DE ESTADOS JERÁRQUICOS ESCRITORIO */}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          sol.estado === "APROBADO" ? "bg-green-100 text-green-700" : 
                          sol.estado === "PRE_APROBADO" ? "bg-amber-100 text-amber-700" :
                          sol.estado === "PENDIENTE" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                        }`}
                      >
                        {sol.estado === "PRE_APROBADO" ? "PRE-APROBADO" : sol.estado}
                      </span>
                      {/* ######################## FIN  */}
                    </td>

                    {/* COLUMNA DE ACCIONES EXCLUSIVA ADM */}
                    {(user?.role === "ROLE_GERENTE" || user?.role === "ROLE_RRHH") && (
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          {/* ######################## INICIO DE INTEGRACIÓN: FILTRADO DE BOTONES SEGÚN ROL Y PASO DE FLUJO */}
                          {(user?.role === "ROLE_RRHH" && sol.estado === "PENDIENTE") || 
                           (user?.role === "ROLE_GERENTE" && sol.estado === "PRE_APROBADO") ? (
                            <>
                              <button
                                onClick={() => manejarDecision(sol.id, "APROBAR")}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-xl flex items-center gap-1 text-xs font-bold transition"
                              >
                                <FaCheckCircle /> {user?.role === "ROLE_RRHH" ? "Pre-Aprobar" : "Aprobar"}
                              </button>
                              <button
                                onClick={() => manejarDecision(sol.id, "RECHAZADO")}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-xl flex items-center gap-1 text-xs font-bold transition"
                              >
                                <FaTimesCircle /> Rechazar
                              </button>
                            </>
                          ) : (
                            <span className="text-gray-400 italic text-xs bg-gray-100 px-2.5 py-1 rounded-lg border flex items-center gap-1">
                              <FaHourglassHalf /> {sol.estado === "PENDIENTE" ? "Espera RRHH" : sol.estado === "PRE_APROBADO" ? "Espera Gerente" : "Procesada"}
                            </span>
                          )}
                          {/* ######################## FIN DE INTEGRACIÓN */}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER - PAGINACIÓN */}
        <div className="flex flex-col md:flex-row items-center justify-between p-5 border-t gap-4">
          <p className="text-sm text-gray-600">
            Mostrando <span className="font-bold">{paginatedSolicitudes.length}</span> de <span className="font-bold">{filteredSolicitudes.length}</span> registros
          </p>

          <div className="flex gap-2">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-4 py-2 rounded-lg font-medium text-sm ${
                  currentPage === index + 1 ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default SolicitudesTable;