import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Cliente } from '@/types';

export const generatePDF = (
  pedidoId: string,
  cliente: Cliente,
  items: any[],
  fechaDespacho: string,
  observaciones: string
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // --- COLORES CORPORATIVOS ---
  const greenColor = '#2E7D32'; // Verde Hidrocampo
  const lightGreen = '#E8F5E9';

  // --- ENCABEZADO ---
  doc.setFontSize(22);
  doc.setTextColor(greenColor);
  doc.setFont('helvetica', 'bold');
  doc.text('HIDROCAMPO', 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.setFont('helvetica', 'normal');
  doc.text('Cultivando Sabor', 14, 25);

  // Datos del documento (Derecha)
  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.text('NOTA DE PEDIDO', pageWidth - 14, 20, { align: 'right' });
  
  doc.setFontSize(10);
  doc.text('N° Pedido: ' + pedidoId, pageWidth - 14, 26, { align: 'right' });
  doc.text('Fecha Emisión: ' + new Date().toLocaleDateString(), pageWidth - 14, 31, { align: 'right' });

  // Línea divisora
  doc.setDrawColor(greenColor);
  doc.setLineWidth(1);
  doc.line(14, 35, pageWidth - 14, 35);

  // --- DATOS DEL CLIENTE ---
  const startY = 45;
  
  // Fondo verde claro para cliente
  doc.setFillColor(lightGreen);
  doc.rect(14, startY - 5, pageWidth / 2 - 20, 35, 'F');
  
  doc.setFontSize(11);
  doc.setTextColor(greenColor);
  doc.setFont('helvetica', 'bold');
  doc.text('CLIENTE:', 18, startY);

  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.setFont('helvetica', 'normal');
  
  // Usamos el nombre que esté disponible
  const nombre = cliente.nombreOficial || cliente.diccionarioCliente;
  const direccion = cliente.direccionEntrega || 'No registrada';
  const rut = cliente.rut || 'No registrado';
  const contacto = cliente.contacto || cliente.telefono || 'No registrado';

  doc.text(nombre.substring(0, 35), 18, startY + 6);
  doc.setFontSize(9);
  doc.text('RUT: ' + rut, 18, startY + 11);
  doc.text('Dir: ' + direccion.substring(0, 40), 18, startY + 16);
  doc.text('Tel: ' + contacto, 18, startY + 21);

  // --- DATOS DE ENTREGA (Derecha) ---
  doc.setFillColor(250, 250, 250);
  doc.rect(pageWidth / 2 + 5, startY - 5, pageWidth / 2 - 19, 35, 'F');

  doc.setFontSize(11);
  doc.setTextColor(greenColor);
  doc.setFont('helvetica', 'bold');
  doc.text('ENTREGA:', pageWidth / 2 + 10, startY);

  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.setFont('helvetica', 'normal');
  
  doc.text('Fecha Despacho: ' + fechaDespacho, pageWidth / 2 + 10, startY + 6);
  doc.text('Pago: ' + (cliente.formaPago || 'A Convenir'), pageWidth / 2 + 10, startY + 11);
  
  if (observaciones) {
    doc.setFontSize(9);
    doc.setTextColor(100);
    // Ajuste de texto largo
    const obsLines = doc.splitTextToSize('Nota: ' + observaciones, (pageWidth / 2) - 25);
    doc.text(obsLines, pageWidth / 2 + 10, startY + 18);
  }

  // --- TABLA DE PRODUCTOS ---
  const tableRows = items.map((item) => [
    item.producto,
    item.detalle || '-',
    item.formato,
    item.cantidad,
    '$' + item.precioUnitario.toLocaleString('es-CL'),
    '$' + (item.cantidad * item.precioUnitario).toLocaleString('es-CL')
  ]);

  const totalNeto = items.reduce((acc, item) => acc + (item.cantidad * item.precioUnitario), 0);

  autoTable(doc, {
  startY: startY + 40,
  head: [['PRODUCTO', 'DETALLE', 'FORMATO', 'CANT.', 'PRECIO', 'TOTAL']],
  body: tableRows,
  theme: 'grid',
  headStyles: { fillColor: [46, 125, 50] }, // Verde Hidrocampo
  styles: { fontSize: 9, cellPadding: 3 },
  columnStyles: {
    0: { cellWidth: 50 },
    5: { halign: 'right' },
    4: { halign: 'right' },
    3: { halign: 'center' }
  }
});
  // --- TOTALES ---
  const finalY = (doc as any).lastAutoTable.finalY + 10;

  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL NETO: $' + totalNeto.toLocaleString('es-CL'), pageWidth - 14, finalY, { align: 'right' });

  // Pie de página
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text('Generado por Sistema Hidrocampo', pageWidth / 2, 280, { align: 'center' });

  doc.save('Pedido_' + pedidoId + '.pdf');
};
