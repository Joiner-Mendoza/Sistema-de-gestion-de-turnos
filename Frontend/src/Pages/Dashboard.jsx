import React, { useState, useContext } from "react"; 
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthProvider"; 
import { HomeIcon, UsersIcon, CalendarIcon, ChartPieIcon, Bars3Icon, XMarkIcon, UserCircleIcon } from "@heroicons/react/24/outline"; 
import { TurnosTable } from "../components/TurnosTable";
import SolicitudesTable from "../components/SolicitudesTable";
import { AsistenciaTable } from "../components/AsistenciaTable";
import { ReportesPanel } from "../components/ReportesPanel";

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const navigation = [
    { name: "Horario", icon: HomeIcon },
    { name: "Solicitudes de Turno", icon: UsersIcon },
    { name: "Asistencia", icon: CalendarIcon },

    ...(user?.role === "ROLE_GERENTE" || user?.role === "ROLE_RRHH" 
      ? [
          { name: "Reportes", icon: ChartPieIcon },
          { name: "Registro Personal", icon: UserCircleIcon, navigate: "/registro" }  
        ]
      : []
    ),
  ];

  const [sliderOpen, setSliderOpen] = useState(false);
  const [shift, setShift] = useState("Horario");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const getDisplayName = () => {
    if (user?.name || user?.lastName) {
      return `${user.name || ""} ${user.lastName || ""}`.trim();
    }
    return user?.username || "Usuario";
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-white relative overflow-x-hidden">

      {/* OVERLAY: Móvil */}
      {sliderOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setSliderOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <div 
        style={{ backgroundColor: "#101828" }} 
        className={`fixed inset-y-0 left-0 w-64 border-r border-gray-800 flex flex-col z-50 transform transition-transform duration-300 ease-in-out 
          ${sliderOpen ? "translate-x-0" : "-translate-x-full"} 
          md:relative md:translate-x-0 md:flex`}
      >
        {/* Botón cerrar móvil */}
        <div className="flex justify-end p-4 md:hidden">
          <button
            className="p-2 text-gray-400 hover:text-white"
            onClick={() => setSliderOpen(false)}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* LOGO */}
        <div className="flex items-center h-16 px-6 text-indigo-400 font-bold text-xl border-b border-gray-800/50 md:border-none">
          Gestión de horarios
        </div>
      
        {/* MENU */}
        <nav className="flex-1 px-4 py-4 space-y-2">
          {navigation.map((item) => (
            <button
              key={item.name}
              onClick={() => {
                setSliderOpen(false); 
                setShowProfile(false); 

                if(item.navigate) {
                  navigate(item.navigate);
                }
                
                setShift(item.name);
              }}
              className={`flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                shift === item.name && !showProfile
                  ? "bg-indigo-600 text-white font-medium" 
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </button>
          ))}
        </nav>

        {/* USER MENU */}
        <div className="border-t border-gray-800 relative">
          {userMenuOpen && (
            <div className="absolute bottom-full w-full bg-gray-800 border-b border-gray-700 rounded-t-lg overflow-hidden shadow-lg">
              <button
                onClick={() => {
                  setShowProfile(true);
                  setUserMenuOpen(false);
                }}
                className="w-full text-left p-3 hover:bg-gray-700 text-sm transition-colors"
              >
                Mi Perfil
              </button>

              <button
                onClick={logout}
                className="w-full text-left p-3 text-red-400 hover:bg-red-500/10 text-sm transition-colors"
              >
                Cerrar sesión
              </button>
            </div>
          )}

          <div
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="p-4 cursor-pointer flex gap-3 items-center hover:bg-gray-800/40 transition-colors"
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-lg shadow-md">
              {getDisplayName().charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{getDisplayName()}</p>
              <p className="text-xs text-indigo-400 truncate">{user?.role || "Anónimo"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-4 md:p-10 flex flex-col">
        
        {/* NAVBAR MÓVIL SUPERIOR */}
        <div className="flex items-center justify-between md:hidden mb-4 bg-gray-800/40 p-3 rounded-xl border border-gray-800">
          <span className="font-bold text-indigo-400">Gestión de horarios</span>
          <button
            onClick={() => setSliderOpen(true)}
            className="p-2 text-gray-300 hover:text-white focus:outline-none"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
        </div>

        {/* CONTENEDOR DE VISTAS */}
        <div className="border border-dashed border-gray-700 rounded-xl min-h-[600px] flex flex-col p-2 md:p-6 bg-gray-900/50">
          
          {/* CONTROL DEL MODAL/VISTA DE PERFIL */}
          {showProfile ? (
            <div className="p-4">
              <h2 className="text-2xl font-bold text-indigo-400 mb-4">Mi Perfil</h2>
              <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-800 max-w-md">
                <p className="text-gray-300"><span className="font-semibold text-gray-400">Nombre:</span> {getDisplayName()}</p>
                <p className="text-gray-300 mt-2"><span className="font-semibold text-gray-400">Rol de usuario:</span> {user?.role || "No asignado"}</p>
                <button 
                  onClick={() => setShowProfile(false)}
                  className="mt-6 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
                >
                  Volver al tablero
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Vistas normales del menú */}
              {shift === "Horario" && <TurnosTable />}
              
              {shift === "Solicitudes de Turno" && (
                <div className="p-4">
                  <div className="text-gray-400">
                    <SolicitudesTable />
                  </div>
                </div>
              )}

              {shift === "Asistencia" && <AsistenciaTable />}
              {shift === "Reportes" && <ReportesPanel />}
            </>
          )}

        </div>
      </div>
        
    </div>
  );
}