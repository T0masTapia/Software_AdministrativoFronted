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

  const handlePagar = () => {
    alert('Botón de pago presionado (solo visual)');
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

          <button className="btn-pagar" onClick={handlePagar}>
            Pagar deuda
          </button>
        </div>

        {error && <p className="error">{error}</p>}

        <div className="tabla-transacciones">
          <h3>Transacciones</h3>
          {transacciones.length === 0 && !cargando ? (
            <p>No hay transacciones para mostrar</p>
          ) : (
            <table>
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
    </>
  );
};

export default FinanzasAlumno;
