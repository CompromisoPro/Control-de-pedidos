import { NextRequest, NextResponse } from 'next/server';
import { crearPedido, getPedidos, getClienteByDiccionario } from '@/lib/sheets';
import { ItemPedido } from '@/types';

// 👇 AQUÍ AGREGUÉ LA LÍNEA MÁGICA 👇
export const dynamic = 'force-dynamic';

// GET - Obtener todos los pedidos
export async function GET(request: NextRequest) {
  try {
    const pedidos = await getPedidos();
    
    // Ordenar por fecha de registro (más recientes primero)
    pedidos.sort((a, b) => 
      new Date(b.fechaRegistro).getTime() - new Date(a.fechaRegistro).getTime()
    );
    
    return NextResponse.json({
      success: true,
      data: pedidos,
    });
  } catch (error) {
    console.error('Error en API pedidos GET:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener pedidos',
      },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo pedido
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { clienteDiccionario, fechaDespacho, items, observaciones } = body;

    // Validaciones
    if (!clienteDiccionario) {
      return NextResponse.json(
        { success: false, error: 'Cliente es requerido' },
        { status: 400 }
      );
    }

    if (!fechaDespacho) {
      return NextResponse.json(
        { success: false, error: 'Fecha de despacho es requerida' },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Debe incluir al menos un producto' },
        { status: 400 }
      );
    }

    // Obtener datos completos del cliente
    const cliente = await getClienteByDiccionario(clienteDiccionario);
    
    if (!cliente) {
      return NextResponse.json(
        { success: false, error: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    // Procesar items
    const itemsProcesados: ItemPedido[] = items.map((item: any) => ({
      producto: item.producto,
      formato: item.formato,
      detalle: item.detalle || '',
      cantidad: parseFloat(item.cantidad) || 0,
      precioUnitario: parseFloat(item.precioUnitario) || 0,
      totalNeto: (parseFloat(item.cantidad) || 0) * (parseFloat(item.precioUnitario) || 0),
    })).filter((item: ItemPedido) => item.cantidad > 0);

    if (itemsProcesados.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Debe incluir al menos un producto con cantidad mayor a 0' },
        { status: 400 }
      );
    }

    // Crear el pedido
    const resultado = await crearPedido(
      cliente,
      itemsProcesados,
      fechaDespacho,
      observaciones || ''
    );

    if (!resultado.success) {
      return NextResponse.json(
        { success: false, error: resultado.error },
        { status: 500 }
      );
    }

    // Calcular totales para la respuesta
    const subtotal = itemsProcesados.reduce((sum, item) => sum + item.totalNeto, 0);
    const iva = Math.round(subtotal * 0.19);
    const total = subtotal + iva;

    return NextResponse.json({
      success: true,
      data: {
        pedidoId: resultado.pedidoId,
        cliente: cliente,
        items: itemsProcesados,
        subtotal,
        iva,
        total,
        fechaDespacho,
      },
    });
  } catch (error) {
    console.error('Error en API pedidos POST:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al crear pedido',
      },
      { status: 500 }
    );
  }
}
