import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext'; // Ajusta la ruta si es necesario

export default function Header() {
  const navigate = useNavigate();
  const { tipoUsuario, logout } = useAdmin();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header>
      <div className="header-left">
        <img src="/image/educamadrid.2.png" alt="Logo EduControl" className="logo" />
        EduControl
      </div>
      <div className="header-right">
        <span>Sistema de Gestión Académica</span>
        {tipoUsuario ? (
          <button className="btn-acceder" onClick={handleLogout}>
            Cerrar sesión
          </button>
        ) : (
          <button className="btn-acceder" onClick={() => navigate('/login')}>
            Acceder
          </button>
        )}
      </div>
    </header>
  );
}
