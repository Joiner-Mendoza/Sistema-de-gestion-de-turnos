import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export function FormularioCrearTurno({ onTurnoCreado }) {
  const API_URL = import.meta.env.VITE_API_URL;

  // Estados del formulario
  const [employeeCc, setEmployeeCc] = useState("");
  const [fecha, setFecha] = useState("");
  const [horaEntrada, setHoraEntrada] = useState("");
  const [horaSalida, setHoraSalida] = useState("");
  const [observation, setObservation] = useState("");
  const [enviando, setEnviando] = useState(false);
  const navigate =  useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validaciones básicas en caliente
    if (!employeeCc || !fecha || !horaEntrada || !horaSalida) {
      Swal.fire("Atención", "Por favor completa todos los campos obligatorios.", "warning");
      return;
    }

    try {
      setEnviando(true);
      const token = localStorage.getItem("token");

      // Unimos la fecha y la hora en el formato ISO que espera Java (LocalDateTime)
      const dateInCombined = `${fecha}T${horaEntrada}:00`;
      const dateOutCombined = `${fecha}T${horaSalida}:00`;
      
      const nuevoTurno = {
        employeeCc: parseInt(employeeCc, 10),
        dateIn: dateInCombined,
        dateOut: dateOutCombined,
        state: "PENDIENTE", 
        confirm: false,      // Arranca en falso porque no ha asistido
        observation: observation || "Nuevo turno"
      };

      //  endpoint de tus turnos
      await axios.post(`${API_URL}/turno`, nuevoTurno, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Swal.fire({
        title: "¡Asignado!",
        text: "El turno fue registrado exitosamente.",
        icon: "success",
        confirmButtonColor: "#4f46e5"
      });

      // Limpiar el formulario
      setEmployeeCc("");
      setFecha("");
      setHoraEntrada("");
      setHoraSalida("");
      setObservation("");

      // Si le pasas una función padre, recarga la lista de turnos al instante
      if (onTurnoCreado) onTurnoCreado();
      navigate("/dashboard")
    } catch (error) {
      console.error("Error al registrar el turno:", error);
      Swal.fire("Error", "No se pudo registrar el turno. Verifica los datos o la cédula.", "error");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="w-full bg-white p-5 rounded-2xl shadow-md border max-w-xl mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Asignar Nuevo Turno</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Cédula del Empleado */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-500">Cédula del Trabajador *</label>
          <input
            type="number"
            placeholder="Ej. 100456789"
            value={employeeCc}
            onChange={(e) => setEmployeeCc(e.target.value)}
            className="w-full px-4 py-2 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 border-gray-300 transition"
            required
          />
        </div>

        {/* Fecha del Turno */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-500">Fecha del Turno *</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full px-4 py-2 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 border-gray-300 transition"
            required
          />
        </div>

        {/* Horarios (Grid de 2 columnas para que quepa bien en celular) */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500">Hora Entrada *</label>
            <input
              type="time"
              value={horaEntrada}
              onChange={(e) => setHoraEntrada(e.target.value)}
              className="w-full px-4 py-2 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 border-gray-300 transition"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500">Hora Salida *</label>
            <input
              type="time"
              value={horaSalida}
              onChange={(e) => setHoraSalida(e.target.value)}
              className="w-full px-4 py-2 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 border-gray-300 transition"
              required
            />
          </div>
        </div>

        {/* Observaciones adicionales */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-500">Comentarios Opcionales</label>
          <textarea
            rows="2"
            placeholder="Opcionmal"
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            className="w-full px-4 py-2 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 border-gray-300 transition resize-none"
          />
        </div>

        {/* Botón de Enviar */}
        <button
          type="submit"
          disabled={enviando}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition text-sm flex items-center justify-center gap-2 shadow disabled:opacity-50 cursor-pointer"
        >
         {enviando ? "Guardando en el sistema..." : "Registrar Turno"}
        </button>

      </form>
    </div>
  );
}