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
  RefreshCw,
  Leaf,
  Target,
  Clock,
  LayoutDashboard,
  FileText,
  Truck,
  Settings,
  Menu,
  Search,
  Filter,
  ChevronRight,
  Plus,
  Save,
  X,
  Edit2,
  ArrowLeft
} from 'lucide-react';

// --- CONFIGURACIÓN DE CONEXIÓN ---
const GOOGLE_SHEET_CSV_URL = ""; 

// --- DATOS REALES DE PEDIDOS (Tu historial) ---
const DATOS_INICIALES_CSV = `
ID Pedido,Fecha Registro,Fecha Despacho,Cliente,Nombre Oficial,Rut,Dirección,Comuna,Contacto,Telefono,Forma pago,Producto,Formato,Detalle,Cantidad,Precio Unitario,Total Neto,Observaciones,Estado
HC-2025-0001,2025-12-22T14:04:08.566Z,2025-12-23,Club Maquehue,,,,,,,,Albahaca,Bolsa 1Kg,,23,15000,345000,llevar en la noche,pendiente
HC-2025-0002,2025-12-22T14:04:47.044Z,2025-12-23,Club Sport Frances,Sport Francés,,Lo Beltran 2500,Vitacura,,,A 30 DIAS,Albahaca,Bolsa 250 gr,,23,3800,87400,comer pan con mermelada,pendiente
HC-2025-0002,2025-12-22T14:04:47.044Z,2025-12-23,Club Sport Frances,Sport Francés,,Lo Beltran 2500,Vitacura,,,A 30 DIAS,Cebolla Blanca,Cubo Bolsa 2kg,,3,1300,3900,comer pan con mermelada,pendiente
HC-2025-0003,2025-12-20T10:00:00.000Z,2025-12-21,Restaurante El Valle,,,,,,,,Tomate Larga Vida,Caja 18kg,,5,18000,90000,,completado
HC-2025-0004,2025-12-19T15:30:00.000Z,2025-12-20,Verdulería La Fresca,,,,,,,,Lechuga Hidropónica,Unidad,,50,650,32500,,completado
HC-2025-0005,2025-12-18T09:15:00.000Z,2025-12-19,Club de Golf Los Leones,,,,,,,,Ciboulette,Paquete,,10,800,8000,,completado
`;

// --- DATOS SIMULADOS DE "BD_Productos.csv" (Lista de Precios Negociados) ---
// Esto simula lo que leerías de la hoja "BD_Productos"
const DATOS_PRODUCTOS_CLIENTES_CSV = `
CLIENTE,Producto,Formato,Precio Neto
Club Maquehue,Albahaca,Bolsa 1Kg,15000
Club Maquehue,Zanahoria,Bolsa 1Kg,650
Club Maquehue,Perejil,Bolsa 1Kg,2400
Club Sport Frances,Albahaca,Bolsa 250 gr,3800
Club Sport Frances,Cebolla Blanca,Cubo Bolsa 2kg,1300
Restaurante El Valle,Tomate Larga Vida,Caja 18kg,18000
Verdulería La Fresca,Lechuga Hidropónica,Unidad,650
Club de Golf Los Leones,Ciboulette,Paquete,800
Club de Golf Los Leones,Cebolla Morada,Granel kg,900
`;

// --- TIPOS ---
interface PedidoHidrocampo {
  id: string;
  fecha: string;
  cliente: string;
  producto: string;
  formato: string;
  cantidad: number;
  total: number;
  estado: string;
}

interface ProductoNegociado {
  cliente: string;
  producto: string;
  formato: string;
  precio: number;
}

// --- PARSERS ---
const parseCSV = (csvText: string): PedidoHidrocampo[] => {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  // Mapeo simplificado para la demo
  return lines.slice(1).map(line => {
    const v = line.split(','); 
    return {
      id: v[0] || '',
      fecha: v[1] || new Date().toISOString(),
      cliente: v[3] || 'Desconocido',
      producto: v[11] || '',
      formato: v[12] || '',
      cantidad: Number(v[14]) || 0,
      total: Number(v[16]) || 0,
      estado: (v[18] || 'pendiente').trim().toLowerCase(),
    };
  }).filter(p => p.id && p.total > 0);
};

const parseProductosCSV = (csvText: string): ProductoNegociado[] => {
  const lines = csvText.trim().split('\n');
  return lines.slice(1).map(line => {
    const v = line.split(',');
    return {
      cliente: v[0],
      producto: v[1],
      formato: v[2],
      precio: Number(v[3]) || 0
    };
  });
};

