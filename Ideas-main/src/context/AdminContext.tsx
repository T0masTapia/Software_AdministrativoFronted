import React, { createContext, useContext, useState } from "react";

interface AdminContextType {
  idUsuario: string | null;
  tipoUsuario: string | null;
  nombreUsuario: string | null;
  rut: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [idUsuario, setIdUsuario] = useState<string | null>(() => localStorage.getItem("idUsuario"));
  const [tipoUsuario, setTipoUsuario] = useState<string | null>(() => localStorage.getItem("tipoUsuario"));
  const [nombreUsuario, setNombreUsuario] = useState<string | null>(() => localStorage.getItem("nombreUsuario"));
  const [rut, setRut] = useState<string | null>(() => localStorage.getItem("rut"));

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch("http://localhost:3001/usuarios/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: email, password }),
      });

      if (!res.ok) return false;

      const data = await res.json();
      console.log("Respuesta login:", data);

      if (data.success && data.tipo_usuario) {
        setIdUsuario(data.id_usuario);
        setTipoUsuario(data.tipo_usuario);
        setNombreUsuario(data.nombre || null);
        setRut(data.rut || null);

        localStorage.setItem("idUsuario", data.id_usuario);
        localStorage.setItem("tipoUsuario", data.tipo_usuario);
        localStorage.setItem("nombreUsuario", data.nombre || "");
        localStorage.setItem("rut", data.rut || "");

        return true;
      }

      return false;
    } catch (error) {
      console.error("Error de login:", error);
      return false;
    }
  };

  const logout = () => {
    setIdUsuario(null);
    setTipoUsuario(null);
    setNombreUsuario(null);
    setRut(null);

    localStorage.removeItem("idUsuario");
    localStorage.removeItem("tipoUsuario");
    localStorage.removeItem("nombreUsuario");
    localStorage.removeItem("rut");
  };

  return (
    <AdminContext.Provider
      value={{
        idUsuario,
        tipoUsuario,
        nombreUsuario,
        rut,
        login,
        logout,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) throw new Error("useAdmin debe usarse dentro de AdminProvider");
  return context;
}
