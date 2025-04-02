import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse } from '../types';

// URL base de la API
const API_URL = 'http://192.168.251.60:4040/api';

// Configuración de axios con interceptores
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos de timeout
});

// Interceptor para peticiones
apiClient.interceptors.request.use(
  (config) => {
    // Aquí podríamos añadir tokens de autenticación si fuera necesario
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para respuestas
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Manejo centralizado de errores
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      console.error('Error de respuesta:', error.response.data);
      
      // Manejo específico según el código de estado
      if (error.response.status === 401) {
        // Manejar no autorizado
        console.log('Sesión expirada o no autorizada');
      } else if (error.response.status === 404) {
        console.log('Recurso no encontrado');
      }
    } else if (error.request) {
      // La petición fue hecha pero no se recibió respuesta
      console.error('Error de conexión:', error.request);
    } else {
      // Algo ocurrió al configurar la petición
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Clase controladora para manejar peticiones al backend
class ApiController {
  // Método para realizar peticiones GET
  static async get<T>(endpoint: string, params?: any): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse = await apiClient.get(endpoint, { params });
      console.log(`Respuesta GET ${endpoint}:`, response.data);
      
      // Si la API no devuelve el formato esperado, adaptarlo
      if (response.data && !response.data.hasOwnProperty('success')) {
        return {
          success: true,
          data: response.data
        };
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error en GET ${endpoint}:`, error);
      return { success: false, message: 'Error al obtener datos del servidor' };
    }
  }

  // Método para realizar peticiones POST
  static async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse = await apiClient.post(endpoint, data);
      console.log(`Respuesta POST ${endpoint}:`, response.data);
      
      // Si la API no devuelve el formato esperado, adaptarlo
      if (response.data && !response.data.hasOwnProperty('success')) {
        return {
          success: true,
          data: response.data
        };
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error en POST ${endpoint}:`, error);
      return { success: false, message: 'Error al enviar datos al servidor' };
    }
  }

  // Método para realizar peticiones PUT
  static async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse = await apiClient.put(endpoint, data);
      console.log(`Respuesta PUT ${endpoint}:`, response.data);
      
      // Si la API no devuelve el formato esperado, adaptarlo
      if (response.data && !response.data.hasOwnProperty('success')) {
        return {
          success: true,
          data: response.data
        };
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error en PUT ${endpoint}:`, error);
      return { success: false, message: 'Error al actualizar datos en el servidor' };
    }
  }

  // Método para realizar peticiones DELETE
  static async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse = await apiClient.delete(endpoint);
      console.log(`Respuesta DELETE ${endpoint}:`, response.data);
      
      // Si la API no devuelve el formato esperado, adaptarlo
      if (response.data && !response.data.hasOwnProperty('success')) {
        return {
          success: true,
          data: response.data
        };
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error en DELETE ${endpoint}:`, error);
      return { success: false, message: 'Error al eliminar datos en el servidor' };
    }
  }
}

export default ApiController;