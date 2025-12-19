'use client';

import { useState } from 'react';
import { ShoppingCart, Send, CheckCircle, FileDown, RefreshCw } from 'lucide-react';
import { Cliente, ProductoCliente } from '@/types';
import { generatePDF } from '@/lib/pdfGenerator';

interface PedidoSummaryProps {
  cliente: Cliente | null;
  productos: ProductoCliente[];
  cantidades: Map<string, number>;
  onSubmit: (fecha: string, obs: string) => Promise<void>;
  submitting: boolean;
  submitResult: { success: boolean; pedidoId?: string; error?: string } | null;
  onReset: () => void;
}

export default function PedidoSummary({
  cliente,
  productos,
  cantidades,
  onSubmit,
  submitting,
  submitResult,
  onReset,
}: PedidoSummaryProps) {
  const [fechaDespacho, setFechaDespacho] = useState('');
  const [observaciones, setObservaciones] = useState('');

  // Calcular totales
  const totalItems = Array.from(cantidades.values()).reduce((a, b) => a + b, 0);
  
  const totalNeto = productos.reduce((acc, p) => {
    const key = `${p.producto}-${p.formato}-${p.detalleProducto}`;
    const cantidad = cantidades.get(key) || 0;
    return acc + cantidad * p.precioNeto;
  }, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fechaDespacho) {
      alert('Por favor seleccione fecha de despacho');
      return;
    }
    onSubmit(fechaDespacho, observaciones);
  };

  const handleDownloadPDF = () => {
    if (!cliente || !submitResult?.pedidoId) return;

    // Preparar items para el PDF
    const itemsParaPDF = productos
      .filter((p) => {
        const key = `${p.producto}-${p.formato}-${p.detalleProducto}`;
        return (cantidades.get(key) || 0) > 0;
      })
      .map((p) => {
        const key = `${p.producto}-${p.formato}-${p.detalleProducto}`;
        return {
          producto: p.producto,
          formato: p.formato,
          detalle: p.detalleProducto,
          cantidad: cantidades.get(key) || 0,
          precioUnitario: p.precioNeto,
        };
      });

    generatePDF(
      submitResult.pedidoId,
      cliente,
      itemsParaPDF,
      fechaDespacho,
      observaciones
    );
  };

  // --- ESTADO: PEDIDO EXITOSO ---
  if (submitResult?.success) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center animate-fade-in border-2 border-green-100">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        
        <h3 className="text-2xl font-bold text-gray-800 mb-2">¡Pedido Confirmado!</h3>
        <p className="text-gray-500 mb-6">El pedido ha sido registrado correctamente.</p>

        <div className="bg-gray-50 rounded-xl p-4 mb-8 border border-gray-200">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Número de Pedido</p>
          <p className="text-xl font-mono font-bold text-gray-900 mt-1">{submitResult.pedidoId}</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleDownloadPDF}
            className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <FileDown className="w-5 h-5" />
            Descargar PDF
          </button>

          <button
            onClick={onReset}
            className="w-full py-3 text-green-700 font-medium hover:bg-green-50 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Crear Nuevo Pedido
          </button>
        </div>
      </div>
    );
  }

  // --- ESTADO: SIN CLIENTE ---
  if (!cliente) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100 h-full flex flex-col justify-center items-center opacity-60">
        <ShoppingCart className="w-12 h-12 text-gray-300 mb-3" />
        <p className="text-gray-400">Seleccione un cliente para comenzar</p>
      </div>
    );
  }

  // --- ESTADO: RESUMEN NORMAL ---
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden sticky top-6">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-green-600" />
          Resumen del Pedido
        </h3>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center py-4 border-b border-gray-100">
          <div>
            <p className="text-sm text-gray-500">Items</p>
            <p className="text-2xl font-bold text-gray-800">{totalItems}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Neto</p>
            <p className="text-2xl font-bold text-green-600">${totalNeto.toLocaleString('es-CL')}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Fecha de Despacho *</label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={fechaDespacho}
              onChange={(e) => setFechaDespacho(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Observaciones</label>
            <textarea
              rows={3}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Ej: Entregar por puerta trasera..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-1 focus:ring-green-500 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || totalItems === 0}
            className={`
              w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2
              ${submitting || totalItems === 0 ? 'bg-gray-300 cursor-not-allowed shadow-none' : 'bg-green-600 hover:bg-green-700'}
            `}
          >
            {submitting ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Confirmar Pedido
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
