'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, User, Check, ChevronDown, AlertCircle, MapPin, Phone, CreditCard, RefreshCw } from 'lucide-react';
import { Cliente } from '@/types';

interface ClienteSelectorProps {
  clientes: Cliente[];
  selectedCliente: Cliente | null;
  onSelect: (cliente: Cliente) => void;
  loading: boolean;
}

export default function ClienteSelector({
  clientes = [], 
  selectedCliente,
  onSelect,
  loading,
}: ClienteSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filtrado seguro
  const filteredClientes = useMemo(() => {
    if (!clientes) return [];
    return clientes.filter((cliente) => {
      if (!cliente) return false;
      const term = searchTerm.toLowerCase().trim();
      if (!term) return true;
      
      const nombreDic = (cliente.diccionarioCliente || '').toLowerCase();
      const nombreOfi = (cliente.nombreOficial || '').toLowerCase();
      const rut = (cliente.rut || '').toLowerCase();
      
      return nombreDic.includes(term) || nombreOfi.includes(term) || rut.includes(term);
    });
  }, [clientes, searchTerm]);

  // Cerrar al hacer clic fuera
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
    // Z-50 AQUÍ es clave para que flote sobre el resumen de abajo
    <div className="w-full relative z-50" ref={dropdownRef}>
      
      {/* DIAGNÓSTICO VISUAL (Para ver si llegan datos) */}
      <div className="flex justify-end mb-1">
        <span className="text-[10px] text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded-full">
          {loading ? '⏳ Cargando...' : `✅ Datos: ${clientes?.length || 0} clientes`}
        </span>
      </div>

      {/* TARJETA PRINCIPAL (Sin overflow-hidden para no cortar el menú) */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-green-700 to-green-600 px-6 py-4 rounded-t-2xl">
          <h2 className="text-white font-semibold text-lg flex items-center gap-2">
            <User className="w-5 h-5" />
            Seleccionar Cliente
          </h2>
        </div>

        {/* CONTENIDO */}
        <div className="p-6 relative">
          
          {/* BOTÓN DESPLEGABLE */}
          <button
            type="button"
            onClick={() => !loading && setIsOpen(!isOpen)}
            disabled={loading}
            className={`
              w-full bg-white border-2 rounded-xl p-4 cursor-pointer transition-all
              flex items-center justify-between shadow-sm hover:border-green-500
              ${isOpen ? 'border-green-600 ring-2 ring-green-100' : 'border-gray-200'}
              ${loading ? 'opacity-70' : ''}
            `}
          >
            <div className="flex items-center gap-3 overflow-hidden text-left w-full">
              <div className={`p-2 rounded-full flex-shrink-0 ${selectedCliente ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <User className="w-5 h-5" />}
              </div>
              
              <div className="flex flex-col truncate w-full">
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                  {loading ? 'Sincronizando' : 'Cliente'}
                </span>
                <span className={`font-bold text-lg truncate ${selectedCliente ? 'text-gray-900' : 'text-gray-400'}`}>
                  {loading ? 'Cargando datos...' : (selectedCliente?.diccionarioCliente || 'Seleccionar...')}
                </span>
              </div>
            </div>
            <ChevronDown className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* MENÚ DESPLEGABLE (Flotante absoluto) */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 z-[100] max-h-96 flex flex-col">
              
              {/* Buscador */}
              <div className="p-3 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    autoFocus
                    type="text"
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-sm"
                    placeholder="Escribe para buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Lista */}
              <div className="overflow-y-auto max-h-64 p-2">
                {filteredClientes.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>No encontrado</p>
                  </div>
                ) : (
                  filteredClientes.map((cliente) => {
                    const isSelected = selectedCliente?.id === cliente.id;
                    return (
                      <button
                        key={cliente.id || Math.random()}
                        onClick={() => handleSelect(cliente)}
                        className={`
                          w-full text-left p-3 rounded-lg mb-1 flex items-start gap-3 transition-colors
                          ${isSelected ? 'bg-green-50 border border-green-200' : 'hover:bg-gray-50 border border-transparent'}
                        `}
                      >
                        <div className={`mt-1 ${isSelected ? 'text-green-600' : 'text-gray-300'}`}>
                          {isSelected ? <Check size={18} /> : <User size={18} />}
                        </div>
                        <div>
                          <div className={`font-bold ${isSelected ? 'text-green-900' : 'text-gray-700'}`}>
                            {cliente.diccionarioCliente}
                          </div>
                          {(cliente.nombreOficial || cliente.rut) && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              {cliente.nombreOficial !== cliente.diccionarioCliente && cliente.nombreOficial}
                              {cliente.rut && ` • ${cliente.rut}`}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* FICHA DE INFORMACIÓN (Solo si hay cliente seleccionado) */}
          {selectedCliente && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="grid grid-cols-1 gap-4 text-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded text-green-700"><MapPin size={16} /></div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Dirección</p>
                    <p className="font-medium">{selectedCliente.direccionEntrega || 'No registrada'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded text-green-700"><Phone size={16} /></div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Contacto</p>
                    <p className="font-medium">{selectedCliente.contacto || selectedCliente.telefono || 'No registrado'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded text-green-700"><CreditCard size={16} /></div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Pago</p>
                    <p className="font-medium">{selectedCliente.formaPago || 'No registrado'}</p>
                  </div>
                </div>
              </div>
              
              {selectedCliente.comentario && (
                <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 rounded-lg text-sm border border-yellow-100">
                  <span className="font-bold">Nota:</span> {selectedCliente.comentario}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
