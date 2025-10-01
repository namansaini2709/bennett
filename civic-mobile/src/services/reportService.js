import axios from 'axios';
import { API_BASE_URL } from '../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

class ReportService {
  constructor() {
    this.apiClient = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000, // 30 seconds timeout for file uploads
    });

    // Add token interceptor
    this.apiClient.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  async createReport(reportData) {
    try {
      const formData = new FormData();
      
      // Add text fields
      formData.append('title', reportData.title);
      formData.append('description', reportData.description);
      formData.append('category', reportData.category);
      
      // Add location data
      if (reportData.location) {
        formData.append('location[address]', reportData.location.address || '');
        if (reportData.location.latitude && reportData.location.longitude) {
          formData.append('location[latitude]', reportData.location.latitude.toString());
          formData.append('location[longitude]', reportData.location.longitude.toString());
        }
      }

      // Add media file if present
      if (reportData.image) {
        const imageUri = reportData.image.uri || reportData.image;
        const fileName = imageUri.split('/').pop();
        const fileType = fileName.split('.').pop();

        formData.append('media', {
          uri: imageUri,
          type: `image/${fileType}`,
          name: fileName,
        });
      }

      const response = await this.apiClient.post('/reports', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Report submitted successfully'
      };
    } catch (error) {
      console.error('Report submission error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to submit report',
        error: error.response?.data || error.message
      };
    }
  }

  async getMyReports(limit = 100) {
    try {
      const response = await this.apiClient.get(`/reports/my-reports?limit=${limit}`);
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      console.error('Fetch reports error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch reports',
        data: []
      };
    }
  }

  async getAllReports(limit = 100, params = {}) {
    try {
      const queryParams = { limit, ...params };
      const response = await this.apiClient.get('/reports', { params: queryParams });
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      console.error('Fetch all reports error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch reports',
        data: []
      };
    }
  }

  async getNearbyReports(latitude, longitude, radius = 1000, limit = 100) {
    try {
      const response = await this.apiClient.get(`/reports/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}&limit=${limit}`);
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      console.error('Fetch nearby reports error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch nearby reports',
        data: []
      };
    }
  }

  async getReportById(reportId) {
    try {
      const response = await this.apiClient.get(`/reports/${reportId}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Fetch report error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch report details'
      };
    }
  }

  async addComment(reportId, comment) {
    try {
      const response = await this.apiClient.post(`/reports/${reportId}/comment`, {
        comment
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Add comment error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add comment'
      };
    }
  }

  async upvoteReport(reportId) {
    try {
      const response = await this.apiClient.post(`/reports/${reportId}/upvote`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Upvote error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to upvote report'
      };
    }
  }

  async deleteReport(reportId) {
    try {
      const response = await this.apiClient.delete(`/reports/${reportId}`);
      return {
        success: true,
        message: response.data.message || 'Report deleted successfully'
      };
    } catch (error) {
      console.error('Delete report error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete report'
      };
    }
  }
}

export default new ReportService();