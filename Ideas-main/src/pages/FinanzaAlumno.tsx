import { useState, useEffect } from 'react';
import '../style/FinanzaAlum.css';
import NavbarPag from '../components/NavbarPag';
import { useAdmin } from '../context/AdminContext';

interface Transaccion {
  fecha: string;
  tipo: string;
  descripcion: string;
  monto: number;
  fecha_deuda: Date;
}

const FinanzasAlumno = () => {
  const { rut } = useAdmin();
  const [filtro, setFiltro] = useState({ desde: '', hasta: '' });
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para el modal
  const [montoPago, setMontoPago] = useState<number>(0);
  const [metodo, setMetodo] = useState("tarjeta");

  // Estados para tarjeta
  const [numeroTarjeta, setNumeroTarjeta] = useState("");
  const [bancoDetectado, setBancoDetectado] = useState<string | null>(null);

  const cargarTransacciones = async () => {
    if (!rut) return;

    setCargando(true);
    setError(null);

    try {
      let url = `http://localhost:3001/deuda/alumno/${rut}`;
      const params = new URLSearchParams();
      if (filtro.desde) params.append('desde', filtro.desde);
      if (filtro.hasta) params.append('hasta', filtro.hasta);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Error al obtener las transacciones');

      const data = await res.json();

      if (data.success) {
        setTransacciones(data.transacciones);
      } else {
        setError('No se encontraron transacciones');
        setTransacciones([]);
      }
    } catch (err: any) {
      setError(err.message || 'Error desconocido');
      setTransacciones([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarTransacciones();
  }, [rut]);

  const ingresos = transacciones
    .filter(t => t.monto > 0)
    .reduce((acc, t) => acc + t.monto, 0);

  const gastos = transacciones
    .filter(t => t.monto < 0)
    .reduce((acc, t) => acc + t.monto, 0);

  const balance = ingresos + gastos;

  // 🔎 Detectar banco vía API binlist
  const detectarBancoAPI = async (numero: string) => {
    if (numero.length < 6) return;
    const bin = numero.slice(0, 6);

    try {
      const res = await fetch(`http://localhost:3001/binlookup/${bin}`);
      if (!res.ok) return;

      const data = await res.json();
      if (data.bank?.name) {
        setBancoDetectado(data.bank.name);
      } else {
        setBancoDetectado("Banco desconocido");
      }
    } catch (err) {
      console.error("Error consultando BIN:", err);
    }
  };

  return (
    <>
      <NavbarPag />
      <div className="finanzas-wrapper">
        <h1 className="titulo">Panel de Finanzas</h1>

        <div className="finanzas-resumen">
          <div className="card ingreso">
            <h3>Deuda</h3>
            <p>${ingresos.toLocaleString()}</p>
          </div>
          <div className="card gasto">
            <h3>Gastos</h3>
            <p>${Math.abs(gastos).toLocaleString()}</p>
          </div>
        </div>

        <div className="filtro-y-pago">
          <div className="filtro-fechas">
            <label htmlFor="desde">Desde:</label>
            <input
              type="date"
              id="desde"
              value={filtro.desde}
              onChange={e => setFiltro({ ...filtro, desde: e.target.value })}
            />
            <label htmlFor="hasta">Hasta:</label>
            <input
              type="date"
              id="hasta"
              value={filtro.hasta}
              onChange={e => setFiltro({ ...filtro, hasta: e.target.value })}
            />
            <button
              className="btn-filtrar"
              onClick={cargarTransacciones}
              disabled={cargando}
            >
              {cargando ? 'Cargando...' : 'Filtrar'}
            </button>
          </div>

          {/* Botón que abre el modal */}
          <button
            className="btn-pagar"
            data-bs-toggle="modal"
            data-bs-target="#modalPago"
            onClick={() => setMontoPago(ingresos)} // se inicializa con la deuda pendiente
          >
            Pagar deuda
          </button>
        </div>

        {error && <p className="error">{error}</p>}

        <div className="tabla-transacciones">
          <h3>Transacciones</h3>
          {transacciones.length === 0 && !cargando ? (
            <p>No hay transacciones para mostrar</p>
          ) : (
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Descripción</th>
                  <th>Monto</th>
                </tr>
              </thead>
              <tbody>
                {transacciones.map((t, i) => (
                  <tr key={i}>
                    <td>{new Date(t.fecha_deuda).toLocaleDateString()}</td>
                    <td>{t.tipo}</td>
                    <td>{t.descripcion}</td>
                    <td style={{ color: t.monto < 0 ? 'red' : 'green' }}>
                      {t.monto < 0 ? '-' : ''}${Math.abs(t.monto).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal de Bootstrap */}
      <div
        className="modal fade"
        id="modalPago"
        tabIndex={-1}
        aria-labelledby="modalPagoLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="modalPagoLabel">
                Realizar Pago
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Cerrar"
              ></button>
            </div>

            <div className="modal-body">
              {/* Monto */}
              <div className="mb-3">
                <label className="form-label">Monto a pagar</label>
                <input
                  type="number"
                  className="form-control"
                  value={montoPago}
                  onChange={e => setMontoPago(Number(e.target.value))}
                />
              </div>

              {/* Método de pago */}
              <div className="mb-3">
                <label className="form-label">Método de pago</label>
                <select
                  className="form-select"
                  onChange={e => setMetodo(e.target.value)}
                  value={metodo}
                >
                  <option value="tarjeta">Tarjeta de Crédito/Débito</option>
                  <option value="transferencia">Transferencia Bancaria</option>
                  <option value="efectivo">Efectivo</option>
                </select>
              </div>

              {/* Campos dinámicos */}
              {metodo === "tarjeta" && (
                <div>
                  <div className="mb-3">
                    <label className="form-label">Número de tarjeta</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="**** **** **** ****"
                      value={numeroTarjeta}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        setNumeroTarjeta(value);
                        if (value.length >= 6) {
                          detectarBancoAPI(value);
                        } else {
                          setBancoDetectado(null);
                        }
                      }}
                    />
                    {bancoDetectado && (
                      <p className="text-success mt-2">
                        Banco detectado: {bancoDetectado}
                      </p>
                    )}
                  </div>
                  <div className="row">
                    <div className="col">
                      <label className="form-label">Expira</label>
                      <input type="text" className="form-control" placeholder="MM/AA" />
                    </div>
                    <div className="col">
                      <label className="form-label">CVV</label>
                      <input type="password" className="form-control" placeholder="***" />
                    </div>
                  </div>
                </div>
              )}

              {metodo === "transferencia" && (
                <div className="mb-3">
                  <p>
                    Realiza la transferencia a: <br />
                    <strong>Banco Ejemplo</strong> <br />
                    N° Cuenta: <strong>123456789</strong> <br />
                    Titular: <strong>Universidad XYZ</strong>
                  </p>
                </div>
              )}

              {metodo === "efectivo" && (
                <div className="mb-3">
                  <p>
                    El pago en efectivo debe realizarse en la oficina de finanzas.  
                    Horario: <strong>9:00 - 18:00</strong>.
                  </p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-success"
                data-bs-dismiss="modal"
              >
                Confirmar Pago
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FinanzasAlumno;
