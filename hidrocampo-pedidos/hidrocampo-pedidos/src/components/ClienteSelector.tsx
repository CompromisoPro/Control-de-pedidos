'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, User, MapPin, Phone, CreditCard, ChevronDown } from 'lucide-react';
import { Cliente } from '@/types';

interface ClienteSelectorProps {
  clientes: Cliente[];
  selectedCliente: Cliente | null;
  onSelect: (cliente: Cliente) => void;
  loading: boolean;
}

export default function ClienteSelector({
  clientes,
  selectedCliente,
  onSelect,
  loading,
}: ClienteSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // --- CORRECCIÓN AQUÍ ---
  // Agregamos ( || '') para evitar que explote si un campo viene vacío del Excel
  const filteredClientes = clientes.filter((cliente) => {
    // Protección contra datos nulos
    if (!cliente) return false;

    const term = searchTerm.toLowerCase();
    const nombreDiccionario = (cliente.diccionarioCliente || '').toLowerCase();
    const nombreOficial = (cliente.nombreOficial || '').toLowerCase();

    return nombreDiccionario.includes(term) || nombreOficial.includes(term);
  });

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (cliente: Cliente) => {
    onSelect(cliente);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in-up">
      {/* Header */}
      <div className="bg-gradient-to-r from-hidrocampo-green to-hidrocampo-green-light px-6 py-4">
        <h2 className="text-white font-display font-semibold text-lg flex items-center gap-2">
          <User className="w-5 h-5" />
          Seleccionar Cliente
        </h2>
      </div>

      {/* Selector */}
      <div className="p-6">
        <div className="relative" ref={dropdownRef}>
          {/* Input/Botón de selección */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            disabled={loading}
            className={`
              w-full px-4 py-4 text-left bg-gray-50 border-2 rounded-xl
              transition-all duration-200 flex items-center justify-between
              ${isOpen ? 'border-hidrocampo-green ring-4 ring-hidrocampo-green/10' : 'border-gray-200 hover:border-hidrocampo-green/50'}
              ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {loading ? (
              <span className="text-gray-400 flex items-center gap-2">
                <div className="spinner w-5 h-5"></div>
                Cargando clientes...
              </span>
            ) : selectedCliente ? (
              <span className="font-medium text-gray-800">
                {selectedCliente.diccionarioCliente || 'Cliente seleccionado'}
              </span>
            ) : (
              <span className="text-gray-400">Seleccione un cliente...</span>
            )}
            <ChevronDown
              className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown */}
          {isOpen && (
            <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-100 rounded-xl shadow-2xl overflow-hidden animate-slide-down">
              {/* Buscador */}
              <div className="p-3 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar cliente..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-hidrocampo-green focus:ring-2 focus:ring-hidrocampo-green/10"
                    autoFocus
                  />
                </div>
              </div>

              {/* Lista de clientes */}
              <div className="max-h-72 overflow-y-auto">
                {filteredClientes.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-400">
                    No se encontraron clientes
                  </div>
                ) : (
                  filteredClientes.map((cliente) => (
                    <button
                      key={cliente.id}
                      type="button"
                      onClick={() => handleSelect(cliente)}
                      className={`
                        w-full px-4 py-3 text-left hover:bg-hidrocampo-green/5 transition-colors
                        border-b border-gray-50 last:border-b-0
                        ${selectedCliente?.id === cliente.id ? 'bg-hidrocampo-green/10' : ''}
                      `}
                    >
                      <div className="font-medium text-gray-800">
                        {cliente.diccionarioCliente}
                      </div>
                      {/* Solo mostrar nombre oficial si existe y es diferente */}
                      {cliente.nombreOficial && 
                       cliente.nombreOficial !== cliente.diccionarioCliente && (
                        <div className="text-sm text-gray-500 mt-0.5">
                          {cliente.nombreOficial}
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Info del cliente seleccionado */}
        {selectedCliente && (
          <div className="mt-6 p-4 bg-gradient-to-br from-hidrocampo-green/5 to-hidrocampo-yellow/5 rounded-xl border border-hidrocampo-green/10 animate-fade-in-up">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Razón Social */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <User className="w-4 h-4 text-hidrocampo-green" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Razón Social</p>
                  <p className="font-medium text-gray-800">
                    {selectedCliente.nombreOficial || selectedCliente.diccionarioCliente}
                  </p>
                  {selectedCliente.rut && (
                    <p className="text-sm text-gray-500">RUT: {selectedCliente.rut}</p>
                  )}
                </div>
              </div>

              {/* Dirección */}
              {selectedCliente.direccionEntrega && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <MapPin className="w-4 h-4 text-hidrocampo-green" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Dirección</p>
                    <p className="font-medium text-gray-800">{selectedCliente.direccionEntrega}</p>
                    {selectedCliente.comuna && (
                      <p className="text-sm text-gray-500">{selectedCliente.comuna}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Contacto */}
              {(selectedCliente.contacto || selectedCliente.telefono) && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Phone className="w-4 h-4 text-hidrocampo-green" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Contacto</p>
                    {selectedCliente.contacto && (
                      <p className="font-medium text-gray-800">{selectedCliente.contacto}</p>
                    )}
                    {selectedCliente.telefono && (
                      <p className="text-sm text-gray-500">{selectedCliente.telefono}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Forma de Pago */}
              {selectedCliente.formaPago && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <CreditCard className="w-4 h-4 text-hidrocampo-green" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Forma de Pago</p>
                    <p className="font-medium text-gray-800">{selectedCliente.formaPago}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Comentario */}
            {selectedCliente.comentario && (
              <div className="mt-4 p-3 bg-hidrocampo-yellow/20 rounded-lg border border-hidrocampo-yellow/30">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Nota:</span> {selectedCliente.comentario}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
