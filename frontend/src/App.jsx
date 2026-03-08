import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { Reorder, AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Sun,
  Moon,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Search,
  Tag,
  Calendar,
  LogOut,
} from "lucide-react";
import "./index.css";
import Login from "./components/Login";
import Register from "./components/Register";

// Django SimpleJWT guarda el identificador del usuario como "user_id", no como "username"
const getUsernameFromToken = (tkn) => {
  try {
    return JSON.parse(atob(tkn.split(".")[1])).user_id;
  } catch {
    return "default";
  }
};

// Extraigo el username legible del token para mostrarlo en el menú de usuario
const getDisplayNameFromToken = (tkn) => {
  try {
    return JSON.parse(atob(tkn.split(".")[1])).username;
  } catch {
    return "Usuario";
  }
};

function App() {
  // Leo el token de localStorage (recuérdame activado) o sessionStorage (sesión temporal)
  const [token, setToken] = useState(
    localStorage.getItem("access") || sessionStorage.getItem("access") || "",
  );
  const [showRegister, setShowRegister] = useState(false);

  const [tasks, setTasks] = useState([]);

  // Inicializo en false — el useEffect cargará la preferencia correcta del usuario una vez logueado
  const [darkMode, setDarkMode] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");

  // Controlo qué campo de qué tarea está en modo edición inline
  // editingField = { id: number, field: "title" | "description" }
  const [editingField, setEditingField] = useState(null);

  // Valor temporal mientras el usuario edita, antes de guardar en el backend
  const [editingValue, setEditingValue] = useState("");

  // Guardo el ID de la tarea que está esperando confirmación de borrado
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Controlo si el menú desplegable de usuario está abierto o cerrado
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Referencia al menú para detectar clics fuera y cerrarlo automáticamente
  const userMenuRef = useRef(null);

  // Guardo el número anterior de tareas completadas para detectar cuándo se completan todas
  const prevDoneRef = useRef(0);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    status: "Pending",
    due_date: "",
    category: "General",
  });

  const API_URL =
    import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/tasks/";

  const fetchTasks = useCallback(() => {
    if (!token) return;
    axios
      .get(`${API_URL}?t=${new Date().getTime()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const sortedTasks = res.data.sort((a, b) => b.id - a.id);
        setTasks(sortedTasks);
      });
  }, [token]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    if (!token) return;
    const username = getUsernameFromToken(token);
    const savedDark = localStorage.getItem(`darkMode_${username}`) === "true";
    setDarkMode(savedDark);
  }, [token]);

  // Cierro el menú de usuario al hacer clic fuera de él
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Disparo el confeti cuando todas las tareas pasan a estar completadas
  // Solo se activa si había tareas pendientes antes (evita confeti al cargar la página)
  useEffect(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === "Completed").length;

    if (total > 0 && done === total && prevDoneRef.current < total) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
      });
    }

    // Actualizo la referencia con el número actual de completadas para la próxima comparación
    prevDoneRef.current = done;
  }, [tasks]);

  if (!token) {
    return showRegister ? (
      <Register
        onRegister={setToken}
        goToLogin={() => setShowRegister(false)}
      />
    ) : (
      <Login onLogin={setToken} goToRegister={() => setShowRegister(true)} />
    );
  }

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "Pending").length,
    progress: tasks.filter((t) => t.status === "In Progress").length,
    done: tasks.filter((t) => t.status === "Completed").length,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) return;
    const dataToSend = { ...formData, due_date: formData.due_date || null };
    try {
      await axios.post(API_URL, dataToSend, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFormData({
        title: "",
        description: "",
        priority: "Medium",
        status: "Pending",
        due_date: "",
        category: "General",
      });
      fetchTasks();
    } catch (err) {
      console.error("Error al guardar la tarea:", err.response?.data);
    }
  };

  // Elimino la tarea del estado local y del backend tras confirmación del usuario
  const deleteTask = (id) => {
    setTasks(tasks.filter((t) => t.id !== id));
    setConfirmDeleteId(null);
    axios.delete(`${API_URL}${id}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const updateTask = (id, field, value) => {
    const finalValue = field === "due_date" && !value ? null : value;
    axios
      .patch(
        `${API_URL}${id}/`,
        { [field]: finalValue },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      .then(() => {
        setTasks(
          tasks.map((t) => (t.id === id ? { ...t, [field]: value } : t)),
        );
      });
  };

  // Activo el modo edición inline al hacer doble clic en título o descripción
  const startEditing = (task, field) => {
    setEditingField({ id: task.id, field });
    setEditingValue(task[field] || "");
  };

  // Guardo los cambios en el backend al salir del campo (onBlur) o pulsar Enter
  const saveEditing = () => {
    if (!editingField) return;
    // Solo guardo si el valor ha cambiado para evitar llamadas innecesarias al backend
    const original =
      tasks.find((t) => t.id === editingField.id)?.[editingField.field] || "";
    if (editingValue.trim() !== original) {
      updateTask(editingField.id, editingField.field, editingValue.trim());
    }
    setEditingField(null);
    setEditingValue("");
  };

  // Cancelo la edición con Escape sin guardar cambios
  const cancelEditing = (e) => {
    if (e.key === "Escape") {
      setEditingField(null);
      setEditingValue("");
    }
    // Guardo con Enter en el título (no en descripción para permitir saltos de línea)
    if (e.key === "Enter" && editingField?.field === "title") {
      saveEditing();
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority =
      filterPriority === "All" || task.priority === filterPriority;
    const matchesStatus =
      filterStatus === "All" || task.status === filterStatus;
    const matchesCategory =
      filterCategory === "All" || task.category === filterCategory;
    return matchesSearch && matchesPriority && matchesStatus && matchesCategory;
  });

  const getPriorityClasses = (p) => {
    if (p === "High")
      return {
        border: "border-l-red-600",
        text: "text-red-600",
        bg: "bg-red-50",
      };
    if (p === "Medium")
      return {
        border: "border-l-orange-400",
        text: "text-orange-500",
        bg: "bg-orange-50",
      };
    if (p === "Low")
      return {
        border: "border-l-emerald-500",
        text: "text-emerald-600",
        bg: "bg-emerald-50",
      };
    return {
      border: "border-l-slate-300",
      text: "text-slate-500",
      bg: "bg-slate-50",
    };
  };

  const getStatusClasses = (s) => {
    if (s === "Pending") return { bg: "bg-red-100", text: "text-red-700" };
    if (s === "In Progress")
      return { bg: "bg-orange-100", text: "text-orange-700" };
    if (s === "Completed")
      return { bg: "bg-emerald-100", text: "text-emerald-700" };
    return { bg: "bg-slate-100", text: "text-slate-700" };
  };

  // Compruebo si una tarea está vencida: tiene fecha, esa fecha ya pasó y no está completada
  const isOverdue = (task) =>
    task.due_date &&
    new Date(task.due_date) < new Date() &&
    task.status !== "Completed";

  // Extraigo el nombre del usuario logueado para mostrarlo en el menú
  const displayName = getDisplayNameFromToken(token);

  // Genero la inicial del nombre para el avatar circular
  const avatarLetter = displayName?.charAt(0).toUpperCase() || "?";

  return (
    <div
      className={`min-h-screen transition-all duration-500 ${darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"} p-6 md:p-12 font-sans`}
    >
      <div className="max-w-5xl mx-auto">
        {/* HEADER CON LOGO Y MENÚ DE USUARIO */}
        <header className="mb-8 flex justify-between items-center border-b border-slate-200 pb-6">
          <h1 className="text-3xl font-black tracking-tighter italic">
            TASKFLOW <span className="text-blue-600 font-light">PRO</span>
          </h1>

          {/* MENÚ DE USUARIO: avatar con inicial que abre un dropdown con dark mode y logout */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-11 h-11 rounded-2xl bg-blue-600 text-white font-black text-sm shadow-lg flex items-center justify-center hover:bg-blue-700 transition-all active:scale-95"
            >
              {avatarLetter}
            </button>

            {/* DROPDOWN: se muestra solo cuando userMenuOpen es true */}
            {userMenuOpen && (
              <div
                className={`absolute right-0 mt-2 w-52 rounded-2xl shadow-xl border z-50 overflow-hidden ${
                  darkMode
                    ? "bg-slate-900 border-slate-700"
                    : "bg-white border-slate-100"
                }`}
              >
                {/* Nombre del usuario logueado */}
                <div
                  className={`px-4 py-3 border-b ${darkMode ? "border-slate-700" : "border-slate-100"}`}
                >
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">
                    Logged in as
                  </p>
                  <p className="text-sm font-black mt-0.5 truncate">
                    {displayName}
                  </p>
                </div>

                {/* Botón de dark mode dentro del menú */}
                <button
                  onClick={() => {
                    const next = !darkMode;
                    localStorage.setItem(
                      `darkMode_${getUsernameFromToken(token)}`,
                      next,
                    );
                    setDarkMode(next);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-colors ${
                    darkMode
                      ? "hover:bg-slate-800 text-yellow-400"
                      : "hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                  {darkMode ? "Light mode" : "Dark mode"}
                </button>

                {/* Botón de logout: limpia tareas y tokens pero NO el darkMode del usuario */}
                <button
                  onClick={() => {
                    setTasks([]);
                    setToken("");
                    setUserMenuOpen(false);
                    localStorage.removeItem("access");
                    localStorage.removeItem("refresh");
                    sessionStorage.removeItem("access");
                    sessionStorage.removeItem("refresh");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* DASHBOARD DE ESTADÍSTICAS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Total", v: stats.total, c: "text-blue-500" },
            { label: "Pending", v: stats.pending, c: "text-red-500" },
            { label: "Active", v: stats.progress, c: "text-orange-500" },
            { label: "Done", v: stats.done, c: "text-emerald-500" },
          ].map((s, i) => (
            <div
              key={i}
              className={`${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"} p-5 rounded-4xl border shadow-sm text-center`}
            >
              <p className={`text-3xl font-black ${s.c}`}>{s.v}</p>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* BARRA DE BÚSQUEDA Y FILTROS AVANZADOS */}
        <div className="mb-10 flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <input
              className={`w-full ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} p-4 px-12 rounded-2xl outline-none shadow-sm text-sm`}
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search
              className="absolute left-4 top-4 text-slate-400"
              size={20}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              className={`${darkMode ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-500"} p-4 rounded-2xl text-xs font-bold outline-none shadow-sm min-w-32`}
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="All">Priority: All</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <select
              className={`${darkMode ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-500"} p-4 rounded-2xl text-xs font-bold outline-none shadow-sm min-w-32`}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">Status: All</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
            <select
              className={`${darkMode ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-500"} p-4 rounded-2xl text-xs font-bold outline-none shadow-sm min-w-32`}
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="All">Tag: All</option>
              <option value="General">General</option>
              <option value="Work">Work</option>
              <option value="Home">Home</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* FORMULARIO DE CREACIÓN */}
        <form
          onSubmit={handleSubmit}
          className={`${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} p-8 rounded-[2.5rem] mb-12 shadow-xl border`}
        >
          <div className="grid grid-cols-1 gap-5">
            <input
              className={`${darkMode ? "bg-slate-800 text-white" : "bg-slate-50 text-slate-900"} border-none p-5 rounded-2xl outline-none text-xl font-bold placeholder:text-slate-400`}
              placeholder="Task title..."
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
            <textarea
              className={`${darkMode ? "bg-slate-800 text-white" : "bg-slate-50 text-slate-900"} border-none p-5 rounded-2xl outline-none text-sm font-medium h-24 placeholder:text-slate-400 resize-none`}
              placeholder="Task details..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <select
                className={`${darkMode ? "bg-slate-800" : "bg-slate-100"} p-4 rounded-2xl text-xs font-bold outline-none`}
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              >
                <option value="General">🏷️ General</option>
                <option value="Work">💼 Work</option>
                <option value="Home">🏠 Home</option>
                <option value="Urgent">🔥 Urgent</option>
              </select>
              <select
                className={`${darkMode ? "bg-slate-800" : "bg-slate-100"} p-4 rounded-2xl text-xs font-bold outline-none ${getPriorityClasses(formData.priority).text}`}
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
              >
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
              <select
                className={`${darkMode ? "bg-slate-800" : "bg-slate-100"} p-4 rounded-2xl text-xs font-bold outline-none ${getStatusClasses(formData.status).text}`}
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
              <input
                type="date"
                className={`${darkMode ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"} p-4 rounded-2xl text-xs font-bold outline-none`}
                value={formData.due_date}
                onChange={(e) =>
                  setFormData({ ...formData, due_date: e.target.value })
                }
              />
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white p-5 rounded-2xl font-black text-sm transition-all shadow-lg flex items-center justify-center gap-3 active:scale-95">
              <Plus size={20} /> ADD
            </button>
          </div>
        </form>

        {/* PANTALLA VACÍA: se muestra cuando no hay tareas creadas todavía */}
        {tasks.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <p className="text-6xl mb-4">🚀</p>
            <p
              className={`text-2xl font-black tracking-tight ${darkMode ? "text-slate-300" : "text-slate-700"}`}
            >
              No tasks yet.
            </p>
            <p
              className={`text-sm mt-2 font-medium ${darkMode ? "text-slate-500" : "text-slate-400"}`}
            >
              Let's get productive! Add your first task above.
            </p>
          </motion.div>
        )}

        {/* LISTADO INTERACTIVO CON DRAG & DROP */}
        <Reorder.Group
          axis="y"
          values={tasks}
          onReorder={setTasks}
          className="space-y-4"
        >
          <AnimatePresence>
            {filteredTasks.map((task) => {
              const prio = getPriorityClasses(task.priority);
              const stat = getStatusClasses(task.status);
              const overdue = isOverdue(task);

              // Compruebo si este campo concreto de esta tarea está en modo edición
              const isEditingTitle =
                editingField?.id === task.id && editingField?.field === "title";
              const isEditingDesc =
                editingField?.id === task.id &&
                editingField?.field === "description";

              // Compruebo si esta tarea está esperando confirmación de borrado
              const isPendingDelete = confirmDeleteId === task.id;

              return (
                <Reorder.Item
                  key={task.id}
                  value={task}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"} border-l-[6px] ${prio.border} rounded-4xl p-6 shadow-sm border group cursor-grab active:cursor-grabbing`}
                >
                  <div className="flex items-center gap-5">
                    <button
                      onClick={() =>
                        updateTask(
                          task.id,
                          "status",
                          task.status === "Completed" ? "Pending" : "Completed",
                        )
                      }
                      className={`transition-all transform hover:scale-110 ${task.status === "Completed" ? "text-emerald-500" : "text-slate-300"}`}
                    >
                      {task.status === "Completed" ? (
                        <CheckCircle2 size={28} />
                      ) : (
                        <Circle size={28} />
                      )}
                    </button>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {/* TÍTULO: doble clic activa edición inline, Enter o blur guarda, Escape cancela */}
                        {isEditingTitle ? (
                          <input
                            autoFocus
                            className="text-lg font-bold tracking-tight bg-transparent border-b-2 border-blue-500 outline-none w-full"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onBlur={saveEditing}
                            onKeyDown={cancelEditing}
                          />
                        ) : (
                          <h3
                            onDoubleClick={() => startEditing(task, "title")}
                            title="Doble clic para editar"
                            className={`text-lg font-bold tracking-tight cursor-text hover:opacity-70 transition-opacity ${task.status === "Completed" ? "line-through text-slate-500 opacity-60" : ""}`}
                          >
                            {task.title}
                          </h3>
                        )}

                        <select
                          value={task.priority}
                          onChange={(e) =>
                            updateTask(task.id, "priority", e.target.value)
                          }
                          className={`text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider border-none outline-none cursor-pointer ${prio.bg} ${prio.text}`}
                        >
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                        </select>
                        <select
                          value={task.status}
                          onChange={(e) =>
                            updateTask(task.id, "status", e.target.value)
                          }
                          className={`text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider border-none outline-none cursor-pointer ${stat.bg} ${stat.text}`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                        <div
                          className={`flex items-center gap-1 ${darkMode ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"} px-2.5 py-1 rounded-full font-bold border ${darkMode ? "border-slate-700" : "border-slate-200"}`}
                        >
                          <Tag size={10} />
                          <select
                            value={task.category || "General"}
                            onChange={(e) =>
                              updateTask(task.id, "category", e.target.value)
                            }
                            className="text-[9px] bg-transparent border-none outline-none font-bold uppercase cursor-pointer"
                          >
                            <option value="General">General</option>
                            <option value="Work">Work</option>
                            <option value="Home">Home</option>
                            <option value="Urgent">Urgent</option>
                          </select>
                        </div>
                      </div>

                      {/* DESCRIPCIÓN: doble clic activa edición inline, blur guarda, Escape cancela */}
                      {isEditingDesc ? (
                        <textarea
                          autoFocus
                          className={`text-sm bg-transparent border-b-2 border-blue-500 outline-none w-full resize-none mb-3 ${darkMode ? "text-slate-300" : "text-slate-600"}`}
                          rows={2}
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onBlur={saveEditing}
                          onKeyDown={cancelEditing}
                        />
                      ) : (
                        <p
                          onDoubleClick={() =>
                            startEditing(task, "description")
                          }
                          title="Doble clic para editar"
                          className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"} leading-relaxed mb-3 cursor-text hover:opacity-70 transition-opacity`}
                        >
                          {task.description || "No description provided."}
                        </p>
                      )}

                      {/* CAMPO DE FECHA: se pone rojo y parpadea si la tarea está vencida y no completada */}
                      <div
                        className={`flex items-center gap-2 text-[10px] font-bold w-fit px-3 py-1 rounded-lg ${
                          overdue
                            ? "text-red-500 bg-red-50 animate-pulse"
                            : darkMode
                              ? "text-blue-400 bg-blue-900/30"
                              : "text-blue-500 bg-blue-50"
                        }`}
                      >
                        <Calendar size={12} />
                        <span className="mr-1 uppercase tracking-tighter">
                          {overdue ? "⚠ Overdue:" : "Deadline:"}
                        </span>
                        <input
                          type="date"
                          value={task.due_date || ""}
                          onChange={(e) =>
                            updateTask(task.id, "due_date", e.target.value)
                          }
                          className="bg-transparent border-none outline-none text-[10px] font-bold cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* BOTÓN DE BORRADO: primer clic pide confirmación, segundo clic borra definitivamente */}
                    <div className="flex flex-col items-center gap-1">
                      {isPendingDelete ? (
                        // Estado de confirmación: muestra dos botones para confirmar o cancelar
                        <div className="flex gap-1">
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="px-2 py-1 rounded-xl bg-red-500 text-white text-[10px] font-black hover:bg-red-600 transition-all"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className={`px-2 py-1 rounded-xl text-[10px] font-black transition-all ${darkMode ? "bg-slate-700 text-slate-300 hover:bg-slate-600" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        // Estado normal: icono de papelera que activa la confirmación al hacer clic
                        <button
                          onClick={() => setConfirmDeleteId(task.id)}
                          className="p-2 rounded-xl transition-all duration-300 opacity-20 group-hover:opacity-100 flex items-center justify-center hover:scale-125 hover:bg-red-500/20 text-slate-400 hover:text-red-600"
                        >
                          <Trash2 size={22} />
                        </button>
                      )}
                    </div>
                  </div>
                </Reorder.Item>
              );
            })}
          </AnimatePresence>
        </Reorder.Group>
      </div>
    </div>
  );
}

export default App;