// --- COMPONENTES UI ---

const formatCLP = (value: number) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

function StatCard({ title, value, subtitle, icon: Icon, color = 'green' }: any) {
  const bgClasses: any = {
    green: 'bg-green-50 text-green-700',
    blue: 'bg-blue-50 text-blue-700',
    amber: 'bg-amber-50 text-amber-700',
    purple: 'bg-purple-50 text-purple-700',
  };
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${bgClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

// --- VISTAS ---

const DashboardView = ({ pedidos }: { pedidos: PedidoHidrocampo[] }) => {
  const ventaTotal = pedidos.reduce((acc, p) => acc + p.total, 0);
  const pedidosPendientes = pedidos.filter(p => p.estado === 'pendiente').length;
  
  const topProductos = Object.entries(pedidos.reduce((acc: any, p) => {
    acc[p.producto] = (acc[p.producto] || 0) + p.total;
    return acc;
  }, {})).sort(([,a]: any, [,b]: any) => b - a).slice(0, 5);

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Venta Total" value={formatCLP(ventaTotal)} subtitle={`${pedidos.length} items vendidos`} icon={DollarSign} color="green" />
        <StatCard title="Por Despachar" value={pedidosPendientes} subtitle="Pedidos pendientes" icon={Truck} color="amber" />
        <StatCard title="Ticket Promedio" value={formatCLP(ventaTotal/pedidos.length || 0)} subtitle="Por línea" icon={Target} color="blue" />
        <StatCard title="Clientes Activos" value={new Set(pedidos.map(p => p.cliente)).size} subtitle="Con pedidos recientes" icon={Users} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Top Productos (Ingresos)
          </h3>
          <div className="space-y-4">
            {topProductos.map(([prod, venta]: any, i) => (
              <div key={i} className="relative">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{prod}</span>
                  <span className="font-bold text-gray-900">{formatCLP(venta)}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${(venta / (topProductos[0][1] as number)) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-600" />
            Últimos Movimientos
          </h3>
          <div className="space-y-3">
            {pedidos.slice(0, 5).map((p, i) => (
              <div key={i} className="flex justify-between p-3 bg-gray-50 rounded-xl">
                <div className="overflow-hidden">
                  <p className="font-bold text-gray-800 text-sm truncate">{p.cliente}</p>
                  <p className="text-xs text-gray-500 truncate">{p.producto}</p>
                </div>
                <p className="font-bold text-green-700 text-sm">{formatCLP(p.total)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const PedidosView = ({ pedidos }: { pedidos: PedidoHidrocampo[] }) => {
  const [filter, setFilter] = useState('');
  const filtered = pedidos.filter(p => p.cliente.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[calc(100vh-140px)] animate-in slide-in-from-right-4">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center gap-4">
        <h2 className="text-xl font-bold text-gray-800">Historial de Pedidos</h2>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Buscar cliente..." className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm" value={filter} onChange={e => setFilter(e.target.value)} />
        </div>
      </div>
      <div className="overflow-auto flex-1 p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500 sticky top-0">
            <tr>
              <th className="px-6 py-4">Fecha</th>
              <th className="px-6 py-4">Cliente</th>
              <th className="px-6 py-4">Producto</th>
              <th className="px-6 py-4 text-right">Total</th>
              <th className="px-6 py-4 text-center">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((p, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-xs">{new Date(p.fecha).toLocaleDateString()}</td>
                <td className="px-6 py-4 font-medium">{p.cliente}</td>
                <td className="px-6 py-4">{p.producto} <span className="text-xs text-gray-400 block">{p.formato}</span></td>
                <td className="px-6 py-4 font-bold text-right">{formatCLP(p.total)}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs capitalize ${p.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{p.estado}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- NUEVO: VISTA DE CLIENTES Y PRECIOS NEGOCIADOS ---
const ClientesView = ({ productosNegociados, clientesUnicos }: { productosNegociados: ProductoNegociado[], clientesUnicos: string[] }) => {
  const [selectedCliente, setSelectedCliente] = useState<string | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ producto: '', formato: '', precio: '' });
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el buscador
  
  // Estado local para simular la adición de productos (se reinicia al recargar)
  const [localProductos, setLocalProductos] = useState(productosNegociados);

  const productosCliente = useMemo(() => {
    if (!selectedCliente) return [];
    return localProductos.filter(p => p.cliente === selectedCliente);
  }, [selectedCliente, localProductos]);

  const filteredClientes = useMemo(() => {
    return clientesUnicos.filter(cliente => 
      cliente.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clientesUnicos, searchTerm]);

  const handleAddProduct = () => {
    if (!selectedCliente) return;
    const nuevo = {
      cliente: selectedCliente,
      producto: newProduct.producto || 'Nuevo Producto',
      formato: newProduct.formato || 'Unidad',
      precio: Number(newProduct.precio) || 0
    };
    setLocalProductos([...localProductos, nuevo]);
    setIsAddingProduct(false);
    setNewProduct({ producto: '', formato: '', precio: '' });
  };

  if (selectedCliente) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-[calc(100vh-140px)] flex flex-col animate-in slide-in-from-right-4">
        {/* Header Detalle */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSelectedCliente(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{selectedCliente}</h2>
              <p className="text-sm text-green-600 flex items-center gap-1">
                <FileText className="w-3 h-3" /> Lista de Precios Negociada
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsAddingProduct(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Negociar Producto</span>
          </button>
        </div>

        {/* Modal Agregar Producto (Simulado) */}
        {isAddingProduct && (
          <div className="p-4 bg-green-50 border-b border-green-100 flex flex-col sm:flex-row gap-3 items-end sm:items-center animate-in slide-in-from-top-2">
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
               <input 
                 autoFocus
                 placeholder="Nombre Producto (ej: Zapallo)" 
                 className="px-3 py-2 rounded-lg border border-green-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                 value={newProduct.producto}
                 onChange={e => setNewProduct({...newProduct, producto: e.target.value})}
               />
               <input 
                 placeholder="Formato (ej: Saco 20kg)" 
                 className="px-3 py-2 rounded-lg border border-green-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                 value={newProduct.formato}
                 onChange={e => setNewProduct({...newProduct, formato: e.target.value})}
               />
               <input 
                 type="number"
                 placeholder="Precio Negociado ($)" 
                 className="px-3 py-2 rounded-lg border border-green-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                 value={newProduct.precio}
                 onChange={e => setNewProduct({...newProduct, precio: e.target.value})}
               />
             </div>
             <div className="flex gap-2">
               <button onClick={handleAddProduct} className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700"><Save className="w-4 h-4"/></button>
               <button onClick={() => setIsAddingProduct(false)} className="p-2 bg-white text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50"><X className="w-4 h-4"/></button>
             </div>
          </div>
        )}

        {/* Tabla Productos Negociados */}
        <div className="flex-1 overflow-auto bg-gray-50/50 p-6">
          {productosCliente.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Este cliente aún no tiene lista de precios propia.</p>
              <button onClick={() => setIsAddingProduct(true)} className="text-green-600 font-medium hover:underline mt-2">Agregar primer producto</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <div className="col-span-5">Producto / Formato</div>
                <div className="col-span-3 text-right">Precio Negociado</div>
                <div className="col-span-4 text-center">Acciones Rápidas</div>
              </div>
              
              {productosCliente.map((p, i) => (
                <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-green-200 transition-all flex flex-col sm:grid sm:grid-cols-12 gap-4 items-center group">
                  <div className="col-span-5 w-full">
                    <p className="font-bold text-gray-800">{p.producto}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Package className="w-3 h-3" /> {p.formato}
                    </p>
                  </div>
                  <div className="col-span-3 w-full flex justify-between sm:justify-end items-center">
                    <span className="sm:hidden text-xs text-gray-400 uppercase">Precio:</span>
                    <div className="text-right">
                       <span className="block font-bold text-gray-900 text-lg">{formatCLP(p.precio)}</span>
                       <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Fijo/Negociado</span>
                    </div>
                  </div>
                  <div className="col-span-4 w-full flex items-center justify-end sm:justify-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 mt-3 sm:mt-0">
                     {/* Simulación de tomar pedido */}
                     <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                       <button className="px-3 py-1 hover:bg-gray-200 text-gray-500">-</button>
                       <input className="w-12 text-center bg-transparent text-sm font-medium focus:outline-none" placeholder="0" />
                       <button className="px-3 py-1 hover:bg-gray-200 text-green-600">+</button>
                     </div>
                     <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar Precio">
                       <Edit2 className="w-4 h-4" />
                     </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Vista Lista de Clientes (CON BUSCADOR)
  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Barra de Búsqueda */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-4 sticky top-0 z-10">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar cliente por nombre..."
            className="w-full pl-10 pr-4 py-3 sm:py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-xs font-medium text-gray-500 whitespace-nowrap bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
            {filteredClientes.length} {filteredClientes.length === 1 ? 'cliente encontrado' : 'clientes encontrados'}
        </div>
      </div>

      {/* Grid de Clientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClientes.map((cliente, i) => (
          <div 
            key={i} 
            onClick={() => setSelectedCliente(cliente)}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:border-green-500 hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-700 font-bold text-lg group-hover:bg-green-600 group-hover:text-white transition-colors">
                {cliente.substring(0, 2).toUpperCase()}
              </div>
              <div className="bg-gray-100 p-2 rounded-full group-hover:bg-green-100 transition-colors">
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-green-600" />
              </div>
            </div>
            <h3 className="font-bold text-gray-900 mb-1 truncate">{cliente}</h3>
            <p className="text-sm text-gray-500 mb-4">Lista de precios activa</p>
            <div className="flex items-center gap-2 text-xs font-medium text-green-700 bg-green-50 px-3 py-2 rounded-lg w-fit">
              <FileText className="w-3 h-3" />
              Ver Productos Habituales
            </div>
          </div>
        ))}

        {/* Botón Nuevo Cliente (Siempre visible al final) */}
        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center text-gray-400 hover:border-green-500 hover:text-green-500 transition-colors cursor-pointer min-h-[180px]">
          <Plus className="w-10 h-10 mb-2" />
          <span className="font-medium">Nuevo Cliente</span>
        </div>
        
        {/* Mensaje si no hay resultados */}
        {filteredClientes.length === 0 && (
           <div className="col-span-full py-8 text-center text-gray-400">
             <p>No se encontraron clientes con "{searchTerm}"</p>
           </div>
        )}
      </div>
    </div>
  );
};

// --- APP PRINCIPAL ---

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pedidos' | 'clientes'>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [pedidos, setPedidos] = useState<PedidoHidrocampo[]>([]);
  const [productosNegociados, setProductosNegociados] = useState<ProductoNegociado[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 800)); // Simula red
        
        // Cargar Pedidos
        const pedidosParsed = parseCSV(DATOS_INICIALES_CSV);
        setPedidos(pedidosParsed);

        // Cargar Productos Negociados (Simulado desde CSV)
        const productosParsed = parseProductosCSV(DATOS_PRODUCTOS_CLIENTES_CSV);
        setProductosNegociados(productosParsed);

      } catch (error) {
        console.error("Error cargando datos", error);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  // Extraer clientes únicos de ambos orígenes
  const clientesUnicos = useMemo(() => {
    const fromPedidos = pedidos.map(p => p.cliente);
    const fromProductos = productosNegociados.map(p => p.cliente);
    return Array.from(new Set([...fromPedidos, ...fromProductos])).sort();
  }, [pedidos, productosNegociados]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pedidos', label: 'Pedidos', icon: FileText },
    { id: 'clientes', label: 'Gestión Clientes', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center gap-3 border-b border-gray-100">
            <div className="bg-green-600 p-2 rounded-lg"><Leaf className="w-6 h-6 text-white" /></div>
            <div><h1 className="text-xl font-bold text-gray-900 tracking-tight">HIDROCAMPO</h1><p className="text-xs text-green-600 font-medium">Panel de Control</p></div>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button key={item.id} onClick={() => { setActiveTab(item.id as any); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === item.id ? 'bg-green-50 text-green-700 shadow-sm border border-green-100' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <Icon className={`w-5 h-5 ${activeTab === item.id ? 'text-green-600' : 'text-gray-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 text-gray-600"><Menu className="w-6 h-6" /></button>
            <h2 className="text-lg font-semibold text-gray-800 capitalize">{menuItems.find(i => i.id === activeTab)?.label}</h2>
          </div>
          <div className="flex items-center gap-3"><div className="hidden sm:flex flex-col items-end mr-2"><span className="text-xs text-gray-400">Origen de datos</span><span className="text-xs font-medium text-green-600 flex items-center gap-1"><FileText className="w-3 h-3" /> Google Sheets</span></div></div>
        </header>

        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 animate-pulse"><RefreshCw className="w-8 h-8 animate-spin mb-4 text-green-600" /><p>Cargando Sistema...</p></div>
          ) : (
            <>
              {activeTab === 'dashboard' && <DashboardView pedidos={pedidos} />}
              {activeTab === 'pedidos' && <PedidosView pedidos={pedidos} />}
              {activeTab === 'clientes' && <ClientesView productosNegociados={productosNegociados} clientesUnicos={clientesUnicos} />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
