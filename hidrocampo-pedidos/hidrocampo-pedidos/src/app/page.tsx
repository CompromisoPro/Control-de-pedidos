'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import ClienteSelector from '@/components/ClienteSelector';
import ProductosTable from '@/components/ProductosTable';
import PedidoSummary from '@/components/PedidoSummary';
import { Cliente, ProductoCliente } from '@/types';

// Generar key única para cada producto
const getProductoKey = (producto: ProductoCliente) => {
  return `${producto.producto}-${producto.formato}-${producto.detalleProducto}`;
};

export default function Home() {
  // Estados
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(true);

  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [productos, setProductos] = useState<ProductoCliente[]>([]);
  const [loadingProductos, setLoadingProductos] = useState(false);

  const [cantidades, setCantidades] = useState<Map<string, number>>(new Map());

  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    pedidoId?: string;
    error?: string;
  } | null>(null);

  // Cargar clientes al inicio
  useEffect(() => {
    async function fetchClientes() {
      try {
        const response = await fetch('/api/clientes');
        const data = await response.json();
        if (data.success) {
          setClientes(data.data);
        }
      } catch (error) {
        console.error('Error fetching clientes:', error);
      } finally {
        setLoadingClientes(false);
      }
    }

    fetchClientes();
  }, []);

  // Cargar productos cuando se selecciona un cliente
  useEffect(() => {
    async function fetchProductos() {
      if (!selectedCliente) {
        setProductos([]);
        return;
      }

      setLoadingProductos(true);
      setCantidades(new Map()); // Reset cantidades

      try {
        const response = await fetch(
          `/api/productos?cliente=${encodeURIComponent(selectedCliente.diccionarioCliente)}`
        );
        const data = await response.json();
        if (data.success) {
          setProductos(data.data);
        }
      } catch (error) {
        console.error('Error fetching productos:', error);
      } finally {
        setLoadingProductos(false);
      }
    }

    fetchProductos();
  }, [selectedCliente]);

  // Manejar selección de cliente
  const handleClienteSelect = useCallback((cliente: Cliente) => {
    setSelectedCliente(cliente);
    setSubmitResult(null);
  }, []);

  // Manejar cambio de cantidad
  const handleCantidadChange = useCallback((productoKey: string, cantidad: number) => {
    setCantidades((prev) => {
      const newMap = new Map(prev);
      if (cantidad > 0) {
        newMap.set(productoKey, cantidad);
      } else {
        newMap.delete(productoKey);
      }
      return newMap;
    });
  }, []);

  // Enviar pedido
  const handleSubmitPedido = useCallback(
    async (fechaDespacho: string, observaciones: string) => {
      if (!selectedCliente) return;

      setSubmitting(true);
      setSubmitResult(null);

      try {
        // Preparar items
        const items = productos
          .filter((p) => {
            const key = getProductoKey(p);
            return (cantidades.get(key) || 0) > 0;
          })
          .map((p) => {
            const key = getProductoKey(p);
            return {
              producto: p.producto,
              formato: p.formato,
              detalle: p.detalleProducto,
              cantidad: cantidades.get(key) || 0,
              precioUnitario: p.precioNeto,
            };
          });

        const response = await fetch('/api/pedidos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clienteDiccionario: selectedCliente.diccionarioCliente,
            fechaDespacho,
            items,
            observaciones,
          }),
        });

        const data = await response.json();

        if (data.success) {
          setSubmitResult({
            success: true,
            pedidoId: data.data.pedidoId,
          });
        } else {
          setSubmitResult({
            success: false,
            error: data.error || 'Error desconocido',
          });
        }
      } catch (error) {
        setSubmitResult({
          success: false,
          error: 'Error de conexión. Intente nuevamente.',
        });
      } finally {
        setSubmitting(false);
      }
    },
    [selectedCliente, productos, cantidades]
  );

  // Reset para nuevo pedido
  const handleReset = useCallback(() => {
    setSelectedCliente(null);
    setProductos([]);
    setCantidades(new Map());
    setSubmitResult(null);
  }, []);

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda - Cliente y Resumen */}
          <div className="lg:col-span-1 space-y-6">
            <ClienteSelector
              clientes={clientes}
              selectedCliente={selectedCliente}
              onSelect={handleClienteSelect}
              loading={loadingClientes}
            />

            <PedidoSummary
              cliente={selectedCliente}
              productos={productos}
              cantidades={cantidades}
              onSubmit={handleSubmitPedido}
              submitting={submitting}
              submitResult={submitResult}
              onReset={handleReset}
            />
          </div>

          {/* Columna derecha - Productos */}
          <div className="lg:col-span-2">
            <ProductosTable
              productos={productos}
              cantidades={cantidades}
              onCantidadChange={handleCantidadChange}
              loading={loadingProductos}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-400 text-sm">
          <p>
            Sistema de Pedidos Hidrocampo © {new Date().getFullYear()} — Desarrollado con 💚
          </p>
        </footer>
      </main>
    </div>
  );
}
