'use client';

import { useState, useMemo } from 'react';
import { Package, Search, Filter } from 'lucide-react';
import { ProductoCliente } from '@/types';

interface ProductosTableProps {
  productos: ProductoCliente[];
  cantidades: Map<string, number>;
  onCantidadChange: (productoKey: string, cantidad: number) => void;
  loading: boolean;
}

// Función para formatear moneda chilena
const formatCLP = (value: number) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(value);
};

// Generar key única para cada producto
const getProductoKey = (producto: ProductoCliente) => {
  return `${producto.producto}-${producto.formato}-${producto.detalleProducto}`;
};

export default function ProductosTable({
  productos,
  cantidades,
  onCantidadChange,
  loading,
}: ProductosTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyWithQuantity, setShowOnlyWithQuantity] = useState(false);

  // Filtrar productos
  const filteredProductos = useMemo(() => {
    let filtered = productos;

    // Filtrar por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.producto.toLowerCase().includes(term) ||
          p.formato.toLowerCase().includes(term) ||
          p.detalleProducto?.toLowerCase().includes(term)
      );
    }

    // Filtrar solo con cantidad
    if (showOnlyWithQuantity) {
      filtered = filtered.filter((p) => {
        const key = getProductoKey(p);
        return (cantidades.get(key) || 0) > 0;
      });
    }

    return filtered;
  }, [productos, searchTerm, showOnlyWithQuantity, cantidades]);

  // Calcular totales
  const totales = useMemo(() => {
    let subtotal = 0;
    let itemsConCantidad = 0;

    productos.forEach((p) => {
      const key = getProductoKey(p);
      const cantidad = cantidades.get(key) || 0;
      if (cantidad > 0) {
        subtotal += cantidad * p.precioNeto;
        itemsConCantidad++;
      }
    });

    const iva = Math.round(subtotal * 0.19);
    const total = subtotal + iva;

    return { subtotal, iva, total, itemsConCantidad };
  }, [productos, cantidades]);

  const handleCantidadChange = (producto: ProductoCliente, value: string) => {
    const cantidad = parseInt(value) || 0;
    const key = getProductoKey(producto);
    onCantidadChange(key, Math.max(0, cantidad));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in-up">
        <div className="bg-gradient-to-r from-hidrocampo-green to-hidrocampo-green-light px-6 py-4">
          <h2 className="text-white font-display font-semibold text-lg flex items-center gap-2">
            <Package className="w-5 h-5" />
            Productos del Cliente
          </h2>
        </div>
        <div className="p-12 text-center">
          <div className="spinner w-12 h-12 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (productos.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in-up">
        <div className="bg-gradient-to-r from-hidrocampo-green to-hidrocampo-green-light px-6 py-4">
          <h2 className="text-white font-display font-semibold text-lg flex items-center gap-2">
            <Package className="w-5 h-5" />
            Productos del Cliente
          </h2>
        </div>
        <div className="p-12 text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">Seleccione un cliente para ver sus productos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in-up">
      {/* Header */}
      <div className="bg-gradient-to-r from-hidrocampo-green to-hidrocampo-green-light px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-white font-display font-semibold text-lg flex items-center gap-2">
            <Package className="w-5 h-5" />
            Productos
            <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-sm">
              {productos.length}
            </span>
          </h2>

          {totales.itemsConCantidad > 0 && (
            <div className="flex items-center gap-2 text-white/90 text-sm">
              <span className="px-3 py-1 bg-hidrocampo-yellow text-hidrocampo-green-dark font-bold rounded-full">
                {totales.itemsConCantidad} seleccionados
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Buscador */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar producto..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-hidrocampo-green focus:ring-2 focus:ring-hidrocampo-green/10"
            />
          </div>

          {/* Filtro solo con cantidad */}
          <button
            type="button"
            onClick={() => setShowOnlyWithQuantity(!showOnlyWithQuantity)}
            className={`
              flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border transition-all
              ${
                showOnlyWithQuantity
                  ? 'bg-hidrocampo-green text-white border-hidrocampo-green'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-hidrocampo-green'
              }
            `}
          >
            <Filter className="w-4 h-4" />
            <span className="whitespace-nowrap text-sm">Solo seleccionados</span>
          </button>
        </div>
      </div>

      {/* Vista Móvil - Tarjetas */}
      <div className="block sm:hidden">
        <div className="divide-y divide-gray-100">
          {filteredProductos.map((producto) => {
            const key = getProductoKey(producto);
            const cantidad = cantidades.get(key) || 0;
            const total = cantidad * producto.precioNeto;
            const hasQuantity = cantidad > 0;

            return (
              <div
                key={key}
                className={`p-4 ${hasQuantity ? 'bg-green-50' : 'bg-white'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{producto.producto}</h3>
                    <p className="text-sm text-gray-500">
                      {producto.formato} {producto.detalleProducto && `• ${producto.detalleProducto}`}
                    </p>
                  </div>
                  <p className="font-mono font-semibold text-gray-800">
                    {formatCLP(producto.precioNeto)}
                  </p>
                </div>
                
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-gray-600">Cantidad:</label>
                    <input
                      type="number"
                      min="0"
                      value={cantidad || ''}
                      onChange={(e) => handleCantidadChange(producto, e.target.value)}
                      placeholder="0"
                      className={`
                        w-20 px-3 py-2 text-center font-medium rounded-lg border-2
                        focus:outline-none transition-all
                        ${
                          hasQuantity
                            ? 'border-hidrocampo-green bg-white text-hidrocampo-green-dark'
                            : 'border-gray-200 bg-white text-gray-700'
                        }
                      `}
                    />
                  </div>
                  {hasQuantity && (
                    <p className="font-mono font-bold text-hidrocampo-green">
                      {formatCLP(total)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vista Desktop - Tabla */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Formato
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Detalle
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Precio
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-28">
                Cant.
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProductos.map((producto) => {
              const key = getProductoKey(producto);
              const cantidad = cantidades.get(key) || 0;
              const total = cantidad * producto.precioNeto;
              const hasQuantity = cantidad > 0;

              return (
                <tr
                  key={key}
                  className={`transition-colors ${hasQuantity ? 'bg-green-50' : 'hover:bg-gray-50'}`}
                >
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-800">{producto.producto}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-600">{producto.formato}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-500 text-sm">
                      {producto.detalleProducto || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-gray-700 font-mono">
                      {formatCLP(producto.precioNeto)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="0"
                      value={cantidad || ''}
                      onChange={(e) => handleCantidadChange(producto, e.target.value)}
                      placeholder="0"
                      className={`
                        w-full px-3 py-2 text-center font-medium rounded-lg border-2
                        focus:outline-none transition-all
                        ${
                          hasQuantity
                            ? 'border-hidrocampo-green bg-white text-hidrocampo-green-dark'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }
                      `}
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`font-mono font-semibold ${
                        hasQuantity ? 'text-hidrocampo-green' : 'text-gray-300'
                      }`}
                    >
                      {formatCLP(total)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredProductos.length === 0 && (
        <div className="px-6 py-12 text-center text-gray-500">
          No se encontraron productos con ese criterio
        </div>
      )}

      {/* Resumen de totales */}
      {totales.itemsConCantidad > 0 && (
        <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-gray-50 to-hidrocampo-green/5 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">
            <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-8">
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase">Subtotal</p>
                <p className="font-mono font-semibold text-gray-700">
                  {formatCLP(totales.subtotal)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase">IVA 19%</p>
                <p className="font-mono font-semibold text-gray-700">{formatCLP(totales.iva)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase">Total</p>
                <p className="font-mono font-bold text-xl text-hidrocampo-green">
                  {formatCLP(totales.total)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
