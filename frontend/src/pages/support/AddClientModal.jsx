import { useState, useEffect } from 'react';
import api from '../../api/axios';
import {
  X,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  Briefcase,
} from 'lucide-react';

const AddClientModal = ({ isOpen, onClose, onClientCreated, interns = [] }) => {
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gstId, setGstId] = useState('');
  const [address, setAddress] = useState('');

  // Optional initial service
  const [includeService, setIncludeService] = useState(false);
  const [serviceName, setServiceName] = useState('');
  const [personInCharge, setPersonInCharge] = useState('');
  const [agreedPrice, setAgreedPrice] = useState('');
  const [paidAmount, setPaidAmount] = useState('0');
  const [deadline, setDeadline] = useState('');
  const [serviceStatus, setServiceStatus] = useState('Active');

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

  // Reset form when modal opens or closes
  useEffect(() => {
    if (!isOpen) {
      setCompanyName('');
      setContactPerson('');
      setEmail('');
      setPhone('');
      setGstId('');
      setAddress('');
      setIncludeService(false);
      setServiceName('');
      setPersonInCharge('');
      setAgreedPrice('');
      setPaidAmount('0');
      setDeadline('');
      setServiceStatus('Active');
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!companyName.trim()) {
      setError('Company Name is required.');
      return;
    }
    if (!contactPerson.trim()) {
      setError('Contact Person is required.');
      return;
    }
    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }
    if (!phone.trim()) {
      setError('Phone number is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        companyName: companyName.trim(),
        contactPerson: contactPerson.trim(),
        email: email.trim(),
        phone: phone.trim(),
        gstId: gstId.trim() || 'N/A',
        address: address.trim(),
      };

      if (includeService && serviceName.trim()) {
        const numericAgreed = parseFloat(agreedPrice) || 0;
        const numericPaid = parseFloat(paidAmount) || 0;

        const newService = {
          serviceName: serviceName.trim(),
          agreedPrice: numericAgreed,
          paidAmount: numericPaid,
          status: serviceStatus || 'Active',
        };

        if (personInCharge && /^[0-9a-fA-F]{24}$/.test(personInCharge)) {
          newService.personInCharge = personInCharge;
        }
        if (deadline) {
          newService.deadline = deadline;
        }

        payload.services = [newService];
      }

      const response = await api.post('/clients', payload);
      const createdClient = response.data?.data || response.data;

      if (onClientCreated) {
        onClientCreated(createdClient);
      }
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to create client. Please verify the details.'
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
      aria-labelledby="add-client-title"
    >
      <div
        className="bg-surface border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-surface">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 id="add-client-title" className="text-xl font-bold text-white tracking-tight">
                Add New Client
              </h2>
              <p className="text-xs text-gray-400">
                Register a new client company into the JM CRM system
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Client Details Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">
              Company & Contact Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Company Name */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Company Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Acme Corporation"
                    className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-white placeholder-gray-500 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>
              </div>

              {/* Contact Person */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Contact Person <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-white placeholder-gray-500 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. billing@acme.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-white placeholder-gray-500 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Phone Number <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 9876543210"
                    className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-white placeholder-gray-500 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>
              </div>

              {/* GSTIN */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  GST Identification Number (GSTIN)
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={gstId}
                    onChange={(e) => setGstId(e.target.value.toUpperCase())}
                    placeholder="e.g. 33AAAAA0000A1Z5"
                    className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-white placeholder-gray-500 text-sm uppercase focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Office / Billing Address
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter complete office address, street, city, state, pin code"
                    className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-white placeholder-gray-500 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Optional Initial Service Section */}
          <div className="pt-2 border-t border-border/60">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Initial Project / Service
                </span>
                <p className="text-xs text-gray-400">
                  Attach an initial project or service to this client now (optional)
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeService}
                  onChange={(e) => setIncludeService(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {includeService && (
              <div className="p-4 rounded-xl bg-background border border-border space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Service Name */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      Service / Project Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={serviceName}
                      onChange={(e) => setServiceName(e.target.value)}
                      placeholder="e.g. Website Development, CRM Mobile App"
                      className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-white placeholder-gray-500 text-sm focus:border-primary"
                    />
                  </div>

                  {/* Person In Charge (Intern) */}
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      Person In Charge (Intern)
                    </label>
                    <select
                      value={personInCharge}
                      onChange={(e) => setPersonInCharge(e.target.value)}
                      className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-white text-sm focus:border-primary"
                    >
                      <option value="">-- Select Person In Charge --</option>
                      {interns.map((intern) => (
                        <option key={intern._id || intern.id} value={intern._id || intern.id}>
                          {intern.name} {intern.email ? `(${intern.email})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Service Status */}
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      Service Status
                    </label>
                    <select
                      value={serviceStatus}
                      onChange={(e) => setServiceStatus(e.target.value)}
                      className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-white text-sm focus:border-primary"
                    >
                      <option value="Active">Active</option>
                      <option value="Completed">Completed</option>
                      <option value="On Hold">On Hold</option>
                    </select>
                  </div>

                  {/* Agreed Price */}
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      Agreed Price (₹) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={agreedPrice}
                      onChange={(e) => setAgreedPrice(e.target.value)}
                      placeholder="e.g. 50000"
                      className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-white placeholder-gray-500 text-sm focus:border-primary"
                    />
                  </div>

                  {/* Paid Amount */}
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      Initial Paid Amount (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(e.target.value)}
                      placeholder="e.g. 20000"
                      className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-white placeholder-gray-500 text-sm focus:border-primary"
                    />
                  </div>

                  {/* Deadline */}
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      Project Deadline
                    </label>
                    <input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-white text-sm focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
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
                  <span>Saving Client...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add Client</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddClientModal;

