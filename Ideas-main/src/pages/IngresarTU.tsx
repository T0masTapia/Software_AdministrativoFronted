// pages/NuevoTipoUsuario.tsx
import { useState, useEffect } from 'react';
import NavbarPag from '../components/NavbarPag';

export default function NuevoTipoUsuario() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState<'admi' | 'subAdmi'>('subAdmi');
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [admiExiste, setAdmiExiste] = useState(false);

  // Verificamos si ya existe un admi para deshabilitar esa opción
  useEffect(() => {
    const checkAdmi = async () => {
      try {
        const res = await fetch('http://localhost:3001/usuarios/check-admi');
        const data = await res.json();
        setAdmiExiste(data.admiExiste);
        if (data.admiExiste && tipoUsuario === 'admi') {
          setTipoUsuario('subAdmi');
        }
      } catch (err) {
        console.error('Error al verificar admi existente:', err);
      }
    };
    checkAdmi();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones frontend
    if (!correo.trim() || !password.trim()) {
      setMensaje('Correo y contraseña son obligatorios.');
      return;
    }

    // Regex básico para correo
    const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!correoRegex.test(correo)) {
      setMensaje('Ingrese un correo válido.');
      return;
    }

    if (password.length < 6) {
      setMensaje('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (tipoUsuario === 'admi' && admiExiste) {
      setMensaje('Ya existe un Administrador, no se puede crear otro.');
      return;
    }

    setCargando(true);
    setMensaje(null);

    try {
      const res = await fetch('http://localhost:3001/usuarios/crear-usuario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correo: correo.trim(),
          password: password.trim(),
          tipo_usuario: tipoUsuario
        }),
      });

      const data = await res.json();

      if (!data.success) throw new Error(data.error || 'Error desconocido');

      setMensaje(`Usuario ${tipoUsuario} creado correctamente ✅`);
      setCorreo('');
      setPassword('');
      setTipoUsuario('subAdmi');
      setAdmiExiste(tipoUsuario === 'admi'); // Actualizamos el estado
    } catch (err: any) {
      setMensaje(err.message || 'Error al crear el usuario');
    } finally {
      setCargando(false);
    }
  };

  return (
    <>
      <NavbarPag />
      <div className="container">
        <h1>Añadir Nuevo Usuario Administrativo</h1>

        <form onSubmit={handleSubmit} className="formulario-tipo">
          <div className="mb-3">
            <label htmlFor="correo" className="form-label">Correo</label>
            <input
              type="email"
              id="correo"
              className="form-control"
              value={correo}
              onChange={e => setCorreo(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">Contraseña</label>
            <input
              type="password"
              id="password"
              className="form-control"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="tipoUsuario" className="form-label">Tipo de Usuario</label>
            <select
              id="tipoUsuario"
              className="form-select"
              value={tipoUsuario}
              onChange={e => setTipoUsuario(e.target.value as 'admi' | 'subAdmi')}
            >
              <option value="admi" disabled={admiExiste}>Administrador (solo 1 permitido)</option>
              <option value="subAdmi">Sub-Administrador</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" disabled={cargando}>
            {cargando ? 'Creando...' : 'Crear Usuario'}
          </button>
        </form>

        {mensaje && <p className="mensaje mt-3">{mensaje}</p>}
      </div>
    </>
  );
}
