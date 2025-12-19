// Tipos para el sistema de pedidos Hidrocampo

export interface Cliente {
  id: string;
  diccionarioCliente: string;
  nombreOficial: string;
  rut: string;
  direccionEntrega: string;
  comuna: string;
  formaPago: string;
  comentario: string;
  contacto: string;
  telefono: string;
  email: string;
  horaRecepcion: string;
}

export interface ProductoCliente {
  id: string;
  cliente: string;
  producto: string;
  formato: string;
  detalleProducto: string;
  precioNeto: number;
}

export interface ItemPedido {
  producto: string;
  formato: string;
  detalle: string;
  cantidad: number;
  precioUnitario: number;
  totalNeto: number;
}

export interface Pedido {
  id: string;
  fechaRegistro: string;
  fechaDespacho: string;
  cliente: string;
  nombreOficial: string;
  rut: string;
  direccion: string;
  comuna: string;
  contacto: string;
  telefono: string;
  formaPago: string;
  items: ItemPedido[];
  subtotal: number;
  iva: number;
  total: number;
  estado: 'pendiente' | 'procesando' | 'completado' | 'cancelado';
}

export interface NotaVenta {
  numero: string;
  fecha: string;
  cliente: Cliente;
  items: ItemPedido[];
  subtotal: number;
  iva: number;
  total: number;
}

// Estado del formulario de pedido
export interface PedidoFormState {
  clienteSeleccionado: string | null;
  fechaDespacho: string;
  items: Map<string, number>; // producto-formato -> cantidad
  observaciones: string;
}

// Respuestas de API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
