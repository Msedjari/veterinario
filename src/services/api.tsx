import ApiController from './apiController';
import { User, Pet, Treatment, ApiResponse } from '../types';

// Servicios para Usuarios
export const userService = {
  getAll: async (): Promise<ApiResponse<User[]>> => {
    return await ApiController.get<User[]>('/usuarios');
  },
  
  getById: async (id: string): Promise<ApiResponse<User>> => {
    return await ApiController.get<User>(`/usuarios/${id}`);
  },
  
  create: async (user: User): Promise<ApiResponse<User>> => {
    return await ApiController.post<User>('/usuarios', user);
  },
  
  update: async (id: string, user: User): Promise<ApiResponse<User>> => {
    return await ApiController.put<User>(`/usuarios/${id}`, user);
  },
  
  delete: async (id: string): Promise<ApiResponse<void>> => {
    return await ApiController.delete<void>(`/usuarios/${id}`);
  }
};

// Servicios para Mascotas
export const petService = {
  getAll: async (): Promise<ApiResponse<Pet[]>> => {
    // Obtener todos los usuarios y extraer sus mascotas
    const response = await userService.getAll();
    
    if (response.success && response.data) {
      // Extraer todas las mascotas de todos los usuarios
      const allPets: Pet[] = [];
      response.data.forEach(user => {
        if (user.mascotas && user.mascotas.length > 0) {
          // Asegurarse de que cada mascota tenga el userId correcto
          const petsWithUserId = user.mascotas.map(pet => ({
            ...pet,
            userId: user.id
          }));
          allPets.push(...petsWithUserId);
        }
      });
      
      return { success: true, data: allPets };
    }
    
    return { success: false, message: 'Error al obtener mascotas' };
  },
  
  getById: async (id: string): Promise<ApiResponse<Pet>> => {
    // Buscar la mascota en todos los usuarios
    const usersResponse = await userService.getAll();
    
    if (usersResponse.success && usersResponse.data) {
      for (const user of usersResponse.data) {
        if (user.mascotas) {
          const pet = user.mascotas.find(p => p.id === id);
          if (pet) {
            // Añadir el userId a la mascota
            return { 
              success: true, 
              data: { ...pet, userId: user.id } 
            };
          }
        }
      }
    }
    
    return { success: false, message: 'Mascota no encontrada' };
  },
  
  getByUserId: async (userId: string): Promise<ApiResponse<Pet[]>> => {
    // Obtener el usuario específico
    const userResponse = await userService.getById(userId);
    
    if (userResponse.success && userResponse.data && userResponse.data.mascotas) {
      // Añadir el userId a cada mascota
      const petsWithUserId = userResponse.data.mascotas.map(pet => ({
        ...pet,
        userId
      }));
      
      return { success: true, data: petsWithUserId };
    }
    
    return { success: false, message: 'Error al obtener mascotas del usuario' };
  },
  
  create: async (pet: Pet): Promise<ApiResponse<Pet>> => {
    if (!pet.userId) {
      return { success: false, message: 'Se requiere el ID del usuario' };
    }
    
    try {
      // Usar la ruta correcta para crear mascotas
      console.log(`Creando mascota para usuario ${pet.userId}:`, pet);
      
      // Preparar la mascota para enviar (sin userId y con formato de fecha correcto)
      const { userId, ...petData } = pet;
      
      // Asegurarse de que la fecha esté en el formato correcto (DD/MM/YYYY)
      if (petData.fechaNacimiento && petData.fechaNacimiento.includes('-')) {
        const [year, month, day] = petData.fechaNacimiento.split('-');
        petData.fechaNacimiento = `${day}/${month}/${year}`;
      }
      
      // Hacer la petición POST a la ruta correcta
      const response = await ApiController.post<Pet>(
        `/usuarios/${userId}/mascotas`, 
        petData
      );
      
      console.log('Respuesta de creación de mascota:', response);
      
      if (response.success && response.data) {
        // Añadir el userId a la mascota devuelta
        return { 
          success: true, 
          data: { ...response.data, userId } 
        };
      } else if (response && !response.success) {
        return response;
      } else if (response) {
        // Si la respuesta no tiene el formato esperado pero existe
        return { 
          success: true, 
          data: { ...response, userId } 
        };
      }
      
      return { success: false, message: 'Error al crear la mascota' };
    } catch (error) {
      console.error('Error al crear mascota:', error);
      return { success: false, message: 'Error al crear la mascota' };
    }
  },
  
  update: async (id: string, pet: Pet): Promise<ApiResponse<Pet>> => {
    if (!pet.userId) {
      return { success: false, message: 'Se requiere el ID del usuario' };
    }
    
    try {
      console.log(`Actualizando mascota ${id} para usuario ${pet.userId}:`, pet);
      
      // Preparar la mascota para enviar (sin userId y con formato de fecha correcto)
      const { userId, ...petData } = pet;
      
      // Asegurarse de que la fecha esté en el formato correcto (DD/MM/YYYY)
      if (petData.fechaNacimiento && petData.fechaNacimiento.includes('-')) {
        const [year, month, day] = petData.fechaNacimiento.split('-');
        petData.fechaNacimiento = `${day}/${month}/${year}`;
      }
      
      // Hacer la petición PUT a la ruta correcta
      const response = await ApiController.put<Pet>(
        `/usuarios/${userId}/mascotas/${id}`, 
        petData
      );
      
      console.log('Respuesta de actualización de mascota:', response);
      
      if (response.success && response.data) {
        // Añadir el userId a la mascota devuelta
        return { 
          success: true, 
          data: { ...response.data, userId } 
        };
      } else if (response && !response.success) {
        return response;
      } else if (response) {
        // Si la respuesta no tiene el formato esperado pero existe
        return { 
          success: true, 
          data: { ...response, userId } 
        };
      }
      
      return { success: false, message: 'Error al actualizar la mascota' };
    } catch (error) {
      console.error('Error al actualizar mascota:', error);
      return { success: false, message: 'Error al actualizar la mascota' };
    }
  },
  
  delete: async (id: string): Promise<ApiResponse<void>> => {
    // Primero necesitamos encontrar la mascota para saber a qué usuario pertenece
    const petResponse = await petService.getById(id);
    
    if (!petResponse.success || !petResponse.data || !petResponse.data.userId) {
      return { success: false, message: 'Mascota no encontrada' };
    }
    
    const userId = petResponse.data.userId;
    
    try {
      console.log(`Eliminando mascota ${id} del usuario ${userId}`);
      
      // Hacer la petición DELETE a la ruta correcta
      const response = await ApiController.delete<void>(
        `/usuarios/${userId}/mascotas/${id}`
      );
      
      console.log('Respuesta de eliminación de mascota:', response);
      
      if (response.success) {
        return { success: true };
      } else if (response) {
        return { success: true };
      }
      
      return { success: false, message: 'Error al eliminar la mascota' };
    } catch (error) {
      console.error('Error al eliminar mascota:', error);
      return { success: false, message: 'Error al eliminar la mascota' };
    }
  }
};

