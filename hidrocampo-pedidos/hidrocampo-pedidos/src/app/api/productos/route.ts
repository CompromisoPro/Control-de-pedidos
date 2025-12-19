import { NextRequest, NextResponse } from 'next/server';
import { getProductosByCliente } from '@/lib/sheets';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cliente = searchParams.get('cliente');

    if (!cliente) {
      return NextResponse.json(
        {
          success: false,
          error: 'Parámetro cliente es requerido',
        },
        { status: 400 }
      );
    }

    const productos = await getProductosByCliente(cliente);
    
    // Ordenar por producto
    productos.sort((a, b) => a.producto.localeCompare(b.producto));
    
    return NextResponse.json({
      success: true,
      data: productos,
    });
  } catch (error) {
    console.error('Error en API productos:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener productos',
      },
      { status: 500 }
    );
  }
}
