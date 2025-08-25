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
  id_deuda?: number;
}

const FinanzasAlumno = () => {
  const { rut } = useAdmin();
  const [filtro, setFiltro] = useState({ desde: '', hasta: '' });
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal estilo Admin
  const [montoPago, setMontoPago] = useState<number>(0);
  const [tipoPago, setTipoPago] = useState<'total' | 'abono'>('total');
  const [conceptoPago, setConceptoPago] = useState<'matricula' | 'cursos'>('matricula');

  const [pagosSesion, setPagosSesion] = useState(0);

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

  const handlePago = async () => {
    if (montoPago <= 0) return alert("Ingrese un monto válido");
    if (!transacciones.length) return alert("No hay deudas registradas");

    try {
      const id_deuda = (transacciones.find(t => t.monto > 0) as any)?.id_deuda;
      if (!id_deuda) return alert("No se encontró deuda para pagar");

      const res = await fetch('http://localhost:3001/pago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_deuda,
          monto: montoPago,
          tipoPago,
          conceptoPago
        })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Error registrando pago');

      // Agregamos la transacción localmente
      const nuevaTransaccion: Transaccion = {
        fecha: new Date().toISOString(),
        tipo: "pago",
        descripcion: tipoPago === 'total'
          ? `Pago total (${conceptoPago})`
          : `Abono (${conceptoPago})`,
        monto: -montoPago,
        fecha_deuda: new Date(),
        id_deuda
      };

      setTransacciones(prev => [nuevaTransaccion, ...prev]);
      setPagosSesion(prev => prev + montoPago);
      setMontoPago(0);

    } catch (err: any) {
      alert(err.message || "Error al registrar pago");
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
            <p>${Math.abs(ingresos - pagosSesion).toLocaleString()}</p>
          </div>
          <div className="card gasto">
            <h3>Gastos</h3>
            <p>${Math.abs(gastos).toLocaleString()}</p>
          </div>
        </div>

        <div className="filtro-y-pago">
          <div className="filtro-fechas">
            <label htmlFor="desde">Desde:</label>
            <input type="date" id="desde" value={filtro.desde} onChange={e => setFiltro({ ...filtro, desde: e.target.value })}/>
            <label htmlFor="hasta">Hasta:</label>
            <input type="date" id="hasta" value={filtro.hasta} onChange={e => setFiltro({ ...filtro, hasta: e.target.value })}/>
            <button className="btn-filtrar" onClick={cargarTransacciones} disabled={cargando}>
              {cargando ? 'Cargando...' : 'Filtrar'}
            </button>
          </div>

          <button className="btn-pagar" onClick={() => setMontoPago(ingresos - pagosSesion)}>
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
                    <td style={{ color: t.monto < 0 ? 'green' : 'red' }}>
                      {t.monto < 0 ? '-' : ''}${Math.abs(t.monto).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal de pago */}
      {montoPago > 0 && (
        <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-modal="true">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Pagar deuda</h5>
                <button type="button" className="btn-close" onClick={() => setMontoPago(0)}></button>
              </div>
              <div className="modal-body">
                <p>Alumno: <strong>{rut}</strong></p>
                <p>Deuda total: ${Math.abs(ingresos - pagosSesion).toLocaleString()}</p>

                <div className="mb-3">
                  <label htmlFor="tipoPago" className="form-label">Tipo de pago</label>
                  <select id="tipoPago" className="form-select" value={tipoPago} onChange={e => setTipoPago(e.target.value as 'total' | 'abono')}>
                    <option value="total">Total</option>
                    <option value="abono">Abono</option>
                  </select>
                </div>

                {tipoPago === 'abono' && (
                  <div className="mb-3">
                    <label htmlFor="conceptoPago" className="form-label">Concepto de pago</label>
                    <select id="conceptoPago" className="form-select" value={conceptoPago} onChange={e => setConceptoPago(e.target.value as 'matricula' | 'cursos')}>
                      <option value="matricula">Matrícula</option>
                      <option value="cursos">Cursos</option>
                    </select>

                    <label htmlFor="montoAbono" className="form-label mt-2">Monto abono</label>
                    <input type="number" id="montoAbono" className="form-control" value={montoPago} onChange={e => setMontoPago(Number(e.target.value))} min={1} />
                  </div>
                )}

                {tipoPago === 'total' && <p><strong>Concepto de pago:</strong> matrícula + cursos</p>}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setMontoPago(0)}>Cancelar</button>
                <button type="button" className="btn btn-success" onClick={handlePago}>Confirmar pago</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FinanzasAlumno;
