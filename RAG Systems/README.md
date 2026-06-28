# Advanced RAG for Production

> A fully serverless, zero-cost Retrieval-Augmented Generation (RAG) system built with Next.js 16, Pinecone Integrated Inference, LlamaCloud, Groq, and Supabase. Upload PDFs, ask questions, and get grounded, streamed answers — completely free to run.

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org)
[![Pinecone](https://img.shields.io/badge/Pinecone-Serverless-blue?logo=pinecone)](https://pinecone.io)
[![Groq](https://img.shields.io/badge/Groq-llama--3.1--8b--instant-orange)](https://groq.com)
[![Reranker](https://img.shields.io/badge/Reranker-bge--reranker--v2--m3-purple)](https://docs.pinecone.io/guides/search/rerank-results)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [System Design Decisions](#system-design-decisions)
3. [Zero-Cost Infrastructure Stack](#zero-cost-infrastructure-stack)
4. [Data Flow Diagrams](#data-flow-diagrams)
5. [Database Schema](#database-schema)
6. [API Contract](#api-contract)
7. [Project Structure](#project-structure)
8. [Environment Variables](#environment-variables)
9. [Local Development Setup](#local-development-setup)
10. [Operational Limits & Rate Limits](#operational-limits--rate-limits)
11. [Known Limitations & Future Work](#known-limitations--future-work)

---

## Architecture Overview

This system implements a **serverless RAG pipeline** with three distinct phases: Ingestion, Retrieval, and Generation. All compute runs inside Next.js API Routes deployed to Vercel's serverless edge network. There is no dedicated backend process — the system is entirely stateless and horizontally scalable by design.

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                             │
│   ┌──────────────────┐          ┌───────────────────────────────┐   │
│   │  UploadDropzone  │          │       ChatInterface            │   │
│   │  (React, fetch)  │          │  (React, ReadableStream API)   │   │
│   └────────┬─────────┘          └──────────────┬────────────────┘   │
└────────────│──────────────────────────────────│────────────────────┘
             │ multipart/form-data               │ POST /api/chat
             ▼                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    NEXT.JS API ROUTES (Serverless)                  │
│                                                                     │
│   POST /api/ingest          GET /api/documents   POST /api/chat     │
│   DELETE /api/documents                                             │
└───────────┬────────────────────────────────────────┬───────────────┘
            │                                        │
     ┌──────┴──────────────────┐         ┌───────────┴─────────────┐
     │     INGESTION PIPELINE  │         │     RETRIEVAL PIPELINE  │
     │                         │         │                         │
     │  1. LlamaCloud (Parse)  │         │  1. Pinecone Search     │
     │  2. chunkText() (Split) │         │     (Integrated Embed)  │
     │  3. Pinecone Upsert     │         │  2. Context Assembly    │
     │     (Integrated Embed)  │         │  3. Groq Stream         │
     │  4. Supabase Insert     │         │     (llama-3.1-8b)      │
     └─────────────────────────┘         └─────────────────────────┘
```

---

## System Design Decisions

### 0. Architecture Hardening Decisions

The following patterns were deliberately chosen to avoid common RAG production pitfalls:

- **Collision-safe chunk IDs:** Every chunk is assigned `crypto.randomUUID()` instead of a derivation from the filename. Two documents with identical names can coexist without silently corrupting each other's vectors. Deletion still works because it filters on the `source` metadata field, not on the ID.
- **Idempotency:** Before indexing any file, the API queries Supabase to check if a document with that filename already exists. Duplicate uploads return a `skipped` status instead of silently creating ghost vectors.
- **Per-file error isolation:** The ingestion loop wraps each file in an isolated `try/catch`. A corrupt PDF or LlamaParse timeout does not abort processing for the remaining files in the batch. The API always returns a per-file `results` array.
- **Two-stage retrieval (ANN + Reranking):** Initial ANN search fetches `topK=10` candidates. A dedicated reranker (`bge-reranker-v2-m3`) precision-scores all 10 and returns only the top 3 to the LLM. This significantly reduces context noise and hallucination.

---

### 1. Pinecone Integrated Inference (No Separate Embedding Model)
Rather than running a separate embedding service (e.g., calling HuggingFace or OpenAI Embeddings), this system uses **Pinecone Integrated Inference**. When you upsert a record with a `text` field, Pinecone's inference layer embeds the text automatically using `llama-text-embed-v2` (NVIDIA-hosted, dense, 2048-token max context). The same model is used at query time when you call `searchRecords`. This eliminates an entire network hop and a separate API dependency.

**Trade-off:** You lose the ability to swap embedding models without re-indexing all vectors. Accepted for this use case.

### 2. Groq Direct REST API (No Vercel AI SDK for LLM)
The Vercel AI SDK (`@ai-sdk/openai`) v4.x routes requests through Groq's **Responses API** (`/openai/v1/responses`). Groq does not fully support all fields in this newer OpenAI-compatible spec, causing `AI_APICallError: Input contains unsupported content types`. 

The solution is to call Groq's battle-tested **Chat Completions API** (`/openai/v1/chat/completions`) directly via native `fetch`, then manually parse the SSE (Server-Sent Events) stream and pipe plain text tokens to the browser.

### 3. Supabase as the Metadata Store
Pinecone is a vector database — it is optimized for ANN (Approximate Nearest Neighbour) similarity search, not structured relational queries. Listing all distinct indexed documents requires a full index scan which is not supported on the Starter plan. Supabase (Postgres) acts as the **source of truth for document metadata** (filename, size, chunk count, timestamp). All delete operations are two-phase: Pinecone first (via metadata filter), Supabase second.

### 4. Recursive Character Text Splitter
A custom `chunkText()` function implements a character-based sliding window splitter:
- **Chunk size:** 1,000 characters
- **Overlap:** 200 characters (preserves sentence continuity across chunk boundaries)
- **Smart boundary detection:** Prefers natural sentence/paragraph breaks (`.` or `\n`) over hard splits
- **Garbage filter:** Drops any chunk < 50 characters

---

## Zero-Cost Infrastructure Stack

All services below operate 100% within free tiers. **No credit card is required for any of them.** Rate limits cause hard errors (HTTP 429/503), never unexpected charges.

| Layer | Service | Model / Tier | Free Limit | On Limit Exceeded |
|---|---|---|---|---|
| **Frontend** | Vercel Hobby | Next.js 16 SSR | 100 GB bandwidth/mo | Soft block |
| **PDF Parsing** | LlamaCloud | Free Tier | 1,000 pages/day | `429 Too Many Requests` |
| **Vector Store** | Pinecone Serverless | Starter Plan | 5M inference tokens, 1 index | `429` / request blocked |
| **Embedding** | Pinecone (`llama-text-embed-v2`) | NVIDIA-hosted | 5M tokens/mo | Included in Pinecone limit |
| **Metadata DB** | Supabase | Free Tier | 500 MB storage, 2 GB bandwidth | Project paused |
| **LLM** | Groq | Free Dev Tier | 14,400 req/day, 30 req/min | `429 Too Many Requests` |
| **LLM Model** | `llama-3.1-8b-instant` | Meta / Groq-hosted | — | Included in Groq limit |

---

## Data Flow Diagrams

### Ingestion Flow

```
User selects PDF(s)
       │
       │  POST /api/ingest (multipart/form-data)
       ▼
┌──────────────────────────────────────────────┐
│ Validation Layer                              │
│  • files.length ≤ 50                          │
│  • totalSize ≤ 25 MB                          │
└────────────────────┬─────────────────────────┘
                     │ For each file:
                     ▼
┌──────────────────────────────────────────────┐
│ LlamaCloud (LlamaParse)                       │
│  • Converts PDF binary → structured Markdown  │
│  • Preserves tables, headers, lists           │
│  • Output: parsedText (string)                │
└────────────────────┬─────────────────────────┘
                     ▼
┌──────────────────────────────────────────────┐
│ chunkText(parsedText, size=1000, overlap=200) │
│  • Sliding window over character array        │
│  • Prefers sentence/newline boundaries        │
│  • Filters chunks < 50 chars                  │
│  • Output: string[]                           │
└────────────────────┬─────────────────────────┘
                     ▼
┌──────────────────────────────────────────────┐
│ Record Assembly                               │
│  Each record:                                 │
│  {                                            │
│    id: "uuid-v4-string",         ← collision  │
│    text: "<chunk content>",      ← embedded   │
│    source: "{filename}",         ← filter key │
│    chunkIndex: i,                             │
│    timestamp: ISO8601                         │
│  }                                            │
└────────────────────┬─────────────────────────┘
                     ▼
┌──────────────────────────────────────────────┐
│ Pinecone upsertRecords (batches of 50)        │
│  • Integrated Inference embeds text[]         │
│  • Dense vectors stored in "default"          │
│    namespace                                  │
└────────────────────┬─────────────────────────┘
                     ▼
┌──────────────────────────────────────────────┐
│ Supabase INSERT into documents table          │
│  { filename, size_bytes, chunk_count }        │
└────────────────────┬─────────────────────────┘
                     ▼
       200 { success: true, message: "..." }
```

---

### Retrieval & Generation Flow (RAG — with Reranking)

```
User types message → Submit
       │
       │  POST /api/chat { messages: Message[] }
       ▼
┌──────────────────────────────────────────────┐
│ Extract latest user message (content string)  │
└────────────────────┬─────────────────────────┘
                     ▼
┌──────────────────────────────────────────────┐
│ Pinecone searchRecords (Stage 1: ANN Recall)  │
│  query: { inputs: { text: latestMessage },    │
│           topK: 10 }                          │
│  → Pinecone embeds query text inline          │
│  → ANN search over "default" namespace        │
│  → Returns top-10 candidates by cosine sim    │
└────────────────────┬─────────────────────────┘
                     ▼
┌──────────────────────────────────────────────┐
│ Pinecone Reranker (Stage 2: Precision)        │
│  model: bge-reranker-v2-m3                    │
│  rankFields: ["text"]                         │
│  topN: 3  ← only 3 chunks reach the LLM      │
│  → Cross-encoder re-scores all 10 candidates  │
│  → Returns 3 highest-relevance chunks         │
└────────────────────┬─────────────────────────┘
                     ▼
┌──────────────────────────────────────────────┐
│ Context Assembly                              │
│  contextString = hits.map(h => h.fields.text) │
│                      .join("\n\n---\n\n")     │
└────────────────────┬─────────────────────────┘
                     ▼
┌──────────────────────────────────────────────┐
│ Groq Chat Completions API (native fetch)      │
│  POST https://api.groq.com/openai/v1/         │
│            chat/completions                   │
│  model: llama-3.1-8b-instant                  │
│  messages:                                    │
│   [{ role: "system", content: systemPrompt }  │
│    ...sanitized conversation history]         │
│  temperature: 0.1                             │
│  stream: true                                 │
└────────────────────┬─────────────────────────┘
                     ▼
┌──────────────────────────────────────────────┐
│ SSE Stream Parser (ReadableStream)            │
│  • Reads SSE chunks from Groq body            │
│  • Parses data: {...} lines                   │
│  • Extracts choices[0].delta.content          │
│  • Encodes & enqueues plain text tokens       │
└────────────────────┬─────────────────────────┘
                     ▼
       Response: text/plain stream
       (consumed by browser ReadableStream API)
```

---

### Document Deletion Flow

```
User clicks 🗑️ on document
       │
       │  DELETE /api/documents { id, filename }
       ▼
┌──────────────────────────────────────────────┐
│ Pinecone deleteMany                           │
│  filter: { source: filename }                 │
│  → Deletes ALL vectors where metadata.source  │
│    matches the filename                       │
│  namespace: "default"                         │
└────────────────────┬─────────────────────────┘
                     ▼
┌──────────────────────────────────────────────┐
│ Supabase DELETE FROM documents WHERE id=$1    │
└────────────────────┬─────────────────────────┘
                     ▼
       200 { success: true }
       UI re-fetches document list
```

---

## Database Schema

### Supabase (PostgreSQL)

```sql
-- Run this once in the Supabase SQL Editor before starting the app

create table documents (
  id           uuid      default gen_random_uuid() primary key,
  filename     text      not null,
  size_bytes   bigint    not null,
  chunk_count  int       not null,
  created_at   timestamp with time zone
               default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table documents enable row level security;

-- Allow anon key to read/write (API routes act as the access control layer)
create policy "Allow all operations for public"
  on documents
  for all
  using (true)
  with check (true);
```

| Column | Type | Description |
|---|---|---|
| `id` | `uuid` | Primary key, auto-generated |
| `filename` | `text` | Original PDF filename, used as Pinecone filter key |
| `size_bytes` | `bigint` | Raw file size in bytes |
| `chunk_count` | `int` | Number of vector chunks indexed into Pinecone |
| `created_at` | `timestamptz` | UTC timestamp of ingestion |

### Pinecone Vector Record Schema

Each chunk is stored as an **integrated inference record** (no pre-computed vectors):

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "text": "The raw text content of this chunk...",
  "source": "My Document.pdf",
  "chunkIndex": 0,
  "timestamp": "2026-06-28T08:33:00.000Z"
}
```

| Field | Type | Role |
|---|---|---|
| `id` | `uuid` | Collision-safe UUID generated by `crypto.randomUUID()`. Never derived from filename. |
| `text` | `string` | The chunk content. Pinecone embeds this automatically via Integrated Inference. |
| `source` | `string` | Original filename. Used as the **deletion filter key** — not the ID. |
| `chunkIndex` | `number` | Position of this chunk within the parent document. |
| `timestamp` | `ISO8601` | When the chunk was indexed. |

---

## API Contract

### `POST /api/ingest`

Parses, chunks, and indexes one or more PDFs into Pinecone. Saves metadata to Supabase.

**Request**
```
Content-Type: multipart/form-data
Field name: documents (can repeat for multiple files)
```

| Constraint | Value |
|---|---|
| Max files | 50 |
| Max total size | 25 MB |
| Accepted types | PDF |

**Response — 200 OK**
```json
{
  "success": true,
  "summary": "2 indexed, 0 skipped, 0 failed out of 2 files.",
  "results": [
    { "file": "report.pdf",  "status": "success", "chunks": 23 },
    { "file": "resume.pdf",  "status": "success", "chunks": 11 },
    { "file": "corrupt.pdf", "status": "error",   "reason": "LlamaParse timeout" },
    { "file": "old.pdf",     "status": "skipped",  "reason": "Already indexed. Delete it first to re-index." }
  ]
}
```

**Response — 400 Bad Request**
```json
{ "error": "Total file size exceeds 25MB limit" }
```

**Response — 500 Internal Server Error**
```json
{
  "error": "Failed to process documents",
  "details": "LlamaParse rate limit exceeded"
}
```

---

### `GET /api/documents`

Returns all indexed documents from Supabase, ordered by most recently uploaded.

**Response — 200 OK**
```json
{
  "documents": [
    {
      "id": "a1b2c3d4-...",
      "filename": "Q4-Report.pdf",
      "size_bytes": 204800,
      "chunk_count": 23,
      "created_at": "2026-06-28T08:33:00.000Z"
    }
  ]
}
```

**Response — 500**
```json
{ "error": "Supabase keys are missing in .env.local" }
```

---

### `DELETE /api/documents`

Atomically deletes all Pinecone vectors for a document and removes its Supabase record.

**Request**
```json
{
  "id": "a1b2c3d4-e5f6-...",
  "filename": "Q4-Report.pdf"
}
```

**Response — 200 OK**
```json
{ "success": true, "message": "Document deleted successfully" }
```

**Response — 400 Bad Request**
```json
{ "error": "Missing document id or filename" }
```

---

### `POST /api/chat`

Retrieves top-5 relevant chunks from Pinecone and streams an LLM response from Groq.

**Request**
```
{
  "messages": [
    { "role": "user", "content": "What was the revenue in Q4?" },
    { "role": "assistant", "content": "The Q4 revenue was..." },
    { "role": "user", "content": "How does that compare to Q3?" }
  ]
}
```

**Response — 200 OK**
```
Content-Type: text/plain; charset=utf-8
Transfer-Encoding: chunked

The Q4 revenue was $4.2M, which represents a 12% increase...
```
> The response is a raw streaming text body (not SSE, not JSON). The browser reads it via the `ReadableStream` API and renders tokens progressively.

**Response — 500**
```json
{ "error": "Groq API error: ..." }
```

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.ts          # RAG retrieval + Groq streaming
│   │   ├── documents/
│   │   │   └── route.ts          # GET list / DELETE (Pinecone + Supabase)
│   │   └── ingest/
│   │       └── route.ts          # PDF parse + chunk + embed pipeline
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                  # Root page composing UploadDropzone + ChatInterface
├── components/
│   ├── ChatInterface.tsx          # Streaming chat UI with native ReadableStream
│   ├── UploadDropzone.tsx         # Drag & drop upload + indexed document list
│   └── ui/
│       ├── button.tsx             # shadcn/ui
│       ├── card.tsx               # shadcn/ui
│       └── ...
└── lib/
    ├── supabase.ts                # Nullable Supabase client (graceful if keys missing)
    └── utils.ts                   # cn() tailwind merge helper
```

---

## Environment Variables

Create a `.env.local` file in the project root. This file is excluded from Git via `.gitignore`.

```env
# ── Pinecone ──────────────────────────────────────────
# From: https://app.pinecone.io → API Keys
PINECONE_API_KEY=pcsk_...

# Your index name (must exist in Pinecone dashboard)
# Index type: Dense, Model: llama-text-embed-v2, Cloud: AWS us-east-1
PINECONE_INDEX=rag-index

# ── LlamaCloud (PDF Parsing) ───────────────────────────
# From: https://cloud.llamaindex.ai → API Keys
LLAMA_CLOUD_API_KEY=llx-...

# ── Groq (LLM Inference) ──────────────────────────────
# From: https://console.groq.com → API Keys
GROQ_API_KEY=gsk_...

# ── Supabase (Metadata Store) ─────────────────────────
# From: https://supabase.com → Project → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

> **Security note:** `NEXT_PUBLIC_` prefix exposes the variable to the browser bundle. The Supabase `anon` key is safe to expose only because Row Level Security (RLS) is enabled on all tables. Never prefix `PINECONE_API_KEY`, `GROQ_API_KEY`, or `LLAMA_CLOUD_API_KEY` with `NEXT_PUBLIC_`.

---

## Local Development Setup

### Prerequisites

- Node.js 20+
- A Pinecone account with one index created (Dense, `llama-text-embed-v2`, AWS `us-east-1`)
- A Supabase project with the `documents` table created (SQL schema above)
- A LlamaCloud API key (free tier)
- A Groq API key (free tier)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/HarishSivakumar/Advanced-RAG-for-Production.git
cd Advanced-RAG-for-Production

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# → Fill in your keys as described above

# 4. Run the Supabase schema migration
# → Go to your Supabase project → SQL Editor → paste the schema above → Run

# 5. Start the development server
npm run dev

# → Open http://localhost:3000
```

---

## Operational Limits & Rate Limits

| Operation | Bottleneck | Limit | Error Behaviour |
|---|---|---|---|
| Upload | LlamaCloud parsing | 1,000 pages/day | `500` from `/api/ingest` |
| Upload | Pinecone inference | 5M tokens/month | `429` from Pinecone |
| Upload | File validation | 50 files / 25 MB | `400` from `/api/ingest` |
| Chat | Groq | 30 req/min, 14,400/day | `500` (Groq 429 propagated) |
| Documents | Supabase | 500 MB storage | Project paused by Supabase |

---

## Known Limitations & Future Work

### Current Limitations

| # | Limitation | Impact | Status |
|---|---|---|---|
| 1 | No authentication | Any user with the URL can upload/delete documents | 🔴 Open |
| 2 | No per-user namespacing | All documents share a single Pinecone namespace | 🔴 Open |
| 3 | ~~Chunk IDs are not collision-safe~~ | ~~Two files with identical names will overwrite each other's chunks~~ | ✅ Fixed — `crypto.randomUUID()` |
| 4 | ~~No reranking~~ | ~~Top-5 results are returned by cosine similarity score only~~ | ✅ Fixed — `bge-reranker-v2-m3` |
| 5 | ~~No idempotency on duplicate uploads~~ | ~~Re-uploading a file silently creates ghost vectors~~ | ✅ Fixed — Supabase idempotency check |
| 6 | ~~One bad file aborts the batch~~ | ~~A single corrupt PDF fails all other uploads~~ | ✅ Fixed — per-file error isolation |
| 7 | No citation markers in UI | The source document for each context chunk is not displayed | 🟡 Roadmap |
| 8 | Chat history not persisted | Refreshing the browser resets the conversation | 🟡 Roadmap |

### Roadmap

- [ ] **Authentication** — Clerk or Supabase Auth to isolate per-user document spaces
- [ ] **Namespacing** — Use Pinecone namespaces per user ID to prevent data leakage
- [ ] **Hybrid Search** — Add `pinecone-sparse-english-v0` sparse vectors for BM25-style keyword matching alongside dense semantic search
- [ ] **Re-ranking** — Add `bge-reranker-v2-m3` (Pinecone Integrated Inference) to re-score top-K results before passing to LLM
- [ ] **Citation Markers** — Surface `source` metadata from each Pinecone hit in the chat UI
- [ ] **RAG-Ops Debug Panel** — Display latency breakdown (parse, embed, retrieve, generate) per query
- [ ] **Persistent Chat History** — Store conversations in Supabase per session
- [ ] **Multi-tenancy** — Full workspace isolation with RBAC

---

## License

MIT © 2026 Harish Sivakumar
