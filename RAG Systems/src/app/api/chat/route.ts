import { Pinecone } from '@pinecone-database/pinecone';
import { NextRequest } from 'next/server';

export const maxDuration = 30;

const NAMESPACE = 'tenant-primary';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const latestMsgObj = messages[messages.length - 1];
    const latestMessage = latestMsgObj.content || '';

    // 1. Initialize Pinecone
    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
    const indexName = process.env.PINECONE_INDEX || 'rag-index';
    const index = pinecone.Index(indexName);

    // 2. Vector Search + Reranking in a single Pinecone call (Fix 4)
    // Strategy: broad ANN recall (topK=10) → reranker precision-scores → returns top 3
    // Model: bge-reranker-v2-m3 (BAAI, free: 500 req/day on Pinecone Starter)
    const searchResponse = await index.namespace(NAMESPACE).searchRecords({
      query: {
        inputs: { text: latestMessage },
        topK: 10,  // Broader recall to give the reranker more to work with
      },
      rerank: {
        model: 'bge-reranker-v2-m3',
        rankFields: ['text'],
        topN: 3,   // After reranking, only keep the 3 most relevant chunks
        query: latestMessage,
      },
      fields: ['text', 'source', 'chunkIndex'],
    });

    // 3. Extract the reranked text chunks
    const hits = searchResponse.result?.hits || [];
    const contextChunks = hits.map(hit => (hit as any).fields?.text || '').filter(Boolean);
    const contextString = contextChunks.join('\n\n---\n\n');

    // 4. Assemble the RAG Prompt
    const systemPrompt = `You are an expert enterprise AI assistant.
Answer the user's question based strictly on the context provided below. 
If the answer cannot be found in the context, politely state that you don't know based on the provided documents.
Do not hallucinate or make up information.

CONTEXT:
${contextString}
`;

    // 5. Sanitize messages — only pass role + content as plain strings to Groq
    const groqMessages = messages.map((m: any) => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: typeof m.content === 'string' ? m.content : (m.parts?.[0]?.text ?? ''),
    }));

    // 6. Call Groq directly via native fetch (avoids Vercel AI SDK Responses API issues)
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          ...groqMessages,
        ],
        temperature: 0.1,
        stream: true,
      }),
    });

    if (!groqRes.ok) {
      const err = await groqRes.text();
      throw new Error(`Groq API error: ${err}`);
    }

    // 7. Stream SSE from Groq → parse → pipe plain text to client
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = groqRes.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6).trim();
            if (data === '[DONE]') {
              controller.close();
              return;
            }
            try {
              const json = JSON.parse(data);
              const text = json.choices?.[0]?.delta?.content;
              if (text) controller.enqueue(encoder.encode(text));
            } catch {
              // skip malformed chunks
            }
          }
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });

  } catch (error: any) {
    console.error('Chat API Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
