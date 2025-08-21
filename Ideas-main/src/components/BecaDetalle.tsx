// BecaDetalle.tsx
import type { FC } from "react";

type Beca = {
  id_beca: number;
  nombre_beca: string;
  monto_descuento: number;
  fecha_inicio: string;
  fecha_fin: string;
  criterios: string;
};

type Props = {
  beca: Beca;
};

const BecaDetalle: FC<Props> = ({ beca }) => {
  const formatearFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const handlePostular = () => {
    // Aquí luego puedes agregar la lógica real de postulación
    alert(`Postulaste a la beca: ${beca.nombre_beca}`);
  };

  return (
    <div className="card p-3 mt-2 border-primary">
      <p>
        <strong>Requisitos:</strong> {beca.criterios}
      </p>
      <p>
        <strong>Monto:</strong> ${beca.monto_descuento.toLocaleString()}
      </p>
      <p>
        <strong>Vigencia:</strong>{" "}
        {formatearFecha(beca.fecha_inicio)} - {formatearFecha(beca.fecha_fin)}
      </p>
      <button className="btn btn-success w-100 mt-2" onClick={handlePostular}>
        Postular
      </button>
    </div>
  );
};

export default BecaDetalle;
