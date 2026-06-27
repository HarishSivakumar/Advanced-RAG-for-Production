import { Project } from '@/types';

export const projects: Project[] = [
  {
    slug: 'escalate-ai',
    title: 'EscalateAI',
    subtitle: 'AI Escalation Intelligence Platform',
    description:
      'A full-stack AI platform that analyzes customer support conversations in real time, predicts escalation risk across 5 severity signals, and auto-assigns incident priority before issues become critical.',
    problem:
      'Support teams often find out about escalations after the damage is done. Manual review of all tickets is impossible, leading to missed SLA breaches and poor customer satisfaction.',
    architecture:
      'Hybrid AI pipeline combining scikit-learn ML models, rule-based NLP signal extraction, and LLM reasoning (Ollama). FastAPI backend with 10+ endpoints, PostgreSQL via Supabase, Next.js dashboards.',
    features: [
      { title: 'Real-time Analysis', description: 'Real-time conversation analysis detecting risk across 5 severity signals' },
      { title: 'Hybrid AI Pipeline', description: 'ML models + rule-based NLP + LLM reasoning for accurate predictions' },
      { title: 'Explainable Priority', description: 'P1–P3 priority assignment with confidence scoring and explanations' },
      { title: 'FastAPI Backend', description: 'Robust Python backend with 10+ REST endpoints' },
      { title: 'Next.js Dashboards', description: 'Interactive frontend with Recharts for data visualization' },
      { title: 'Full CI/CD', description: 'Automated deployments on Vercel and Render via GitHub Actions' },
    ],
    techStack: ['Next.js', 'FastAPI', 'scikit-learn', 'LLMs', 'Supabase', 'PostgreSQL', 'GitHub Actions', 'Vercel'],
    heroImage: '/images/projects/ai-support-hero.png',
    screenshots: [],
    github: 'https://github.com/HarishSivakumar',
    liveDemo: 'https://escalate-ai-gold.vercel.app/',
    category: 'AI',
    featured: true,
    order: 1,
  },
  {
    slug: 'scalable-rag-system',
    title: 'Scalable RAG System',
    subtitle: 'Modular Retrieval-Augmented Generation',
    description:
      'A modular RAG pipeline covering document ingestion, chunking, embedding generation, vector indexing, and LLM context assembly. Built for extensibility to 100K+ document collections.',
    problem:
      'Standard LLMs hallucinate and lack domain-specific knowledge. Building a reliable RAG pipeline requires careful optimization of chunking, embedding, and retrieval strategies.',
    architecture:
      'Built with Python and LangChain. Evaluated 3+ chunking strategies. Uses Hugging Face Sentence Transformers for embeddings, Pinecone for vector indexing, and PostgreSQL for metadata.',
    features: [
      { title: 'Modular Pipeline', description: 'End-to-end pipeline from ingestion to LLM context assembly' },
      { title: 'Chunking Optimization', description: 'Benchmarked 3+ chunking strategies to optimize grounding quality' },
      { title: 'Vector Indexing', description: 'Pinecone integration for fast, semantic similarity search' },
      { title: 'Scalability', description: 'Designed for extensibility to 100K+ document collections' },
      { title: 'Production Ready', description: 'Same architectural patterns used in production at ZipTier' },
    ],
    techStack: ['Python', 'LangChain', 'Pinecone', 'Hugging Face', 'Sentence Transformers', 'PostgreSQL'],
    heroImage: '/images/projects/cloud-monitor-hero.png',
    screenshots: [],
    github: 'https://github.com/HarishSivakumar',
    liveDemo: '#',
    category: 'AI',
    featured: true,
    order: 2,
  },
  {
    slug: 'coupon-bazaar',
    title: 'CouponBazaar',
    subtitle: 'Unlock Savings, Share Smiles',
    description:
      'A Django-powered web platform designed to revolutionize the way we think about coupons. Connects savvy shoppers to buy and sell spare coupons.',
    problem:
      'People often receive promotional coupons they don\'t need, while others search for discounts. There is no centralized marketplace to exchange unused digital coupons securely.',
    architecture:
      'A full-stack Django application with user authentication, secure payment handling, and dynamic coupon tracking.',
    features: [
      { title: 'Coupon Marketplace', description: 'Buy and sell unused digital coupons easily' },
      { title: 'User Profiles', description: 'Track buying and selling history with user ratings' },
      { title: 'Secure Transactions', description: 'Safe exchange mechanism for digital codes' },
    ],
    techStack: ['Django', 'Python', 'HTML', 'CSS', 'JavaScript', 'PostgreSQL'],
    heroImage: '/images/projects/marketing-hero.png',
    screenshots: [],
    github: 'https://github.com/HarishSivakumar',
    liveDemo: '#',
    category: 'Full Stack',
    featured: true,
    order: 3,
  },
  {
    slug: 'building-optimizers',
    title: 'Building Optimizers from First Principles',
    subtitle: 'Deep Learning Internals',
    description:
      'A mini-project focused on understanding optimization algorithms—particularly gradient descent and its variants—by implementing them from scratch without high-level frameworks.',
    problem:
      'Many practitioners use optimizers like Adam or SGD as black boxes without understanding the mechanics of parameter updates, momentum, and their impact on loss landscapes.',
    architecture:
      'Pure Python and NumPy implementation of core optimization algorithms with visualization of loss trajectories.',
    features: [
      { title: 'From Scratch', description: 'Implemented without PyTorch or TensorFlow' },
      { title: 'Gradient Descent', description: 'Core implementation of vanilla GD and SGD' },
      { title: 'Momentum', description: 'Analysis of momentum variants and learning rate decay' },
    ],
    techStack: ['Python', 'NumPy', 'Matplotlib', 'Jupyter'],
    heroImage: '/images/projects/airline-hero.png',
    screenshots: [],
    github: 'https://github.com/HarishSivakumar',
    liveDemo: '#',
    category: 'MLOps',
    featured: false,
    order: 4,
  },
];

export const getProjectBySlug = (slug: string): Project | undefined => {
  return projects.find((p) => p.slug === slug);
};

export const getFeaturedProjects = (): Project[] => {
  return projects.filter((p) => p.featured).sort((a, b) => a.order - b.order);
};
