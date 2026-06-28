import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Pinecone } from '@pinecone-database/pinecone';

export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase keys are missing in .env.local' }, { status: 500 });
    }
    
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    return NextResponse.json({ documents: data || [] });
  } catch (error: any) {
    console.error('Fetch documents error:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id, filename } = await req.json();

    if (!id || !filename) {
      return NextResponse.json({ error: 'Missing document id or filename' }, { status: 400 });
    }

    // 1. Delete from Pinecone
    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
    const indexName = process.env.PINECONE_INDEX || 'llama-text-embed-v2-index';
    const index = pinecone.Index(indexName);

    // Pinecone serverless supports deleting by metadata
    await index.namespace('default').deleteMany({
      filter: { source: filename }
    });

    // 2. Delete from Supabase
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase keys are missing in .env.local' }, { status: 500 });
    }

    const { error: dbError } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (dbError) throw new Error(dbError.message);

    return NextResponse.json({ success: true, message: 'Document deleted successfully' });
  } catch (error: any) {
    console.error('Delete document error:', error);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}
