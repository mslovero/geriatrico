import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { post } from "../api/api";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("enfermero");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await post("/register", { name, email, password, role });
      localStorage.setItem("token", res.access_token);

      await login(email, password);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Error al registrar. Verifique los datos.");
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div
        className="card shadow p-4"
        style={{ maxWidth: "400px", width: "100%" }}
      >
        <div className="text-center mb-4">
          <i
            className="bi bi-person-plus-fill text-primary"
            style={{ fontSize: "3rem" }}
          ></i>
          <h3 className="mt-2">Crear Cuenta</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Nombre</label>
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Rol</label>
            <select
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="admin">Director / Admin</option>
              <option value="medico">Médico</option>
              <option value="enfermero">Enfermero</option>
              <option value="administrativo">Administrativo</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="8"
            />
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          <button type="submit" className="btn btn-primary w-100 mb-3">
            Registrarse
          </button>
          <div className="text-center">
            <Link to="/login" className="text-decoration-none">
              ¿Ya tienes cuenta? Ingresa aquí
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
