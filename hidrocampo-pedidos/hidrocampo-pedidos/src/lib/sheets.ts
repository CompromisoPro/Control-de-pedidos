import { google } from 'googleapis';
import { Cliente, ProductoCliente, Pedido, ItemPedido } from '@/types';

// Configuración de autenticación con Google Sheets
const getGoogleSheetsAuth = () => {
  const credentials = {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return auth;
};

const getSheets = async () => {
  const auth = getGoogleSheetsAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  return sheets;
};

const SHEET_ID = process.env.GOOGLE_SHEET_ID;

// ============================================
// CLIENTES
// ============================================

export async function getClientes(): Promise<Cliente[]> {
  try {
    const sheets = await getSheets();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'BBDD_Clientes!A2:L',
    });

    const rows = response.data.values || [];
    
    return rows.map((row, index) => ({
      id: `cliente-${index}`,
      diccionarioCliente: row[0] || '',
      nombreOficial: row[1] || '',
      rut: row[2] || '',
      direccionEntrega: row[3] || '',
      comuna: row[4] || '',
      formaPago: row[5] || '',
      comentario: row[6] || '',
      contacto: row[8] || '',
      telefono: row[9] || '',
      email: row[10] || '',
      horaRecepcion: row[11] || '',
    })).filter(c => c.diccionarioCliente); // Filtrar filas vacías
  } catch (error) {
    console.error('Error fetching clientes:', error);
    throw error;
  }
}

export async function getClienteByDiccionario(diccionario: string): Promise<Cliente | null> {
  const clientes = await getClientes();
  return clientes.find(c => c.diccionarioCliente === diccionario) || null;
}

// ============================================
// PRODUCTOS POR CLIENTE
// ============================================

export async function getProductos(): Promise<ProductoCliente[]> {
  try {
    const sheets = await getSheets();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'BD_Productos!A2:F',
    });

    const rows = response.data.values || [];
    
    return rows.map((row, index) => ({
      id: `producto-${index}`,
      cliente: row[0] || '',
      producto: row[2] || '',
      formato: row[3] || '',
      detalleProducto: row[4] || '',
      precioNeto: parseFloat(row[5]) || 0,
    })).filter(p => p.cliente && p.producto); // Filtrar filas vacías
  } catch (error) {
    console.error('Error fetching productos:', error);
    throw error;
  }
}

export async function getProductosByCliente(cliente: string): Promise<ProductoCliente[]> {
  const productos = await getProductos();
  return productos.filter(p => p.cliente === cliente);
}

// ============================================
// PEDIDOS
// ============================================

export async function getNextPedidoId(): Promise<string> {
  try {
    const sheets = await getSheets();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'BD_Pedidos!A2:A',
    });

    const rows = response.data.values || [];
    const year = new Date().getFullYear();
    
    // Buscar el último número del año actual
    const pedidosDelAno = rows
      .filter(row => row[0] && row[0].startsWith(`HC-${year}`))
      .map(row => {
        const match = row[0].match(/HC-\d{4}-(\d{4})/);
        return match ? parseInt(match[1]) : 0;
      });

    const ultimoNumero = pedidosDelAno.length > 0 ? Math.max(...pedidosDelAno) : 0;
    const nuevoNumero = (ultimoNumero + 1).toString().padStart(4, '0');
    
    return `HC-${year}-${nuevoNumero}`;
  } catch (error) {
    console.error('Error getting next pedido ID:', error);
    const year = new Date().getFullYear();
    return `HC-${year}-0001`;
  }
}

export async function crearPedido(
  cliente: Cliente,
  items: ItemPedido[],
  fechaDespacho: string,
  observaciones: string
): Promise<{ success: boolean; pedidoId: string; error?: string }> {
  try {
    const sheets = await getSheets();
    const pedidoId = await getNextPedidoId();
    const fechaRegistro = new Date().toISOString();

    // Preparar filas para insertar (una por cada item)
    const rows = items.map(item => [
      pedidoId,
      fechaRegistro,
      fechaDespacho,
      cliente.diccionarioCliente,
      cliente.nombreOficial,
      cliente.rut,
      cliente.direccionEntrega,
      cliente.comuna,
      cliente.contacto,
      cliente.telefono,
      cliente.formaPago,
      item.producto,
      item.formato,
      item.detalle,
      item.cantidad,
      item.precioUnitario,
      item.totalNeto,
      observaciones,
      'pendiente',
    ]);

    // Insertar en la hoja
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'BD_Pedidos!A:S',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: rows,
      },
    });

    return { success: true, pedidoId };
  } catch (error) {
    console.error('Error creating pedido:', error);
    return { 
      success: false, 
      pedidoId: '', 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    };
  }
}

export async function getPedidos(): Promise<any[]> {
  try {
    const sheets = await getSheets();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'BD_Pedidos!A2:S',
    });

    const rows = response.data.values || [];
    
    // Agrupar por ID de pedido
    const pedidosMap = new Map<string, any>();
    
    rows.forEach(row => {
      const pedidoId = row[0];
      if (!pedidoId) return;

      if (!pedidosMap.has(pedidoId)) {
        pedidosMap.set(pedidoId, {
          id: pedidoId,
          fechaRegistro: row[1],
          fechaDespacho: row[2],
          cliente: row[3],
          nombreOficial: row[4],
          rut: row[5],
          direccion: row[6],
          comuna: row[7],
          contacto: row[8],
          telefono: row[9],
          formaPago: row[10],
          observaciones: row[17],
          estado: row[18] || 'pendiente',
          items: [],
        });
      }

      pedidosMap.get(pedidoId).items.push({
        producto: row[11],
        formato: row[12],
        detalle: row[13],
        cantidad: parseFloat(row[14]) || 0,
        precioUnitario: parseFloat(row[15]) || 0,
        totalNeto: parseFloat(row[16]) || 0,
      });
    });

    return Array.from(pedidosMap.values());
  } catch (error) {
    console.error('Error fetching pedidos:', error);
    throw error;
  }
}

// ============================================
// UTILIDADES
// ============================================

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
}
