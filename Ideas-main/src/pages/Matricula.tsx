import { useState, useEffect } from 'react';
import '../style/Matricula.css';
import NavbarPag from '../components/NavbarPag';

export default function Matricula() {
    const [rut, setRut] = useState('');
    const [nombreCompleto, setNombreCompleto] = useState('');
    const [cursoSeleccionado, setCursoSeleccionado] = useState('');
    const [cursos, setCursos] = useState<any[]>([]);
    const [alumnos, setAlumnos] = useState<any[]>([]);
    const [filtroRut, setFiltroRut] = useState('');
    const [errores, setErrores] = useState<{ [key: string]: string }>({});
    const [sugerenciasRut, setSugerenciasRut] = useState<any[]>([]);
    const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

    useEffect(() => {
        fetch('http://localhost:3001/cursos')
            .then(res => res.json())
            .then(data => setCursos(data.cursos))
            .catch(err => console.error('Error al cargar cursos:', err));
    }, []);

    useEffect(() => {
        fetch('http://localhost:3001/alumnoCurso')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setAlumnos(data.matriculas);
                } else {
                    console.error('Error al cargar alumnos matriculados:', data.error);
                }
            })
            .catch(err => console.error('Error al cargar alumnos matriculados:', err));
    }, []);

    useEffect(() => {
        if (rut.length >= 3) {
            fetch(`http://localhost:3001/alumnos/buscar?rut=${rut}`)
                .then(res => res.json())
                .then(data => {
                    setSugerenciasRut(data.alumnos || []);
                    setMostrarSugerencias(true);
                })
                .catch(() => {
                    setSugerenciasRut([]);
                    setMostrarSugerencias(false);
                });
        } else {
            setSugerenciasRut([]);
            setMostrarSugerencias(false);
        }
    }, [rut]);

    const seleccionarSugerencia = (alumno: any) => {
        setRut(alumno.rut);
        setNombreCompleto(alumno.nombre_completo);
        setSugerenciasRut([]);
        setMostrarSugerencias(false);
    };

    const validar = () => {
        const nuevosErrores: { [key: string]: string } = {};
        if (!rut || rut.length < 9) {
            nuevosErrores.rut = 'RUT inválido (mínimo 9 caracteres)';
        }
        if (!cursoSeleccionado) {
            nuevosErrores.curso = 'Debe seleccionar un curso';
        }
        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validar()) return;

        const nombreCurso = cursos.find(c => c.id_curso === parseInt(cursoSeleccionado))?.nombre_curso || '';

        const yaMatriculado = alumnos.some(
            (a) => a.rut === rut && a.curso === nombreCurso
        );

        if (yaMatriculado) {
            setErrores({ rut: 'El alumno ya está matriculado en este curso' });
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/alumnoCurso/matricular', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rut_alumno: rut,
                    nombre_completo: nombreCompleto,
                    id_curso: parseInt(cursoSeleccionado),
                }),
            });

            const data = await response.json();

            if (data.success) {
                setAlumnos([
                    ...alumnos,
                    { rut, nombre_completo: nombreCompleto, curso: nombreCurso }
                ]);
                setRut('');
                setNombreCompleto('');
                setCursoSeleccionado('');
                setErrores({});
            } else {
                setErrores({ rut: data.error || 'Error al matricular alumno' });
            }
        } catch (error) {
            console.error('Error al enviar la matrícula:', error);
            setErrores({ rut: 'Error en la conexión con el servidor' });
        }
    };

    const alumnosFiltrados = alumnos.filter((alumno) =>
        alumno.rut.toLowerCase().includes(filtroRut.toLowerCase())
    );

    return (
        <>
            <NavbarPag />
            <div className="matricula-wrapper">
                <div className="matricula-container">
                    <h2>Matricular Alumno</h2>
                    <form onSubmit={handleSubmit} className="matricula-form" noValidate>
                        <label>RUT:
                            <input
                                type="text"
                                placeholder="Ej: 21.465.XXX-X"
                                value={rut}
                                onChange={(e) => {
                                    setRut(e.target.value);
                                    setNombreCompleto('');
                                }}
                                onFocus={() => setMostrarSugerencias(true)}
                                className={errores.rut ? 'input-error' : ''}
                                autoComplete="off"
                            />
                            {errores.rut && <small className="error-text">{errores.rut}</small>}
                            {mostrarSugerencias && sugerenciasRut.length > 0 && (
                                <ul className="sugerencias">
                                    {sugerenciasRut.map((alumno, index) => (
                                        <li key={index} onClick={() => seleccionarSugerencia(alumno)}>
                                            {alumno.rut} - {alumno.nombre_completo}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </label>

                        {nombreCompleto && (
                            <p><strong>Nombre:</strong> {nombreCompleto}</p>
                        )}

                        <label>Curso:
                            <select
                                value={cursoSeleccionado}
                                onChange={(e) => setCursoSeleccionado(e.target.value)}
                                className={errores.curso ? 'input-error' : ''}
                            >
                                <option value="">Seleccione un curso</option>
                                {cursos.map((curso) => (
                                    <option key={curso.id_curso} value={curso.id_curso}>
                                        {curso.nombre_curso}
                                    </option>
                                ))}
                            </select>
                            {errores.curso && <small className="error-text">{errores.curso}</small>}
                        </label>

                        <button type="submit" className="btn-matricular">Matricular Alumno</button>
                    </form>
                </div>

                <div className="tabla-alumnos">
                    <h3>Alumnos Matriculados</h3>

                    <input
                        type="text"
                        placeholder="Buscar por RUT..."
                        value={filtroRut}
                        onChange={(e) => setFiltroRut(e.target.value)}
                        className="input-filtro"
                    />

                    <table>
                        <thead>
                            <tr>
                                <th>RUT</th>
                                <th>Nombre</th>
                                <th>Curso</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alumnosFiltrados.map((alumno, index) => (
                                <tr key={index}>
                                    <td>{alumno.rut}</td>
                                    <td>{alumno.nombre_completo}</td>
                                    <td>{alumno.curso}</td>
                                    <td>
                                        <button
                                            type="button"
                                            className="btn btn-danger btn-sm"
                                            onClick={() => console.log("Desmatricular a:", alumno.rut)}
                                        >
                                            Desmatricular
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {alumnosFiltrados.length === 0 && (
                                <tr>
                                    <td colSpan={4} style={{ textAlign: 'center' }}>
                                        No se encontraron alumnos
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
