import React, { useState, useEffect } from "react";
import { FaCalendarAlt, FaEdit, FaExchangeAlt, FaCommentDots } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";

function ModalSolicitudCambio({ isOpen, onClose, turnoSeleccionado, apiUrl }) {
  const API_URL = import.meta.env.VITE_API_URL;
  
  const [motivo, setMotivo] = useState("");
  const [tipoSolicitud, setTipoSolicitud] = useState("CAMBIO_TURNO");
  const [fechaPropuesta, setFechaPropuesta] = useState("");
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false); // Estado para deshabilitar el botón mientras procesa

  const user = JSON.parse(localStorage.getItem("user"));

  // Limpiar formulario 
  useEffect(() => {
    if (isOpen) {
      setMotivo("");
      setTipoSolicitud("CAMBIO_TURNO");
      setFechaPropuesta("");
      setComentario("");
    }
  }, [isOpen, turnoSeleccionado]);

  if (!isOpen || !turnoSeleccionado) return null;

  // Helpers de formato
  const formatFecha = (isoString) => isoString ? isoString.split("T")[0] : "";
  const formatHora = (isoString) => {
    if (!isoString) return "";
    const horaCompleta = isoString.split("T")[1];
    const [horas, minutos] = horaCompleta.split(":");
    const h = parseInt(horas, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${String(h12).padStart(2, "0")}:${minutos} ${ampm}`;
  };

  const getBadgeStyles = (state) => {
    switch (state) {
      case "ACEPTADO": return "text-green-400 border-green-500/30 bg-green-500/10";
      case "PENDIENTE": return "text-yellow-400 border-yellow-500/30 bg-yellow-500/10";
      case "AUSENTE": return "text-red-400 border-red-500/30 bg-red-500/10";
      default: return "text-blue-400 border-blue-500/30 bg-blue-500/10";
    }
  };

  // ==========================================
  // MANEJO DEL ENVÍO 
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!motivo.trim()) return;

    const datosSolicitud = {
      turnoId: turnoSeleccionado.id,
      empleadoId: turnoSeleccionado.employeeId || user?.id, // Asegura capturar el ID correcto
      motivo: motivo,
      tipoSolicitud: tipoSolicitud,
      fechaPropuesta: fechaPropuesta || null, // Evita enviar strings vacíos a LocalDate
      comentario: comentario,
    };

    try {
      setEnviando(true);
      const token = localStorage.getItem("token");
    
      await axios.post(`${API_URL}/solicitud-cambio`, datosSolicitud, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      // Alerta de éxito integrada
      Swal.fire({
        title: "¡Solicitud Enviada!",
        text: "Tu solicitud de cambio de turno ha sido registrada correctamente.",
        icon: "success",
        background: "#101828",
        confirmButtonColor: "#cbceff",
        customClass: { confirmButton: "text-[#101828] font-bold" }
      });

      onClose(); // Cierra el modal solo si el servidor respondió 200/201 OK
    } catch (error) {
      console.error("Error al enviar solicitud de cambio:", error);
      Swal.fire({
        title: "Error al procesar",
        text: "No se pudo registrar la solicitud. Inténtalo de nuevo.",
        icon: "error",
        background: "#101828",
        confirmButtonColor: "#ef4444"
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#101828] shadow-2xl">
        
        {/* HEADER */}
        <div className="border-b border-white/10 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Solicitar Cambio</h2>
              <p className="text-sm text-gray-400">Gestión de solicitud de turno</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-gray-300 transition hover:bg-red-500 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit}>
          <div className="max-h-[calc(100vh-14rem)] overflow-y-auto space-y-5 p-6 custom-scrollbar">
            
            {/* TURNO SELECCIONADO */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#cbceff]">
                <FaCalendarAlt /> Turno seleccionado
              </label>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Fecha del turno</p>
                <h3 className="text-base font-semibold text-white">{formatFecha(turnoSeleccionado.dateIn)}</h3>
                <div className="mt-3 flex items-center gap-4 text-sm text-gray-300">
                  <span><strong className="text-gray-400 font-normal">Entrada:</strong> {formatHora(turnoSeleccionado.dateIn)}</span>
                  <span><strong className="text-gray-400 font-normal">Salida:</strong> {formatHora(turnoSeleccionado.dateOut)}</span>
                </div>
                <div className="mt-4">
                  <span className={`inline-block rounded-full border px-3 py-1 text-xs font-bold ${getBadgeStyles(turnoSeleccionado.state)}`}>
                    {turnoSeleccionado.state}
                  </span>
                </div>
              </div>
            </div>

            {/* TIPO SOLICITUD */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#cbceff]"><FaExchangeAlt /> Tipo de solicitud</label>
              <select
                value={tipoSolicitud}
                onChange={(e) => setTipoSolicitud(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-[#1a2235] px-4 py-3 text-sm text-white outline-none transition focus:border-[#cbceff] cursor-pointer"
              >
                <option value="CAMBIO_TURNO">CAMBIO DE TURNO</option>
                <option value="REPROGRAMACION">REPROGRAMACIÓN</option>
                <option value="PERMISO">PERMISO</option>
              </select>
            </div>

            {/* MOTIVO */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#cbceff]"><FaEdit /> Motivo del cambio</label>
              <textarea
                rows="3"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Explica el motivo..."
                className="w-full rounded-2xl border border-white/10 bg-[#1a2235] px-4 py-3 text-sm text-white outline-none resize-none"
                required
              />
            </div>

            {/* FECHA PROPUESTA */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#cbceff]">Fecha </label>
              <input
                type="date"
                value={fechaPropuesta}
                onChange={(e) => setFechaPropuesta(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-[#1a2235] px-4 py-3 text-sm text-white outline-none cursor-pointer [color-scheme:dark]"
              />
            </div>

            {/* COMENTARIO */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#cbceff]"><FaCommentDots /> Comentario adicional</label>
              <textarea
                rows="2"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Comentario opcional..."
                className="w-full rounded-2xl border border-white/10 bg-[#1a2235] px-4 py-3 text-sm text-white outline-none resize-none"
              />
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex justify-end gap-3 border-t border-white/10 bg-black/20 px-6 py-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-white/10"
              disabled={enviando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-2xl bg-[#cbceff] px-6 py-2.5 text-sm font-bold text-[#101828] shadow-lg disabled:opacity-50"
              disabled={enviando}
            >
              {enviando ? "Enviando..." : "Enviar Solicitud"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalSolicitudCambio;