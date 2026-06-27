import { Certification } from '@/types';

export const certifications: Certification[] = [
  {
    id: 'soc-analyst',
    name: 'Certified SOC Analyst',
    issuer: 'EC-Council',
    issueDate: 'May 2025',
    credentialUrl: 'https://www.eccouncil.org/',
    category: 'Cybersecurity',
  },
  {
    id: 'deloitte-data',
    name: 'Data Analytics Job Simulation',
    issuer: 'Deloitte Australia / Forage',
    issueDate: 'Mar 2025',
    category: 'Data Analytics',
  },
  {
    id: 'deep-learning',
    name: 'Deep Learning Specialization (3 Courses)',
    issuer: 'DeepLearning.AI / Coursera',
    issueDate: '2024',
    category: 'AI / Machine Learning',
  },
  {
    id: 'ibm-ai',
    name: 'Introduction to AI',
    issuer: 'IBM',
    issueDate: '2024',
    category: 'AI / Machine Learning',
  },
  {
    id: 'hackerrank',
    name: 'Problem Solving (Intermediate)',
    issuer: 'HackerRank',
    issueDate: 'Apr 2025',
    category: 'Software Engineering',
  },
];
