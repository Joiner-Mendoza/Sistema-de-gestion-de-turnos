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
  <div className="bg-gray-900 min-h-screen py-12 px-6">

    <div className="mx-auto max-w-2xl">

      <form
        className="space-y-8"
        onSubmit={handleSubmit}
      >

        {/* TITULO */}

        <div>
          <h2 className="text-2xl font-bold text-white">
            Asignar Nuevo Turno
          </h2>

          <p className="mt-2 text-gray-400">
            Complete la información del turno.
          </p>
        </div>

        {/* CEDULA */}

        <div>

          <label className="block text-sm font-medium text-white">
            Cédula del trabajador
          </label>

          <input
            type="number"
            value={employeeCc}
            onChange={(e) => setEmployeeCc(e.target.value)}
            placeholder="1001234567"
            className="mt-2 w-full rounded-md bg-white/5 px-3 py-2 text-white outline outline-1 outline-white/10 focus:outline-indigo-500"
          />

        </div>

        {/* FECHA */}

        <div>

          <label className="block text-sm font-medium text-white">
            Fecha
          </label>

          <input
            type="date"
            value={fecha}
            onChange={(e)=>setFecha(e.target.value)}
            className="mt-2 w-full rounded-md bg-white/5 px-3 py-2 text-white outline outline-1 outline-white/10 focus:outline-indigo-500"
          />

        </div>

        {/* HORAS */}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

          <div>

            <label className="block text-sm font-medium text-white">
              Hora de entrada
            </label>

            <input
              type="time"
              value={horaEntrada}
              onChange={(e)=>setHoraEntrada(e.target.value)}
              className="mt-2 w-full rounded-md bg-white/5 px-3 py-2 text-white outline outline-1 outline-white/10 focus:outline-indigo-500"
            />

          </div>

          <div>

            <label className="block text-sm font-medium text-white">
              Hora de salida
            </label>

            <input
              type="time"
              value={horaSalida}
              onChange={(e)=>setHoraSalida(e.target.value)}
              className="mt-2 w-full rounded-md bg-white/5 px-3 py-2 text-white outline outline-1 outline-white/10 focus:outline-indigo-500"
            />

          </div>

        </div>

        {/* OBSERVACIONES */}

        <div>

          <label className="block text-sm font-medium text-white">
            Observaciones
          </label>

          <textarea
            rows="4"
            value={observation}
            onChange={(e)=>setObservation(e.target.value)}
            placeholder="Observaciones del turno..."
            className="mt-2 w-full rounded-md bg-white/5 px-3 py-2 text-white outline outline-1 outline-white/10 focus:outline-indigo-500 resize-none"
          />

        </div>

        {/* BOTONES */}

        <div className="flex justify-end gap-4 pt-6">

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="bg-gray-700 hover:bg-gray-600 px-5 py-2 rounded-md text-white font-semibold transition"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={enviando}
            className="bg-indigo-500 hover:bg-indigo-400 px-5 py-2 rounded-md text-white font-semibold transition disabled:opacity-50"
          >
            {enviando
              ? "Guardando..."
              : "Registrar Turno"}
          </button>

        </div>

      </form>

    </div>

  </div>
);
}