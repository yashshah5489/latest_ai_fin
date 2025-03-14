import { apiRequest } from "@/lib/queryClient";

export interface Document {
  id: number;
  name: string;
  type: string;
  size: number;
  uploaded_at: string;
  analysis_status: 'pending' | 'completed' | 'failed';
  analysis?: {
    summary: string;
    insights: string[];
  };
}

/**
 * Fetch all user documents
 * @returns Array of documents
 */
export async function fetchDocuments(): Promise<Document[]> {
  const response = await apiRequest("GET", "/api/documents");
  return await response.json();
}

/**
 * Upload and analyze a document
 * @param formData Form data with file
 * @returns Uploaded document
 */
export async function uploadDocument(formData: FormData): Promise<Document> {
  const response = await apiRequest("POST", "/api/documents", formData, {
    isFormData: true,
  });
  return await response.json();
}

/**
 * Get document analysis
 * @param id Document ID
 * @returns Document analysis or null if not found
 */
export async function getDocumentAnalysis(id: number): Promise<Document['analysis'] | null> {
  try {
    const response = await apiRequest("GET", `/api/documents/${id}/analysis`);
    return await response.json();
  } catch (error) {
    return null;
  }
}

/**
 * Delete a document
 * @param id Document ID
 * @returns True if deleted successfully
 */
export async function deleteDocument(id: number): Promise<boolean> {
  try {
    await apiRequest("DELETE", `/api/documents/${id}`);
    return true;
  } catch (error) {
    return false;
  }
}