import { useState, useEffect, type FormEvent } from 'react';
import NavbarPag from '../components/NavbarPag';
import '../style/Cursos.css';

// Definimos el tipo Curso según la estructura de la tabla
type Curso = {
  id_curso: number;
  nombre_curso: string;
  codigo_curso: string;
  duracion_curso: string;
  costo_curso: number;
  descripcion: string;
};

export default function CursosCrear() {
  const [cursos, setCursos] = useState<Curso[]>([]);

  // Estados para los inputs del formulario
  const [nombreCurso, setNombreCurso] = useState('');
  const [codigoCurso, setCodigoCurso] = useState('');
  const [duracionCurso, setDuracionCurso] = useState('');
  const [costoCurso, setCostoCurso] = useState('');
  const [descripcion, setDescripcion] = useState('');

  // Traer los cursos desde backend cuando el componente carga
  useEffect(() => {
    fetch('http://localhost:3001/cursos') // Ajusta el URL a tu backend
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCursos(data.cursos);
        }
      })
      .catch(err => {
        console.error('Error al cargar cursos:', err);
      });
  }, []);

  // Manejo del submit del formulario para crear nuevo curso
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Validaciones detalladas
    if (nombreCurso.trim().length < 3) {
      alert('El nombre del curso debe tener al menos 3 caracteres.');
      return;
    }

    // Código de curso: 3 letras mayúsculas + 3 números
    const codigoPattern = /^[A-Z]{3}\d{3}$/;
    if (!codigoPattern.test(codigoCurso.toUpperCase())) {
      alert('El código del curso debe tener formato AAA999 (3 letras mayúsculas y 3 números).');
      return;
    }

    if (duracionCurso.trim().length < 3) {
      alert('Por favor, ingresa una duración válida.');
      return;
    }

    // Validar costo (número positivo)
    const costoNumero = parseFloat(costoCurso.replace(/[^0-9.]/g, ''));
    if (isNaN(costoNumero) || costoNumero <= 5000) {
      alert('El costo del curso debe ser un número mayor que 5000 y no puede ser 0');
      return;
    }

    if (descripcion.trim().length < 10) {
      alert('La descripción debe tener al menos 10 caracteres.');
      return;
    }

    // Si pasa todas las validaciones, preparar y enviar datos
    const nuevoCurso = {
      nombre_curso: nombreCurso.trim(),
      codigo_curso: codigoCurso.toUpperCase(),
      duracion_curso: duracionCurso.trim(),
      costo_curso: costoNumero,
      descripcion: descripcion.trim(),
    };

    // Envío a backend
    fetch('http://localhost:3001/cursos/crear-curso', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoCurso),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCursos(prev => [
            ...prev,
            {
              id_curso: data.id,
              ...nuevoCurso,
            },
          ]);
          // Limpiar formulario
          setNombreCurso('');
          setCodigoCurso('');
          setDuracionCurso('');
          setCostoCurso('');
          setDescripcion('');
        } else {
          alert('Error al crear el curso');
        }
      })
      .catch(err => {
        console.error('Error al crear el curso:', err);
      });
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
              <input
                type="text"
                placeholder="Ej: Matemáticas Básicas"
                value={nombreCurso}
                onChange={e => setNombreCurso(e.target.value)}
              />
            </label>

            <label>
              Código del Curso:
              <input
                type="text"
                placeholder="Ej: MAT101"
                value={codigoCurso}
                onChange={e => setCodigoCurso(e.target.value.toUpperCase())}
                maxLength={6}
              />
            </label>

            <label>
              Duración del Curso:
              <input
                type="text"
                placeholder="Ej: 3 meses, 40 horas"
                value={duracionCurso}
                onChange={e => setDuracionCurso(e.target.value)}
              />
            </label>

            <label>
              Costo del Curso:
              <input
                type="text"
                placeholder="Ej: $150.000"
                value={costoCurso}
                onChange={e => setCostoCurso(e.target.value)}
              />
            </label>

            <label>
              Descripción:
              <textarea
                placeholder="Descripción breve del curso..."
                rows={4}
                value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
              ></textarea>
            </label>

            <button type="submit" className="btn-crear-curso">
              Crear Curso
            </button>
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
                </tr>
              </thead>
              <tbody>
                {cursos.map(curso => (
                  <tr key={curso.id_curso}>
                    <td>{curso.nombre_curso}</td>
                    <td>{curso.codigo_curso}</td>
                    <td>{curso.duracion_curso}</td>
                    <td>${curso.costo_curso.toLocaleString()}</td>
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
