import { useState, useEffect, type FormEvent } from 'react';
import NavbarPag from '../components/NavbarPag';
import '../style/Cursos.css';

type Curso = {
  id_curso: number;
  nombre_curso: string;
  codigo_curso: string;
  duracion_curso: string;
  costo_curso: number;
  descripcion: string;
  url_aula?: string | null; 
};

export default function CursosCrear() {
  const [cursos, setCursos] = useState<Curso[]>([]);

  const [nombreCurso, setNombreCurso] = useState('');
  const [codigoCurso, setCodigoCurso] = useState('');
  const [duracionCurso, setDuracionCurso] = useState('');
  const [costoCurso, setCostoCurso] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [urlAula, setUrlAula] = useState('');

  useEffect(() => {
    fetch('http://localhost:3001/cursos')
      .then(res => res.json())
      .then(data => {
        if (data.success) setCursos(data.cursos);
      })
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!nombreCurso.trim() || !codigoCurso.trim() || !duracionCurso.trim() || !descripcion.trim() || !urlAula.trim()) {
      alert('Todos los campos son obligatorios.');
      return;
    }

    const nuevoCurso = {
      nombre_curso: nombreCurso.trim(),
      codigo_curso: codigoCurso.toUpperCase(),
      duracion_curso: duracionCurso.trim(),
      costo_curso: parseFloat(costoCurso.replace(/[^0-9.]/g, '')) || 0,
      descripcion: descripcion.trim(),
      url_aula: urlAula.trim(),
    };

    fetch('http://localhost:3001/cursos/crear-curso', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoCurso),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCursos(prev => [...prev, { id_curso: data.id, ...nuevoCurso }]);
          setNombreCurso('');
          setCodigoCurso('');
          setDuracionCurso('');
          setCostoCurso('');
          setDescripcion('');
          setUrlAula('');
        } else {
          alert('Error al crear el curso');
        }
      })
      .catch(err => console.error(err));
  };

  // ------------------------------
  // Función para eliminar curso
  const handleEliminar = (id: number) => {
    if (!confirm('¿Seguro que quieres eliminar este curso?')) return;

    fetch(`http://localhost:3001/cursos/${id}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCursos(prev => prev.filter(c => c.id_curso !== id));
        } else {
          // Mostrar el mensaje específico que envía el backend
          alert(data.error || 'Error al eliminar curso');
        }
      })
      .catch(err => console.error(err));
  };


  // ------------------------------
  // Función para editar curso (prompt simple)
  const handleEditar = (curso: Curso) => {
  // Pedir datos al usuario mediante prompt, dejando el valor actual como default
  const nuevoNombre = prompt('Nombre del curso:', curso.nombre_curso) ?? curso.nombre_curso;
  const nuevoCodigo = prompt('Código del curso:', curso.codigo_curso) ?? curso.codigo_curso;
  const nuevaDuracion = prompt('Duración:', curso.duracion_curso) ?? curso.duracion_curso;
  const nuevoCostoStr = prompt('Costo:', curso.costo_curso.toString()) ?? curso.costo_curso.toString();
  const nuevaDescripcion = prompt('Descripción:', curso.descripcion) ?? curso.descripcion;

  // Para URL Aula: si el usuario deja vacío, queda null
  const nuevaUrlPrompt = prompt('URL Aula:', curso.url_aula ?? '');
  const nuevaUrl = nuevaUrlPrompt !== null ? nuevaUrlPrompt.trim() || null : curso.url_aula;

  const nuevoCosto = parseFloat(nuevoCostoStr.replace(/[^0-9.]/g, '')) || curso.costo_curso;

  const datosActualizados = {
    nombre_curso: nuevoNombre.trim(),
    codigo_curso: nuevoCodigo.trim(),
    duracion_curso: nuevaDuracion.trim(),
    costo_curso: nuevoCosto,
    descripcion: nuevaDescripcion.trim(),
    url_aula: nuevaUrl, // puede ser string o null
  };

  fetch(`http://localhost:3001/cursos/${curso.id_curso}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datosActualizados),
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setCursos(prev =>
          prev.map(c =>
            c.id_curso === curso.id_curso
              ? { ...c, ...datosActualizados } 
              : c
          )
        );
      } else {
        alert('Error al actualizar curso');
      }
    })
    .catch(err => console.error(err));
};


  return (
    <>
      <NavbarPag />
      <div className="cursos-crear-wrapper">
        <h2>Gestionar Cursos</h2>
        <div className="cursos-crear-content">
          <form className="cursos-crear-form" onSubmit={handleSubmit}>
            <label>
              Nombre del Curso:
              <input type="text" placeholder="Ej: Matemáticas Básicas" value={nombreCurso} onChange={e => setNombreCurso(e.target.value)} />
            </label>

            <label>
              Código del Curso:
              <input type="text" placeholder="Ej: MAT101" value={codigoCurso} onChange={e => setCodigoCurso(e.target.value.toUpperCase())} maxLength={6} />
            </label>

            <label>
              Duración del Curso:
              <input type="text" placeholder="Ej: 3 meses, 40 horas" value={duracionCurso} onChange={e => setDuracionCurso(e.target.value)} />
            </label>

            <label>
              Costo del Curso:
              <input type="text" placeholder="Ej: $150.000" value={costoCurso} onChange={e => setCostoCurso(e.target.value)} />
            </label>

            <label>
              Descripción:
              <textarea placeholder="Descripción breve del curso..." rows={4} value={descripcion} onChange={e => setDescripcion(e.target.value)}></textarea>
            </label>

            <label>
              URL Aula:
              <input type="text" placeholder="Ej: https://mi-aula.com" value={urlAula} onChange={e => setUrlAula(e.target.value)} />
            </label>

            <button type="submit" className="btn-crear-curso">Crear Curso</button>
          </form>

          <div className="cursos-tabla">
            <h3>Cursos existentes</h3>
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Código</th>
                  <th>Duración</th>
                  <th>Costo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cursos.map(curso => (
                  <tr key={curso.id_curso}>
                    <td>{curso.nombre_curso}</td>
                    <td>{curso.codigo_curso}</td>
                    <td>{curso.duracion_curso}</td>
                    <td>${curso.costo_curso.toLocaleString()}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => handleEditar(curso)}
                          title="Editar curso"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleEliminar(curso.id_curso)}
                          title="Eliminar curso"
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
      </div>
    </>
  );
}
