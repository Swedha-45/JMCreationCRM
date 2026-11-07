import { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  X,
  FileText,
  Download,
  Calendar,
  Building2,
  CreditCard,
  Phone,
  MapPin,
  Loader2,
  AlertCircle,
  CheckCircle,
  Hash,
  Plus,
  Trash2,
} from 'lucide-react';

const TEMPLATES = [
  { id: 'jina_quotation', name: 'Jina Quotation', company: 'Jina Groups', typeBadge: 'Quotation' },
  { id: 'jina_proforma', name: 'Jina Proforma', company: 'Jina Groups', typeBadge: 'Proforma (Taxed)' },
  { id: 'jina_tax_invoice', name: 'Jina Tax', company: 'Jina Groups', typeBadge: 'Tax Invoice' },
  { id: 'jm_proforma_1', name: 'JM Proforma 1', company: 'JM Creations', typeBadge: 'Proforma (Paid/Due)' },
  { id: 'jm_proforma_2', name: 'JM Proforma 2', company: 'JM Creations', typeBadge: 'Proforma (Net)' },
];

const GenerateInvoiceModal = ({ isOpen, onClose, client, service, onInvoiceGenerated }) => {
  const [templateType, setTemplateType] = useState('jina_proforma');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [date, setDate] = useState('');

  // Client Details
  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientGstin, setClientGstin] = useState('');
  const [clientMobile, setClientMobile] = useState('');

  // Dynamic Multiple Services / Items Array
  const [items, setItems] = useState([
    {
      description: 'Stage - (40 x 50) with ramp (15 x 6)',
      sacHsn: '',
      units: '',
      rate: '',
      days: 1,
      amount: 250000,
    },
  ]);

  // Dynamic / Conditional Inputs
  const [discount, setDiscount] = useState(0);
  const [paid, setPaid] = useState(0);

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Initialize form when opened or props change
  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      setDate(today.toLocaleDateString('en-GB')); // DD/MM/YYYY

      const prefixMap = {
        jina_quotation: 'JQ',
        jina_proforma: 'JP',
        jina_tax_invoice: 'JTI',
        jm_proforma_1: 'JM-PI1',
        jm_proforma_2: 'JM-PI2',
      };
      const prefix = prefixMap[templateType] || 'INV';
      const randomId = Math.floor(100 + Math.random() * 900);
      setInvoiceNumber(`${prefix}-${today.getFullYear()}-${randomId}`);

      if (client) {
        setClientName(client.companyName || '');
        setClientAddress(
          client.address ||
            'No.129, Plaza Centre, Anna Salai, Chennai, Tamil Nadu - 600006'
        );
        setClientGstin(
          client.gstId && client.gstId !== 'N/A' ? client.gstId : '33AAAAA0000A1Z5'
        );
        setClientMobile(client.phone || '9876543210');
      }

      if (service) {
        setItems([
          {
            description: service.serviceName || (templateType === 'jina_quotation' ? 'Event Management Services' : 'Custom CRM Application Development'),
            sacHsn: templateType === 'jina_quotation' ? '' : '998314',
            rate: Number(service.agreedPrice) || 15000,
            units: 1,
            days: 1,
            amount: Number(service.agreedPrice) || 15000,
          },
        ]);
        setPaid(Number(service.paidAmount) || 0);
      } else {
        // Default initial items template-appropriate
        if (templateType === 'jina_quotation') {
          setItems([
            {
              description: 'Stage - (40 x 50) with ramp (15 x 6)',
              sacHsn: '',
              units: '',
              rate: '',
              days: 1,
              amount: 250000,
            },
          ]);
        } else {
          setItems([
            {
              description: templateType.startsWith('jm') ? 'Poster ( 30 nos )' : 'Enterprise Software & Consulting Services',
              sacHsn: templateType.startsWith('jm') ? '' : '998314',
              rate: templateType === 'jm_proforma_2' ? 3000 : 15000,
              units: 1,
              days: 1,
              amount: templateType === 'jm_proforma_2' ? 3000 : 15000,
            },
          ]);
        }
      }

      setError('');
      setSuccess('');
    }
  }, [isOpen, client, service, templateType]);

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

  if (!isOpen) return null;

  // Condition checks
  const isJinaQuotation = templateType === 'jina_quotation';
  const isJinaTax = templateType === 'jina_tax_invoice';
  const isJMProforma1 = templateType === 'jm_proforma_1';
  const isJinaProforma = templateType === 'jina_proforma';

  // Item management handlers
  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        description: '',
        sacHsn: isJinaQuotation ? '' : '998314',
        units: isJinaQuotation ? '' : 1,
        rate: '',
        days: isJinaQuotation ? '' : 1,
        amount: '',
      },
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };

      // Auto-calculate amount when rate, units, or days change
      if (field === 'rate' || field === 'units' || field === 'days') {
        const r = item.rate !== '' && !isNaN(item.rate) ? Number(item.rate) : null;
        const u = item.units !== '' && !isNaN(item.units) ? Number(item.units) : null;
        const d = item.days !== '' && !isNaN(item.days) ? Number(item.days) : null;

        if (r !== null) {
          const uVal = u !== null ? u : 1;
          const dVal = isJinaQuotation ? (d !== null ? d : 1) : 1;
          item.amount = r * uVal * dVal;
        }
      }

      updated[index] = item;
      return updated;
    });
  };

  // Financial Calculations
  const subtotal = items.reduce((sum, item) => {
    let amt = 0;
    if (item.amount !== '' && item.amount !== null && !isNaN(item.amount)) {
      amt = Number(item.amount);
    } else {
      const r = Number(item.rate || 0);
      const u = Number(item.units || 1);
      const d = isJinaQuotation ? Number(item.days || 1) : 1;
      amt = r * u * d;
    }
    return sum + amt;
  }, 0);

  const numericDiscount = Number(discount) || 0;
  const numericPaid = Number(paid) || 0;

  // Taxable Value
  const taxableValue =
    isJinaTax || isJMProforma1
      ? Math.max(0, subtotal - numericDiscount)
      : subtotal;

  // Taxes (CGST 9% + SGST 9% only for Jina Proforma & Jina Tax)
  const hasGst = isJinaProforma || isJinaTax;
  const cgst = hasGst ? taxableValue * 0.09 : 0;
  const sgst = hasGst ? taxableValue * 0.09 : 0;

  // Grand Total
  let totalInvoiceValue = subtotal;
  if (hasGst) {
    totalInvoiceValue = Math.round(taxableValue + cgst + sgst);
  } else if (isJMProforma1) {
    totalInvoiceValue = taxableValue;
  } else {
    totalInvoiceValue = subtotal;
  }

  // Due (for JM Proforma 1)
  const due = Math.max(0, totalInvoiceValue - numericPaid);

  // Submit Handler
  const handleDownloadPDF = async () => {
    if (!client?._id) {
      setError('Client ID is missing. Please select a valid client.');
      return;
    }

    setIsGenerating(true);
    setError('');
    setSuccess('');

    try {
      // 1. Structured Payload with critical clientId and calculated financials
      const payload = {
        templateType,
        invoiceData: {
          clientId: client._id, // CRITICAL: Required by backend to save document to MongoDB
          invoiceNo: invoiceNumber.trim(),
          docNumber: invoiceNumber.trim(), // For PDFKit document generator
          date: date.trim(),
          clientName: clientName.trim() || client.companyName || 'Valued Client',
          clientAddress: clientAddress.trim() || client.address || 'Client Address, Tamil Nadu',
          clientGstin: clientGstin.trim() || client.gstId || 'N/A',
          clientMobile: clientMobile.trim() || client.phone || 'N/A',
          items: items.map((item) => {
            const r = item.rate !== '' && item.rate !== null && !isNaN(item.rate) ? Number(item.rate) : '';
            const u = item.units !== '' && item.units !== null && !isNaN(item.units) ? Number(item.units) : '';
            const d = item.days !== '' && item.days !== null && !isNaN(item.days) ? Number(item.days) : '';
            const amt = item.amount !== '' && item.amount !== null && !isNaN(item.amount)
              ? Number(item.amount)
              : (typeof r === 'number' ? r * (u || 1) * (isJinaQuotation ? (d || 1) : 1) : 0);

            return {
              description: item.description?.trim() || '',
              sacHsn: item.sacHsn?.trim() || '',
              rate: r,
              units: u,
              days: d,
              amount: amt,
            };
          }),
          totalAmount: totalInvoiceValue,
          totalInvoiceValue: totalInvoiceValue, // For PDFKit
          paidAmount: numericPaid,
          paid: numericPaid,
          discount: numericDiscount,
          subtotal,
          taxableValue,
          cgst,
          sgst,
          due,
        },
      };

      // 2. Request PDF stream via PDFKit with responseType: 'blob'
      const response = await api.post('/documents/generate', payload, {
        responseType: 'blob',
      });

      // 3. Create Blob URL & trigger automatic browser download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      const filename = `${templateType}_${invoiceNumber.trim() || 'doc'}.pdf`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setSuccess(`Document "${filename}" generated and downloaded successfully!`);
      if (typeof onInvoiceGenerated === 'function') {
        onInvoiceGenerated();
      }
    } catch (err) {
      console.error('PDF Generation failed:', err);
      let errorMsg = 'Failed to generate PDF. Please ensure the backend PDFKit service is running.';

      // Handle Blob error response parsing
      if (err.response?.data) {
        if (err.response.data instanceof Blob) {
          try {
            const text = await err.response.data.text();
            const json = JSON.parse(text);
            if (json.message) errorMsg = json.message;
          } catch {
            // Blob wasn't a valid JSON string
          }
        } else if (err.response.data.message) {
          errorMsg = err.response.data.message;
        }
      }
      setError(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto"
      aria-modal="true"
      role="dialog"
      aria-labelledby="invoice-modal-title"
    >
      <div
        className="bg-surface border border-border rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 id="invoice-modal-title" className="text-xl font-bold text-white tracking-tight">
                Document & Invoice Generator
              </h2>
              <p className="text-xs text-gray-400">
                Generate pixel-perfect A4 PDFs powered by server-side PDFKit engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
              <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* Template Selection Dropdown & Pills */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-primary mb-2">
              Select Template
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2">
              {TEMPLATES.map((tmpl) => {
                const isSelected = templateType === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => setTemplateType(tmpl.id)}
                    className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-primary/15 border-primary text-primary font-semibold shadow-sm'
                        : 'bg-background border-border text-gray-400 hover:text-gray-200 hover:border-gray-600'
                    }`}
                  >
                    <span className="text-[10px] block font-mono text-gray-400">
                      {tmpl.company}
                    </span>
                    <span className="text-xs font-bold block text-white mt-0.5">
                      {tmpl.name}
                    </span>
                    <span className="text-[10px] text-gray-400 block mt-1 truncate">
                      {tmpl.typeBadge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Meta Inputs (Invoice Number & Date) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-background border border-border">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Invoice / Reference Number <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="e.g. JP-2026-101"
                  className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-xl text-white text-sm focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Document Date <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="DD/MM/YYYY"
                  className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-xl text-white text-sm focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Client Details Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">
              Client & Billing Information ({isJinaQuotation ? 'To' : 'Billed To'})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-background border border-border">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Client / Company Name
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. A M Jain College"
                    className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-xl text-white text-sm focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Client GSTIN
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={clientGstin}
                    onChange={(e) => setClientGstin(e.target.value)}
                    placeholder="33AAAAA0000A1Z5"
                    className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-xl text-white text-sm focus:border-primary uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Client Mobile / Phone
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={clientMobile}
                    onChange={(e) => setClientMobile(e.target.value)}
                    placeholder="9876543210"
                    className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-xl text-white text-sm focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Client Office Address
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    placeholder="City, State, Pin Code"
                    className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-xl text-white text-sm focus:border-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Multiple Services / Line Items Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {isJinaQuotation ? 'Quotation Services & Pricing Breakdown' : 'Line Items & Services'}
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {isJinaQuotation
                    ? 'Add multiple services. Units, Rate & Days will calculate amount automatically, or you can enter lump-sum amounts directly.'
                    : 'Add multiple line items. Subtotal and taxes will update dynamically.'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-lg text-primary text-xs font-medium hover:bg-primary/20 transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Service / Item</span>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-background border border-border space-y-3">
              <div className="overflow-x-auto rounded-lg border border-border/80">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-surface/60 text-gray-300 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="p-2.5 pl-3 w-10 text-center">#</th>
                      <th className="p-2.5 min-w-[200px]">Service Description <span className="text-red-400">*</span></th>
                      {!isJinaQuotation && <th className="p-2.5 w-24">SAC/HSIN</th>}
                      <th className="p-2.5 w-20 text-center">{isJinaQuotation ? 'Units' : 'Qty'}</th>
                      <th className="p-2.5 w-28 text-right">{isJinaQuotation ? 'Rate (P.U) ₹' : 'Rate (₹)'}</th>
                      {isJinaQuotation && <th className="p-2.5 w-20 text-center">Days</th>}
                      <th className="p-2.5 w-28 text-right pr-3">Amount (₹)</th>
                      <th className="p-2.5 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-surface/30 transition-colors">
                        <td className="p-2 pl-3 text-gray-400 font-mono text-center">{idx + 1}</td>
                        <td className="p-2">
                          <input
                            type="text"
                            required
                            value={item.description}
                            onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                            placeholder={isJinaQuotation ? 'e.g. Stage - (40 x 50) with ramp' : 'Service description'}
                            className="w-full px-2.5 py-1.5 bg-surface border border-border rounded-lg text-white text-xs focus:border-primary placeholder:text-gray-500"
                          />
                        </td>
                        {!isJinaQuotation && (
                          <td className="p-2">
                            <input
                              type="text"
                              value={item.sacHsn}
                              onChange={(e) => handleItemChange(idx, 'sacHsn', e.target.value)}
                              placeholder="998314"
                              className="w-full px-2 py-1.5 bg-surface border border-border rounded-lg text-white text-xs font-mono focus:border-primary placeholder:text-gray-500"
                            />
                          </td>
                        )}
                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            value={item.units}
                            onChange={(e) => handleItemChange(idx, 'units', e.target.value)}
                            placeholder={isJinaQuotation ? '-' : '1'}
                            className="w-full px-2 py-1.5 bg-surface border border-border rounded-lg text-white text-xs focus:border-primary text-center placeholder:text-gray-500"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            value={item.rate}
                            onChange={(e) => handleItemChange(idx, 'rate', e.target.value)}
                            placeholder="0"
                            className="w-full px-2 py-1.5 bg-surface border border-border rounded-lg text-white text-xs focus:border-primary text-right placeholder:text-gray-500"
                          />
                        </td>
                        {isJinaQuotation && (
                          <td className="p-2">
                            <input
                              type="number"
                              min="0"
                              value={item.days}
                              onChange={(e) => handleItemChange(idx, 'days', e.target.value)}
                              placeholder="-"
                              className="w-full px-2 py-1.5 bg-surface border border-border rounded-lg text-white text-xs focus:border-primary text-center placeholder:text-gray-500"
                            />
                          </td>
                        )}
                        <td className="p-2 pr-3">
                          <input
                            type="number"
                            min="0"
                            value={item.amount}
                            onChange={(e) => handleItemChange(idx, 'amount', e.target.value)}
                            placeholder="0"
                            className="w-full px-2 py-1.5 bg-surface border border-border rounded-lg text-white text-xs focus:border-primary font-semibold text-right placeholder:text-gray-500"
                          />
                        </td>
                        <td className="p-2 text-center">
                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                              title="Delete Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total items count & sum */}
              <div className="flex items-center justify-between px-2 pt-1 text-xs text-gray-400">
                <span>Total Items: <b className="text-white">{items.length}</b></span>
                <span>Items Subtotal: <b className="text-primary font-mono text-sm font-semibold">₹{subtotal.toLocaleString('en-IN')}</b></span>
              </div>

              {/* Conditional Inputs: Discount & Paid for JM Proforma 1 and Jina Tax */}
              {(isJMProforma1 || isJinaTax) && (
                <div className="pt-3 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-amber-400 mb-1">
                      Discount (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-white text-xs focus:border-primary"
                    />
                  </div>

                  {isJMProforma1 && (
                    <div>
                      <label className="block text-xs font-medium text-emerald-400 mb-1">
                        Amount Paid (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={paid}
                        onChange={(e) => setPaid(e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-white text-xs focus:border-primary"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Financial Math Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Template Specific Notes */}
            <div className="p-4 rounded-xl bg-background border border-border text-xs space-y-2">
              <span className="font-semibold text-gray-300 uppercase tracking-wide block">
                Template Rules & Details
              </span>
              <ul className="text-gray-400 space-y-1 list-disc list-inside">
                <li>
                  Entity:{' '}
                  <b className="text-white">
                    {templateType.startsWith('jina') ? 'Jina Groups of Company' : 'JM Creations'}
                  </b>
                </li>
                {isJinaQuotation && (
                  <li className="text-primary">
                    Quotation: Sum of ({items.length} items) = ₹{subtotal.toLocaleString('en-IN')}
                  </li>
                )}
                {hasGst && (
                  <li>
                    GST Applied: CGST (9%) + SGST (9%) on Taxable Value
                  </li>
                )}
                {isJMProforma1 && (
                  <li>
                    Status: Tracking Paid (₹{numericPaid.toLocaleString('en-IN')}) & Due (₹{due.toLocaleString('en-IN')})
                  </li>
                )}
                {templateType === 'jm_proforma_2' && (
                  <li>
                    No taxes or discounts applied. Net calculation mode.
                  </li>
                )}
              </ul>
            </div>

            {/* Calculations Breakdown Card */}
            <div className="p-4 rounded-xl bg-background border border-border space-y-2 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal:</span>
                <span className="font-mono text-white">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {(isJinaTax || isJMProforma1) && numericDiscount > 0 && (
                <div className="flex justify-between text-red-400">
                  <span>Less Discount:</span>
                  <span className="font-mono">-₹{numericDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-400">
                <span>Taxable Value:</span>
                <span className="font-mono text-white">₹{taxableValue.toLocaleString('en-IN')}</span>
              </div>

              {hasGst && (
                <>
                  <div className="flex justify-between text-gray-400">
                    <span>CGST (9%):</span>
                    <span className="font-mono text-gray-300">₹{cgst.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>SGST (9%):</span>
                    <span className="font-mono text-gray-300">₹{sgst.toLocaleString('en-IN')}</span>
                  </div>
                </>
              )}

              {isJMProforma1 && (
                <>
                  <div className="flex justify-between text-emerald-400">
                    <span>Paid Amount:</span>
                    <span className="font-mono">₹{numericPaid.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-amber-400 font-semibold">
                    <span>Due Amount:</span>
                    <span className="font-mono">₹{due.toLocaleString('en-IN')}</span>
                  </div>
                </>
              )}

              <div className="pt-2 border-t border-border flex justify-between items-center text-sm font-bold">
                <span className="text-white">Total Value:</span>
                <span className="font-mono text-primary text-base">
                  ₹{totalInvoiceValue.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-surface">
          <p className="text-xs text-gray-400 hidden sm:block">
            Output: <code className="text-primary font-mono">{templateType}.pdf</code> via PDFKit
          </p>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="px-5 py-2.5 rounded-xl border border-border text-gray-300 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-primary/20 transition-all duration-200 disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateInvoiceModal;
