import { UploadDropzone } from '@/components/UploadDropzone';
import { ChatInterface } from '@/components/ChatInterface';

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center p-6 sm:p-12 font-sans relative overflow-hidden">
      {/* Background gradients for premium feel */}
      <div className="absolute top-0 -z-10 h-full w-full bg-white dark:bg-zinc-950">
        <div className="absolute bottom-auto left-auto right-0 top-0 h-[500px] w-[500px] -translate-x-[30%] translate-y-[20%] rounded-full bg-[rgba(173,109,244,0.15)] opacity-50 blur-[80px]"></div>
      </div>

      <div className="z-10 max-w-5xl w-full flex flex-col items-center text-center mt-8 sm:mt-12">
        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary mb-6">
          Serverless RAG Architecture
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-6xl mb-6 text-foreground">
          Talk to your <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-500">Documents</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mb-12">
          Upload up to 50 PDFs (Max 25MB total). We'll parse them with Llama Cloud and index them natively into Pinecone using state-of-the-art embedding models.
        </p>
      </div>

      <div className="w-full max-w-6xl z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="w-full">
          <UploadDropzone />
        </div>
        <div className="w-full mt-8 lg:mt-0">
          <ChatInterface />
        </div>
      </div>
    </main>
  );
}
