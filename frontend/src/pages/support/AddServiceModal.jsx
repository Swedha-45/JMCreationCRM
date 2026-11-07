import { useState, useEffect } from 'react';
import api from '../../api/axios';
import {
  X,
  Briefcase,
  User,
  IndianRupee,
  Calendar,
  AlertCircle,
  Loader2,
  Plus,
} from 'lucide-react';

const AddServiceModal = ({ isOpen, onClose, client, onServiceAdded, interns = [] }) => {
  const [serviceName, setServiceName] = useState('');
  const [personInCharge, setPersonInCharge] = useState('');
  const [agreedPrice, setAgreedPrice] = useState('');
  const [paidAmount, setPaidAmount] = useState('0');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState('Active');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset form on open/close
  useEffect(() => {
    if (!isOpen) {
      setServiceName('');
      setPersonInCharge('');
      setAgreedPrice('');
      setPaidAmount('0');
      setDeadline('');
      setStatus('Active');
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen || !client) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!serviceName.trim()) {
      setError('Service name is required.');
      return;
    }
    if (!agreedPrice || isNaN(Number(agreedPrice))) {
      setError('A valid agreed price is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        serviceName: serviceName.trim(),
        agreedPrice: parseFloat(agreedPrice),
        paidAmount: parseFloat(paidAmount) || 0,
        status: status || 'Active',
      };

      if (personInCharge && /^[0-9a-fA-F]{24}$/.test(personInCharge)) {
        payload.personInCharge = personInCharge;
      }
      if (deadline) {
        payload.deadline = deadline;
      }

      const response = await api.put(`/clients/${client._id}/service`, payload);
      const updatedClient = response.data?.data || response.data;

      if (onServiceAdded) {
        onServiceAdded(updatedClient);
      }
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to add service. Please check your inputs.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-opacity duration-200"
      aria-modal="true"
      role="dialog"
      aria-labelledby="add-service-title"
    >
      <div
        className="bg-surface border border-border rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-surface">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 id="add-service-title" className="text-xl font-bold text-white tracking-tight">
                Add Service
              </h2>
              <p className="text-xs text-gray-400">
                Client: <span className="text-primary font-medium">{client.companyName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors duration-200"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Service Name */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Service / Project Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              placeholder="e.g. Mobile Application Development"
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-white placeholder-gray-500 text-sm focus:border-primary"
            />
          </div>

          {/* Person In Charge (Intern) */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Person In Charge (Intern)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={personInCharge}
                onChange={(e) => setPersonInCharge(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-white text-sm focus:border-primary"
              >
                <option value="">-- Assign to Intern --</option>
                {interns.map((intern) => (
                  <option key={intern._id || intern.id} value={intern._id || intern.id}>
                    {intern.name} {intern.email ? `(${intern.email})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Agreed Price */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Agreed Price (₹) <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="number"
                  min="0"
                  required
                  value={agreedPrice}
                  onChange={(e) => setAgreedPrice(e.target.value)}
                  placeholder="e.g. 50000"
                  className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-white text-sm focus:border-primary"
                />
              </div>
            </div>

            {/* Paid Amount */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Initial Paid Amount (₹)
              </label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="number"
                  min="0"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-white text-sm focus:border-primary"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Service Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-white text-sm focus:border-primary"
              >
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Deadline
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-white text-sm focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-border text-gray-300 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-primary/20 transition-all duration-200 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Adding Service...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add Service</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddServiceModal;

