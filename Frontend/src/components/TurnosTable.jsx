import React, { useEffect, useMemo, useState } from "react";
import { FaCalendarAlt, FaCheckCircle, FaClock, FaTimesCircle, FaSearch, FaEdit } from "react-icons/fa"; 
import "../styles/turnotable.css";
import ModalEstadoTurno from "../modals/ModalConfirmar"; 
import axios from "axios";
import Swal from "sweetalert2";
import ModalSolicitudCambio from "../modals/ModalSolicitudCambio";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

function TurnosTable() {
  // ==========================================
  // CONFIGURACIÓN Y ESTADOS
  // ==========================================  
  const API_URL = import.meta.env.VITE_API_URL;

  const [turnos, setTurnos] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 7;

  // Estados para controlar los modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);
  const [isModalSolicitudOpen, setIsModalSolicitudOpen] = useState(false);

  // localStorage para el rol del usuario 
  const role = localStorage.getItem("role");
  const user = JSON.parse(localStorage.getItem("user"));

  // ==========================================
  // Endpoint para obtener los turnos
  // ==========================================
  useEffect(() => {
    const getTurnos = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token"); 
        const response = await axios.get(`${API_URL}/turno`, {
          headers: {
            Authorization: `Bearer ${token}` 
          }
        }); 
        setTurnos(response.data); 
      } catch (error) {
        console.error("Error al cargar turnos en la tabla:", error);
      } finally {
        setLoading(false);
      }
    };

    getTurnos();
  }, []);

  // ==========================================
  // HELPERS PARA PROCESAR LOCALDATETIME
  // ==========================================
  const formatFecha = (isoString) => {
    if (!isoString) return "";
    return isoString.split("T")[0]; 
  };

  const formatHora = (isoString) => {
    if (!isoString) return "";
    const horaCompleta = isoString.split("T")[1]; 
    const [horas, minutos] = horaCompleta.split(":");
    const h = parseInt(horas, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${String(h12).padStart(2, '0')}:${minutos} ${ampm}`;
  };

  // ==========================================
  // FILTROS Y PAGINACIÓN
  // ==========================================
  const filteredTurnos = useMemo(() => {
    if(!Array.isArray(turnos)) return [];

    return turnos.filter((turno) => { 
      const estado = turno.state ? turno.state.toLowerCase() : "";
      const fecha = turno.dateIn ? turno.dateIn : "";
      const employeeCc = turno.employeeCc ? turno.employeeCc : "";
      return (
        estado.includes(search.toLowerCase()) ||
        fecha.includes(search) ||
        employeeCc.includes(search)
      );
    });
  }, [search, turnos]);

  const totalPages = Math.ceil(filteredTurnos.length / perPage);

  const paginatedTurnos = filteredTurnos.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  // ==========================================
  // ESTADÍSTICAS EN TIEMPO REAL 
  // ==========================================
  const stats = useMemo(() => {
    const list = Array.isArray(turnos) ? turnos : [];
    return {
      total: list.length,
      confirmados: list.filter((t) => t && t.state === "ACEPTADO").length,
      pendientes: list.filter((t) => t && t.state === "PENDIENTE").length,
      ausentes: list.filter((t) => t && t.state === "AUSENTE").length,
      reprogramados: list.filter((t) => t && t.state === "REPROGRAMADO").length
    };
  }, [turnos]);

  // ==========================================
  // LÓGICA DEL MODAL DE ESTADO (GERENTE/RRHH)
  // ==========================================
  const abrirModalEstado = (turno) => {
    setTurnoSeleccionado(turno);
    setIsModalOpen(true);
  };
  
  const guardarCambioEstado = async (id, datosActualizados) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(`${API_URL}/turno/${id}`, datosActualizados, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      const nuevosTurnos = turnos.map((turno) => {
        if (turno.id === id) {
          return {
            ...turno,
            state: datosActualizados.state,
            confirm: datosActualizados.state === "ACEPTADO",
            observation: datosActualizados.observation
          };
        }
        return turno;
      });
      
      setTurnos(nuevosTurnos);
      setIsModalOpen(false); 
      setTurnoSeleccionado(null);

      Swal.fire({
        title: "¡Actualizado!",
        text: "Turno actualizado exitosamente.",
        icon: "success",
        background: "#111827",
        confirmButtonColor: "#4f46e5"
      });

    } catch (error) {
      console.error("Error al actualizar estado del turno:", error);
      Swal.fire({
        title: "Error al guardar",
        text: error.response?.status === 403 
          ? "No tienes autorización para realizar esta operación."
          : "Ocurrió un error al guardar los cambios.",
        icon: "error",
        background: "#111827",
        confirmButtonColor: "#ef4444"
      });
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl font-semibold text-indigo-600 animate-pulse">Cargando... <span className="animate-spin">↻</span></p>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-100 p-6 table">      

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Turnos</h1>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-md p-5 border-l-4 border-indigo-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-semibold uppercase">Total Turnos</p>
              <h2 className="text-3xl font-bold text-gray-800">{stats.total}</h2>
            </div>
            <FaCalendarAlt className="text-4xl text-indigo-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-5 border-l-4 border-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-semibold uppercase">ACEPTADO</p>
              <h2 className="text-3xl font-bold text-gray-800">{stats.confirmados}</h2>
            </div>
            <FaCheckCircle className="text-4xl text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-5 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-semibold uppercase">Pendientes</p>
              <h2 className="text-3xl font-bold text-gray-800">{stats.pendientes}</h2>
            </div>
            <FaClock className="text-4xl text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-5 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-semibold uppercase">Ausencias</p>
              <h2 className="text-3xl font-bold text-gray-800">{stats.ausentes}</h2>
            </div>
            <FaTimesCircle className="text-4xl text-red-500" />
          </div>
        </div>
      </div>
  
      {/* TABLA CONTENEDOR */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between p-5 border-b gap-4">
                
          <h2 className="text-2xl font-bold text-gray-700">Tabla de Turnos</h2>

          {user?.role === "ROLE_GERENTE" || user?.role === "ROLE_RRHH" ? (
            <Link 
              to="/registro-nuevo-turno" 
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-xl transition cursor-pointer"
            >
              AGREGAR TURNO
            </Link>
          ) : null}
                      
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por CC"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-auto pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 border-blue-300 transition "
            />
          </div>
        </div>

        {/* 1. VISTA DE DISPOSITIVOS MÓVILES */}
        <div className="block md:hidden p-4 space-y-4 bg-gray-50">
          {paginatedTurnos.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No hay turnos registrados.</p>
          ) : (
            paginatedTurnos.map((turno) => {
              // VALIDACIÓN DE DUEÑO DEL TURNO (MÓVIL)
              const esDueñoDelTurno = user && turno && String(user.cc) === String(turno.employeeCc);

              return (
                <div key={turno.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Fecha: {formatFecha(turno.dateIn)}</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        turno.state === "ACEPTADO" ? "bg-green-100 text-green-700" : 
                        turno.state === "PENDIENTE" ? "bg-yellow-100 text-yellow-700" : 
                        turno.state === "AUSENTE" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {turno.state}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div>
                      <span className="block text-xs text-gray-400">Entrada:</span>
                      <span className="font-medium text-gray-800">{formatHora(turno.dateIn)}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-gray-400">Salida:</span>
                      <span className="font-medium text-gray-800">{formatHora(turno.dateOut)}</span>
                    </div>
                  </div>

                  <div className="text-sm border-t pt-2 border-gray-100">
                    <span className="text-xs text-gray-400 block">Asistencia:</span>
                    <p className="text-gray-700">{turno.confirm ? "Sí" : "No"}</p>
                  </div>

                  <div className="text-sm">
                    <span className="text-xs text-gray-400 block">Observación:</span>
                    <p className="text-gray-700 italic">{turno.observation || "Sin observaciones"}</p>
                  </div>

                  {/* ACCIONES MÓVIL BASADO EN ROL Y PROPIEDAD */}
                  <div className="pt-2 border-t border-gray-100">
                    {(user?.role === "ROLE_GERENTE" || user?.role === "ROLE_RRHH") ? (
                      <button
                        onClick={() => abrirModalEstado(turno)}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl flex items-center justify-center gap-2 font-medium transition"
                      >
                        <FaEdit /> Modificar Estado
                      </button>
                    ) : user?.role === "ROLE_EMPLEADO" && esDueñoDelTurno ? (
                      // Añadida la restricción 'esDueñoDelTurno'
                      (turno?.state === "ACEPTADO" || turno?.state === "PENDIENTE") ? (
                        <button
                          onClick={() => {
                            setTurnoSeleccionado(turno);
                            setIsModalSolicitudOpen(true);
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl flex items-center justify-center gap-2 font-medium transition"
                        >
                          Solicitar cambio
                        </button>
                      ) : (
                        <span className="text-gray-400 italic bg-gray-100 px-3 py-2 rounded-lg text-xs block w-full text-center">
                          No disponible
                        </span>
                      )
                    ) : (
                      <span className="text-gray-400 italic text-center block w-full bg-gray-50 py-2 rounded-lg text-xs">
                        Solo lectura
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 2. VISTA ESCRITORIO */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left">Fecha</th>
                <th className="px-6 py-4 text-left">Usuario</th>
                <th className="px-6 py-4 text-left">Hora Inicio</th>
                <th className="px-6 py-4 text-left">Hora Fin</th>
                <th className="px-6 py-4 text-left">Estado</th>
                <th className="px-6 py-4 text-left">Asistencia</th>
                <th className="px-6 py-4 text-left">Observación</th>
                <th className="px-6 py-4 text-center">Modificar</th>
                {user?.role === "ROLE_EMPLEADO" && (
                  <th className="px-6 py-4 text-center">Solicitar</th>
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedTurnos.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-gray-500 font-medium">No hay turnos registrados.</td>
                </tr>
              ) : (
                paginatedTurnos.map((turno, index) => {
                  // VALIDACIÓN DE DUEÑO DEL TURNO (ESCRITORIO)
                  const esDueñoDelTurno = user && turno && String(user.cc) === String(turno.employeeCc);

                  return (
                    <tr
                      key={turno.id}
                      className={`border-b hover:bg-gray-50 transition ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="px-6 py-4">{formatFecha(turno.dateIn)}</td>
                      <td className="px-6 py-4 font-medium text-gray-800">{turno.employeeCc || "Sin CC"}</td>
                      <td className="px-6 py-4">{formatHora(turno.dateIn)}</td>
                      <td className="px-6 py-4">{formatHora(turno.dateOut)}</td>
                      
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold span-state ${
                            turno.state === "ACEPTADO" ? "bg-green-100 text-green-700" : 
                            turno.state === "PENDIENTE" ? "bg-yellow-100 text-yellow-700" : 
                            turno.state === "AUSENTE" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {turno.state}
                        </span>
                      </td>
                      <td className="px-6 py-4">{turno.confirm ? "Sí" : "No"}</td>
                      <td className="px-6 py-4 max-w-xs truncate" title={turno.observation}>
                        {turno.observation || "-"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {(user?.role === "ROLE_GERENTE" || user?.role === "ROLE_RRHH" ) ? (
                          <button
                            onClick={() => abrirModalEstado(turno)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 mx-auto transition cursor-pointer"
                          >
                            <FaEdit /> Confirmar
                          </button>
                        ) : (
                          <span className="text-gray-400 italic">En proceso</span>
                        )}
                      </td>
                      
                      {/* ACCIÓN SOLICITAR EN ESCRITORIO */}
                      {user?.role === "ROLE_EMPLEADO" && (
                        <td className="px-6 py-4 text-center">
                          {/* Modificado aquí: Ahora requiere que 'esDueñoDelTurno' sea true */}
                          {esDueñoDelTurno ? (
                            (turno?.state === "ACEPTADO" || turno?.state === "PENDIENTE") ? (
                              <button 
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl flex items-center justify-center gap-2 font-medium transition duration-200 cursor-pointer"
                                onClick={() => {
                                  setTurnoSeleccionado(turno);
                                  setIsModalSolicitudOpen(true);
                                }}
                              >
                                Solicitar cambio
                              </button>
                            ) : (
                              <span className="text-gray-400 italic bg-gray-100 px-3 py-1.5 rounded-lg text-xs block w-full text-center">
                                No disponible
                              </span>
                            )
                          ) : (
                            <span className="text-gray-400 italic text-xs block w-full text-center">
                              No permitido
                            </span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER - PAGINACIÓN */}
        <div className="flex flex-col md:flex-row items-center justify-between p-5 border-t gap-4">
          <p className="text-sm text-gray-600">
            Mostrando <span className="font-bold">{paginatedTurnos.length}</span> de <span className="font-bold">{filteredTurnos.length}</span> registros
          </p>

          <div className="flex gap-2">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === index + 1 ? "bg-indigo-600 text-white" : "bg-gray-200"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* RENDERIZACIÓN DEL MODAL DE CONFIRMACIÓN (GERENCIA) */}
      <ModalEstadoTurno 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTurnoSeleccionado(null);
        }}
        onSave={guardarCambioEstado}
        turnoData={turnoSeleccionado}
      />
      {/* RENDERIZACIÓN DEL MODAL SOLICITUD DE CAMBIO (EMPLEADO) */}
      <ModalSolicitudCambio 
        isOpen={isModalSolicitudOpen}
        onClose={() => {
          setIsModalSolicitudOpen(false);
          setTurnoSeleccionado(null);
        }}
        turnoSeleccionado={turnoSeleccionado}
        apiUrl={API_URL} 
      />

    </div>
  );
}

export { TurnosTable };