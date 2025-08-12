// Environment-aware API URL
const getApiUrl = () => {
  if (import.meta.env.PROD) {
    return 'https://web-production-0cc6.up.railway.app/api';
  }
  return import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
};

const API_URL = getApiUrl();

// Interface untuk Testimoni
export interface Testimoni {
  id: number;
  nama: string;
  angkatan_beswan: string;
  sekarang_dimana?: string;
  isi_testimoni: string;
  foto_testimoni?: string;
  foto_testimoni_url?: string;
  status: 'active' | 'inactive';
  tanggal_input?: string;
}

export const TestimoniService = {
  // Helper function untuk mendapatkan URL gambar testimoni
  getImageUrl: (imagePath?: string): string => {
    const baseUrl = import.meta.env.PROD 
      ? 'https://web-production-0cc6.up.railway.app'
      : 'http://localhost:8000';
    
    // If no image path provided, return default
    if (!imagePath || imagePath === 'null' || imagePath === '') {
      return `${baseUrl}/storage/defaults/testimoni-default.jpg`;
    }
    
    // If it's already 'default.jpg', return the correct path
    if (imagePath === 'default.jpg') {
      return `${baseUrl}/storage/defaults/testimoni-default.jpg`;
    }
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // If it already starts with /storage, convert to full URL
    if (imagePath.startsWith('/storage/')) {
      return `${baseUrl}${imagePath}`;
    }
    
    // If it's just filename, construct full Laravel storage URL
    if (!imagePath.includes('/')) {
      return `${baseUrl}/storage/admin/testimoni/${imagePath}`;
    }
    
    // Extract filename from any path structure
    let filename = imagePath;
    if (filename.includes('/')) {
      filename = filename.split('/').pop() || 'testimoni-default.jpg';
    }

    // Return full Laravel storage URL for testimoni
    return `${baseUrl}/storage/admin/testimoni/${filename}`;
  },

  getAllTestimoni: async (): Promise<Testimoni[]> => {
    try {
      const token = localStorage.getItem('bersekolah_auth_token');
      if (!token) {
        throw new Error('Unauthorized: No token found');
      }
      
      const response = await fetch(`${API_URL}/testimoni`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch testimoni: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Testimoni API response:', data);
      
      return data.success ? data.data : data.data || [];
    } catch (error) {
      console.error('Error in getAllTestimoni:', error);
      throw error;
    }
  },

  getTotalTestimoni: async (): Promise<number> => {
    try {
      const token = localStorage.getItem('bersekolah_auth_token');
      if (!token) {
        throw new Error('Unauthorized: No token found');
      }
      
      const response = await fetch(`${API_URL}/testimoni/total`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch testimoni total: ${response.status}`);
      }
      
      const data = await response.json();
      return data.total || 0;
    } catch (error) {
      console.error('Error in getTotalTestimoni:', error);
      throw error;
    }
  },

  getTestimoniById: async (id: number): Promise<Testimoni> => {
    try {
      const token = localStorage.getItem('bersekolah_auth_token');
      if (!token) {
        throw new Error('Unauthorized: No token found');
      }
      
      const response = await fetch(`${API_URL}/testimoni/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch testimoni: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Testimoni detail API response:', data);
      
      return data.success ? data.data : data;
    } catch (error) {
      console.error(`Error in getTestimoniById (${id}):`, error);
      throw error;
    }
  },

  createTestimoni: async (testimoniData: any, photoFile: File | null): Promise<Testimoni> => {
    try {
      const token = localStorage.getItem('bersekolah_auth_token');
      if (!token) {
        throw new Error('Unauthorized: No token found');
      }
      
      const formData = new FormData();
      
      // Add testimoni data to form
      formData.append('nama', testimoniData.nama);
      formData.append('angkatan_beswan', testimoniData.angkatan_beswan);
      
      if (testimoniData.sekarang_dimana) {
        formData.append('sekarang_dimana', testimoniData.sekarang_dimana);
      }
      
      formData.append('isi_testimoni', testimoniData.isi_testimoni);
      formData.append('status', testimoniData.status);
      
      // Add photo if provided
      if (photoFile) {
        formData.append('foto_testimoni', photoFile);
      }
      
      console.log('Creating testimoni with data:', testimoniData);
      
      const response = await fetch(`${API_URL}/testimoni`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error response:', errorData);
        throw new Error(errorData.message || `Failed to create testimoni: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Create testimoni API response:', data);
      return data.success ? data.data : data;
    } catch (error) {
      console.error('Error in createTestimoni:', error);
      throw error;
    }
  },

  updateTestimoni: async (id: number, testimoniData: any, photoFile: File | null): Promise<Testimoni> => {
    try {
      const token = localStorage.getItem('bersekolah_auth_token');
      if (!token) {
        throw new Error('Unauthorized: No token found');
      }
      
      const formData = new FormData();
      
      // Add testimoni data to form
      formData.append('nama', testimoniData.nama);
      formData.append('angkatan_beswan', testimoniData.angkatan_beswan);
      
      if (testimoniData.sekarang_dimana) {
        formData.append('sekarang_dimana', testimoniData.sekarang_dimana);
      }
      
      formData.append('isi_testimoni', testimoniData.isi_testimoni);
      formData.append('status', testimoniData.status);
      
      formData.append('_method', 'PUT'); // Laravel form method spoofing
      
      // Add photo if provided
      if (photoFile) {
        formData.append('foto_testimoni', photoFile);
      }
      
      console.log(`Updating testimoni ${id} with data:`, testimoniData);
      
      const response = await fetch(`${API_URL}/testimoni/${id}`, {
        method: 'POST', // Using POST with _method for Laravel method spoofing
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error response:', errorData);
        throw new Error(errorData.message || `Failed to update testimoni: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Update testimoni API response:', data);
      return data.success ? data.data : data;
    } catch (error) {
      console.error(`Error in updateTestimoni (${id}):`, error);
      throw error;
    }
  },

  deleteTestimoni: async (id: number): Promise<boolean> => {
    try {
      const token = localStorage.getItem('bersekolah_auth_token');
      if (!token) {
        throw new Error('Unauthorized: No token found');
      }
      
      const response = await fetch(`${API_URL}/testimoni/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete testimoni: ${response.status}`);
      }
      
      return true;
    } catch (error) {
      console.error(`Error in deleteTestimoni (${id}):`, error);
      throw error;
    }
  },

  updateTestimoniStatus: async (id: number, status: 'active' | 'inactive'): Promise<Testimoni> => {
    try {
      const token = localStorage.getItem('bersekolah_auth_token');
      if (!token) {
        throw new Error('Unauthorized: No token found');
      }
      
      const response = await fetch(`${API_URL}/testimoni/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update testimoni status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.success ? data.data : data;
    } catch (error) {
      console.error(`Error in updateTestimoniStatus (${id}):`, error);
      throw error;
    }
  }
};
