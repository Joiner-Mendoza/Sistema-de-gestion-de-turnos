import React, { useEffect, useMemo, useState } from "react";
import { FaCalendarAlt, FaCheckCircle, FaClock, FaTimesCircle, FaSearch } from "react-icons/fa"; 
import axios from "axios";
import Swal from "sweetalert2";

function AsistenciaTable() {
  // ==========================================
  // CONFIGURACIÓN Y ESTADOS
  // ==========================================  
  const API_URL = import.meta.env.VITE_API_URL;

  const [turnos, setTurnos] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 7;

  // ==========================================
  // end poind de turnos para asistencia
  // ==========================================
  useEffect(() => {
    const getDatosAsistencia = async () => {
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
        console.error("Error al cargar datos de asistencia:", error);
        Swal.fire({
          title: "Error",
          text: "No se pudieron obtener los registros.",
          icon: "error",
          confirmButtonColor: "#4f46e5"
        });
      } finally {
        setLoading(false);
      }
    };

    getDatosAsistencia();
  }, []);

  // ==========================================
  // HELPERS DE FORMATEO 
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
  const filteredAsistencias = useMemo(() => {
    if (!Array.isArray(turnos)) return [];

    return turnos.filter((turno) => { 
      const empleado = turno.employeeCc ? turno.employeeCc.toString() : "";
      const fecha = turno.dateIn ? turno.dateIn : "";
      const cumplio = turno.confirm ? "asistió sí" : "no asistió";
      const term = search.toLowerCase();

      return (
        empleado.includes(term) ||
        fecha.includes(term) ||
        cumplio.includes(term)
      );
    });
  }, [search, turnos]);

  const totalPages = Math.ceil(filteredAsistencias.length / perPage);

  const paginatedAsistencias = filteredAsistencias.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  // ==========================================
  // ESTADÍSTICAS EN TIEMPO REAL (Enfocadas en confirmación)
  // ==========================================
  const stats = useMemo(() => {
    const list = Array.isArray(turnos) ? turnos : [];
    return {
      total: list.length,
      asistieron: list.filter((t) => t && t.confirm === true).length,
      noAsistieron: list.filter((t) => t && t.confirm === false && t.state === "AUSENTE").length,
      pendientes: list.filter((t) => t && t.confirm === false && t.state !== "AUSENTE").length,
      cedula: list.filter((t) => t && t.employeeCc).length
    };
  }, [turnos]);

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl font-semibold text-indigo-600 animate-pulse">Procesando registros de asistencia...</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-100 p- table">      

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Control de Asistencia</h1>
      </div>

      {/* CARDS ESTADÍSTICAS */}
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
              <p className="text-sm text-gray-500 font-semibold uppercase">Asistencias Confirmadas</p>
              <h2 className="text-3xl font-bold text-gray-800">{stats.asistieron}</h2>
            </div>
            <FaCheckCircle className="text-4xl text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-5 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-semibold uppercase">Faltas Justificadas/Ausente</p>
              <h2 className="text-3xl font-bold text-gray-800">{stats.noAsistieron}</h2>
            </div>
            <FaTimesCircle className="text-4xl text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-5 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-semibold uppercase">Por Confirmar (Pendientes)</p>
              <h2 className="text-3xl font-bold text-gray-800">{stats.pendientes}</h2>
            </div>
            <FaClock className="text-4xl text-yellow-500" />
          </div>
        </div>
      </div>

      {/* TABLA CONTENEDOR */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between p-5 border-b gap-4">
          <h2 className="text-2xl font-bold text-gray-700">Validación de Asistencia</h2>
          
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por cédula o fecha..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full md:w-auto pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 border-blue-300 transition"
            />
          </div>
        </div>

        {/* VISTA MÓVIL */}
        <div className="block md:hidden p-4 space-y-4 bg-gray-50">
          {paginatedAsistencias.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No hay registros coincidentes.</p>
          ) : (
            paginatedAsistencias.map((turno) => (
              <div key={turno.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-400">FECHA: {formatFecha(turno.dateIn)}</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    turno.confirm ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {turno.confirm ? "ASISTIÓ" : "NO ASISTIÓ"}
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="text-gray-400 text-xs">Empleado (CC):</span> {turno.employeeCc || "Sin CC"}</p>
                  <p><span className="text-gray-400 text-xs">Horario Esperado:</span> {formatHora(turno.dateIn)} - {formatHora(turno.dateOut)}</p>
                  <p><span className="text-gray-400 text-xs">Estado del Turno:</span> <span className="font-semibold">{turno.state}</span></p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* VISTA ESCRITORIO */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left">Fecha</th>
                <th className="px-6 py-4 text-left">Cédula Empleado</th>
                <th className="px-6 py-4 text-left">Hora Entrada</th>
                <th className="px-6 py-4 text-left">Hora Salida</th>
                <th className="px-6 py-4 text-left">Estado del Turno</th>
                <th className="px-6 py-4 text-center">¿Confirmó Asistencia?</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAsistencias.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500 font-medium">No hay registros.</td>
                </tr>
              ) : (
                paginatedAsistencias.map((turno, index) => (
                  <tr key={turno.id} className={`border-b hover:bg-gray-50 transition ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                    <td className="px-6 py-4">{formatFecha(turno.dateIn)}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">{turno.employeeCc || "Sin CC"}</td>
                    <td className="px-6 py-4 text-gray-600 font-mono">{formatHora(turno.dateIn)}</td>
                    <td className="px-6 py-4 text-gray-600 font-mono">{formatHora(turno.dateOut)}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold bg-gray-200 text-gray-700 px-2 py-1 rounded">
                        {turno.state}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                        turno.confirm 
                          ? "bg-green-100 text-green-700 border border-green-300" 
                          : "bg-red-100 text-red-700 border border-red-300"
                      }`}>
                        {turno.confirm ? "SÍ, ASISTIÓ" : "NO ASISTIÓ"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINACIÓN */}
        <div className="flex flex-col md:flex-row items-center justify-between p-5 border-t gap-4">
          <p className="text-sm text-gray-600">
            Mostrando <span className="font-bold">{paginatedAsistencias.length}</span> de <span className="font-bold">{filteredAsistencias.length}</span> registros
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

export { AsistenciaTable };