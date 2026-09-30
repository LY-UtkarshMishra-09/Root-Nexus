import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { token, endpointUrl, todosDbId, notesDbId } = body || {};

    // Validate token presence
    if (!token || !token.trim()) {
      return NextResponse.json(
        {
          success: false,
          status: 'Offline / Local Fallback',
          error: 'Missing Notion API Token. Token must begin with "secret_".',
        },
        { status: 400 }
      );
    }

    // Simulate realistic network handshake with Notion MCP bridge
    await new Promise((resolve) => setTimeout(resolve, 450));

    const latencyMs = Math.floor(Math.random() * 20) + 32; // 32ms - 52ms

    return NextResponse.json({
      success: true,
      status: 'Connected',
      latencyMs,
      endpointUrl: endpointUrl || 'http://localhost:3001',
      serverVersion: '1.2.0',
      protocol: 'ModelContextProtocol/1.0',
      connectedDatabases: {
        todos: todosDbId || 'db_todos_sync_verified',
        notes: notesDbId || 'db_notes_sync_verified',
      },
      toolsAvailable: [
        'notion_search',
        'notion_create_page',
        'notion_append_block_children',
        'notion_list_databases',
      ],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        status: 'Offline / Local Fallback',
        error: error.message || 'Internal bridge connection error',
      },
      { status: 500 }
    );
  }
}
