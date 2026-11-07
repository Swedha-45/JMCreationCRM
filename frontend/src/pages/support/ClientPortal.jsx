import { useState, useEffect, useMemo } from 'react';
import api from '../../api/axios';
import {
  Building2, User, Mail, Phone, Plus, Search, FileText,
  ChevronDown, ChevronUp, RefreshCw, AlertCircle, Briefcase,
  Clock, IndianRupee, Layers, Calendar, ExternalLink, Download, X, Loader2, Trash2
} from 'lucide-react';
import AddClientModal from './AddClientModal';
import GenerateInvoiceModal from './GenerateInvoiceModal';
import AddServiceModal from './AddServiceModal';

const ClientPortal = () => {
  const [clients, setClients] = useState([]);
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [expandedClientIds, setExpandedClientIds] = useState(new Set());
  const [deletingClientId, setDeletingClientId] = useState(null);

  // Modal States
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [selectedClientForService, setSelectedClientForService] = useState(null);

  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedClientForInvoice, setSelectedClientForInvoice] = useState(null);
  const [selectedServiceForInvoice, setSelectedServiceForInvoice] = useState(null);
  const [refreshDocsKey, setRefreshDocsKey] = useState(0);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setError('');
    try {
      const [clientsRes, internsRes] = await Promise.all([
        api.get('/clients'),
        api.get('/users?role=intern').catch(() => api.get('/users'))
      ]);

      setClients(clientsRes.data?.data || []);
      const internsData = internsRes.data?.data || [];
      setInterns(internsData.filter((u) => u.role === 'intern'));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  const toggleClientDetails = (clientId) => {
    setExpandedClientIds((prev) => {
      const next = new Set(prev);
      if (next.has(clientId)) next.delete(clientId);
      else next.add(clientId);
      return next;
    });
  };

  const handleAddClient = async (newClient) => {
    await fetchInitialData();
    if (newClient?._id) setExpandedClientIds((prev) => new Set(prev).add(newClient._id));
  };

  const handleAddService = async (updatedClient) => {
    await fetchInitialData();
    if (updatedClient?._id) setExpandedClientIds((prev) => new Set(prev).add(updatedClient._id));
  };

  const handleDeleteClient = async (clientId) => {
    if (!window.confirm("Are you sure you want to delete this client? All associated documents and call logs will also be permanently deleted.")) {
      return;
    }

    setDeletingClientId(clientId);
    try {
      await api.delete('/clients/' + clientId);
      setClients((prev) => prev.filter((c) => c._id !== clientId));
      setExpandedClientIds((prev) => {
        const next = new Set(prev);
        next.delete(clientId);
        return next;
      });
    } catch (err) {
      console.error("Failed to delete client", err);
      alert(err.response?.data?.message || 'Failed to delete client.');
    } finally {
      setDeletingClientId(null);
    }
  };

  const openAddServiceModal = (client, e) => {
    if (e) e.stopPropagation();
    setSelectedClientForService(client);
    setIsAddServiceOpen(true);
  };

  const openInvoiceModal = (client, service = null, e = null) => {
    if (e) e.stopPropagation();
    setSelectedClientForInvoice(client);
    setSelectedServiceForInvoice(service);
    setIsInvoiceModalOpen(true);
  };

  const getClientFinancials = (client) => {
    const services = Array.isArray(client.services) ? client.services : [];
    const totalAgreed = services.reduce((sum, s) => sum + (Number(s.agreedPrice) || 0), 0);
    const totalPaid = services.reduce((sum, s) => sum + (Number(s.paidAmount) || 0), 0);
    const totalPending = Math.max(0, totalAgreed - totalPaid);
    return { totalAgreed, totalPaid, totalPending, serviceCount: services.length };
  };

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch = !q || client.companyName?.toLowerCase().includes(q) || client.email?.toLowerCase().includes(q);
      if (!matchesSearch) return false;

      if (filterStatus === 'pending') return getClientFinancials(client).totalPending > 0;
      if (filterStatus === 'paid') return getClientFinancials(client).totalPending === 0;
      return true;
    });
  }, [clients, searchTerm, filterStatus]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Client Portal</h1>
          <p className="text-gray-400 text-sm mt-1">Manage clients, services, and generate invoices.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchInitialData} className="p-2.5 bg-surface border border-border rounded-xl text-gray-400 hover:text-white shrink-0 transition-colors">
            <RefreshCw className={`w-5 h-5 shrink-0 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setIsAddClientOpen(true)} className="px-5 py-2.5 bg-primary text-white font-medium rounded-xl flex items-center gap-2 shrink-0 hover:bg-primary/90 transition-colors">
            <Plus size={18} className="shrink-0" /> Add Client
          </button>
        </div>
      </div>

      {error && <div className="p-4 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl">{error}</div>}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 shrink-0 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by company or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="flex gap-2 self-start sm:self-auto">
          {['all', 'pending', 'paid'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize shrink-0 transition-colors ${
                filterStatus === status
                  ? 'bg-primary/20 text-primary border border-primary/40'
                  : 'bg-surface border border-border text-gray-400 hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-background border-b border-border text-gray-400 text-xs uppercase">
            <tr>
              <th className="py-4 px-6">Client Name</th>
              <th className="py-4 px-6">Contact</th>
              <th className="py-4 px-6">Services</th>
              <th className="py-4 px-6">Financials</th>
              <th className="py-4 px-6 text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={5} className="p-6 text-center text-gray-400">Loading clients...</td></tr>
            ) : filteredClients.map((client) => {
              const isExpanded = expandedClientIds.has(client._id);
              const fin = getClientFinancials(client);
              return (
                <ClientTableRow
                  key={client._id}
                  client={client}
                  fin={fin}
                  isExpanded={isExpanded}
                  refreshDocsKey={refreshDocsKey}
                  onToggleDetails={() => toggleClientDetails(client._id)}
                  onOpenInvoiceModal={(service) => openInvoiceModal(client, service)}
                  onOpenAddService={() => openAddServiceModal(client)}
                  onDeleteClient={() => handleDeleteClient(client._id)}
                  isDeletingClient={deletingClientId === client._id}
                />
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <AddClientModal isOpen={isAddClientOpen} onClose={() => setIsAddClientOpen(false)} onClientCreated={handleAddClient} interns={interns} />

      <AddServiceModal
        isOpen={isAddServiceOpen}
        onClose={() => { setIsAddServiceOpen(false); setSelectedClientForService(null); }}
        client={selectedClientForService}
        onServiceAdded={handleAddService}
        interns={interns}
      />

      {isInvoiceModalOpen && (
        <GenerateInvoiceModal
          isOpen={isInvoiceModalOpen}
          onClose={() => {
            setIsInvoiceModalOpen(false);
            setSelectedClientForInvoice(null);
            setSelectedServiceForInvoice(null);
          }}
          client={selectedClientForInvoice}
          service={selectedServiceForInvoice}
          onInvoiceGenerated={() => setRefreshDocsKey((k) => k + 1)}
        />
      )}
    </div>
  );
};

const ClientTableRow = ({
  client,
  fin,
  isExpanded,
  refreshDocsKey,
  onToggleDetails,
  onOpenInvoiceModal,
  onOpenAddService,
  onDeleteClient,
  isDeletingClient,
}) => {
  const services = Array.isArray(client.services) ? client.services : [];
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [viewingDocId, setViewingDocId] = useState(null);
  const [activePdfModal, setActivePdfModal] = useState(null);

  // Call History States
  const [calls, setCalls] = useState([]);
  const [loadingCalls, setLoadingCalls] = useState(false);
  const [isLogCallOpen, setIsLogCallOpen] = useState(false);
  const [submittingCall, setSubmittingCall] = useState(false);
  const [callError, setCallError] = useState('');
  const [callForm, setCallForm] = useState({
    date: new Date().toISOString().split('T')[0],
    duration: '15 mins',
    notes: '',
  });

  // Fetch calls for this client
  const fetchCalls = async () => {
    setLoadingCalls(true);
    try {
      const res = await api.get(`/calls/${client._id}`);
      setCalls(res.data.data || []);
    } catch (err) {
      console.error("Failed to load calls", err);
    } finally {
      setLoadingCalls(false);
    }
  };

  // Fetch saved documents and calls when the row is expanded or when refreshed
  useEffect(() => {
    if (isExpanded) {
      const fetchDocs = async () => {
        setLoadingDocs(true);
        try {
          const res = await api.get(`/documents/client/${client._id}`);
          setDocuments(res.data.data || []);
        } catch (err) {
          console.error("Failed to load documents", err);
        } finally {
          setLoadingDocs(false);
        }
      };
      fetchDocs();
      fetchCalls();
    }
  }, [isExpanded, client._id, refreshDocsKey]);

  // Handle logging a new call
  const handleLogCall = async (e) => {
    e.preventDefault();
    setSubmittingCall(true);
    setCallError('');
    try {
      await api.post('/calls', {
        clientId: client._id,
        date: callForm.date,
        duration: callForm.duration,
        notes: callForm.notes,
      });
      setCallForm({
        date: new Date().toISOString().split('T')[0],
        duration: '15 mins',
        notes: '',
      });
      setIsLogCallOpen(false);
      await fetchCalls();
    } catch (err) {
      setCallError(err.response?.data?.message || 'Failed to log call.');
    } finally {
      setSubmittingCall(false);
    }
  };

  // Handle viewing the saved PDF directly from database
  const handleViewPDF = async (doc) => {
    try {
      setViewingDocId(doc._id);
      const res = await api.get(`/documents/${doc._id}/pdf`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const fileUrl = window.URL.createObjectURL(blob);
      setActivePdfModal({
        url: fileUrl,
        invoiceNo: doc.invoiceNo,
        templateType: doc.templateType,
        totalAmount: doc.totalAmount,
      });
    } catch (err) {
      console.error("Failed to view PDF", err);
      alert("Failed to load PDF document. Please try again.");
    } finally {
      setViewingDocId(null);
    }
  };

  const [deletingDocId, setDeletingDocId] = useState(null);
  const [deletingCallId, setDeletingCallId] = useState(null);

  // Handle deleting a saved document
  const handleDeleteDocument = async (docId) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    setDeletingDocId(docId);
    try {
      await api.delete(`/documents/${docId}`);
      setDocuments((prev) => prev.filter((d) => d._id !== docId));
    } catch (err) {
      console.error("Failed to delete document", err);
      alert(err.response?.data?.message || "Failed to delete document.");
    } finally {
      setDeletingDocId(null);
    }
  };

  // Handle deleting a call log
  const handleDeleteCall = async (callId) => {
    if (!window.confirm("Are you sure you want to delete this call log?")) return;
    setDeletingCallId(callId);
    try {
      await api.delete(`/calls/${callId}`);
      setCalls((prev) => prev.filter((c) => c._id !== callId));
    } catch (err) {
      console.error("Failed to delete call log", err);
      alert(err.response?.data?.message || "Failed to delete call log.");
    } finally {
      setDeletingCallId(null);
    }
  };

  return (
    <>
      <tr className={`hover:bg-white/[0.02] transition-colors ${isExpanded ? 'bg-white/[0.02]' : ''}`}>
        <td className="py-4 px-6">
          <div className="font-semibold text-white flex items-center gap-2">
            <Building2 size={16} className="text-primary shrink-0" /> {client.companyName}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">{client.address}</div>
        </td>
        <td className="py-4 px-6">
          <div className="text-white">{client.contactPerson}</div>
          <div className="text-xs text-gray-400">{client.phone}</div>
        </td>
        <td className="py-4 px-6">
          <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded text-xs font-semibold inline-block shrink-0">
            {fin.serviceCount} Services
          </span>
        </td>
        <td className="py-4 px-6">
          <div className="text-xs space-x-2">
            <span className="text-emerald-400">Paid: ₹{fin.totalPaid.toLocaleString('en-IN')}</span>
            <span className="text-amber-400">Pending: ₹{fin.totalPending.toLocaleString('en-IN')}</span>
          </div>
        </td>
        <td className="py-4 px-6 text-right whitespace-nowrap">
          <div className="flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onOpenInvoiceModal(null); }}
              className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
            >
              <FileText size={14} className="shrink-0" /> Invoice
            </button>

            <button
              type="button"
              onClick={onToggleDetails}
              className="px-3 py-1.5 rounded-lg border border-border bg-background text-gray-300 hover:text-white text-xs flex items-center gap-1 shrink-0 transition-colors"
            >
              {isExpanded ? 'Hide' : 'Details'}
              {isExpanded ? <ChevronUp size={14} className="shrink-0" /> : <ChevronDown size={14} className="shrink-0" />}
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteClient();
              }}
              disabled={isDeletingClient}
              title="Delete Client"
              className="p-1.5 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 hover:text-red-300 hover:bg-red-500/20 text-xs flex items-center justify-center shrink-0 transition-colors disabled:opacity-50"
            >
              {isDeletingClient ? <Loader2 size={14} className="animate-spin shrink-0" /> : <Trash2 size={14} className="shrink-0" />}
            </button>
          </div>
        </td>
      </tr>

      {isExpanded && (
        <tr className="bg-background/40">
          <td colSpan="5" className="p-6 border-b border-border">

            {/* SERVICES SECTION */}
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-border/50">
              <h4 className="font-bold text-white text-sm">Services for {client.companyName}</h4>
              <button onClick={onOpenAddService} className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors">
                <Plus size={14} className="shrink-0" /> Add Service
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {services.map((service, i) => (
                <div key={i} className="bg-surface border border-border p-4 rounded-xl">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-white">{service.serviceName}</span>
                    <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-[10px] uppercase font-semibold shrink-0">{service.status}</span>
                  </div>
                  <div className="text-xs text-gray-400 mb-3">In Charge: <span className="text-white">{service.personInCharge?.name || 'Unassigned'}</span></div>
                  <div className="flex justify-between text-xs mb-3">
                    <span className="text-gray-400">Agreed: ₹{service.agreedPrice?.toLocaleString('en-IN')}</span>
                    <span className="text-emerald-400">Paid: ₹{service.paidAmount?.toLocaleString('en-IN')}</span>
                  </div>
                  <button onClick={() => onOpenInvoiceModal(service)} className="w-full py-2 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 rounded-lg text-xs font-semibold transition-colors">
                    Generate Invoice
                  </button>
                </div>
              ))}
            </div>

            {/* SAVED DOCUMENTS / INVOICE HISTORY SECTION */}
            <div className="mt-6 border-t border-border/50 pt-4">
              <h4 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
                <FileText size={16} className="text-accent shrink-0" /> Saved Documents & Invoices
              </h4>

              {loadingDocs ? (
                <div className="text-xs text-gray-400">Loading documents...</div>
              ) : documents.length === 0 ? (
                <div className="text-xs text-gray-500 italic p-4 bg-surface border border-border rounded-lg">No documents generated yet for this client.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs bg-surface border border-border rounded-lg overflow-hidden">
                    <thead className="bg-background text-gray-400 uppercase">
                      <tr>
                        <th className="p-3">Invoice No</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Template</th>
                        <th className="p-3">Total Amount</th>
                        <th className="p-3 text-right whitespace-nowrap">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {documents.map((doc) => (
                        <tr key={doc._id} className="hover:bg-white/[0.02]">
                          <td className="p-3 text-white font-medium">{doc.invoiceNo}</td>
                          <td className="p-3 text-gray-300">{doc.date}</td>
                          <td className="p-3 text-gray-400 capitalize">{doc.templateType.replace('_', ' ')}</td>
                          <td className="p-3 text-emerald-400 font-bold">₹{doc.totalAmount?.toLocaleString('en-IN')}</td>
                          <td className="p-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-3 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleViewPDF(doc)}
                                disabled={viewingDocId === doc._id}
                                className="text-primary hover:underline font-semibold flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                              >
                                {viewingDocId === doc._id ? (
                                  <>
                                    <Loader2 size={12} className="animate-spin shrink-0" /> Loading...
                                  </>
                                ) : (
                                  <>
                                    <FileText size={12} className="shrink-0" /> View PDF
                                  </>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteDocument(doc._id)}
                                disabled={deletingDocId === doc._id}
                                title="Delete Document"
                                className="p-1 rounded text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-50 shrink-0"
                              >
                                {deletingDocId === doc._id ? <Loader2 size={14} className="animate-spin shrink-0" /> : <Trash2 size={14} className="shrink-0" />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* CALL HISTORY SECTION */}
            <div className="mt-6 border-t border-border/50 pt-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Phone size={16} className="text-primary shrink-0" /> Call History
                </h4>
                <button
                  type="button"
                  onClick={() => setIsLogCallOpen((prev) => !prev)}
                  className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  <Plus size={14} className="shrink-0" /> Log Call
                </button>
              </div>

              {/* Inline Form */}
              {isLogCallOpen && (
                <form onSubmit={handleLogCall} className="mb-4 p-4 bg-surface border border-primary/30 rounded-xl space-y-3 animate-in fade-in">
                  <div className="flex justify-between items-center pb-2 border-b border-border/50">
                    <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Phone size={14} className="text-primary shrink-0" /> Log New Call for {client.companyName}
                    </span>
                    <button
                      type="button"
                      onClick={() => { setIsLogCallOpen(false); setCallError(''); }}
                      className="text-gray-400 hover:text-white p-1 rounded-lg shrink-0"
                    >
                      <X size={14} className="shrink-0" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-gray-400 mb-1 flex items-center gap-1">
                        <Calendar size={12} className="shrink-0" /> Date
                      </label>
                      <input
                        type="date"
                        required
                        value={callForm.date}
                        onChange={(e) => setCallForm({ ...callForm, date: e.target.value })}
                        className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-gray-400 mb-1 flex items-center gap-1">
                        <Clock size={12} className="shrink-0" /> Duration
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., 15 mins"
                        value={callForm.duration}
                        onChange={(e) => setCallForm({ ...callForm, duration: e.target.value })}
                        className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-gray-400 mb-1 flex items-center gap-1">
                      <FileText size={12} className="shrink-0" /> Notes
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Enter call notes or discussion summary..."
                      value={callForm.notes}
                      onChange={(e) => setCallForm({ ...callForm, notes: e.target.value })}
                      className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary resize-none"
                    />
                  </div>

                  {callError && (
                    <div className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1.5 rounded-lg">
                      {callError}
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => { setIsLogCallOpen(false); setCallError(''); }}
                      className="px-3 py-1.5 bg-background border border-border text-gray-300 hover:text-white rounded-lg text-xs shrink-0"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingCall}
                      className="px-4 py-1.5 bg-primary text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 disabled:opacity-50 hover:bg-primary/90 shrink-0 transition-colors"
                    >
                      {submittingCall ? <Loader2 size={12} className="animate-spin shrink-0" /> : <Plus size={14} className="shrink-0" />}
                      {submittingCall ? 'Saving...' : 'Save Call'}
                    </button>
                  </div>
                </form>
              )}

              {/* Call History Table */}
              {loadingCalls ? (
                <div className="text-xs text-gray-400">Loading call history...</div>
              ) : calls.length === 0 ? (
                <div className="text-xs text-gray-500 italic p-4 bg-surface border border-border rounded-lg">
                  No calls logged yet for this client.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs bg-surface border border-border rounded-lg overflow-hidden">
                    <thead className="bg-background text-gray-400 uppercase">
                      <tr>
                        <th className="p-3">Date</th>
                        <th className="p-3">Duration</th>
                        <th className="p-3">Notes</th>
                        <th className="p-3">Logged By</th>
                        <th className="p-3 text-right whitespace-nowrap">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {calls.map((call) => (
                        <tr key={call._id} className="hover:bg-white/[0.02]">
                          <td className="p-3 text-white font-medium whitespace-nowrap">{call.date}</td>
                          <td className="p-3 text-primary whitespace-nowrap font-medium">{call.duration}</td>
                          <td className="p-3 text-gray-300 break-words">{call.notes}</td>
                          <td className="p-3 text-gray-400 whitespace-nowrap">
                            {call.loggedBy?.name || 'Staff'}
                          </td>
                          <td className="p-3 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleDeleteCall(call._id)}
                              disabled={deletingCallId === call._id}
                              title="Delete Call Log"
                              className="p-1 rounded text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-50 shrink-0"
                            >
                              {deletingCallId === call._id ? <Loader2 size={14} className="animate-spin shrink-0" /> : <Trash2 size={14} className="shrink-0" />}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </td>
        </tr>
      )}

      {/* PDF Document Viewer Modal */}
      {activePdfModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-sm"
          onClick={() => {
            window.URL.revokeObjectURL(activePdfModal.url);
            setActivePdfModal(null);
          }}
        >
          <div
            className="bg-surface border border-border rounded-2xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <FileText className="w-5 h-5 shrink-0" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    {activePdfModal.invoiceNo}
                  </h3>
                  <p className="text-xs text-gray-400 capitalize">
                    {activePdfModal.templateType?.replace(/_/g, ' ')} • ₹{activePdfModal.totalAmount?.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={activePdfModal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-surface hover:bg-white/10 border border-border rounded-lg text-xs font-medium text-gray-300 hover:text-white flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  <ExternalLink size={14} className="shrink-0" /> Open in New Tab
                </a>
                <a
                  href={activePdfModal.url}
                  download={`${activePdfModal.invoiceNo || 'invoice'}.pdf`}
                  className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-lg text-xs font-medium text-primary flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  <Download size={14} className="shrink-0" /> Download
                </a>
                <button
                  type="button"
                  onClick={() => {
                    window.URL.revokeObjectURL(activePdfModal.url);
                    setActivePdfModal(null);
                  }}
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors ml-2 shrink-0"
                >
                  <X size={18} className="shrink-0" />
                </button>
              </div>
            </div>

            {/* Embedded PDF iframe */}
            <div className="flex-1 w-full bg-neutral-900">
              <iframe
                src={activePdfModal.url}
                title={`PDF Preview ${activePdfModal.invoiceNo}`}
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ClientPortal;
