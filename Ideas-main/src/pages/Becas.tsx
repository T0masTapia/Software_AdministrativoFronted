import { useState, useEffect } from "react";
import NavbarPag from "../components/NavbarPag";
import BecaCard from "../components/BecaCard";
import BecaDetalle from "../components/BecaDetalle";
import "../style/Becas.css";

type Beca = {
    id_beca: number;
    nombre_beca: string;
    monto_descuento: number;
    fecha_inicio: string;
    fecha_fin: string;
    criterios: string;
    image: string;
};

export default function Becas() {
    const [becas, setBecas] = useState<Beca[]>([]);
    const [detalleBeca, setDetalleBeca] = useState<Beca | null>(null);

    // Estados del formulario
    const [nombre, setNombre] = useState("");
    const [monto, setMonto] = useState("");
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [criterios, setCriterios] = useState("");
    const [image, setImage] = useState("");

    // Cargar becas desde el backend
    useEffect(() => {
        fetch("http://localhost:3001/becas")
            .then((res) => res.json())
            .then((data) => {
                if (data.success) setBecas(data.becas);
            });
    }, []);

    const handleCrearBeca = (e: React.FormEvent) => {
        e.preventDefault();

        const nuevaBeca = {
            nombre_beca: nombre,
            monto_descuento: Number(monto),
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin,
            criterios,
            image,
        };

        fetch("http://localhost:3001/becas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuevaBeca),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setBecas([...becas, { ...nuevaBeca, id_beca: data.id_beca }]);
                    setNombre("");
                    setMonto("");
                    setFechaInicio("");
                    setFechaFin("");
                    setCriterios("");
                    setImage("");
                } else {
                    alert("Error al crear la beca");
                }
            });
    };

    return (
        <>
            <NavbarPag />
            <div className="container py-5">
                <h1 className="text-center mb-5">Becas Disponibles</h1>

                <div className="row mb-5">
                    {becas.map((b) => (
                        <div key={b.id_beca} className="col-md-4 mb-4">
                            <BecaCard
                                beca={b}
                                onVerDetalle={() =>
                                    setDetalleBeca(
                                        detalleBeca?.id_beca === b.id_beca ? null : b
                                    )
                                }
                            />
                            {detalleBeca?.id_beca === b.id_beca && (
                                <BecaDetalle beca={detalleBeca} />
                            )}
                        </div>
                    ))}
                </div>


                {/* Formulario para crear nuevas becas */}
                <div className="card shadow p-4">
                    <h3 className="mb-4">Crear Nueva Beca</h3>
                    <form onSubmit={handleCrearBeca}>
                        <div className="mb-3">
                            <label className="form-label">Nombre Beca</label>
                            <input
                                type="text"
                                className="form-control"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Monto Descuento</label>
                            <input
                                type="number"
                                className="form-control"
                                value={monto}
                                onChange={(e) => setMonto(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Fecha Inicio</label>
                            <input
                                type="date"
                                className="form-control"
                                value={fechaInicio}
                                onChange={(e) => setFechaInicio(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Fecha Fin</label>
                            <input
                                type="date"
                                className="form-control"
                                value={fechaFin}
                                onChange={(e) => setFechaFin(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Criterios</label>
                            <textarea
                                className="form-control"
                                value={criterios}
                                onChange={(e) => setCriterios(e.target.value)}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Imagen (URL)</label>
                            <input
                                type="text"
                                className="form-control"
                                value={image}
                                onChange={(e) => setImage(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="btn btn-success">
                            Crear Beca
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
