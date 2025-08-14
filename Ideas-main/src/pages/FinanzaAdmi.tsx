import { useEffect, useState } from 'react';
import NavbarPag from '../components/NavbarPag';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../style/FinanzasAdmi.css';

interface Alumno {
  id_deuda: number;
  rut: string;
  nombre_completo: string;
  deuda_total: number;
  correo: string;
  deudaMatricula: number;
  deudaCursos: number;
}

interface Pago {
  tipoPago: 'abono' | 'total';
  conceptoPago: 'matricula' | 'cursos';
  monto: number;
  fecha: string;
}

export default function FinanzaAdmiV1() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState<Alumno | null>(null);

  // Modal states
  const [tipoPago, setTipoPago] = useState<'abono' | 'total'>('total');
  const [conceptoPago, setConceptoPago] = useState<'matricula' | 'cursos'>('matricula');
  const [montoAbono, setMontoAbono] = useState<number>(0);

  // Pagos locales por alumno
  const [pagosPorAlumno, setPagosPorAlumno] = useState<Record<string, Pago[]>>({});

  // Filtro
  const [filtroTexto, setFiltroTexto] = useState('');

  useEffect(() => {
    fetch('http://localhost:3001/deuda/con-deuda')
      .then(res => {
        if (!res.ok) throw new Error('Error al obtener los datos');
        return res.json();
      })
      .then((data: { success: boolean; alumnos: any[] }) => {
        if (data.success) {
          const alumnosConDeuda: Alumno[] = data.alumnos.map(a => ({
            ...a,
            deudaMatricula: a.deudaMatricula,
            deudaCursos: a.deudaCursos,
          }));
          setAlumnos(alumnosConDeuda);
        } else {
          setError('No se pudieron cargar los datos');
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const abrirModalPago = (alumno: Alumno) => {
    setAlumnoSeleccionado(alumno);
    setShowModal(true);
    setTipoPago('total');
    setConceptoPago(
      alumno.deudaMatricula > 0 ? 'matricula' : 'cursos'
    );
    setMontoAbono(0);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setAlumnoSeleccionado(null);
  };

  const confirmarPago = async () => {
    if (!alumnoSeleccionado) return;

    let montoAPagar =
      tipoPago === "total"
        ? alumnoSeleccionado.deuda_total
        : montoAbono;

    if (tipoPago === "abono") {
      if (montoAbono <= 0) {
        alert("Ingresa un monto válido");
        return;
      }
      if (
        (conceptoPago === 'matricula' && montoAbono > alumnoSeleccionado.deudaMatricula) ||
        (conceptoPago === 'cursos' && montoAbono > alumnoSeleccionado.deudaCursos)
      ) {
        alert("El monto no puede ser mayor al pendiente");
        return;
      }
    }

    try {
      const respuesta = await fetch("http://localhost:3001/pago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_deuda: alumnoSeleccionado.id_deuda,
          monto: montoAPagar,
          tipoPago,
          conceptoPago
        }),
      });

      if (!respuesta.ok) throw new Error("Error al registrar el pago");

      const data = await respuesta.json();

      if (data.success) {
        alert(data.message);

        // Actualizar localmente la deuda pendiente
        setAlumnos(prev =>
          prev.map(a => {
            if (a.id_deuda === alumnoSeleccionado.id_deuda) {
              const nuevaDeudaMatricula =
                conceptoPago === 'matricula'
                  ? Math.max(a.deudaMatricula - montoAPagar, 0)
                  : a.deudaMatricula;
              const nuevaDeudaCursos =
                conceptoPago === 'cursos'
                  ? Math.max(a.deudaCursos - montoAPagar, 0)
                  : a.deudaCursos;
              return {
                ...a,
                deudaMatricula: nuevaDeudaMatricula,
                deudaCursos: nuevaDeudaCursos,
                deuda_total: nuevaDeudaMatricula + nuevaDeudaCursos
              };
            }
            return a;
          })
        );

        // Guardar pago localmente
        setPagosPorAlumno(prev => {
          const pagosPrev = prev[alumnoSeleccionado.rut] || [];
          return {
            ...prev,
            [alumnoSeleccionado.rut]: [
              ...pagosPrev,
              {
                tipoPago,
                conceptoPago,
                monto: montoAPagar,
                fecha: new Date().toLocaleDateString()
              }
            ]
          };
        });

        cerrarModal();
      } else {
        alert("El pago no se pudo registrar");
      }
    } catch (err) {
      console.error(err);
      alert("Hubo un problema al registrar el pago");
    }
  };

  const alumnosFiltrados = alumnos.filter(alumno =>
    alumno.nombre_completo.toLowerCase().includes(filtroTexto.toLowerCase()) ||
    alumno.rut.toLowerCase().includes(filtroTexto.toLowerCase())
  );

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <>
      <NavbarPag />
      <div className="finanzas-container">
        <div className="finanzas-content">
          <h2 className="finanzas-title">Panel de Finanzas - Administrador</h2>

          <input
            type="text"
            placeholder="Buscar por nombre o RUT"
            className="finanzas-search"
            value={filtroTexto}
            onChange={e => setFiltroTexto(e.target.value)}
          />

          <div className="alumnos-lista">
            {alumnosFiltrados.length === 0 ? (
              <p>No hay alumnos con deuda pendiente.</p>
            ) : (
              alumnosFiltrados.map(alumno => {
                const pagosAlumno = pagosPorAlumno[alumno.rut];
                const tienePagos = Array.isArray(pagosAlumno) && pagosAlumno.length > 0;

                return (
                  <div key={alumno.rut} className="alumno-card">
                    <div className="alumno-info">
                      <div>
                        <p className="alumno-nombre">{alumno.nombre_completo}</p>
                        <p className="alumno-rut">RUT: {alumno.rut}</p>
                        <p className="alumno-correo">Correo: {alumno.correo}</p>
                      </div>
                      <div className="alumno-finanzas">
                        <p className="deuda">
                          <span>💸</span>Deuda total: ${alumno.deuda_total.toLocaleString()}
                        </p>
                        <button
                          className="btn btn-primary"
                          onClick={() => abrirModalPago(alumno)}
                        >
                          Pagar deuda
                        </button>
                      </div>
                    </div>

                    <div className="alumno-detalles">
                      <p className="titulo-detalles">Pagos y Deudas:</p>
                      <p>
                        <strong>Matrícula:</strong>{" "}
                        {alumno.deudaMatricula > 0
                          ? `Pendiente $${alumno.deudaMatricula.toLocaleString()}`
                          : "Pagada"}
                      </p>
                      <p>
                        <strong>Cursos:</strong>{" "}
                        {alumno.deudaCursos > 0
                          ? `Pendiente $${alumno.deudaCursos.toLocaleString()}`
                          : "Pagados"}
                      </p>

                      <ul className="lista-detalles">
                        {tienePagos ? (
                          pagosAlumno.map((pago, index) => (
                            <li key={index} className="deuda-item">
                              {pago.fecha} - {pago.tipoPago === 'total' ? 'Pago Total' : 'Abono'} de ${pago.monto.toLocaleString()} ({pago.tipoPago === 'total' ? 'matrícula + cursos' : pago.conceptoPago})
                            </li>
                          ))
                        ) : (
                          <li className="deuda-item">No se han registrado pagos aún.</li>
                        )}
                      </ul>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && alumnoSeleccionado && (
        <div
          className="modal fade show"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Pagar deuda</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={cerrarModal}></button>
              </div>
              <div className="modal-body">
                <p>Alumno: <strong>{alumnoSeleccionado.nombre_completo}</strong></p>
                <p>RUT: {alumnoSeleccionado.rut}</p>
                <p>Deuda total: ${alumnoSeleccionado.deuda_total.toLocaleString()}</p>

                <hr />

                <p>
                  <strong>Matrícula:</strong>{" "}
                  {alumnoSeleccionado.deudaMatricula > 0
                    ? `Pendiente $${alumnoSeleccionado.deudaMatricula.toLocaleString()}`
                    : "Pagada"}
                </p>
                <p>
                  <strong>Cursos:</strong>{" "}
                  {alumnoSeleccionado.deudaCursos > 0
                    ? `Pendiente $${alumnoSeleccionado.deudaCursos.toLocaleString()}`
                    : "Pagados"}
                </p>

                <div className="mb-3">
                  <label htmlFor="tipoPago" className="form-label">Tipo de pago</label>
                  <select
                    id="tipoPago"
                    className="form-select"
                    value={tipoPago}
                    onChange={e => setTipoPago(e.target.value as 'abono' | 'total')}
                  >
                    <option value="total">Total</option>
                    <option value="abono">Abono</option>
                  </select>
                </div>

                {tipoPago === 'abono' && (
                  <>
                    <div className="mb-3">
                      <label htmlFor="montoAbono" className="form-label">Monto abono</label>
                      <input
                        type="number"
                        id="montoAbono"
                        className="form-control"
                        value={montoAbono === 0 ? '' : montoAbono}
                        onChange={e => setMontoAbono(Number(e.target.value))}
                        min={1}
                        placeholder="Ingresa el monto del abono"
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="conceptoPago" className="form-label">Concepto de pago</label>
                      <select
                        id="conceptoPago"
                        className="form-select"
                        value={conceptoPago}
                        onChange={e => setConceptoPago(e.target.value as 'matricula' | 'cursos')}
                      >
                        {alumnoSeleccionado.deudaMatricula > 0 && <option value="matricula">Matrícula</option>}
                        {alumnoSeleccionado.deudaCursos > 0 && <option value="cursos">Cursos</option>}
                      </select>
                    </div>
                  </>
                )}

                {tipoPago === 'total' && (
                  <p><strong>Concepto de pago:</strong> matrícula + cursos</p>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={cerrarModal}>Cerrar</button>
                <button type="button" className="btn btn-success" onClick={confirmarPago}>Confirmar pago</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
