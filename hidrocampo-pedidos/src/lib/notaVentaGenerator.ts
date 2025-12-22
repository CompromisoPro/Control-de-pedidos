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
        <td class="px-4 py-3 font-semibold text-gray-900">${item.producto}</td>
        <td class="px-4 py-3 text-gray-600 text-sm">${item.formato}</td>
        <td class="px-4 py-3 text-gray-500 text-sm">${item.detalle || '-'}</td>
        <td class="px-4 py-3 text-center font-bold text-green-700">${item.cantidad}</td>
        <td class="px-4 py-3 text-right font-mono text-gray-700">${formatCLP(item.precioUnitario)}</td>
        <td class="px-4 py-3 text-right font-mono font-semibold text-gray-900">${formatCLP(item.cantidad * item.precioUnitario)}</td>
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
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            hidrocampo: { green: '#2E7D32', 'green-dark': '#1B5E20' }
          }
        }
      }
    }
  </script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
    body { font-family: 'DM Sans', system-ui, sans-serif; }
    @media print {
      body { background: white !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      .no-print { display: none !important; }
      .nota-venta { box-shadow: none !important; margin: 0 !important; max-width: 100% !important; }
      @page { margin: 0.5cm; size: A4; }
    }
  </style>
</head>
<body class="bg-gray-200 min-h-screen py-8">
  
  <!-- Botones (no se imprimen) -->
  <div class="max-w-4xl mx-auto mb-4 px-4 no-print">
    <div class="flex gap-3 items-center flex-wrap">
      <button onclick="window.print()" class="bg-green-700 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-800 transition-colors shadow-lg flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
        Imprimir / Guardar PDF
      </button>
      <button onclick="window.close()" class="bg-gray-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-700 transition-colors">
        Cerrar
      </button>
      <span class="text-sm text-gray-600">💡 En el diálogo de impresión elige "Guardar como PDF"</span>
    </div>
  </div>

  <!-- NOTA DE VENTA -->
  <div class="nota-venta max-w-4xl mx-auto bg-white shadow-2xl rounded-lg overflow-hidden">
    
    <!-- HEADER -->
    <div class="bg-gradient-to-r from-green-800 via-green-700 to-green-600 text-white p-6">
      <div class="flex justify-between items-start">
        <div>
          <div class="flex items-center gap-3">
            <div class="bg-white rounded-lg p-2">
              <svg class="w-10 h-10 text-green-700" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z"/>
              </svg>
            </div>
            <div>
              <h1 class="text-3xl font-bold tracking-tight">HIDROCAMPO</h1>
              <p class="text-green-200 text-sm font-medium -mt-1">CULTIVANDO SABOR</p>
            </div>
          </div>
          <div class="mt-3 text-xs text-green-100 space-y-0.5">
            <p>📧 ventas@hidrocampo.cl</p>
            <p>🌐 hidrocampo.cl</p>
          </div>
        </div>
        <div class="text-right">
          <div class="bg-white/10 backdrop-blur-sm border border-white/20 px-5 py-3 rounded-xl">
            <p class="text-green-200 text-xs uppercase tracking-widest font-medium">Nota de Venta</p>
            <p class="text-3xl font-bold font-mono mt-1">${pedidoId}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- BARRA DE FECHAS -->
    <div class="bg-green-50 border-b-2 border-green-100 px-6 py-3">
      <div class="flex justify-between items-center text-sm flex-wrap gap-2">
        <div class="flex items-center gap-2">
          <span class="text-gray-500">📅 Emisión:</span>
          <span class="font-semibold text-gray-800 bg-white px-2 py-0.5 rounded">${fechaEmision}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-gray-500">🚚 Despacho:</span>
          <span class="font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded">${fechaDespacho}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-gray-500">💳 Pago:</span>
          <span class="font-semibold text-gray-800 bg-white px-2 py-0.5 rounded">${cliente.formaPago || 'A Convenir'}</span>
        </div>
      </div>
    </div>

    <!-- DATOS CLIENTE -->
    <div class="p-6 border-b border-gray-200 bg-white">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
          <div class="flex items-center gap-2 mb-3">
            <div class="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
            </div>
            <h3 class="text-xs font-bold text-green-700 uppercase tracking-wide">Cliente</h3>
          </div>
          <p class="font-bold text-gray-900 text-lg">${cliente.nombreOficial || cliente.diccionarioCliente}</p>
          <p class="text-sm text-gray-600 mt-1">RUT: ${cliente.rut || 'No registrado'}</p>
          <p class="text-sm text-gray-600">${cliente.direccionEntrega || 'Dirección no registrada'}</p>
          <p class="text-sm text-gray-600">${cliente.comuna || ''}</p>
        </div>
        <div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
          <div class="flex items-center gap-2 mb-3">
            <div class="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
            <h3 class="text-xs font-bold text-green-700 uppercase tracking-wide">Contacto</h3>
          </div>
          <p class="font-bold text-gray-900">${cliente.contacto || 'No registrado'}</p>
          <p class="text-sm text-gray-600 mt-1">📞 ${cliente.telefono || 'No registrado'}</p>
          ${
            observaciones
              ? `<div class="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                  <p class="text-xs text-amber-800"><span class="font-bold">📝 Nota:</span> ${observaciones}</p>
                </div>`
              : ''
          }
        </div>
      </div>
    </div>

    <!-- TABLA DE PRODUCTOS -->
    <div class="p-6">
      <table class="w-full border-collapse">
        <thead>
          <tr class="bg-green-700 text-white">
            <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide rounded-tl-lg">Producto</th>
            <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">Formato</th>
            <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">Detalle</th>
            <th class="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide w-20">Cant.</th>
            <th class="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide">Precio</th>
            <th class="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide rounded-tr-lg">Total</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          ${filasProductos}
        </tbody>
      </table>

      <!-- TOTALES -->
      <div class="mt-6 flex justify-end">
        <div class="w-80">
          <div class="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-sm">
            <div class="px-5 py-3 flex justify-between items-center border-b border-gray-100">
              <span class="text-gray-600">Subtotal</span>
              <span class="font-mono font-semibold text-gray-800">${formatCLP(subtotal)}</span>
            </div>
            <div class="px-5 py-3 flex justify-between items-center border-b border-gray-100 bg-gray-50">
              <span class="text-gray-600">IVA (19%)</span>
              <span class="font-mono font-semibold text-gray-800">${formatCLP(iva)}</span>
            </div>
            <div class="px-5 py-4 flex justify-between items-center bg-green-700 text-white">
              <span class="font-bold text-lg">TOTAL</span>
              <span class="font-mono font-bold text-2xl">${formatCLP(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- FOOTER -->
    <div class="bg-gray-100 px-6 py-4 border-t border-gray-200">
      <div class="flex justify-between items-center text-xs text-gray-500">
        <span>📄 Documento generado por Sistema Hidrocampo</span>
        <span class="font-mono">${pedidoId} • ${fechaEmision}</span>
      </div>
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
