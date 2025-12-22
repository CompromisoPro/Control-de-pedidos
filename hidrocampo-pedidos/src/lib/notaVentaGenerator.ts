import { Cliente } from '@/types';

interface ItemNotaVenta {
  producto: string;
  formato: string;
  detalle: string;
  cantidad: number;
  precioUnitario: number;
}

const formatCLP = (value: number): string => {
  return '$' + value.toLocaleString('es-CL');
};

export const generarNotaVenta = (
  pedidoId: string,
  cliente: Cliente,
  items: ItemNotaVenta[],
  fechaDespacho: string,
  observaciones: string
): void => {
  const fechaEmision = new Date().toLocaleDateString('es-CL');
  const subtotal = items.reduce((acc, item) => acc + item.cantidad * item.precioUnitario, 0);
  const iva = Math.round(subtotal * 0.19);
  const total = subtotal + iva;

  // Generar filas de la tabla
  const filasProductos = items
    .map(
      (item, index) => `
      <tr class="${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">
        <td class="px-4 py-2 font-medium text-gray-900">${item.producto}</td>
        <td class="px-4 py-2 text-gray-600 text-sm">${item.formato}</td>
        <td class="px-4 py-2 text-gray-500 text-sm">${item.detalle || '-'}</td>
        <td class="px-4 py-2 text-center font-semibold text-gray-800">${item.cantidad}</td>
        <td class="px-4 py-2 text-right font-mono text-gray-700">${formatCLP(item.precioUnitario)}</td>
        <td class="px-4 py-2 text-right font-mono font-semibold text-gray-900">${formatCLP(item.cantidad * item.precioUnitario)}</td>
      </tr>
    `
    )
    .join('');

  const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nota de Venta ${pedidoId} - HIDROCAMPO</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
    body { font-family: 'DM Sans', system-ui, sans-serif; }
    @media print {
      body { background: white !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      .no-print { display: none !important; }
      .nota-venta { box-shadow: none !important; margin: 0 !important; max-width: 100% !important; }
      @page { margin: 0.8cm; size: A4; }
    }
  </style>
</head>
<body class="bg-gray-200 min-h-screen py-8">
  
  <!-- Botones (no se imprimen) -->
  <div class="max-w-3xl mx-auto mb-4 px-4 no-print">
    <div class="flex gap-3 items-center flex-wrap">
      <button onclick="window.print()" class="bg-green-700 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-800 transition-colors shadow-lg flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
        Imprimir / Guardar PDF
      </button>
      <button onclick="window.close()" class="bg-gray-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-700 transition-colors">
        Cerrar
      </button>
    </div>
  </div>

  <!-- NOTA DE VENTA -->
  <div class="nota-venta max-w-3xl mx-auto bg-white shadow-xl">
    
    <!-- HEADER -->
    <div class="bg-green-700 text-white px-6 py-4">
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-3">
          <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z"/>
          </svg>
          <div>
            <h1 class="text-2xl font-bold">HIDROCAMPO</h1>
            <p class="text-green-200 text-xs">Cultivando Sabor</p>
          </div>
        </div>
        <div class="text-right">
          <p class="text-green-200 text-xs uppercase tracking-wide">Nota de Venta</p>
          <p class="text-2xl font-bold font-mono">${pedidoId}</p>
        </div>
      </div>
    </div>

    <!-- DATOS PRINCIPALES -->
    <div class="px-6 py-4 border-b border-gray-200">
      
      <!-- Fila 1: Cliente y Fechas -->
      <div class="flex flex-wrap justify-between items-start gap-4 mb-4">
        <div>
          <p class="text-xs text-gray-500 uppercase tracking-wide">Cliente</p>
          <p class="text-lg font-bold text-gray-900">${cliente.nombreOficial || cliente.diccionarioCliente}</p>
          <p class="text-sm text-gray-600">RUT: ${cliente.rut || 'No registrado'}</p>
        </div>
        <div class="text-right">
          <div class="flex gap-6">
            <div>
              <p class="text-xs text-gray-500 uppercase">Emisión</p>
              <p class="font-semibold text-gray-800">${fechaEmision}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 uppercase">Despacho</p>
              <p class="font-semibold text-green-700">${fechaDespacho}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Fila 2: Dirección, Contacto, Pago -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        <div>
          <p class="text-xs text-gray-500 uppercase">Dirección</p>
          <p class="text-gray-800">${cliente.direccionEntrega || 'No registrada'}</p>
          <p class="text-gray-600">${cliente.comuna || ''}</p>
        </div>
        <div>
          <p class="text-xs text-gray-500 uppercase">Contacto</p>
          <p class="text-gray-800 font-medium">${cliente.contacto || 'No registrado'}</p>
          <p class="text-gray-600">${cliente.telefono || ''}</p>
        </div>
        <div>
          <p class="text-xs text-gray-500 uppercase">Forma de Pago</p>
          <p class="text-gray-800 font-medium">${cliente.formaPago || 'A convenir'}</p>
        </div>
      </div>

      <!-- Observaciones (si hay) -->
      ${observaciones ? `
      <div class="mt-4 p-3 bg-amber-50 border-l-4 border-amber-400 text-sm">
        <p class="text-amber-800"><span class="font-semibold">Observaciones:</span> ${observaciones}</p>
      </div>
      ` : ''}
    </div>

    <!-- TABLA DE PRODUCTOS -->
    <div class="px-6 py-4">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b-2 border-green-700">
            <th class="px-4 py-2 text-left text-xs font-bold text-green-800 uppercase">Producto</th>
            <th class="px-4 py-2 text-left text-xs font-bold text-green-800 uppercase">Formato</th>
            <th class="px-4 py-2 text-left text-xs font-bold text-green-800 uppercase">Detalle</th>
            <th class="px-4 py-2 text-center text-xs font-bold text-green-800 uppercase">Cant.</th>
            <th class="px-4 py-2 text-right text-xs font-bold text-green-800 uppercase">Precio</th>
            <th class="px-4 py-2 text-right text-xs font-bold text-green-800 uppercase">Total</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          ${filasProductos}
        </tbody>
      </table>

      <!-- TOTALES -->
      <div class="mt-4 flex justify-end">
        <div class="w-64">
          <div class="border-t-2 border-gray-200 pt-3 space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Subtotal</span>
              <span class="font-mono font-medium">${formatCLP(subtotal)}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">IVA (19%)</span>
              <span class="font-mono font-medium">${formatCLP(iva)}</span>
            </div>
            <div class="flex justify-between text-lg font-bold border-t border-gray-200 pt-2 mt-2">
              <span class="text-gray-900">TOTAL</span>
              <span class="font-mono text-green-700">${formatCLP(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- FOOTER -->
    <div class="px-6 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex justify-between">
      <span>Sistema Hidrocampo</span>
      <span class="font-mono">${pedidoId} • ${fechaEmision}</span>
    </div>
  </div>

</body>
</html>
`;

  // Abrir en nueva pestaña
  const nuevaVentana = window.open('', '_blank');
  if (nuevaVentana) {
    nuevaVentana.document.write(htmlContent);
    nuevaVentana.document.close();
  }
};
