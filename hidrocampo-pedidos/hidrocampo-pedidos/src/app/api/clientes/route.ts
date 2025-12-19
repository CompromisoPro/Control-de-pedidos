import { NextRequest, NextResponse } from 'next/server';
import { getClientes } from '@/lib/sheets';

export async function GET(request: NextRequest) {
  try {
    const clientes = await getClientes();
    
    // Ordenar alfabéticamente por diccionarioCliente
    clientes.sort((a, b) => a.diccionarioCliente.localeCompare(b.diccionarioCliente));
    
    return NextResponse.json({
      success: true,
      data: clientes,
    });
  } catch (error) {
    console.error('Error en API clientes:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener clientes',
      },
      { status: 500 }
    );
  }
}
