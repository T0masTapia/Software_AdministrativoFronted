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
        {tipoUsuario === 'admi' && (
          <>
            <NavLink to="/cursos" className="nav-link">Cursos</NavLink>
            <NavLink to="/asistencia" className="nav-link">Asistencia</NavLink>
            <NavLink to="/crear-usuario" className="nav-link">Crear Usuario</NavLink>
            <NavLink to="/matricula-alumno" className="nav-link">Matricular Alumno</NavLink>
          </>
        )}

        {(tipoUsuario === 'admi' || tipoUsuario === 'alumno') && (
          <NavLink to="/finanzas" className="nav-link">Finanzas</NavLink>
        )}

        {tipoUsuario === 'alumno' && (
          <NavLink to="/perfilA" className="nav-link">Perfil</NavLink>
        )}
      </div>
    </nav>
  );
}
