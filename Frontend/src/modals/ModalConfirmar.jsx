import React, { useState, useEffect } from "react";
import {
  FaClipboardCheck,
  FaStickyNote,
} from "react-icons/fa";

function ModalEstadoTurno({
  isOpen,
  onClose,
  onSave,
  turnoData,
}) {

  const [nuevoEstado, setNuevoEstado] = useState("");
  const [nuevaObservacion, setNuevaObservacion] = useState("");

  useEffect(() => {
    if (turnoData) {
      setNuevoEstado(
        turnoData.state || "PENDIENTE"
      );

      setNuevaObservacion(
        turnoData.observation || ""
      );
    }
  }, [turnoData, isOpen]);

  if (!isOpen || !turnoData) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    onSave(turnoData.id, {
      state: nuevoEstado,
      observation: nuevaObservacion,
    });
  };

  // ==========================================
  // COLORES POR ESTADO
  // ==========================================
  const getEstadoColor = () => {

    switch (nuevoEstado) {
      case "PENDIENTE":
        return "text-yellow-400 border-yellow-500/40 bg-yellow-500/10";
        
      case "ACEPTADO":
        return "text-green-400 border-green-500/40 bg-green-500/10";

      case "AUSENTE":
        return "text-red-400 border-red-500/40 bg-red-500/10";

      case "REPROGRAMADO":
        return "text-blue-400 border-blue-500/40 bg-blue-500/10";

      default:
        return "text-yellow-400 border-yellow-500/40 bg-yellow-500/10";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">

      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#101828] shadow-2xl">

        {/* HEADER */}
        <div className="border-b border-white/10 px-6 py-5">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-lg font-bold text-white">
                Cambiar Estado
              </h2>

              <p className="text-sm text-gray-400">
                Gestión de turno
              </p>
            </div>

            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-gray-300 transition hover:bg-red-500 hover:text-white"
            >
              ✕
            </button>

          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit}>

          <div className="space-y-5 p-6">

            {/* USER */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">

              <p className="text-xs uppercase tracking-wide text-gray-400">
                Usuario
              </p>

              <h3 className="mt-1 text-base font-semibold text-white">
                {turnoData.employeeCc} 
              </h3>

            </div>

            {/* ESTADO */}
            <div>

              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#cbceff]">
                <FaClipboardCheck />
                Estado del turno
              </label>

              <select
                value={nuevoEstado}
                onChange={(e) =>
                  setNuevoEstado(e.target.value)
                }
                className={`
                  w-full rounded-2xl border px-4 py-3
                  text-sm font-medium outline-none transition
                  bg-[#1a2235]
                  ${getEstadoColor()}
                  focus:ring-2 focus:ring-[#cbceff]/30
                `}
              >

                <option value="PENDIENTE">
                  PENDIENTE
                </option>

                <option value="ACEPTADO">
                  ACEPTADO
                </option>

                <option value="AUSENTE">
                  AUSENTE
                </option>

                <option value="REPROGRAMADO">
                  REPROGRAMADO
                </option>

              </select>
            </div>

            {/* OBSERVACIÓN */}
            <div>

              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#cbceff]">
                <FaStickyNote />
                Observaciones
              </label>

              <textarea
                rows="4"
                value={nuevaObservacion}
                onChange={(e) =>
                  setNuevaObservacion(
                    e.target.value
                  )
                }
                placeholder="Agregar observaciones del turno..."
                className=" w-full rounded-2xl border border-white/10 bg-[#1a2235] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-[#cbceff] focus:ring-2 focus:ring-[#cbceff]/30"/>

            </div>

          </div>

          {/* FOOTER */}
          <div className="flex justify-end gap-3 border-t border-white/10 bg-black/20 px-6 py-5">

            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-white/10">
              Cancelar
            </button>

            <button
              type="submit"
              className="rounded-2xl bg-[#cbceff] px-6 py-2.5 text-sm font-bold text-[#101828] shadow-lg transition-all duration-300 hover:scale-105">
              Guardar Estado
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}

export default ModalEstadoTurno;