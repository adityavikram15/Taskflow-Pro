import { useEffect, useState } from "react";
import axios from "axios";
import { motion, Reorder, AnimatePresence } from "framer-motion";
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
} from "lucide-react";
import "./index.css";

function App() {
  // Manejo el estado global de las tareas y los parámetros de la interfaz
  const [tasks, setTasks] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");

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

  // Sincronizo con el backend añadiendo un timestamp para evitar datos antiguos por caché
  const fetchTasks = () => {
    axios.get(`${API_URL}?t=${new Date().getTime()}`).then((res) => {
      // Ordeno por ID descendente para que lo último creado aparezca primero
      const sortedTasks = res.data.sort((a, b) => b.id - a.id);
      setTasks(sortedTasks);
    });
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Calculo métricas en tiempo real basándome en el estado actual de las tareas
  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "Pending").length,
    progress: tasks.filter((t) => t.status === "In Progress").length,
    done: tasks.filter((t) => t.status === "Completed").length,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) return;

    // Normalizo la fecha: si está vacía envío null para que Django la procese correctamente
    const dataToSend = { ...formData, due_date: formData.due_date || null };
    try {
      await axios.post(API_URL, dataToSend);
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
      console.error("Error al guardar la misión:", err.response?.data);
    }
  };

  const deleteTask = (id) => {
    // Actualización optimista: elimino del estado local antes de la confirmación del servidor
    setTasks(tasks.filter((t) => t.id !== id));
    axios.delete(`${API_URL}${id}/`);
  };

  // Actualizo campos individuales mediante PATCH para optimizar el tráfico de red
  const updateTask = (id, field, value) => {
    const finalValue = field === "due_date" && !value ? null : value;
    axios.patch(`${API_URL}${id}/`, { [field]: finalValue }).then(() => {
      // Actualizo solo la tarea modificada en el estado inmutable
      setTasks(tasks.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
    });
  };

  // Lógica de filtrado combinada para búsqueda de texto y etiquetas
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

  return (
    <div
      className={`min-h-screen transition-all duration-500 ${darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"} p-6 md:p-12 font-sans`}
    >
      <div className="max-w-5xl mx-auto">
        {/* HEADER Y CONTROL DE TEMA */}
        <header className="mb-8 flex justify-between items-center border-b border-slate-200 pb-6">
          <h1 className="text-3xl font-black tracking-tighter italic">
            TASKFLOW <span className="text-blue-600 font-light">PRO</span>
          </h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-3 rounded-2xl shadow-lg transition-all ${darkMode ? "bg-slate-800 text-yellow-400" : "bg-white text-slate-500"}`}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
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
              placeholder="Search missions..."
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
              <option value="High" className="text-red-600">
                High
              </option>
              <option value="Medium" className="text-orange-500">
                Medium
              </option>
              <option value="Low" className="text-emerald-600">
                Low
              </option>
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
              <Plus size={20} /> DEPLOY MISSION
            </button>
          </div>
        </form>

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
                        <h3
                          className={`text-lg font-bold tracking-tight ${task.status === "Completed" ? "line-through text-slate-500 opacity-60" : ""}`}
                        >
                          {task.title}
                        </h3>
                        {/* SELECTORES INLINE PARA EDICIÓN RÁPIDA */}
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
                      <p
                        className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"} leading-relaxed mb-3`}
                      >
                        {task.description || "No description provided."}
                      </p>
                      <div
                        className={`flex items-center gap-2 text-[10px] font-bold ${darkMode ? "text-blue-400 bg-blue-900/30" : "text-blue-500 bg-blue-50"} w-fit px-3 py-1 rounded-lg`}
                      >
                        <Calendar size={12} />
                        <span className="mr-1 uppercase tracking-tighter">
                          Deadline:
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

                    <button
                      onClick={() => deleteTask(task.id)}
                      className={`p-2 rounded-xl transition-all duration-300 opacity-20 group-hover:opacity-100 flex items-center justify-center hover:scale-125 hover:bg-red-500/20 text-slate-400 hover:text-red-600`}
                    >
                      <Trash2 size={22} />
                    </button>
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
