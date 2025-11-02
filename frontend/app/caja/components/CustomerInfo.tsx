
import React, { useEffect, useState } from 'react';
import type { Customer } from '../types';

interface CustomerInfoProps {
  customer: Customer;
  // optional callback to notify parent about customer changes
  onChange?: (c: Customer) => void;
}

type FieldProps = {
  label: string;
  value: string;
  name?: keyof Customer;
  className?: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
};

const FormField: React.FC<FieldProps> = ({ label, value, name, className = 'md:col-span-1', readOnly = true, onChange }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      type="text"
      name={String(name || '')}
      value={value}
      readOnly={readOnly}
      onChange={(e) => onChange?.(e.target.value)}
      className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 bg-white`}
    />
  </div>
);

const CustomerInfo: React.FC<CustomerInfoProps> = ({ customer, onChange }) => {
  const [local, setLocal] = useState<Customer>(customer);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLocal(customer);
  }, [customer]);

  const handleDocChange = (v: string) => {
    setLocal((prev) => ({ ...prev, documentNumber: v }));
  };

  const handleFieldChange = (key: keyof Customer, v: string) => {
    const updated = { ...local, [key]: v } as Customer;
    setLocal(updated);
    onChange?.(updated);
  };

  const fetchClient = async (doc: string) => {
    if (!doc || doc.trim() === '') return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://127.0.0.1:5001/api/clients/${encodeURIComponent(doc)}`);
      if (!res.ok) {
        if (res.status === 404) {
          // no existe: keep local values but clear other fields
          setLocal((prev) => ({ ...prev, fullName: '', email: '', address: '', city: '', department: '', postalCode: '', phone: '' }));
          onChange?.({ ...local, fullName: '', email: '', address: '', city: '', department: '', postalCode: '', phone: '' });
        } else {
          setError('Error consultando cliente');
        }
        setLoading(false);
        return;
      }

      const data = await res.json();
      // Map backend shape to local Customer
      const mapped: Customer = {
        fullName: data.name || data.registrationName || '',
        documentType: data.documentType || '',
        documentNumber: data.documentNumber || doc,
        email: data.email || '',
        address: (data.address && (data.address.direccion || '')) || '',
        city: (data.address && data.address.cityName) || '',
        department: (data.address && data.address.countrySubentity) || '',
        postalCode: (data.address && data.address.postalZone) || '',
        phone: data.telephone || '',
      };

      setLocal(mapped);
      onChange?.(mapped);
    } catch (e: any) {
      setError(e?.message || 'Error fetching client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Datos del Cliente</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
  <FormField label="Nombre completo" name="fullName" value={local.fullName} className="md:col-span-2" />

          <FormField label="Tipo de documento" name="documentType" value={local.documentType} />

        <div>
          <label className="block text-sm font-medium text-gray-700">Número de documento</label>
          <div className="mt-1 flex gap-2">
            <input
              type="text"
              value={local.documentNumber}
              onChange={(e) => handleDocChange(e.target.value)}
              onBlur={() => fetchClient(local.documentNumber)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2"
            />
            <button
              type="button"
              onClick={() => fetchClient(local.documentNumber)}
              disabled={loading}
              className="px-3 py-2 bg-blue-600 text-white rounded-md"
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>

  <FormField label="Correo electrónico" name="email" value={local.email} className="md:col-span-2" />
  <FormField label="Dirección" name="address" value={local.address} />
  <FormField label="Ciudad" name="city" value={local.city} />
  <FormField label="Departamento" name="department" value={local.department} />
  <FormField label="Código postal" name="postalCode" value={local.postalCode} />
  <FormField label="Teléfono" name="phone" value={local.phone} className="md:col-span-2" />
      </div>
    </div>
  );
};

export default CustomerInfo;
