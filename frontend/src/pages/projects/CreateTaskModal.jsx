import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { X, Plus, Trash2, Calendar, AlertCircle, Flag } from 'lucide-react';

const CreateTaskModal = ({ isOpen, onClose, onTaskCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [subTasks, setSubTasks] = useState(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setDescription('');
      setDueDate('');
      setPriority('medium');
      setSubTasks(['']);
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddSubTask = () => {
    setSubTasks((prev) => [...prev, '']);
  };

  const handleSubTaskChange = (index, value) => {
    setSubTasks((prev) => prev.map((item, i) => (i === index ? value : item)));
  };

  const handleRemoveSubTask = (index) => {
    setSubTasks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formattedSubTasks = subTasks
        .map((st) => st.trim())
        .filter(Boolean)
        .map((text) => ({ text, isCompleted: false }));

      const payload = {
        title: title.trim(),
        description: description.trim(),
        priority,
        subTasks: formattedSubTasks,
      };

      if (dueDate) {
        payload.dueDate = dueDate;
      }

      const response = await api.post('/tasks', payload);

      if (response.data && response.data.success) {
        onTaskCreated(response.data.data);
        onClose();
      } else {
        setError(response.data?.message || 'Failed to create task.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="w-full max-w-lg bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 id="modal-title" className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block"></span>
            Create New Task
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-background transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Task Title <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Design CRM Dashboard UI"
              className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors text-sm"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details, notes, or acceptance criteria..."
              rows={3}
              className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors text-sm resize-none"
            />
          </div>

          {/* Due Date & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
                <Calendar size={15} className="text-gray-400" />
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors text-sm"
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
                <Flag size={15} className="text-gray-400" />
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors text-sm"
              >
                <option value="low" className="bg-surface text-white">Low</option>
                <option value="medium" className="bg-surface text-white">Medium</option>
                <option value="high" className="bg-surface text-white">High</option>
              </select>
            </div>
          </div>

          {/* Dynamic Sub-tasks */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">
                Sub-tasks
              </label>
              <button
                type="button"
                onClick={handleAddSubTask}
                className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors"
              >
                <Plus size={14} /> Add Sub-task
              </button>
            </div>

            <div className="space-y-2">
              {subTasks.map((subTask, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-mono w-4 text-center">
                    {index + 1}.
                  </span>
                  <input
                    type="text"
                    value={subTask}
                    onChange={(e) => handleSubTaskChange(index, e.target.value)}
                    placeholder={`Sub-task #${index + 1}`}
                    className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors text-sm"
                  />
                  {subTasks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSubTask(index)}
                      className="text-gray-500 hover:text-red-400 p-2 rounded-lg hover:bg-background transition-colors"
                      title="Remove sub-task"
                      aria-label="Remove sub-task"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white bg-background hover:bg-surface border border-border rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                  Creating...
                </>
              ) : (
                'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
