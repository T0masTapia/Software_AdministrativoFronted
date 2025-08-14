import React, { useState, useEffect } from "react";
import { useAdmin } from "../context/AdminContext";

export default function Dashboards() {
  const { nombreUsuario, tipoUsuario, rut } = useAdmin();

  const [totalAlumnos, setTotalAlumnos] = useState<number | null>(null);
  const [cursosActivos, setCursosActivos] = useState<number | null>(null);
  const [deudasPendientes, setDeudasPendientes] = useState<number | null>(null);
  const [cursosAlumno, setCursosAlumno] = useState<number | null>(null);

  useEffect(() => {
    // DATOS PARA EL ADMIN
    if (tipoUsuario === "admi") {
      fetch("http://localhost:3001/alumnos/total")
        .then((res) => res.json())
        .then((data) => data.success && setTotalAlumnos(data.total))
        .catch((err) => console.error("Error al obtener total de alumnos:", err));

      fetch("http://localhost:3001/cursos/total")
        .then((res) => res.json())
        .then((data) => data.success && setCursosActivos(data.total))
        .catch((err) => console.error("Error al obtener cursos:", err));

      fetch("http://localhost:3001/deuda/total-pendientes")
        .then((res) => res.json())
        .then((data) => data.success && setDeudasPendientes(data.total))
        .catch((err) => console.error("Error al obtener deudas pendientes:", err));

      // DATOS PARA EL ALUMNO
    } else if (tipoUsuario === "alumno") {
      fetch(`http://localhost:3001/alumnos/${rut}/cursos`)
        .then((res) => res.json())
        .then((data) => data.success && setCursosAlumno(data.total))
        .catch((err) => console.error("Error al obtener cursos del alumno:", err));

      fetch(`http://localhost:3001/deuda/alumno/${rut}/pendientes`)
        .then(res => res.json())
        .then(data => data.success && setDeudasPendientes(data.total))
        .catch(err => console.error(err));

    }
  }, [tipoUsuario, rut]);

  const renderBienvenida = () => {
    if (tipoUsuario === "admi") return "Bienvenido, Administrador";
    return `Bienvenido${nombreUsuario ? `, ${nombreUsuario}` : ""}${tipoUsuario ? ` (${tipoUsuario})` : ""}`;
  };

  const containerStyle = {
    maxWidth: "800px",
    margin: "40px auto",
    padding: "20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: "#f5f7fa",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  };

  const headingStyle: React.CSSProperties = {
    color: "#333",
    fontWeight: "700",
    fontSize: "1.8rem",
    marginBottom: "20px",
    textAlign: "center",
  };

  const resumenData = tipoUsuario === "admi"
    ? [
      { label: "Alumnos Ingresados", value: totalAlumnos ?? "-", color: "#28a745", icon: "👨‍🎓" },
      { label: "Cursos activos", value: cursosActivos ?? "-", color: "#007bff", icon: "📚" },
      { label: "Pagos pendientes", value: deudasPendientes ?? "-", color: "#dc3545", icon: "💰" },
    ]
    : [
      { label: "Mis Cursos", value: cursosAlumno ?? "-", color: "#007bff", icon: "📚" },
      { label: "Mis Deudas", value: deudasPendientes ?? "-", color: "#dc3545", icon: "💰" },
    ];

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "15px",
    marginTop: "15px",
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: "#fff",
    borderRadius: "10px",
    padding: "15px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    textAlign: "center",
  };

  const iconStyle = {
    fontSize: "2rem",
    marginBottom: "5px",
  };

  const valueStyle = (color: string) => ({
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: color,
    marginBottom: "5px",
  });

  const labelStyle = {
    fontSize: "0.9rem",
    color: "#555",
  };

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>{renderBienvenida()}</h2>

      <h3 style={{ marginBottom: "12px", color: "#007bff", textAlign: "center" }}>
        Resumen Rápido
      </h3>

      <div style={gridStyle}>
        {resumenData.map((item, index) => (
          <div key={index} style={cardStyle}>
            <div style={iconStyle}>{item.icon}</div>
            <div style={valueStyle(item.color)}>{item.value}</div>
            <div style={labelStyle}>{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
