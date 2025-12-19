'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, User, Check, ChevronDown, AlertCircle, MapPin, Phone, CreditCard } from 'lucide-react';
import { Cliente } from '@/types';

interface ClienteSelectorProps {
  clientes: Cliente[];
  selectedCliente: Cliente | null;
  onSelect: (cliente: Cliente) => void;
  loading: boolean;
}

export default function ClienteSelector({
  clientes = [], // Protección: Si llega undefined, usa array vacío
  selectedCliente,
  onSelect,
  loading,
}: ClienteSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // DEBUG: Ver en consola si el componente recibe datos
  useEffect(() => {
    if (clientes.length > 0) {
      console.log(`[ClienteSelector] Componente montado con ${clientes.length} clientes.`);
    } else if (!loading) {
      console.log('[ClienteSelector] Alerta: Lista de clientes vacía.');
    }
  }, [clientes, loading]);

  // Filtrado optimizado y seguro
  const filteredClientes = useMemo(() => {
    if (!clientes) return [];
    
    return clientes.filter((cliente) => {
      // Si el cliente viene nulo, saltarlo
      if (!cliente) return false;
      
      const term = searchTerm.toLowerCase().trim();
      // Si no hay búsqueda, mostrar todos
      if (!term) return true;

      // Obtener campos de forma segura
      const nombreDic = (cliente.diccionarioCliente || '').toLowerCase();
      const nombreOfi = (cliente.nombreOficial || '').toLowerCase();
      const rut = (cliente.rut || '').toLowerCase();

      // Buscar coincidencia en cualquiera de los 3 campos
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
    console.log('Cliente seleccionado:', cliente.diccionarioCliente);
    onSelect(cliente);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="w-full relative" ref={dropdownRef}>
      
      {/* --- HEADER VISUAL --- */}
      <div className="bg-gradient-to-r from-hidrocampo-green to-hidrocampo-green-light px-6 py-4 rounded-t-2xl mb-0 shadow-sm">
        <h2 className="text-white font-display font-semibold text-lg flex items-center gap-2">
          <User className="w-5 h-5" />
          Seleccionar Cliente
        </h2>
      </div>

      <div className="bg-white rounded-b-2xl shadow-xl p-6 pt-4 animate-fade-in-up">
        {/* --- BOTÓN PRINCIPAL --- */}
        <div 
          onClick={() => !loading && setIsOpen(!isOpen)}
          className={`
            w-full bg-white border-2 rounded-xl p-4 cursor-pointer transition-all
            flex items-center justify-between shadow-sm hover:shadow-md relative
            ${isOpen ? 'border-hidrocampo-green ring-2 ring-hidrocampo-green/20' : 'border-gray-200'}
            ${loading ? 'opacity-60 cursor-wait' : ''}
          `}
        >
          <div className="flex items-center gap-3 overflow-hidden w-full">
            <div className={`p-2 rounded-full flex-shrink-0 ${selectedCliente ? 'bg-green-100 text-hidrocampo-green' : 'bg-gray-100 text-gray-500'}`}>
              <User size={20} />
            </div>
            
            <div className="flex flex-col truncate w-full">
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                {loading ? 'Cargando sistema...' : 'Cliente'}
              </span>
              <span className={`font-bold text-lg truncate ${selectedCliente ? 'text-gray-900' : 'text-gray-400'}`}>
                {loading 
                  ? 'Sincronizando...' 
                  : (selectedCliente?.diccionarioCliente || 'Seleccionar cliente...')}
              </span>
            </div>
          </div>

          <ChevronDown 
            className={`text-gray-400 transition-transform duration-300 flex-shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`} 
          />
        </div>

        {/* --- MENU DESPLEGABLE (Con Z-Index alto) --- */}
        {isOpen && (
          <div className="absolute z-[100] left-6 right-6 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Buscador interno */}
            <div className="p-3 bg-gray-50 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  autoFocus
                  type="text"
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-hidrocampo-green focus:ring-1 focus:ring-hidrocampo-green text-sm"
                  placeholder="Buscar por nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Lista de resultados */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="animate-spin w-6 h-6 border-2 border-hidrocampo-green border-t-transparent rounded-full mx-auto mb-2"></div>
                  Cargando datos...
                </div>
              ) : filteredClientes.length === 0 ? (
                <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                  <AlertCircle className="mb-2 text-gray-300" size={32} />
                  <p>No se encontraron clientes</p>
                  <p className="text-xs mt-1">Intenta buscar de otra forma</p>
                </div>
              ) : (
                filteredClientes.map((cliente) => {
                  const isSelected = selectedCliente?.id === cliente.id;
                  return (
                    <button
                      key={cliente.id || Math.random()} 
                      onClick={() => handleSelect(cliente)}
                      className={`
                        w-full text-left p-4 border-b border-gray-50 last:border-0 hover:bg-green-50 transition-colors
                        flex items-start gap-3 group
                        ${isSelected ? 'bg-green-50' : ''}
                      `}
                    >
                      <div className={`mt-1 ${isSelected ? 'text-hidrocampo-green' : 'text-gray-300 group-hover:text-hidrocampo-green/60'}`}>
                        {isSelected ? <Check size={18} /> : <User size={18} />}
                      </div>
                      
                      <div className="flex-1">
                        <div className={`font-bold ${isSelected ? 'text-green-800' : 'text-gray-700'}`}>
                          {cliente.diccionarioCliente || 'Sin Nombre'}
                        </div>
                        
                        {(cliente.nombreOficial || cliente.rut) && (
                          <div className="text-xs text-gray-500 mt-1 flex flex-col gap-0.5">
                            {cliente.nombreOficial && cliente.nombreOficial !== cliente.diccionarioCliente && (
                              <span>{cliente.nombreOficial}</span>
                            )}
                            {cliente.rut && <span>RUT: {cliente.rut}</span>}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
            
            <div className="bg-gray-50 p-2 text-center text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
              {filteredClientes.length} Clientes Disponibles
            </div>
          </div>
        )}

        {/* --- TARJETA DE INFORMACIÓN DEL CLIENTE (RESTAURADA) --- */}
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
