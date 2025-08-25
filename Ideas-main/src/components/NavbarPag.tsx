// components/Navbar.tsx
import { NavLink } from 'react-router-dom';
import '../style/NavbarPag.css';
import { useAdmin } from '../context/AdminContext';

export default function NavbarPag() {
  const { tipoUsuario } = useAdmin();

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <NavLink to="/" className="logo" end>
          🏠 Inicio
        </NavLink>
      </div>

      <div className="navbar-right">
        {/* Secciones visibles solo para admi */}
        {tipoUsuario === 'admi' && (
          <>
            <NavLink to="/cursos" className="nav-link">Cursos</NavLink>
            <NavLink to="/asistencia" className="nav-link">Asistencia</NavLink>
            <NavLink to="/crear-usuario" className="nav-link">Crear Usuario</NavLink>
            <NavLink to="/matricula-alumno" className="nav-link">Matricular Alumno</NavLink>
            <NavLink to="/nuevo-tipo-usuario" className="nav-link">Añadir Tipo de Usuario</NavLink>
          </>
        )}

        {/* Secciones visibles para subAdmi (menos permisos que admi) */}
        {tipoUsuario === 'subAdmi' && (
          <>
            <NavLink to="/cursos" className="nav-link">Cursos</NavLink>
            <NavLink to="/asistencia" className="nav-link">Asistencia</NavLink>
            <NavLink to="/crear-usuario" className="nav-link">Crear Usuario</NavLink>
            <NavLink to="/matricula-alumno" className="nav-link">Matricular Alumno</NavLink>
          </>
        )}

        {/* Secciones visibles para admi, subAdmi y alumno */}
        {(tipoUsuario === 'admi' || tipoUsuario === 'subAdmi' || tipoUsuario === 'alumno') && (
          <>
            <NavLink to="/finanzas" className="nav-link">Finanzas</NavLink>
            <NavLink to="/becas" className="nav-link">Becas</NavLink>
          </>
        )}

        {/* Solo alumno */}
        {tipoUsuario === 'alumno' && (
          <NavLink to="/perfilA" className="nav-link">Perfil</NavLink>
        )}
      </div>
    </nav>
  );
}
