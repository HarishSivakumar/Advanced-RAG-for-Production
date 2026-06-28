import { NextRequest, NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import { LlamaParse } from 'llama-parse';
import { supabase } from '@/lib/supabase';

// Configurable constants matching frontend
const MAX_FILES = 50;
const MAX_TOTAL_SIZE = 25 * 1024 * 1024; // 25MB

// Helper to chunk text roughly by characters (recursive character splitter strategy)
function chunkText(text: string, chunkSize = 1000, overlap = 200): string[] {
  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    let endIndex = startIndex + chunkSize;
    
    // If we're not at the end of the text, try to find a natural break (newline or period)
    if (endIndex < text.length) {
      const nextNewline = text.lastIndexOf('\n', endIndex);
      const nextPeriod = text.lastIndexOf('. ', endIndex);
      
      const breakPoint = Math.max(nextNewline, nextPeriod);
      if (breakPoint > startIndex + chunkSize / 2) {
        endIndex = breakPoint + 1;
      }
    }

    chunks.push(text.slice(startIndex, endIndex).trim());
    startIndex = endIndex - overlap;
    
    // Failsafe to prevent infinite loops if overlap is too big
    if (startIndex >= endIndex) {
        startIndex = endIndex;
    }
  }

  return chunks.filter(c => c.length > 50); // Filter out tiny garbage chunks
}

export async function POST(req: NextRequest) {
  const results: Array<{
    file: string;
    status: 'success' | 'skipped' | 'error';
    chunks?: number;
    reason?: string;
  }> = [];

  try {
    const formData = await req.formData();
    const files = formData.getAll('documents') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }
    if (files.length > MAX_FILES) {
      return NextResponse.json({ error: `Too many files. Max is ${MAX_FILES}` }, { status: 400 });
    }

    let totalSize = 0;
    files.forEach(file => { totalSize += file.size; });
    if (totalSize > MAX_TOTAL_SIZE) {
      return NextResponse.json({ error: 'Total file size exceeds 25MB limit' }, { status: 400 });
    }

    // Initialize Pinecone
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
    const indexName = process.env.PINECONE_INDEX || 'rag-index';
    const index = pinecone.Index(indexName);

    // Initialize Llama Parse
    const reader = new LlamaParse({ 
      apiKey: process.env.LLAMA_CLOUD_API_KEY! 
    });

    // FIX 3: Process each file in isolation — one failure cannot abort other files
    for (const file of files) {
      try {
        // FIX 2: Idempotency — skip already-indexed files
        if (supabase) {
          const { data: existing } = await supabase
            .from('documents')
            .select('id')
            .eq('filename', file.name)
            .maybeSingle();

          if (existing) {
            console.log(`Skipping ${file.name} — already indexed`);
            results.push({ file: file.name, status: 'skipped', reason: 'Already indexed. Delete it first to re-index.' });
            continue;
          }
        }

        console.log(`Parsing ${file.name}...`);
        
        // 2. Parse PDF to Markdown using Llama Parse
        const parsedResult = await reader.parseFile(file);
        const parsedText = parsedResult.markdown;
        
        // 3. Chunk the parsed text
        console.log(`Chunking ${file.name}...`);
        const chunks = chunkText(parsedText);
        
        if (chunks.length === 0) {
          results.push({ file: file.name, status: 'error', reason: 'No readable text extracted from PDF.' });
          continue;
        }

        // 4. Prepare records for Pinecone Inference
        // FIX 1: Use crypto.randomUUID() — IDs are never derived from filename.
        // Deletion still works because we filter by `source` metadata, not ID prefix.
        const records = chunks.map((chunk, i) => ({
          id: crypto.randomUUID(),   // Collision-safe — no two uploads can corrupt each other
          text: chunk,               // Sent to Pinecone Inference & stored as metadata
          source: file.name,         // Used as deletion filter key
          chunkIndex: i,
          timestamp: new Date().toISOString()
        }));

        // 5. Upsert to Pinecone in batches to avoid payload limits
        const BATCH_SIZE = 50; 
        for (let i = 0; i < records.length; i += BATCH_SIZE) {
          const batch = records.slice(i, i + BATCH_SIZE);
          await index.namespace("default").upsertRecords({
            records: batch
          });
        }
        
        // 6. Insert metadata into Supabase
        if (!supabase) {
          console.warn("Supabase is not configured. Document metadata won't be saved.");
        } else {
          const { error: dbError } = await supabase
            .from('documents')
            .insert([{ 
              filename: file.name, 
              size_bytes: file.size, 
              chunk_count: chunks.length 
            }]);
            
          if (dbError) {
            console.error("Failed to insert document into Supabase:", dbError);
            // Don't throw — vectors are indexed; metadata failure is recoverable
            console.warn(`Vectors indexed but metadata not saved for ${file.name}: ${dbError.message}`);
          }
        }
        
        results.push({ file: file.name, status: 'success', chunks: records.length });

      } catch (fileError: any) {
        // FIX 3: Isolate per-file errors — other files in the batch continue processing
        console.error(`Error processing ${file.name}:`, fileError);
        results.push({ file: file.name, status: 'error', reason: fileError.message });
      }
    }

    const succeeded = results.filter(r => r.status === 'success').length;
    const skipped = results.filter(r => r.status === 'skipped').length;
    const failed = results.filter(r => r.status === 'error').length;

    return NextResponse.json({ 
      success: true,
      summary: `${succeeded} indexed, ${skipped} skipped, ${failed} failed out of ${files.length} files.`,
      results,
    });

  } catch (error: any) {
    console.error('Ingestion error:', error);
    return NextResponse.json({ 
      error: 'Failed to process documents', 
      details: error.message,
      results,
    }, { status: 500 });
  }
}
