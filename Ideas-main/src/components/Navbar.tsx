import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../style/Navbar.css';
import { useAdmin } from '../context/AdminContext'; // Ajusta la ruta si es diferente

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { tipoUsuario } = useAdmin();

  return (
    <nav className="navbar">
      {/* Admin o SubAdmin: puede ver todo menos "Añadir Tipo de Usuario" para subAdmi */}
      {(tipoUsuario === 'admi' || tipoUsuario === 'subAdmi') && (
        <div
          className="dropdown"
          onMouseEnter={() => setDropdownOpen(true)}
          onMouseLeave={() => setDropdownOpen(false)}
        >
          <button className="dropbtn">Matrícula ▼</button>
          {dropdownOpen && (
            <div className="dropdown-content">
              <Link to="/crear-usuario">Crear Usuario</Link>
              <Link to="/matricula-alumno">Matricular Alumno</Link>
              {tipoUsuario === 'admi' && (
                <Link to="/nuevo-tipo-usuario">Añadir Tipo de Usuario</Link>
              )}
            </div>
          )}
        </div>
      )}

      {/* Admin, SubAdmin o Alumno pueden ver Finanzas y Becas */}
      {(tipoUsuario === 'admi' || tipoUsuario === 'subAdmi' || tipoUsuario === 'alumno') && (
        <>
          <Link to="/finanzas">Finanzas</Link>
          <Link to="/becas">Becas</Link>
        </>
      )}

      {/* Solo Admin o SubAdmin */}
      {(tipoUsuario === 'admi' || tipoUsuario === 'subAdmi') && (
        <>
          <Link to="/asistencia">Asistencia</Link>
          <Link to="/cursos">Cursos</Link>
        </>
      )}

      {/* Solo Alumno */}
      {tipoUsuario === 'alumno' && (
        <Link to="/perfilA">Perfil</Link>
      )}
    </nav>
  );
}
