import React, { useEffect, useMemo, useState } from "react";
import { FaFilePdf, FaSearch, FaCalendarAlt, FaUser, FaChartPie, FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";

export function ReportesPanel() {
  const API_URL = import.meta.env.VITE_API_URL;

  // Estados
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para los Filtros (Por Empleado y Por Período)
  const [filterCc, setFilterCc] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  // Cargar todos los turnos al iniciar
  useEffect(() => {
    const fetchTurnos = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/turno`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTurnos(response.data);
      } catch (error) {
        console.error("Error al cargar turnos para reportes:", error);
        Swal.fire({
          title: "Error",
          text: "No se pudieron procesar los datos para los reportes.",
          icon: "error",
          confirmButtonColor: "#4f46e5",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchTurnos();
  }, []);

  // ==========================================
  // FILTRADO
  // ==========================================
  const turnosFiltrados = useMemo(() => {
    if (!Array.isArray(turnos)) return [];

    return turnos.filter((turno) => {
      const fechaTurno = turno.dateIn ? turno.dateIn.split("T")[0] : "";
      const ccEmpleado = turno.employeeCc ? turno.employeeCc.toString() : "";

      // Validaciones lógicas de filtros
      const cumpleCc = filterCc ? ccEmpleado.includes(filterCc) : true;
      const cumpleInicio = fechaInicio ? fechaTurno >= fechaInicio : true;
      const cumpleFin = fechaFin ? fechaTurno <= fechaFin : true;

      return cumpleCc && cumpleInicio && cumpleFin;
    });
  }, [turnos, filterCc, fechaInicio, fechaFin]);

  // ==========================================
  // CÁLCULO DE MÉTRICAS OPERACIONALES
  // ==========================================
  const metricas = useMemo(() => {
    const total = turnosFiltrados.length;
    if (total === 0) return { total: 0, asistencias: 0, ausencias: 0, solicitudes: 0, pctAsistencia: 0, pctAusentismo: 0 };

    const asistencias = turnosFiltrados.filter((t) => t.confirm === true).length;
    const ausencias = turnosFiltrados.filter((t) => t.state === "AUSENTE").length;
    // Asumimos solicitudes de cambio basadas en estados alterados o reprogramados
    const solicitudes = turnosFiltrados.filter((t) => t.state === "REPROGRAMADO" || t.observation?.toLowerCase().includes("cambio")).length;

    // Fórmulas de Porcentajes
    const pctAsistencia = Math.round((asistencias / total) * 100);
    const pctAusentismo = Math.round((ausencias / total) * 100);

    return { total, asistencias, ausencias, solicitudes, pctAsistencia, pctAusentismo };
  }, [turnosFiltrados]);

  // Obtener lista única de Cédulas para ayudar al buscador (opcional)
  const listaEmpleadosUnicos = useMemo(() => {
    if (!Array.isArray(turnos)) return [];
    const lista = turnos.map((t) => t.employeeCc).filter(Boolean);
    return [...new Set(lista)];
  }, [turnos]);

  // Función para disparar la impresión limpia del navegador (Guardar como PDF)
  const handleExportarPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl font-semibold text-indigo-600 animate-pulse">Generando métricas consolidadas...</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-100 p-6 rounded-xl text-gray-800 printable-area">
      
      {/* HEADER DE REPORTES */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 no-print">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Centro de Reportes Gerenciales</h1>
          <p className="text-sm text-gray-500">Consolidado de asistencia, puntualidad y ausentismo laboral.</p>
        </div>
        <button
          onClick={handleExportarPDF}
          className="bg-red-600 hover:bg-red-700 text-white font-medium px-5 py-2.5 rounded-xl flex items-center gap-2 transition shadow-md cursor-pointer"
        >
          <FaFilePdf /> Guardar Reporte (PDF)
        </button>
      </div>

      {/* FORMULARIO DE FILTROS  */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-8 no-print">
        <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-4">Parámetros de Búsqueda</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Filtro por Empleado */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 flex items-center gap-1">
              <FaUser /> Cédula del Empleado
            </label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-3.5 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Ej. 10023456..."
                value={filterCc}
                onChange={(e) => setFilterCc(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 border-gray-300 transition"
              />
            </div>
          </div>

          {/* Fecha Inicio */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 flex items-center gap-1">
              <FaCalendarAlt /> Fecha Inicial (Desde)
            </label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 border-gray-300 text-gray-700 transition"
            />
          </div>

          {/* Fecha Fin */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 flex items-center gap-1">
              <FaCalendarAlt /> Fecha Final (Hasta)
            </label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 border-gray-300 text-gray-700 transition"
            />
          </div>
        </div>

        {/* Botón para limpiar filtros */}
        {(filterCc || fechaInicio || fechaFin) && (
          <button
            onClick={() => { setFilterCc(""); setFechaInicio(""); setFechaFin(""); }}
            className="mt-4 text-xs font-bold text-red-500 hover:underline"
          >
            Limpiar filtros activos
          </button>
        )}
      </div>

      {/* TITULO SÓLO VISIBLE AL IMPRIMIR EN EN EL PDF */}
      <div className="hidden print:block mb-6 border-b pb-4">
        <h1 className="text-3xl font-bold text-black">REPORTES DE ASISTENCIA Y RENDIMIENTO</h1>
        <p className="text-sm text-gray-600">
          Filtros aplicados: {filterCc ? `Empleado CC: ${filterCc}` : "Todos los empleados"} | 
          Período: {fechaInicio || "Inicio"} al {fechaFin || "Fin de registros"}
        </p>
      </div>

      {/* RENDIMIENTO Y PORCENTAJES (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-md border flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Tasa de Asistencia </p>
            <h3 className="text-4xl font-extrabold text-green-600 mt-1">{metricas.pctAsistencia}%</h3>
            <p className="text-xs text-gray-500 mt-2">Porcentaje de turnos completados y confirmados con éxito.</p>
          </div>
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-500 text-3xl font-bold border border-green-200">
            {metricas.pctAsistencia}%
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md border flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Índice de Inacistencias</p>
            <h3 className="text-4xl font-extrabold text-red-600 mt-1">{metricas.pctAusentismo}%</h3>
            <p className="text-xs text-gray-500 mt-2">Porcentaje de ausencias injustificadas acumuladas.</p>
          </div>
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 text-3xl font-bold border border-red-200">
            {metricas.pctAusentismo}%
          </div>
        </div>
      </div>

      {/* TARJETAS DE CONTEO CONSOLIDADO */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-indigo-600">
          <p className="text-xs text-gray-400 font-bold uppercase">Turnos Evaluados</p>
          <h2 className="text-2xl font-bold text-gray-800 mt-1">{metricas.total}</h2>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-600">
          <p className="text-xs text-gray-400 font-bold uppercase">Asistencias </p>
          <h2 className="text-2xl font-bold text-gray-800 mt-1">{metricas.asistencias}</h2>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-red-600">
          <p className="text-xs text-gray-400 font-bold uppercase">Faltas Registradas</p>
          <h2 className="text-2xl font-bold text-gray-800 mt-1">{metricas.ausencias}</h2>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-yellow-500">
          <p className="text-xs text-gray-400 font-bold uppercase">Solicitudes </p>
          <h2 className="text-2xl font-bold text-gray-800 mt-1">{metricas.solicitudes}</h2>
        </div>
      </div>

      {/* TABLA CONSOLIDADA DETALLADA */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden border">
        <div className="p-5 border-b bg-gray-50">
          <h2 className="text-xl font-bold text-gray-700">Detallades de reportes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-800 text-white text-xs uppercase">
              <tr>
                <th className="px-6 py-3.5">Fecha</th>
                <th className="px-6 py-3.5">Cédula</th>
                <th className="px-6 py-3.5">Horario Turno</th>
                <th className="px-6 py-3.5">Estado Operativo</th>
                <th className="px-6 py-3.5 text-center">Asistencia</th>
                <th className="px-6 py-3.5">Observaciones / Motivos</th>
              </tr>
            </thead>
            <tbody>
              {turnosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-400 font-medium italic">
                    No hay registros .
                  </td>
                </tr>
              ) : (
                turnosFiltrados.map((turno) => {
                  const fecha = turno.dateIn ? turno.dateIn.split("T")[0] : "—";
                  const horaIn = turno.dateIn ? turno.dateIn.split("T")[1]?.slice(0, 5) : "—";
                  const horaOut = turno.dateOut ? turno.dateOut.split("T")[1]?.slice(0, 5) : "—";

                  return (
                    <tr key={turno.id} className="border-b hover:bg-gray-50 font-medium">
                      <td className="px-6 py-4 text-gray-700">{fecha}</td>
                      <td className="px-6 py-4 text-gray-900 font-bold">{turno.employeeCc || "—"}</td>
                      <td className="px-6 py-4 text-gray-600 font-mono text-xs">{horaIn} a {horaOut}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          turno.state === "ACEPTADO" ? "bg-green-100 text-green-800" :
                          turno.state === "AUSENTE" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {turno.state}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {turno.confirm ? (
                          <span className="text-green-600 font-bold text-xs bg-green-50 px-2 py-1 rounded border border-green-200">SÍ VINO</span>
                        ) : (
                          <span className="text-red-600 font-bold text-xs bg-red-50 px-2 py-1 rounded border border-red-200">INASISTENCIA</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500 italic text-xs max-w-xs truncate" title={turno.observation}>
                        {turno.observation || "Sin comentarios anclados"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}