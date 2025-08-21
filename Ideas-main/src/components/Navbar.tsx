import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../style/Navbar.css';
import { useAdmin } from '../context/AdminContext'; // Ajusta la ruta si es diferente

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { tipoUsuario } = useAdmin(); // 👈 obtenemos el tipo de usuario

  return (
    <nav className="navbar">
      {/* Admin: puede ver todo */}
      {tipoUsuario === 'admi' && (
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
              <Link to="/nuevo-tipo-usuario">Añadir Tipo de Usuario</Link>
            </div>
          )}
        </div>
      )}

      {/* Admin y Alumno pueden ver Finanzas */}
      {(tipoUsuario === 'admi' || tipoUsuario === 'alumno') && (
        <>
          <Link to="/finanzas">Finanzas</Link>
          <Link to="/becas">Becas</Link>
        </>
      )}

      {/* Solo Admin */}
      {tipoUsuario === 'admi' && (
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
