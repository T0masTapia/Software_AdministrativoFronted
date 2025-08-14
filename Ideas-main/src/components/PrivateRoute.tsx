// components/PrivateRoute.tsx
import { Navigate } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";
import type { JSX } from "react";

interface PrivateRouteProps {
  children: JSX.Element;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { tipoUsuario } = useAdmin();

  if (!tipoUsuario) {
    // No está logeado, redirigir a login
    return <Navigate to="/login" replace />;
  }

  return children;
}
