import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import api from '../../api/axios';
import CreateTaskModal from './CreateTaskModal';
import {
  List,
  Kanban,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  RefreshCw,
  AlertCircle,
  CheckSquare,
} from 'lucide-react';

const COLUMNS = [
  {
    id: 'todo',
    title: 'To Do',
    badgeClass: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    dotClass: 'bg-amber-400',
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    badgeClass: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    dotClass: 'bg-blue-400',
  },
  {
    id: 'completed',
    title: 'Completed',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    dotClass: 'bg-emerald-400',
  },
];

const PersonalTodo = () => {
  const [tasks, setTasks] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'kanban' (defaults to 'list')
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/tasks');
      if (response.data && response.data.success) {
        setTasks(response.data.data || []);
      } else if (Array.isArray(response.data)) {
        setTasks(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCreated = (newTask) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  // Toggle task completion from List View checkbox
  const toggleTaskStatus = async (task) => {
    const isDone = task.status === 'completed';
    const newStatus = isDone ? 'todo' : 'completed';
    const previousTasks = [...tasks];

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t._id === task._id ? { ...t, status: newStatus } : t))
    );

    try {
      await api.put(`/tasks/${task._id}/status`, { status: newStatus });
    } catch (err) {
      setTasks(previousTasks);
      setError(err.response?.data?.message || 'Failed to update task status.');
    }
  };

  // Drag and drop handler for Kanban view
  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId;
    const taskToUpdate = tasks.find((t) => t._id === draggableId);
    if (!taskToUpdate) return;

    const previousTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) => (t._id === draggableId ? { ...t, status: newStatus } : t))
    );

    try {
      await api.put(`/tasks/${draggableId}/status`, { status: newStatus });
    } catch (err) {
      setTasks(previousTasks);
      setError(err.response?.data?.message || 'Failed to update task status.');
    }
  };

  // Format date helper: shows "Tomorrow" if due tomorrow, else formatted date
  const formatDueDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const diffMs = target.getTime() - today.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === 0) return 'Today';
    if (diffDays === -1) return 'Yesterday';

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: target.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  };

  // Priority badge styling helper
  const getPriorityBadge = (priority) => {
    const p = (priority || 'medium').toLowerCase();
    switch (p) {
      case 'high':
        return {
          label: 'HIGH',
          className: 'text-red-400 bg-red-400/10 border-red-400/20',
        };
      case 'low':
        return {
          label: 'LOW',
          className: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
        };
      case 'medium':
      default:
        return {
          label: 'MEDIUM',
          className: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
        };
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-white">
      {/* 1. Header with View Toggle & Create Task Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Personal ToDo</h1>
          <p className="text-gray-400 text-sm mt-1">
            Organize, prioritize, and track all your sprint deliverables.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle Switch */}
          <div className="bg-surface border border-border p-1 rounded-xl flex items-center gap-1">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                viewMode === 'list'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-background'
              }`}
              title="List View"
              aria-label="Switch to List View"
            >
              <List size={16} />
              <span>List</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                viewMode === 'kanban'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-background'
              }`}
              title="Kanban View"
              aria-label="Switch to Kanban View"
            >
              <Kanban size={16} />
              <span>Kanban</span>
            </button>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={fetchTasks}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-white bg-surface hover:bg-surface/80 border border-border rounded-xl transition-colors disabled:opacity-50"
            title="Refresh tasks"
            aria-label="Refresh tasks"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>

          {/* Create Task Button */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-white font-medium px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30"
          >
            <Plus size={18} />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError('')}
            className="text-xs underline hover:text-red-300 ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-surface border border-border rounded-xl p-4 flex items-center gap-4 animate-pulse"
            >
              <div className="w-5 h-5 rounded-full bg-border"></div>
              <div className="flex-1 h-4 bg-border/60 rounded"></div>
              <div className="w-16 h-6 bg-border/40 rounded-md"></div>
              <div className="w-24 h-6 bg-border/40 rounded-md"></div>
            </div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-12 text-center text-gray-400">
          <Clock size={36} className="mx-auto mb-3 opacity-40 text-primary" />
          <h3 className="text-lg font-semibold text-white mb-1">No tasks yet</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto mb-5">
            You are all caught up! Click "Create Task" to add your first sprint item.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors inline-flex items-center gap-2"
          >
            <Plus size={16} /> Create Task
          </button>
        </div>
      ) : viewMode === 'list' ? (
        /* 2. The Premium List View */
        <div className="flex flex-col gap-3">
          {tasks.map((task) => {
            const priorityInfo = getPriorityBadge(task.priority);
            const formattedDate = formatDueDate(task.dueDate);
            const isCompleted = task.status === 'completed';

            return (
              <div
                key={task._id}
                className="bg-surface border border-border rounded-xl p-4 flex items-center gap-4 hover:border-primary/40 transition-colors group"
              >
                {/* Left side: Checkbox */}
                <button
                  type="button"
                  onClick={() => toggleTaskStatus(task)}
                  className="shrink-0 focus:outline-none transition-transform active:scale-90"
                  aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                >
                  {isCompleted ? (
                    <CheckCircle2
                      size={22}
                      className="text-emerald-400 fill-emerald-400/20"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-600 group-hover:border-primary transition-colors" />
                  )}
                </button>

                {/* Middle: Task title */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium truncate ${
                      isCompleted ? 'line-through text-gray-500' : 'text-white'
                    }`}
                  >
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {task.description}
                    </p>
                  )}
                </div>

                {/* Right side tags: Priority and Date */}
                <div className="flex items-center gap-3 shrink-0 ml-auto">
                  {/* Priority Tag */}
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${priorityInfo.className}`}
                  >
                    {priorityInfo.label}
                  </span>

                  {/* Date Tag */}
                  {formattedDate && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-background border border-border px-2.5 py-1 rounded-md">
                      <Calendar size={13} className="text-gray-400" />
                      <span>{formattedDate}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* 3. The Kanban View */
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {COLUMNS.map((column) => {
              const columnTasks = tasks.filter((t) => (t.status || 'todo') === column.id);

              return (
                <div
                  key={column.id}
                  className="bg-surface/60 border border-border rounded-2xl p-4 flex flex-col min-h-[500px]"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${column.dotClass}`}></span>
                      <h3 className="font-semibold text-white text-base">{column.title}</h3>
                    </div>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${column.badgeClass}`}>
                      {columnTasks.length}
                    </span>
                  </div>

                  {/* Droppable Area */}
                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 space-y-3 rounded-xl transition-colors p-1 ${
                          snapshot.isDraggingOver
                            ? 'bg-primary/5 border-2 border-dashed border-primary/40'
                            : ''
                        }`}
                      >
                        {columnTasks.length === 0 ? (
                          <div className="h-40 flex flex-col items-center justify-center border border-dashed border-border/80 rounded-xl text-gray-500 text-xs text-center p-4">
                            <Clock size={24} className="mb-2 opacity-40" />
                            <span>No tasks in {column.title}</span>
                          </div>
                        ) : (
                          columnTasks.map((task, index) => {
                            const priorityInfo = getPriorityBadge(task.priority);
                            const formattedDate = formatDueDate(task.dueDate);
                            const completedSubtasks =
                              task.subTasks?.filter((st) => st.isCompleted)?.length || 0;
                            const totalSubtasks = task.subTasks?.length || 0;

                            return (
                              <Draggable
                                key={task._id}
                                draggableId={task._id}
                                index={index}
                              >
                                {(dragProvided, dragSnapshot) => (
                                  <div
                                    ref={dragProvided.innerRef}
                                    {...dragProvided.draggableProps}
                                    {...dragProvided.dragHandleProps}
                                    className={`bg-surface border rounded-xl p-4 transition-all duration-200 select-none group ${
                                      dragSnapshot.isDragging
                                        ? 'border-primary ring-2 ring-primary/30 shadow-2xl scale-[1.02] bg-surface z-50'
                                        : 'border-border hover:border-primary/50 shadow-sm'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                      <h4
                                        className={`font-semibold text-sm leading-snug group-hover:text-primary transition-colors ${
                                          task.status === 'completed'
                                            ? 'line-through text-gray-500'
                                            : 'text-white'
                                        }`}
                                      >
                                        {task.title}
                                      </h4>
                                      <span
                                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border shrink-0 ${priorityInfo.className}`}
                                      >
                                        {priorityInfo.label}
                                      </span>
                                    </div>

                                    {task.description && (
                                      <p className="text-gray-400 text-xs line-clamp-2 mb-3">
                                        {task.description}
                                      </p>
                                    )}

                                    {/* Sub-tasks Progress */}
                                    {totalSubtasks > 0 && (
                                      <div className="mb-3 p-2 bg-background/60 rounded-lg border border-border/60">
                                        <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1.5">
                                          <span className="flex items-center gap-1.5 font-medium">
                                            <CheckSquare size={13} className="text-primary" />
                                            Sub-tasks
                                          </span>
                                          <span className="font-mono">
                                            {completedSubtasks}/{totalSubtasks}
                                          </span>
                                        </div>
                                        <div className="w-full bg-border h-1.5 rounded-full overflow-hidden">
                                          <div
                                            className="bg-primary h-full rounded-full transition-all duration-300"
                                            style={{
                                              width: `${(completedSubtasks / totalSubtasks) * 100}%`,
                                            }}
                                          ></div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Card Footer: Due Date */}
                                    {formattedDate && (
                                      <div className="flex items-center justify-between text-[11px] pt-2 border-t border-border/60 text-gray-400">
                                        <span className="flex items-center gap-1">
                                          <Calendar size={12} />
                                          {formattedDate}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </Draggable>
                            );
                          })
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      )}

      {/* 4. Modular Create Task Modal */}
      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  );
};

export default PersonalTodo;
