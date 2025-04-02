// Tipos para la aplicación de veterinaria

// Usuario
export interface User {
  id?: string;
  nombre: string;
  apellido: string;
  email: string;
  numeroCuenta: string;
  mascotas?: Pet[];
}

// Mascota
export interface Pet {
  id?: string;
  nombre: string;
  raza: string;
  genero: string;
  edad?: number;
  fechaNacimiento?: string;
  peso: number;
  userId?: string;
  tratamientos?: Treatment[];
}

// Tratamiento
export interface Treatment {
  id?: string;
  medicamento: string;
  dosis: string;
  duracion: string;
  petId?: string;
}

// Respuestas de la API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  // Campos adicionales que podrían venir en la respuesta
  [key: string]: any;
}