class AuthService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
  }

  async register(userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
  }) {
    try {
      console.log('Registering user with data:', {
        ...userData,
        password: '***',
        password_confirmation: '***'
      });

      const response = await fetch(`${this.baseUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          // Add CORS headers if needed
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(userData)
      });


      const responseText = await response.text();

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Failed to parse JSON response:', parseError);
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}`);
      }

      if (!response.ok) {
        console.error('❌ Registration failed with status:', response.status);
        console.error('❌ Error data:', data);
        
        // Handle different error responses from Laravel
        if (data.errors) {
          // Validation errors
          const errorMessages = Object.values(data.errors).flat();
          throw new Error(`Validation failed: ${errorMessages.join(', ')}`);
        } else if (data.message) {
          // General error message
          throw new Error(data.message);
        } else {
          throw new Error(`Registration failed with status ${response.status}`);
        }
      }

      console.log('Registration successful:', {
        user: data.user,
        hasToken: !!data.token
      });

      return data;
    } catch (error: any) {
      console.error('💥 Registration error:', error);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
      }
      
      throw error;
    }
  }

  async login(credentials: { email: string; password: string }) {
    try {
      
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      return data;
    } catch (error: any) {
      console.error('💥 Login error:', error);
      throw error;
    }
  }

  async logout(token: string) {
    try {
      
      const response = await fetch(`${this.baseUrl}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Requested-With': 'XMLHttpRequest',
        }
      });

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('💥 Logout error:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();