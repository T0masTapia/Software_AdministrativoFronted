import { useEffect, useState } from "react";
import '../style/PerfilA.css';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser, faIdCard, faEnvelope, faLock, faKey, faClipboardList
} from '@fortawesome/free-solid-svg-icons';

import NavbarPag from '../components/NavbarPag';
import { useAdmin } from '../context/AdminContext';

const COLORS = ['#4caf50', '#f44336', '#2196f3']; // verde, rojo, azul

const AlumnoPortal = () => {
  const { rut, idUsuario } = useAdmin();

  const [alumno, setAlumno] = useState<{
    nombre_completo: string;
    rut: string;
    correo: string;
  } | null>(null);

  const [cursos, setCursos] = useState<Array<{ nombre_curso: string; id_curso?: string | number; urlCeforlav?: string }>>([]);
  const [deuda, setDeuda] = useState(150000);

  const [asistenciaData, setAsistenciaData] = useState([
    { mes: 'Abr', asistencia: 68, inasistencia: 20, justificado: 12 },
    { mes: 'May', asistencia: 72, inasistencia: 15, justificado: 13 },
    { mes: 'Jun', asistencia: 75, inasistencia: 18, justificado: 7 },
    { mes: 'Jul', asistencia: 80, inasistencia: 12, justificado: 8 },
    { mes: 'Ago', asistencia: 78, inasistencia: 10, justificado: 12 },
  ]);

  const [pieData, setPieData] = useState([
    { name: 'Asistencia', value: 75 },
    { name: 'Inasistencia', value: 15 },
    { name: 'Justificado', value: 10 },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!rut) return;

    setLoading(true);

    fetch(`http://localhost:3001/alumnos/${rut}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.alumno) {
          setAlumno(data.alumno);
          setError(null);

          if (data.deuda) setDeuda(data.deuda);
          if (data.asistenciaData) setAsistenciaData(data.asistenciaData);
          if (data.pieData) setPieData(data.pieData);
        } else {
          setError("Alumno no encontrado");
        }
      })
      .catch(() => setError("Error al obtener datos"))
      .finally(() => setLoading(false));

    fetch(`http://localhost:3001/alumnoCurso/cursos/${rut}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.cursos) {
          // Usamos el URL de Ceforlav si existe
          const cursosConUrl = data.cursos.map((c: any) => ({
            ...c,
            urlCeforlav: c.url_ceforlav || null
          }));
          setCursos(cursosConUrl);
        } else {
          setCursos([]);
        }
      })
      .catch(() => setCursos([]));
  }, [rut]);

  const handleChangePassword = () => {
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Por favor, completa todos los campos.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("La nueva contraseña y su confirmación no coinciden.");
      return;
    }

    fetch(`http://localhost:3001/usuarios/cambiar-clave/${idUsuario}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, nuevaContrasena: newPassword })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPasswordSuccess("Contraseña cambiada con éxito.");
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setTimeout(() => setModalOpen(false), 1500);
        } else {
          setPasswordError(data.message || "Error al cambiar la contraseña.");
        }
      })
      .catch(() => setPasswordError("Error al comunicarse con el servidor."));
  };

  if (loading) return <p>Cargando datos...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!alumno) return <p>No hay datos del alumno.</p>;

  return (
    <>
      <NavbarPag />
      <div className="portal-container">

        {/* PANEL IZQUIERDO */}
        <div className="left-panel">

          {/* DATOS PERSONALES */}
          <div className="card datos-personales">
            <h2 className="seccion-titulo"><FontAwesomeIcon icon={faUser} /> Datos del Alumno</h2>
            <div className="dato">
              <span className="etiqueta"><FontAwesomeIcon icon={faUser} /> Nombre:</span>
              <span className="valor">{alumno.nombre_completo}</span>
            </div>
            <div className="dato">
              <span className="etiqueta"><FontAwesomeIcon icon={faIdCard} /> RUT:</span>
              <span className="valor">{alumno.rut}</span>
            </div>
            <div className="dato">
              <span className="etiqueta"><FontAwesomeIcon icon={faEnvelope} /> Correo:</span>
              <span className="valor">{alumno.correo}</span>
            </div>
            <div className="dato">
              <span className="etiqueta"><FontAwesomeIcon icon={faLock} /> Contraseña:</span>
              <span className="valor">********</span>
            </div>
            <button
              className="btn-secundario"
              style={{ marginTop: '10px' }}
              onClick={() => setModalOpen(true)}
            >
              <FontAwesomeIcon icon={faKey} /> Cambiar Contraseña
            </button>
          </div>

          {/* CURSOS INSCRITOS */}
          <div className="card resumen-cursos">
            <h3 className="seccion-titulo"><FontAwesomeIcon icon={faClipboardList} /> Cursos Inscritos</h3>
            {cursos.length === 0 ? (
              <p style={{ color: '#333' }}>No estás inscrito en ningún curso.</p>
            ) : (
              <div className="cursos-cards">
                {cursos.map((curso, index) => (
                  <div
                    key={curso.id_curso || curso.nombre_curso}
                    className="card-curso"
                    onClick={() => {
                      if (curso.urlCeforlav) {
                        window.open(curso.urlCeforlav, "_blank");
                      } else {
                        alert("Este curso aún no tiene un enlace en Ceforlav.");
                      }
                    }}
                  >
                    {curso.nombre_curso}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* PANEL DERECHO: ASISTENCIA */}
        <div className="right-panel card">
          <h3 style={{ color: '#333' }}>
            <FontAwesomeIcon icon={faClipboardList} /> Resumen de Asistencia
          </h3>

          <div className="grafico-torta" style={{ marginTop: 10 }}>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {pieData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <button className="btn-secundario" style={{ marginTop: 10 }}>Ver Detalle</button>

          <h4 style={{ marginTop: '30px', color: '#333' }}><FontAwesomeIcon icon={faClipboardList} /> Asistencia Mensual</h4>
          <div className="grafico-barras" style={{ marginTop: 10 }}>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={asistenciaData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis unit="%" domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="asistencia" stackId="a" fill="#4caf50" name="Asistencia" />
                <Bar dataKey="inasistencia" stackId="a" fill="#f44336" name="Inasistencia" />
                <Bar dataKey="justificado" stackId="a" fill="#2196f3" name="Justificado" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Modal Bootstrap para cambiar contraseña */}
      {modalOpen && (
        <div className="modal show d-block" tabIndex={-1} role="dialog" aria-modal="true" >
          <div className="modal-dialog" role="document">
            <div className="modal-content">

              <div className="modal-header">
                <h5 className="modal-title">Cambiar Contraseña</h5>
                <button type="button" className="btn-close" aria-label="Cerrar" onClick={() => setModalOpen(false)}></button>
              </div>

              <div className="modal-body">
                {passwordError && <div className="alert alert-danger">{passwordError}</div>}
                {passwordSuccess && <div className="alert alert-success">{passwordSuccess}</div>}

                <div className="mb-3">
                  <label htmlFor="currentPassword" className="form-label">Contraseña Actual</label>
                  <input
                    type="password"
                    id="currentPassword"
                    className="form-control"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="newPassword" className="form-label">Nueva Contraseña</label>
                  <input
                    type="password"
                    id="newPassword"
                    className="form-control"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">Confirmar Nueva Contraseña</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    className="form-control"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleChangePassword}
                >
                  Cambiar Contraseña
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AlumnoPortal;
