import { Route, Routes } from "react-router-dom";
import PerfilA from "../pages/PerfilA";
import Asistencia from "../pages/Asistencia";
import Home from "../pages/Home";
import Login from "../pages/Login";
import MatriculaA from "../pages/Matricula";
import { AdminProvider } from "../context/AdminContext";
import CrearU from "../pages/CrearU";
import FinanzasViews from "./FinanzasViews";
import PrivateRoute from "../components/PrivateRoute";
import CursosCrear from "../pages/Cursos";
import NuevoTipoUsuario from "../pages/IngresarTU";
import Becas from "../pages/Becas";

export default function Rutas() {
  return (
    <AdminProvider>
      <Routes>
        {/* Ruta pública */}
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          } />

        {/* Rutas protegidas */}
        <Route
          path="/matricula-alumno"
          element={
            <PrivateRoute>
              <MatriculaA />
            </PrivateRoute>
          }
        />
        <Route
          path="/crear-usuario"
          element={
            <PrivateRoute>
              <CrearU />
            </PrivateRoute>
          }
        />
        <Route
          path="/finanzas"
          element={
            <PrivateRoute>
              <FinanzasViews />
            </PrivateRoute>
          }
        />
        <Route
          path="/perfilA"
          element={
            <PrivateRoute>
              <PerfilA />
            </PrivateRoute>
          }
        />
        <Route
          path="/asistencia"
          element={
            <PrivateRoute>
              <Asistencia />
            </PrivateRoute>
          }
        />
        <Route
          path="/cursos"
          element={
            <PrivateRoute>
              <CursosCrear />
            </PrivateRoute>
          }
        />
        <Route
          path="/nuevo-tipo-usuario"
          element={
            <PrivateRoute>
              <NuevoTipoUsuario />
            </PrivateRoute>
          }
        />
        <Route
          path="/becas"
          element={
            <PrivateRoute>
              <Becas />
            </PrivateRoute>
          }
        />
      </Routes>
    </AdminProvider>
  );
}
