import { useAdmin } from "../context/AdminContext";
import FinanzaAdmiV1 from "../pages/FinanzaAdmi";
import FinanzasAlumno from "../pages/FinanzaAlumno";


export default function FinanzasViews() {
  const { tipoUsuario } = useAdmin();

  if (tipoUsuario === "admi") {
    return <FinanzaAdmiV1 />;
  } else if (tipoUsuario === "alumno") {
    return <FinanzasAlumno />;
  } else {
    return <p>No autorizado para ver esta sección.</p>;
  }
}
