import { apiRequest } from "@/lib/queryClient";

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  analysisStatus: 'pending' | 'completed' | 'failed';
  analysis?: {
    summary: string;
    insights: string[];
  };
}

export async function fetchDocuments(): Promise<Document[]> {
  const res = await apiRequest('GET', '/api/documents');
  if (!res.ok) {
    throw new Error('Failed to fetch documents');
  }
  return res.json();
}

export async function uploadDocument(formData: FormData): Promise<Document> {
  const res = await fetch('/api/documents/upload', {
    method: 'POST',
    body: formData,
    credentials: 'include'
  });
  
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'Failed to upload document');
  }
  
  return res.json();
}

export async function getDocumentAnalysis(id: string): Promise<Document['analysis']> {
  const res = await apiRequest('GET', `/api/documents/${id}/analysis`);
  if (!res.ok) {
    throw new Error('Failed to fetch document analysis');
  }
  return res.json();
}