// Servicios para Tratamientos
export const treatmentService = {
  getAll: async (): Promise<ApiResponse<Treatment[]>> => {
    // Esta función debería obtener todos los tratamientos de todas las mascotas
    // Primero obtenemos todas las mascotas
    const petsResponse = await petService.getAll();
    
    if (petsResponse.success && petsResponse.data) {
      const allTreatments: Treatment[] = [];
      
      // Para cada mascota, obtenemos sus tratamientos
      for (const pet of petsResponse.data) {
        if (pet.id && pet.userId) {
          const petTreatmentsResponse = await treatmentService.getByPetId(pet.id, pet.userId);
          if (petTreatmentsResponse.success && petTreatmentsResponse.data) {
            // Añadir el petId a cada tratamiento
            const treatmentsWithPetId = petTreatmentsResponse.data.map(treatment => ({
              ...treatment,
              petId: pet.id
            }));
            allTreatments.push(...treatmentsWithPetId);
          }
        }
      }
      
      return { success: true, data: allTreatments };
    }
    
    return { success: false, message: 'Error al obtener tratamientos' };
  },
  
  getByPetId: async (petId: string, userId?: string): Promise<ApiResponse<Treatment[]>> => {
    // Si no tenemos el userId, primero necesitamos obtenerlo
    if (!userId) {
      const petResponse = await petService.getById(petId);
      if (!petResponse.success || !petResponse.data || !petResponse.data.userId) {
        return { success: false, message: 'No se pudo obtener el usuario de la mascota' };
      }
      userId = petResponse.data.userId;
    }
    
    // Ahora hacemos la petición con la ruta correcta
    const response = await ApiController.get<Treatment[]>(
      `/usuarios/${userId}/mascotas/${petId}/tratamientos`
    );
    
    // Asegurarnos de que cada tratamiento tenga el petId
    if (response.success && response.data) {
      response.data = response.data.map(treatment => ({
        ...treatment,
        petId: petId
      }));
    }
    
    return response;
  },
  
  getById: async (id: string): Promise<ApiResponse<Treatment>> => {
    // Primero necesitamos encontrar a qué mascota y usuario pertenece este tratamiento
    // Obtener todas las mascotas
    const petsResponse = await petService.getAll();
    
    if (petsResponse.success && petsResponse.data) {
      for (const pet of petsResponse.data) {
        if (pet.id && pet.userId) {
          // Obtener tratamientos de esta mascota
          const treatmentsResponse = await treatmentService.getByPetId(pet.id, pet.userId);
          
          if (treatmentsResponse.success && treatmentsResponse.data) {
            // Buscar el tratamiento por id
            const treatment = treatmentsResponse.data.find(t => t.id === id);
            if (treatment) {
              return { success: true, data: { ...treatment, petId: pet.id } };
            }
          }
        }
      }
    }
    
    return { success: false, message: 'Tratamiento no encontrado' };
  },
  
  create: async (treatment: Treatment): Promise<ApiResponse<Treatment>> => {
    if (!treatment.petId) {
      return { success: false, message: 'Se requiere el ID de la mascota' };
    }
    
    // Obtener el userId de la mascota
    const petResponse = await petService.getById(treatment.petId);
    if (!petResponse.success || !petResponse.data || !petResponse.data.userId) {
      return { success: false, message: 'No se pudo obtener el usuario de la mascota' };
    }
    
    const userId = petResponse.data.userId;
    
    // Hacer la petición POST a la ruta correcta
    return await ApiController.post<Treatment>(
      `/usuarios/${userId}/mascotas/${treatment.petId}/tratamientos`,
      treatment
    );
  },
  
  update: async (id: string, treatment: Treatment): Promise<ApiResponse<Treatment>> => {
    if (!treatment.petId) {
      return { success: false, message: 'Se requiere el ID de la mascota' };
    }
    
    // Obtener el userId de la mascota
    const petResponse = await petService.getById(treatment.petId);
    if (!petResponse.success || !petResponse.data || !petResponse.data.userId) {
      return { success: false, message: 'No se pudo obtener el usuario de la mascota' };
    }
    
    const userId = petResponse.data.userId;
    
    // Hacer la petición PUT a la ruta correcta
    return await ApiController.put<Treatment>(
      `/usuarios/${userId}/mascotas/${treatment.petId}/tratamientos/${id}`,
      treatment
    );
  },
  
  delete: async (id: string): Promise<ApiResponse<void>> => {
    // Primero necesitamos encontrar el tratamiento para saber a qué mascota y usuario pertenece
    // Obtener todas las mascotas
    const petsResponse = await petService.getAll();
    
    if (petsResponse.success && petsResponse.data) {
      for (const pet of petsResponse.data) {
        if (pet.id && pet.userId) {
          // Obtener tratamientos de esta mascota
          const treatmentsResponse = await treatmentService.getByPetId(pet.id, pet.userId);
          
          if (treatmentsResponse.success && treatmentsResponse.data) {
            // Buscar el tratamiento por id
            const treatment = treatmentsResponse.data.find(t => t.id === id);
            if (treatment) {
              // Hacer la petición DELETE a la ruta correcta
              return await ApiController.delete<void>(
                `/usuarios/${pet.userId}/mascotas/${pet.id}/tratamientos/${id}`
              );
            }
          }
        }
      }
    }
    
    return { success: false, message: 'Tratamiento no encontrado' };
  }
}; 