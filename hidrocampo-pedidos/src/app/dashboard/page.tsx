'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Package,
  Users,
  Calendar,
  DollarSign,
  BarChart3,
  PieChart,
  RefreshCw,
  ChevronDown,
  Leaf,
  Target,
  Clock,
  ShoppingCart,
} from 'lucide-react';

// Tipos
interface Pedido {
  id: string;
  fechaRegistro: string;
  fechaDespacho: string;
  cliente: string;
  nombreOficial: string;
  producto: string;
  formato: string;
  cantidad: number;
  precioUnitario: number;
  totalNeto: number;
  estado: string;
}

interface DashboardStats {
  ventaHoy: number;
  ventaMes: number;
  ventaProyectada: number;
  pedidosHoy: number;
  pedidosMes: number;
  clientesActivos: number;
  ticketPromedio: number;
  productoTop: string;
  crecimientoMes: number;
}

// Función para formatear moneda
const formatCLP = (value: number) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Función para formatear números
const formatNumber = (value: number) => {
  return new Intl.NumberFormat('es-CL').format(value);
};

// Componente de tarjeta de estadística
function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendValue,
  color = 'green' 
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: any;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'green' | 'blue' | 'amber' | 'purple';
}) {
  const colorClasses = {
    green: 'from-green-500 to-green-600',
    blue: 'from-blue-500 to-blue-600',
    amber: 'from-amber-500 to-amber-600',
    purple: 'from-purple-500 to-purple-600',
  };

  const bgColorClasses = {
    green: 'bg-green-50 border-green-100',
    blue: 'bg-blue-50 border-blue-100',
    amber: 'bg-amber-50 border-amber-100',
    purple: 'bg-purple-50 border-purple-100',
  };

  return (
    <div className={`${bgColorClasses[color]} border rounded-2xl p-6 transition-all hover:shadow-lg`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend && trendValue && (
            <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${
              trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-500' : 'text-gray-500'
            }`}>
              {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

// Componente de barra de progreso
function ProgressBar({ label, value, max, color = 'green' }: { 
  label: string; 
  value: number; 
  max: number;
  color?: string;
}) {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-bold text-gray-900">{formatCLP(value)}</span>
      </div>
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">{percentage.toFixed(0)}% de meta</p>
    </div>
  );
}

// Componente principal del Dashboard
export default function Dashboard() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<'hoy' | 'semana' | 'mes'>('mes');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Cargar datos
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/pedidos');
      const data = await response.json();
      if (data.success) {
        // Aplanar los pedidos (cada item es una fila)
        const pedidosFlat: Pedido[] = [];
        data.data.forEach((pedido: any) => {
          pedido.items?.forEach((item: any) => {
            pedidosFlat.push({
              id: pedido.id,
              fechaRegistro: pedido.fechaRegistro,
              fechaDespacho: pedido.fechaDespacho,
              cliente: pedido.cliente,
              nombreOficial: pedido.nombreOficial,
              producto: item.producto,
              formato: item.formato,
              cantidad: item.cantidad,
              precioUnitario: item.precioUnitario,
              totalNeto: item.totalNeto,
              estado: pedido.estado,
            });
          });
        });
        setPedidos(pedidosFlat);
        setLastUpdate(new Date());
      }
    } catch (err) {
      setError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh cada 5 minutos
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Calcular estadísticas
  const stats = useMemo(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    const diasEnMes = finMes.getDate();
    const diaActual = hoy.getDate();

    // Filtrar pedidos
    const pedidosHoy = pedidos.filter(p => {
      const fecha = new Date(p.fechaRegistro);
      fecha.setHours(0, 0, 0, 0);
      return fecha.getTime() === hoy.getTime();
    });

    const pedidosMes = pedidos.filter(p => {
      const fecha = new Date(p.fechaRegistro);
      return fecha >= inicioMes && fecha <= finMes;
    });

    const pedidosMesAnterior = pedidos.filter(p => {
      const fecha = new Date(p.fechaRegistro);
      const inicioMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
      const finMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
      return fecha >= inicioMesAnterior && fecha <= finMesAnterior;
    });

    // Calcular ventas
    const ventaHoy = pedidosHoy.reduce((sum, p) => sum + p.totalNeto, 0);
    const ventaMes = pedidosMes.reduce((sum, p) => sum + p.totalNeto, 0);
    const ventaMesAnterior = pedidosMesAnterior.reduce((sum, p) => sum + p.totalNeto, 0);
    
    // Proyección lineal
    const promediodiario = diaActual > 0 ? ventaMes / diaActual : 0;
    const ventaProyectada = promediodiario * diasEnMes;

    // Clientes únicos del mes
    const clientesUnicos = new Set(pedidosMes.map(p => p.cliente)).size;

    // Pedidos únicos
    const pedidosUnicosHoy = new Set(pedidosHoy.map(p => p.id)).size;
    const pedidosUnicosMes = new Set(pedidosMes.map(p => p.id)).size;

    // Ticket promedio
    const ticketPromedio = pedidosUnicosMes > 0 ? ventaMes / pedidosUnicosMes : 0;

    // Producto más vendido
    const productoVentas: Record<string, number> = {};
    pedidosMes.forEach(p => {
      productoVentas[p.producto] = (productoVentas[p.producto] || 0) + p.totalNeto;
    });
    const productoTop = Object.entries(productoVentas)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    // Crecimiento vs mes anterior
    const crecimientoMes = ventaMesAnterior > 0 
      ? ((ventaMes - ventaMesAnterior) / ventaMesAnterior) * 100 
      : 0;

    return {
      ventaHoy,
      ventaMes,
      ventaProyectada,
      pedidosHoy: pedidosUnicosHoy,
      pedidosMes: pedidosUnicosMes,
      clientesActivos: clientesUnicos,
      ticketPromedio,
      productoTop,
      crecimientoMes,
    };
  }, [pedidos]);

  // Top 5 productos
  const topProductos = useMemo(() => {
    const productoVentas: Record<string, { cantidad: number; total: number }> = {};
    pedidos.forEach(p => {
      if (!productoVentas[p.producto]) {
        productoVentas[p.producto] = { cantidad: 0, total: 0 };
      }
      productoVentas[p.producto].cantidad += p.cantidad;
      productoVentas[p.producto].total += p.totalNeto;
    });
    
    return Object.entries(productoVentas)
      .map(([nombre, data]) => ({ nombre, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [pedidos]);

  // Top 5 clientes
  const topClientes = useMemo(() => {
    const clienteVentas: Record<string, number> = {};
    pedidos.forEach(p => {
      clienteVentas[p.cliente] = (clienteVentas[p.cliente] || 0) + p.totalNeto;
    });
    
    return Object.entries(clienteVentas)
      .map(([nombre, total]) => ({ nombre, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [pedidos]);

  // Pedidos recientes
  const pedidosRecientes = useMemo(() => {
    const pedidosUnicos = new Map<string, any>();
    pedidos.forEach(p => {
      if (!pedidosUnicos.has(p.id)) {
        pedidosUnicos.set(p.id, {
          id: p.id,
          cliente: p.cliente,
          fecha: p.fechaRegistro,
          total: 0,
        });
      }
      pedidosUnicos.get(p.id).total += p.totalNeto;
    });
    
    return Array.from(pedidosUnicos.values())
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 5);
  }, [pedidos]);

  if (loading && pedidos.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-800 via-green-700 to-green-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white rounded-xl p-2 shadow-lg">
                <Leaf className="w-10 h-10 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">HIDROCAMPO</h1>
                <p className="text-green-200 text-sm">Dashboard de Ventas</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right text-white/80 text-sm hidden sm:block">
                <p>Última actualización</p>
                <p className="font-medium text-white">
                  {lastUpdate.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <button
                onClick={fetchData}
                disabled={loading}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
              >
                <RefreshCw className={`w-5 h-5 text-white ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Venta Hoy"
            value={formatCLP(stats.ventaHoy)}
            subtitle={`${stats.pedidosHoy} pedidos`}
            icon={DollarSign}
            color="green"
          />
          <StatCard
            title="Venta del Mes"
            value={formatCLP(stats.ventaMes)}
            subtitle={`${stats.pedidosMes} pedidos`}
            icon={BarChart3}
            trend={stats.crecimientoMes >= 0 ? 'up' : 'down'}
            trendValue={`${stats.crecimientoMes >= 0 ? '+' : ''}${stats.crecimientoMes.toFixed(1)}% vs mes anterior`}
            color="blue"
          />
          <StatCard
            title="Proyección Mes"
            value={formatCLP(stats.ventaProyectada)}
            subtitle="Proyección lineal"
            icon={Target}
            color="purple"
          />
          <StatCard
            title="Ticket Promedio"
            value={formatCLP(stats.ticketPromedio)}
            subtitle={`${stats.clientesActivos} clientes activos`}
            icon={ShoppingCart}
            color="amber"
          />
        </div>

        {/* Contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda - 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Meta del mes */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-green-600" />
                Progreso del Mes
              </h3>
              <ProgressBar
                label="Venta actual vs Meta"
                value={stats.ventaMes}
                max={stats.ventaProyectada > 0 ? stats.ventaProyectada : 1000000}
              />
              <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{stats.pedidosMes}</p>
                  <p className="text-sm text-gray-500">Pedidos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{stats.clientesActivos}</p>
                  <p className="text-sm text-gray-500">Clientes</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{stats.crecimientoMes.toFixed(1)}%</p>
                  <p className="text-sm text-gray-500">Crecimiento</p>
                </div>
              </div>
            </div>

            {/* Top Productos */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-green-600" />
                Top 5 Productos
              </h3>
              <div className="space-y-4">
                {topProductos.map((producto, index) => (
                  <div key={producto.nombre} className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-amber-600' :
                      'bg-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900">{producto.nombre}</span>
                        <span className="font-bold text-green-600">{formatCLP(producto.total)}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full mt-1 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full"
                          style={{ width: `${(producto.total / (topProductos[0]?.total || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {topProductos.length === 0 && (
                  <p className="text-gray-500 text-center py-4">Sin datos de productos</p>
                )}
              </div>
            </div>
          </div>

          {/* Columna derecha - 1/3 */}
          <div className="space-y-6">
            {/* Top Clientes */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                Top Clientes
              </h3>
              <div className="space-y-3">
                {topClientes.map((cliente, index) => (
                  <div key={cliente.nombre} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {index + 1}
                      </span>
                      <span className="font-medium text-gray-800 text-sm truncate max-w-[120px]">
                        {cliente.nombre}
                      </span>
                    </div>
                    <span className="font-bold text-gray-900 text-sm">{formatCLP(cliente.total)}</span>
                  </div>
                ))}
                {topClientes.length === 0 && (
                  <p className="text-gray-500 text-center py-4">Sin datos de clientes</p>
                )}
              </div>
            </div>

            {/* Pedidos Recientes */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-600" />
                Pedidos Recientes
              </h3>
              <div className="space-y-3">
                {pedidosRecientes.map((pedido) => (
                  <div key={pedido.id} className="p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-mono text-sm font-bold text-green-600">{pedido.id}</p>
                        <p className="text-sm text-gray-600 truncate max-w-[150px]">{pedido.cliente}</p>
                      </div>
                      <p className="font-bold text-gray-900">{formatCLP(pedido.total)}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(pedido.fecha).toLocaleDateString('es-CL')}
                    </p>
                  </div>
                ))}
                {pedidosRecientes.length === 0 && (
                  <p className="text-gray-500 text-center py-4">Sin pedidos recientes</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-400 text-sm">
          <p>Dashboard Hidrocampo © {new Date().getFullYear()} — Actualización en tiempo real</p>
        </footer>
      </main>
    </div>
  );
}
