import { useState, useEffect } from 'react';
import '../style/CrearU.css';
import NavbarPag from '../components/NavbarPag';

export default function CrearU() {
    const [rut, setRut] = useState('');
    const [nombre, setNombre] = useState('');
    const [fono, setFono] = useState('');
    const [direccion, setDireccion] = useState('');
    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState('');
    const [mostrarPassword, setMostrarPassword] = useState(false);
    // const [forzarPasswordSegura, setForzarPasswordSegura] = useState(false); 
    const [alumnos, setAlumnos] = useState<any[]>([]);
    const [filtroNombre, setFiltroNombre] = useState('');
    const [errores, setErrores] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        const cargarAlumnos = async () => {
            try {
                const res = await fetch('http://localhost:3001/alumnos');
                const data = await res.json();
                if (data.success && Array.isArray(data.alumnos)) {
                    const alumnosFormateados = data.alumnos.map((a: any) => ({
                        rut: a.rut ?? '',
                        nombre: a.nombre_completo ?? '',
                        fono: a.fono ?? '',
                        direccion: a.direccion ?? '',
                        correo: a.correo ?? '',
                    }));
                    setAlumnos(alumnosFormateados);
                } else {
                    alert('Error al obtener alumnos del servidor');
                }
            } catch (error) {
                alert('Error de conexión con el backend');
                console.error(error);
            }
        };
        cargarAlumnos();
    }, []);

    const validar = () => {
        const nuevosErrores: { [key: string]: string } = {};

        // Regex para validar RUT chileno formato básico: números + guion + dígito verificador (0-9 o K/k)
        const rutRegex = /^[0-9]+-[0-9kK]$/;

        if (!rut || rut.length < 9) {
            nuevosErrores.rut = 'RUT inválido (mínimo 9 caracteres)';
        } else if (!rutRegex.test(rut)) {
            nuevosErrores.rut = 'RUT debe tener formato válido (ej: 12345678-9)';
        }

        if (!nombre || nombre.trim().length < 3) {
            nuevosErrores.nombre = 'Nombre debe tener al menos 3 caracteres';
        }
        if (!/^\d{8,}$/.test(fono)) {
            nuevosErrores.fono = 'Contacto debe tener al menos 8 números';
        }
        if (!direccion || direccion.trim() === '') {
            nuevosErrores.direccion = 'Dirección es requerida';
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(correo)) {
            nuevosErrores.correo = 'Correo electrónico inválido';
        }
        if (!password || password.length < 6) {
            nuevosErrores.password = 'La contraseña debe tener al menos 6 caracteres';
        }

        // Por ahora no se añade lógica usando forzarPasswordSegura

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validar()) return;

        const nuevoAlumno = { rut, nombre_completo: nombre, fono, direccion, correo, password };

        try {
            const res = await fetch('http://localhost:3001/alumnos/crear', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoAlumno),
            });

            const data = await res.json();

            if (data.success) {
                setAlumnos([...alumnos, { rut, nombre, fono, direccion, correo }]);
                setRut('');
                setNombre('');
                setFono('');
                setDireccion('');
                setCorreo('');
                setPassword('');
                setMostrarPassword(false);
                // setForzarPasswordSegura(false); 
                setErrores({});
                alert('Alumno registrado correctamente');
            } else {
                alert('Error: ' + data.error);
            }
        } catch (error) {
            alert('Error de conexión con el backend');
            console.error(error);
        }
    };

    // Eliminar alumno
    const handleEliminar = async (rut: string) => {
        if (!confirm('¿Seguro que deseas eliminar este alumno?')) return;

        try {
            const res = await fetch(`http://localhost:3001/alumnos/${rut}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (data.success) {
                setAlumnos(alumnos.filter(a => a.rut !== rut));
                alert('Alumno eliminado correctamente');
            } else {
                alert('Error al eliminar: ' + data.error);
            }
        } catch (error) {
            console.error(error);
            alert('Error de conexión al eliminar alumno');
        }
    };

    // Editar alumno (PATCH)
    const handleEditar = async (rut: string) => {
        const nuevoNombre = prompt('Nuevo nombre:');
        if (!nuevoNombre) return;

        try {
            const res = await fetch(`http://localhost:3001/alumnos/${rut}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre: nuevoNombre }),
            });
            const data = await res.json();
            if (data.success) {
                setAlumnos(alumnos.map(a => a.rut === rut ? { ...a, nombre: nuevoNombre } : a));
                alert('Alumno actualizado correctamente');
            } else {
                alert('Error al actualizar: ' + data.error);
            }
        } catch (error) {
            console.error(error);
            alert('Error de conexión al actualizar alumno');
        }
    };


    const alumnosFiltrados = alumnos.filter((alumno) =>
        (alumno.nombre ?? '').toLowerCase().includes(filtroNombre.toLowerCase()) ||
        (alumno.rut ?? '').toLowerCase().includes(filtroNombre.toLowerCase())
    );


    return (
        <>
            <NavbarPag />
            <div className="matricula-wrapper">
                <div className="matricula-container">
                    <h2>Ingresar Alumno</h2>
                    <form onSubmit={handleSubmit} className="matricula-form" noValidate>
                        <label>
                            RUT:
                            <input
                                type="text"
                                placeholder='12345678-9'
                                value={rut}
                                onChange={(e) => setRut(e.target.value)}
                                className={errores.rut ? 'input-error' : ''}
                            />
                            {errores.rut && <small className="error-text">{errores.rut}</small>}
                        </label>

                        <label>
                            Nombre Completo:
                            <input
                                type="text"
                                placeholder='Ingresar Nombre Completo'
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                className={errores.nombre ? 'input-error' : ''}
                            />
                            {errores.nombre && <small className="error-text">{errores.nombre}</small>}
                        </label>

                        <label>
                            Contacto:
                            <input
                                type="text"
                                placeholder='912345678'
                                value={fono}
                                onChange={(e) => setFono(e.target.value)}
                                className={errores.fono ? 'input-error' : ''}
                            />
                            {errores.fono && <small className="error-text">{errores.fono}</small>}
                        </label>

                        <label>
                            Comuna:
                            <input
                                type="text"
                                value={direccion}
                                onChange={(e) => setDireccion(e.target.value)}
                                className={errores.direccion ? 'input-error' : ''}
                            />
                            {errores.direccion && <small className="error-text">{errores.direccion}</small>}
                        </label>

                        <label>
                            Correo electrónico:
                            <input
                                type="email"
                                placeholder='pepito123@gmail.com'
                                value={correo}
                                onChange={(e) => setCorreo(e.target.value)}
                                className={errores.correo ? 'input-error' : ''}
                            />
                            {errores.correo && <small className="error-text">{errores.correo}</small>}
                        </label>

                        <label>
                            Contraseña:
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={mostrarPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={errores.password ? 'input-error' : ''}
                                />
                                <button
                                    type="button"
                                    onClick={() => setMostrarPassword(!mostrarPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: mostrarPassword ? '#4f46e5' : '#e5e7eb', // color cambia según estado
                                        border: 'none',
                                        borderRadius: '50%',
                                        cursor: 'pointer',
                                        width: '32px',
                                        height: '32px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.3s ease',
                                        padding: 0,
                                    }}
                                    aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke={mostrarPassword ? '#fff' : '#6b7280'} // cambia color del icono
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        style={{ width: '18px', height: '18px', transition: 'stroke 0.3s ease' }}
                                    >
                                        {mostrarPassword ? (
                                            // Ojo tachado
                                            <>
                                                <path d="M17.94 17.94A10.97 10.97 0 0112 20c-5 0-9.27-3-11-7 1.17-2.43 3.28-4.4 5.7-5.57"></path>
                                                <line x1="1" y1="1" x2="23" y2="23"></line>
                                            </>
                                        ) : (
                                            // Ojo abierto
                                            <>
                                                <circle cx="12" cy="12" r="3"></circle>
                                                <path d="M2.05 12C3.27 7.6 7.3 4 12 4c4.7 0 8.73 3.6 9.95 8-1.22 4.4-5.25 8-9.95 8-4.7 0-8.73-3.6-9.95-8z"></path>
                                            </>
                                        )}
                                    </svg>
                                </button>

                            </div>
                            {errores.password && <small className="error-text">{errores.password}</small>}
                        </label>

                        {/* Checkbox para forzar contraseña segura (sin lógica) */}
                        {/* <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={forzarPasswordSegura}
                                onChange={() => setForzarPasswordSegura(!forzarPasswordSegura)}
                            />
                            <span></span> Forzar Cambio de contraseña
                        </label> */}

                        <button type="submit" className="btn-matricular" style={{ marginTop: '15px' }}>
                            Matricular
                        </button>
                    </form>
                </div>

                <div className="tabla-alumnos">
                    <h3>Alumnos Ingresados al Sistema</h3>

                    <input
                        type="text"
                        placeholder="Buscar por nombre o RUT..."
                        value={filtroNombre}
                        onChange={(e) => setFiltroNombre(e.target.value)}
                        className="input-filtro"
                    />


                    <table>
                        <thead>
                            <tr>
                                <th>RUT</th>
                                <th>Nombre</th>
                                <th>Contacto</th>
                                <th>Comuna</th>
                                <th>Correo</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alumnosFiltrados.map((alumno, index) => (
                                <tr key={index}>
                                    <td>{alumno.rut}</td>
                                    <td>{alumno.nombre}</td>
                                    <td>{alumno.fono}</td>
                                    <td>{alumno.direccion}</td>
                                    <td>{alumno.correo}</td>
                                    <td>
                                        <div className="d-flex gap-2">
                                            {/* Botón Editar */}
                                            <button
                                                className="btn btn-outline-primary btn-sm"
                                                onClick={async () => {
                                                    // Pedir nuevos valores
                                                    const nuevoNombre = prompt('Nuevo nombre:', alumno.nombre);
                                                    const nuevoFono = prompt('Nuevo fono:', alumno.fono);
                                                    const nuevaDireccion = prompt('Nueva dirección:', alumno.direccion);
                                                    const nuevoCorreo = prompt('Nuevo correo:', alumno.correo);

                                                    // Crear objeto solo con campos que se cambiaron
                                                    const body: any = {};
                                                    if (nuevoNombre && nuevoNombre !== alumno.nombre) body.nombre = nuevoNombre;
                                                    if (nuevoFono && nuevoFono !== alumno.fono) body.fono = nuevoFono;
                                                    if (nuevaDireccion && nuevaDireccion !== alumno.direccion) body.direccion = nuevaDireccion;
                                                    if (nuevoCorreo && nuevoCorreo !== alumno.correo) body.correo = nuevoCorreo;

                                                    if (Object.keys(body).length === 0) return alert('No se hicieron cambios');

                                                    try {
                                                        const res = await fetch(`http://localhost:3001/alumnos/${alumno.rut}`, {
                                                            method: 'PATCH',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify(body),
                                                        });
                                                        const data = await res.json();
                                                        if (data.success) {
                                                            alert('Alumno actualizado correctamente');
                                                            // Actualizar estado local para reflejar cambios
                                                            setAlumnos(prev => prev.map(a => a.rut === alumno.rut ? { ...a, ...body } : a));
                                                        } else {
                                                            alert('Error: ' + data.error);
                                                        }
                                                    } catch (err) {
                                                        console.error(err);
                                                        alert('Error de conexión con el backend');
                                                    }
                                                }}
                                                title="Editar alumno"
                                            >
                                                ✏️
                                            </button>

                                            {/* Botón Eliminar */}
                                            <button
                                                className="btn btn-outline-danger btn-sm"
                                                onClick={async () => {
                                                    if (!confirm('¿Seguro que deseas eliminar este alumno?')) return;
                                                    try {
                                                        const res = await fetch(`http://localhost:3001/alumnos/${alumno.rut}`, { method: 'DELETE' });
                                                        const data = await res.json();
                                                        if (data.success) {
                                                            alert('Alumno eliminado');
                                                            setAlumnos(prev => prev.filter(a => a.rut !== alumno.rut));
                                                        } else {
                                                            alert('Error: ' + data.error);
                                                        }
                                                    } catch (err) {
                                                        console.error(err);
                                                        alert('Error de conexión con el backend');
                                                    }
                                                }}
                                                title="Eliminar alumno"
                                            >
                                                🗑
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>

                    </table>
                </div>
            </div>
        </>
    );
}
