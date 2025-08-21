import type { FC } from "react";

type Beca = {
    id_beca: number;
    nombre_beca: string;
    monto_descuento: number;
    fecha_inicio: string;
    fecha_fin: string;
    criterios: string;
    image: string;
};

type Props = {
    beca: Beca;
    onVerDetalle: (beca: Beca) => void; 
};

const BecaCard: FC<Props> = ({ beca, onVerDetalle }) => {
    return (
        <div className="card m-2 shadow" style={{ width: "20rem" }}>
            <div className="card-body d-flex flex-column justify-content-between">
                <h5 className="card-title">{beca.nombre_beca}</h5>
                <img
                    src={beca.image}
                    alt={beca.nombre_beca}
                    className="card-img-top mb-2"
                    style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                />

                <button
                    className="btn btn-outline-primary mt-3"
                    onClick={() => onVerDetalle(beca)}
                >
                    <i className="bi bi-info-circle me-2"></i>Ver detalles
                </button>
            </div>
        </div>
    );
};

export default BecaCard;
