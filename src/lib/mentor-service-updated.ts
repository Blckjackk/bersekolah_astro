import { z } from 'zod';

const API_URL = import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

// Zod schema for Mentor data validation - Disesuaikan dengan API backend
export const MentorSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  photo: z.string().nullable().optional(),
  photo_url: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  // Fields tambahan untuk frontend
  position: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active')
});

export type Mentor = z.infer<typeof MentorSchema>;

export const MentorService = {
  // Helper function to ensure photo URLs are formatted correctly
  formatPhotoUrl: (mentor: any): Mentor => {
    if (!mentor) return mentor;
    
    // If photo_url already exists from API, use it (API already provides correct URL)
    if (mentor.photo_url) {
      return mentor;
    }
    
    // Only format if photo_url is missing but photo exists
    if (!mentor.photo_url && mentor.photo) {
      mentor.photo_url = `http://localhost:8000/storage/admin/mentor/${mentor.photo}`;
    }
    
    return mentor;
  },
  
  // Mendapatkan semua mentor dari API
  getAllMentors: async () => {
    try {
      // Auth token is optional for public mentor data
      const token = localStorage.getItem('bersekolah_auth_token');
      const headers: any = {
        'Accept': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      console.log('Fetching mentors from:', `${API_URL}/mentors`);
      console.log('Using auth token:', !!token);
      
      const response = await fetch(`${API_URL}/mentors`, { headers });

      if (!response.ok) {
        console.error('API Response Status:', response.status);
        console.error('API Response Text:', await response.text());
        throw new Error('Failed to fetch mentors');
      }

      const data = await response.json();
      console.log('Raw mentor data from API:', data);
      
      // Format photo URLs for all mentors (but API should already provide correct URLs)
      const mentors = (data.data || []).map((mentor: any) => MentorService.formatPhotoUrl(mentor));
      console.log('Formatted mentors:', mentors);
      
      return mentors;
    } catch (error) {
      console.error('Error fetching mentors:', error);
      throw error;
    }
  },

  // Mendapatkan total mentor dari API
  getTotalMentors: async () => {
    try {
      const response = await fetch(`${API_URL}/mentors/total`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bersekolah_auth_token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch total mentors');

      const data = await response.json();
      return data.total || 0;
    } catch (error) {
      console.error('Error fetching mentor total:', error);
      return 0; // Default to 0 if error
    }
  },

  // Mendapatkan mentor berdasarkan ID
  getMentorById: async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/mentors/${id}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bersekolah_auth_token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch mentor');

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching mentor:', error);
      throw error;
    }
  },

  // Membuat mentor baru
  createMentor: async (mentorData: Omit<Mentor, 'id'>) => {
    try {
      const response = await fetch(`${API_URL}/mentors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bersekolah_auth_token')}`
        },
        body: JSON.stringify(mentorData)
      });

      if (!response.ok) throw new Error('Failed to create mentor');

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating mentor:', error);
      throw error;
    }
  },

  // Mengupdate mentor yang ada
  updateMentor: async (id: number, mentorData: Partial<Mentor>) => {
    try {
      const response = await fetch(`${API_URL}/mentors/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bersekolah_auth_token')}`
        },
        body: JSON.stringify(mentorData)
      });

      if (!response.ok) throw new Error('Failed to update mentor');

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating mentor:', error);
      throw error;
    }
  },

  // Menghapus mentor
  deleteMentor: async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/mentors/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bersekolah_auth_token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete mentor');

      return true;
    } catch (error) {
      console.error('Error deleting mentor:', error);
      throw error;
    }
  }
};
