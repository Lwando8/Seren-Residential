import axios, { AxiosInstance } from 'axios';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface HealthResponse {
  demoMode?: boolean;
  demoOTPs?: Array<{ otp: string; resident: string; unit: string; type: string }>;
}

interface ResidentInfo {
  name: string;
  unitNumber: string;
  phone?: string;
  email?: string;
}

interface SessionData {
  sessionId: string;
  residentInfo: ResidentInfo;
  otp: string;
}

interface CaptureModeResponse {
  availableCaptures: string[];
}

interface CompletionData {
  sessionId: string;
  residentInfo: ResidentInfo;
  mode: string;
  totalCaptures: number;
  completedAt: string;
  captures: {
    person?: { timestamp: string };
    vehicle?: { timestamp: string };
  };
}

class CaptureService {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL =
      process.env.EXPO_PUBLIC_API_BASE_URL ||
      'http://192.168.5.52:3000/api/capture';
    const timeout = parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '30000');

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const isDevMode =
      process.env.EXPO_PUBLIC_ENABLE_DEV_MODE === 'true' || __DEV__;

    if (isDevMode) {
      console.log(
        '🧪 DEV MODE: Mobile app connecting to local backend at:',
        this.baseURL
      );
    }

    // Add request interceptor
    this.client.interceptors.request.use(
      (config) => {
        if (isDevMode) {
          console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
        }
        return config;
      },
      (error) => {
        console.error('[API] Request error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor
    this.client.interceptors.response.use(
      (response) => {
        if (isDevMode) {
          console.log(`[API] Response: ${response.status}`);
        }
        return response;
      },
      (error) => {
        console.error('[API] Response error:', error.response?.data || error.message);
        return Promise.reject(this.handleApiError(error));
      }
    );
  }

  private handleApiError(error: any): Error {
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 400:
          return new Error(data?.error || 'Invalid request data');
        case 401:
          return new Error('Unauthorized access');
        case 404:
          return new Error(data?.error || 'Resource not found');
        case 429:
          return new Error('Too many requests. Please try again later.');
        case 500:
          return new Error('Server error. Please try again later.');
        default:
          return new Error(
            data?.error || `Request failed with status ${status}`
          );
      }
    } else if (error.request) {
      return new Error(
        'Network error. Please check your internet connection.'
      );
    } else {
      return new Error(error.message || 'An unexpected error occurred');
    }
  }

  async checkHealth(): Promise<HealthResponse> {
    try {
      const response = await this.client.get<HealthResponse>('/health');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async startSession(otp: string): Promise<ApiResponse<SessionData>> {
    try {
      const response = await this.client.post<ApiResponse<SessionData>>(
        '/session/start',
        { otp }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async setCaptureMode(
    sessionId: string,
    mode: string
  ): Promise<ApiResponse<CaptureModeResponse>> {
    try {
      const response = await this.client.post<ApiResponse<CaptureModeResponse>>(
        `/session/${sessionId}/mode`,
        { mode }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async uploadImage(
    sessionId: string,
    captureType: string,
    imageUri: string
  ): Promise<ApiResponse> {
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: `${captureType}_capture.jpg`,
      } as any);

      const response = await this.client.post<ApiResponse>(
        `/session/${sessionId}/capture/${captureType}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async completeSession(
    sessionId: string
  ): Promise<ApiResponse<CompletionData>> {
    try {
      const response = await this.client.post<ApiResponse<CompletionData>>(
        `/session/${sessionId}/complete`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getSessionStatus(
    sessionId: string
  ): Promise<ApiResponse<{ status: string }>> {
    try {
      const response = await this.client.get<ApiResponse<{ status: string }>>(
        `/session/${sessionId}/status`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new CaptureService();
