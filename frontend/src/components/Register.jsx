import { useState } from "react";
import axios from "axios";

// Elimino solo "tasks/" para evitar la doble barra en la URL de auth
const BASE_URL =
  import.meta.env.VITE_API_URL?.replace("tasks/", "") ||
  "http://127.0.0.1:8000/api/";

export default function Register({ onRegister, goToLogin }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Registro al usuario y hago login automático para no pedirle que vuelva a entrar
      await axios.post(`${BASE_URL}auth/register/`, formData);
      const res = await axios.post(`${BASE_URL}auth/login/`, {
        username: formData.username,
        password: formData.password,
      });
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      onRegister(res.data.access);
    } catch (err) {
      setError(err.response?.data?.username?.[0] || "Error al registrarse");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl p-10 w-full max-w-md">
        <h1 className="text-3xl font-black tracking-tighter italic mb-2">
          TASKFLOW <span className="text-blue-600 font-light">PRO</span>
        </h1>
        <p className="text-slate-400 text-sm mb-8">Crea tu cuenta gratis</p>

        {/* Muestro el error solo si existe */}
        {error && (
          <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-xl">
            {error}
          </p>
        )}

        <div className="space-y-4">
          {/* autoComplete="off" evita que el navegador rellene con datos de otro usuario */}
          <input
            autoComplete="off"
            className="w-full bg-slate-50 p-4 rounded-2xl outline-none text-sm font-medium"
            placeholder="Usuario"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
          />
          <input
            type="email"
            autoComplete="off"
            className="w-full bg-slate-50 p-4 rounded-2xl outline-none text-sm font-medium"
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
          {/* new-password indica al navegador que es un campo nuevo, no un login existente */}
          <input
            type="password"
            autoComplete="new-password"
            className="w-full bg-slate-50 p-4 rounded-2xl outline-none text-sm font-medium"
            placeholder="Contraseña"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-2xl font-black text-sm transition-all shadow-lg active:scale-95"
          >
            CREAR CUENTA
          </button>
        </div>

        <p className="text-center text-sm text-slate-400 mt-6">
          ¿Ya tienes cuenta?{" "}
          <button
            onClick={goToLogin}
            className="text-blue-600 font-bold hover:underline"
          >
            Inicia sesión
          </button>
        </p>
      </div>
    </div>
  );
}
