import { useState, useEffect, useCallback } from 'react'
import type { DocumentType, UploadedDocument, DocCategory, DocType } from '@/component/form-pendaftaran/unggah-dokumen/types'

export function useDocuments(category: DocCategory) {
  const [documents, setDocuments] = useState<UploadedDocument[]>([])
  const [docTypes, setDocTypes] = useState<DocumentType[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchDocumentTypes = async (category: string) => {
    try {
      const token = localStorage.getItem('bersekolah_auth_token');
      if (!token) throw new Error('No authentication token');

      const response = await fetch(`https://sandybrown-capybara-903436.hostingersite.com/api/document-types?category=${category}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch document types: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching document types:', error);
      throw error;
    }
  };

  const fetchDocuments = async (category: string) => {
    try {
      const token = localStorage.getItem('bersekolah_auth_token');
      if (!token) throw new Error('No authentication token');

      const response = await fetch(`https://sandybrown-capybara-903436.hostingersite.com/api/my-documents?category=${category}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch documents: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  };

  const uploadDocument = async (endpoint: string, formData: FormData) => {
    try {
      const token = localStorage.getItem('bersekolah_auth_token');
      if (!token) throw new Error('No authentication token');

      const response = await fetch(`https://sandybrown-capybara-903436.hostingersite.com/api${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
        throw new Error(errorData.message || `Upload failed: ${response.status}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  };

  // Refresh data when component mounts
  useEffect(() => {
    fetchDocumentTypes(category)
    fetchDocuments(category)
  }, [category])

  return {
    documents,
    docTypes,
    isLoading,
    uploadDocument,
    refreshDocuments: fetchDocuments
  }
}