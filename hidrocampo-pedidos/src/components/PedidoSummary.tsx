'use client';

import { useState, useMemo } from 'react';
import {
  Calendar,
  Send,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Printer,
  FileDown,
} from 'lucide-react';
import { Cliente, ProductoCliente } from '@/types';
import { generarNotaVenta } from '@/lib/notaVentaGenerator';

interface PedidoSummaryProps {
  cliente: Cliente | null;
  productos: ProductoCliente[];
  cantidades: Map<string, number>;
  onSubmit: (fechaDespacho: string, observaciones: string) => Promise<void>;
  submitting: boolean;
  submitResult: { success: boolean; pedidoId?: string; error?: string } | null;
  onReset: () => void;
}

const formatCLP = (value: number) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(value);
};

const getProductoKey = (producto: ProductoCliente) => {
  return `${producto.producto}-${producto.formato}-${producto.detalleProducto}`;
};

export default function PedidoSummary({
  cliente,
  productos,
  cantidades,
  onSubmit,
  submitting,
  submitResult,
  onReset,
}: PedidoSummaryProps) {
  const [fechaDespacho, setFechaDespacho] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [observaciones, setObservaciones] = useState('');

  const { itemsSeleccionados, subtotal, iva, total } = useMemo(() => {
    const items: Array<{
      producto: ProductoCliente;
      cantidad: number;
      total: number;
    }> = [];
    let subtotal = 0;

    productos.forEach((p) => {
      const key = getProductoKey(p);
      const cantidad = cantidades.get(key) || 0;
      if (cantidad > 0) {
        const itemTotal = cantidad * p.precioNeto;
        items.push({ producto: p, cantidad, total: itemTotal });
        subtotal += itemTotal;
      }
    });

    const iva = Math.round(subtotal * 0.19);
    const total = subtotal + iva;

    return { itemsSeleccionados: items, subtotal, iva, total };
  }, [productos, cantidades]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliente || itemsSeleccionados.length === 0) return;
    await onSubmit(fechaDespacho, observaciones);
  };

  const canSubmit =
    cliente && itemsSeleccionados.length > 0 && fechaDespacho && !submitting;

  // Abrir Nota de Venta en nueva pestaña
  const handleVerNotaVenta = () => {
    if (!cliente || !submitResult?.pedidoId) return;

    const itemsParaNotaVenta = itemsSeleccionados.map((item) => ({
      producto: item.producto.producto,
      formato: item.producto.formato,
      detalle: item.producto.detalleProducto || '',
      cantidad: item.cantidad,
      precioUnitario: item.producto.precioNeto,
    }));

    generarNotaVenta(
      submitResult.pedidoId,
      cliente,
      itemsParaNotaVenta,
      fechaDespacho,
      observaciones
    );
  };

  // Pantalla de éxito
  if (submitResult?.success) {
    return (
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in-up">
        <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
          <h2 className="text-white font-display font-semibold text-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Pedido Registrado Exitosamente
          </h2>
        </div>
        <div className="p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">¡Pedido Confirmado!</h3>
          <p className="text-gray-600 mb-4">
            El pedido ha sido registrado correctamente en el sistema.
          </p>
          <div className="inline-block px-6 py-3 bg-hidrocampo-green/10 rounded-xl mb-6">
            <p className="text-sm text-gray-600">Número de Pedido</p>
            <p className="text-2xl font-bold text-hidrocampo-green font-mono">
              {submitResult.pedidoId}
            </p>
          </div>

          <div className="flex flex-col gap-3 justify-center">
            {/* Botón Principal: VER NOTA DE VENTA */}
            <button
              type="button"
              onClick={handleVerNotaVenta}
              className="w-full px-6 py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <FileDown className="w-5 h-5" />
              Ver Nota de Venta (Imprimir/PDF)
            </button>
            
            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={onReset}
                className="flex-1 px-4 py-3 bg-hidrocampo-green text-white font-semibold rounded-xl hover:bg-hidrocampo-green-dark transition-colors"
              >
                Nuevo Pedido
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                title="Imprimir pantalla"
              >
                <Printer className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Formulario normal
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in-up">
      <div className="bg-gradient-to-r from-hidrocampo-green to-hidrocampo-green-light px-6 py-4">
        <h2 className="text-white font-display font-semibold text-lg flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Resumen del Pedido
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {/* Fecha de despacho */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-2" />
            Fecha de Despacho
          </label>
          <input
            type="date"
            value={fechaDespacho}
            onChange={(e) => setFechaDespacho(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-hidrocampo-green focus:ring-2 focus:ring-hidrocampo-green/10 transition-all"
            required
          />
        </div>

        {/* Observaciones */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Observaciones (opcional)
          </label>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Instrucciones especiales, hora de entrega, etc."
            rows={3}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-hidrocampo-green focus:ring-2 focus:ring-hidrocampo-green/10 transition-all resize-none"
          />
        </div>

        {/* Resumen de items */}
        {itemsSeleccionados.length > 0 ? (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Productos seleccionados ({itemsSeleccionados.length})
            </h4>
            <div className="bg-gray-50 rounded-xl p-4 max-h-48 overflow-y-auto">
              <div className="space-y-2">
                {itemsSeleccionados.map(({ producto, cantidad, total }) => (
                  <div
                    key={getProductoKey(producto)}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex-1">
                      <span className="font-medium text-gray-800">
                        {producto.producto}
                      </span>
                      <span className="text-gray-500 ml-2">
                        ({producto.formato})
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-600">x{cantidad}</span>
                      <span className="font-mono font-medium text-gray-800 w-24 text-right">
                        {formatCLP(total)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-6 bg-gray-50 rounded-xl text-center">
            <p className="text-gray-500">
              Ingrese cantidades en la tabla de productos para ver el resumen
            </p>
          </div>
        )}

        {/* Totales */}
        {itemsSeleccionados.length > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-br from-hidrocampo-green/5 to-hidrocampo-yellow/5 rounded-xl border border-hidrocampo-green/10">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-mono font-medium">{formatCLP(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">IVA (19%)</span>
                <span className="font-mono font-medium">{formatCLP(iva)}</span>
              </div>
              <div className="h-px bg-gray-200 my-2"></div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-800">TOTAL</span>
                <span className="font-mono font-bold text-xl text-hidrocampo-green">
                  {formatCLP(total)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {submitResult?.error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Error al registrar pedido</p>
              <p className="text-sm text-red-600">{submitResult.error}</p>
            </div>
          </div>
        )}

        {/* Botón de envío */}
        <button
          type="submit"
          disabled={!canSubmit}
          className={`
            btn-primary w-full py-4 rounded-xl font-semibold text-lg
            flex items-center justify-center gap-2 transition-all
            ${
              canSubmit
                ? 'bg-hidrocampo-green text-white hover:bg-hidrocampo-green-dark shadow-lg hover:shadow-xl'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Registrando Pedido...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Registrar Pedido
            </>
          )}
        </button>

        {/* Validaciones */}
        {!cliente && (
          <p className="mt-3 text-sm text-amber-600 text-center">
            ⚠️ Seleccione un cliente para continuar
          </p>
        )}
        {cliente && itemsSeleccionados.length === 0 && (
          <p className="mt-3 text-sm text-amber-600 text-center">
            ⚠️ Ingrese al menos un producto con cantidad
          </p>
        )}
      </form>
    </div>
  );
}
