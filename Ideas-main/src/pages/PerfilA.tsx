import { useEffect, useState } from "react";
import '../style/PerfilA.css';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faIdCard, faEnvelope, faLock, faKey, faClipboardList } from '@fortawesome/free-solid-svg-icons';
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
  const [deuda, setDeuda] = useState(0);

  const [asistenciaData, setAsistenciaData] = useState<Array<any>>([]);
  const [pieData, setPieData] = useState<Array<any>>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // --- Obtener datos del alumno y cursos ---
  useEffect(() => {
    if (!rut) return;

    setLoading(true);

    // Datos del alumno
    fetch(`http://localhost:3001/alumnos/${rut}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.alumno) {
          setAlumno(data.alumno);
          if (data.deuda) setDeuda(data.deuda);
          setError(null);
        } else {
          setError("Alumno no encontrado");
        }
      })
      .catch(() => setError("Error al obtener datos"))
      .finally(() => setLoading(false));

    // Cursos del alumno
    fetch(`http://localhost:3001/alumnoCurso/cursos/${rut}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.cursos) {
          setCursos(data.cursos.map((c: any) => ({
            ...c,
            urlCeforlav: c.url_aula || null
          })));
        } else {
          setCursos([]);
        }
      })
      .catch(() => setCursos([]));
  }, [rut]);

  // --- Obtener asistencia del alumno ---
  useEffect(() => {
  if (!rut) return;

  fetch(`http://localhost:3001/asistencia/toda`)
    .then(res => res.json())
    .then(data => {
      console.log("Datos de asistencia:", data.asistencia);
      if (data.success && data.asistencia) {
        // Filtrar solo asistencias del alumno logeado
        const alumnoAsistencia = data.asistencia.filter((a: any) => a.rut === rut);

        // Función para mapear estados del backend a tu lógica
        const mapEstado = (estado: string) => {
          switch(estado) {
            case 'Presente': return 'A';
            case 'Ausente': return 'I';
            case 'Justificado': return 'J';
            default: return 'S';
          }
        };

        // Agrupar por mes
        const meses = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
        const asistenciaPorMes = meses.map((mes, idx) => {
          const filtrado = alumnoAsistencia.filter(a => {
            const fecha = a.fecha ? new Date(a.fecha) : null;
            return fecha?.getMonth() === idx;
          });

          const asistencia = filtrado.filter(a => mapEstado(a.estado) === 'A').length;
          const inasistencia = filtrado.filter(a => mapEstado(a.estado) === 'I').length;
          const justificado = filtrado.filter(a => mapEstado(a.estado) === 'J').length;

          return { mes, asistencia, inasistencia, justificado };
        });

        setAsistenciaData(asistenciaPorMes);

        // Totales para gráfico de pastel
        const totalA = alumnoAsistencia.filter(a => mapEstado(a.estado) === 'A').length;
        const totalI = alumnoAsistencia.filter(a => mapEstado(a.estado) === 'I').length;
        const totalJ = alumnoAsistencia.filter(a => mapEstado(a.estado) === 'J').length;

        const total = totalA + totalI + totalJ || 1; // evitar división por 0
        setPieData([
          { name: 'Asistencia', value: Math.round((totalA / total) * 100) },
          { name: 'Inasistencia', value: Math.round((totalI / total) * 100) },
          { name: 'Justificado', value: Math.round((totalJ / total) * 100) },
        ]);
      }
    })
    .catch(() => {
      setAsistenciaData([]);
      setPieData([]);
    });
}, [rut]);


  // --- Cambiar contraseña ---
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
        <div className="left-panel">
          {/* Datos personales */}
          <div className="card datos-personales">
            <h2 className="seccion-titulo"><FontAwesomeIcon icon={faUser} /> Datos del Alumno</h2>
            <div className="dato"><span className="etiqueta">Nombre:</span> <span className="valor">{alumno.nombre_completo}</span></div>
            <div className="dato"><span className="etiqueta">RUT:</span> <span className="valor">{alumno.rut}</span></div>
            <div className="dato"><span className="etiqueta">Correo:</span> <span className="valor">{alumno.correo}</span></div>
            <div className="dato"><span className="etiqueta">Contraseña:</span> <span className="valor">********</span></div>
            <button className="btn-secundario" style={{ marginTop: '10px' }} onClick={() => setModalOpen(true)}>
              <FontAwesomeIcon icon={faKey} /> Cambiar Contraseña
            </button>
          </div>

          {/* Cursos */}
          <div className="card resumen-cursos">
            <h3 className="seccion-titulo"><FontAwesomeIcon icon={faClipboardList} /> Cursos Inscritos</h3>
            {cursos.length === 0 ? <p>No estás inscrito en ningún curso.</p> : (
              <div className="cursos-cards">
                {cursos.map((curso) => (
                  <div key={curso.id_curso || curso.nombre_curso} className="card-curso"
                    onClick={() => {
                      if (curso.urlCeforlav) window.open(curso.urlCeforlav, "_blank");
                      else alert("Este curso aún no tiene un enlace en Aula.");
                    }}
                  >
                    {curso.nombre_curso}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panel derecho: Asistencia */}
        <div className="right-panel card">
          <h3><FontAwesomeIcon icon={faClipboardList} /> Resumen de Asistencia</h3>

          <div className="grafico-torta" style={{ marginTop: 10 }}>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {pieData.map((_entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index]} />))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <h4 style={{ marginTop: '30px' }}><FontAwesomeIcon icon={faClipboardList} /> Asistencia Mensual</h4>
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

      {/* Modal cambiar contraseña */}
      {modalOpen && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Cambiar Contraseña</h5>
                <button type="button" className="btn-close" onClick={() => setModalOpen(false)}></button>
              </div>
              <div className="modal-body">
                {passwordError && <div className="alert alert-danger">{passwordError}</div>}
                {passwordSuccess && <div className="alert alert-success">{passwordSuccess}</div>}

                <div className="mb-3">
                  <label>Contraseña Actual</label>
                  <input type="password" className="form-control" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label>Nueva Contraseña</label>
                  <input type="password" className="form-control" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label>Confirmar Nueva Contraseña</label>
                  <input type="password" className="form-control" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
                <button className="btn btn-primary" onClick={handleChangePassword}>Cambiar Contraseña</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AlumnoPortal;
