import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { petService, userService } from '../../services/api';
import { Pet, User } from '../../types';

const PetForm = () => {
  const { id, userId } = useParams<{ id?: string; userId?: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [pet, setPet] = useState<Pet>({
    nombre: '',
    raza: '',
    genero: '',
    fechaNacimiento: '',
    peso: 0,
    userId: userId || ''
  });

  // Función para calcular la edad a partir de la fecha de nacimiento
  const calcularEdad = (fechaNacimiento: string): number => {
    if (!fechaNacimiento) return 0;
    
    // Intentar parsear diferentes formatos de fecha
    let fechaNac: Date;
    
    // Formato DD/MM/YYYY
    if (fechaNacimiento.includes('/')) {
      const [day, month, year] = fechaNacimiento.split('/').map(Number);
      fechaNac = new Date(year, month - 1, day);
    } 
    // Formato YYYY-MM-DD
    else if (fechaNacimiento.includes('-')) {
      fechaNac = new Date(fechaNacimiento);
    } 
    // Otro formato o timestamp
    else {
      fechaNac = new Date(fechaNacimiento);
    }
    
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }
    
    return edad;
  };

  // Función para convertir fecha de nacimiento al formato esperado por el backend
  const formatearFechaNacimiento = (fechaISO: string): string => {
    if (!fechaISO) return '';
    
    const fecha = new Date(fechaISO);
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getFullYear();
    
    return `${dia}/${mes}/${anio}`;
  };

  // Función para convertir fecha del formato DD/MM/YYYY a YYYY-MM-DD para el input date
  const convertirFechaParaInput = (fechaStr: string): string => {
    if (!fechaStr) return '';
    
    // Si ya está en formato ISO, devolverlo
    if (fechaStr.includes('-')) return fechaStr;
    
    // Convertir de DD/MM/YYYY a YYYY-MM-DD
    if (fechaStr.includes('/')) {
      const [day, month, year] = fechaStr.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    return '';
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Obtener usuarios para el selector
        const usersResponse = await userService.getAll();
        console.log('Respuesta de usuarios en PetForm:', usersResponse);
        
        if (usersResponse.success && usersResponse.data) {
          setUsers(usersResponse.data);
        } else if (Array.isArray(usersResponse)) {
          setUsers(usersResponse);
        } else if (usersResponse && typeof usersResponse === 'object') {
          // Intentar extraer los datos de alguna propiedad del objeto
          const possibleDataFields = ['usuarios', 'users', 'items', 'results', 'data'];
          for (const field of possibleDataFields) {
            if (Array.isArray(usersResponse[field])) {
              setUsers(usersResponse[field]);
              break;
            }
          }
        }
        
        // Si estamos editando, obtener datos de la mascota
        if (id) {
          console.log(`Intentando obtener mascota con ID: ${id}`);
          const petResponse = await petService.getById(id);
          console.log('Respuesta de mascota en PetForm:', petResponse);
          
          if (petResponse.success && petResponse.data) {
            // Convertir la fecha al formato para el input date
            if (petResponse.data.fechaNacimiento) {
              petResponse.data.fechaNacimiento = convertirFechaParaInput(petResponse.data.fechaNacimiento);
            }
            setPet(petResponse.data);
          } else if (petResponse && typeof petResponse === 'object' && !Array.isArray(petResponse)) {
            // Si la respuesta es un objeto pero no tiene el formato ApiResponse
            if (petResponse.nombre || petResponse.id) {
              // Convertir la fecha al formato para el input date
              if (petResponse.fechaNacimiento) {
                petResponse.fechaNacimiento = convertirFechaParaInput(petResponse.fechaNacimiento);
              }
              // Usamos 'as unknown as Pet' para forzar el tipo de petResponse a Pet
              // Esto es necesario porque la respuesta de la API podría no coincidir exactamente
              // con la interfaz Pet, pero sabemos que contiene los datos necesarios
              setPet(petResponse as unknown as Pet);
            } else {
              // Buscar si hay un objeto anidado que podría contener los datos
              const possiblePetFields = ['mascota', 'pet', 'data', 'item', 'result'];
              let foundPetData = false;
              
              for (const field of possiblePetFields) {
                if (petResponse[field] && typeof petResponse[field] === 'object') {
                  const petData = petResponse[field];
                  // Convertir la fecha al formato para el input date
                  if (petData.fechaNacimiento) {
                    petData.fechaNacimiento = convertirFechaParaInput(petData.fechaNacimiento);
                  }
                  setPet(petData);
                  foundPetData = true;
                  break;
                }
              }
              
              if (!foundPetData) {
                setError('Error al cargar la mascota: formato de respuesta no reconocido');
              }
            }
          } else {
            setError(petResponse.message || 'Error al cargar la mascota');
          }
        }
      } catch (err) {
        console.error('Error en fetchData:', err);
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, userId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setPet(prev => ({
      ...prev,
      [name]: name === 'peso' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Crear una copia del objeto pet para enviar al servidor
      const petToSend = { ...pet };
      
      // Convertir la fecha al formato esperado por el backend (DD/MM/YYYY)
      if (pet.fechaNacimiento) {
        petToSend.fechaNacimiento = formatearFechaNacimiento(pet.fechaNacimiento);
      }
      
      let response;
      if (id) {
        response = await petService.update(id, petToSend);
      } else {
        response = await petService.create(petToSend);
      }
      
      if (response.success || 
          (response && !response.success && !response.message) || 
          (response && response.id)) {
        if (userId) {
          navigate(`/users/${userId}/pets`);
        } else {
          navigate('/pets');
        }
      } else {
        setError(response.message || 'Error al guardar la mascota');
      }
    } catch (err) {
      console.error('Error en handleSubmit:', err);
      setError('Error en la operación');
    } finally {
      setLoading(false);
    }
  };

  if (loading && id) return <div>Cargando mascota...</div>;

  return (
    <div className="section">
      <h2>{id ? 'Editar Mascota' : 'Nueva Mascota'}</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-group">
          <label htmlFor="nombre">Nombre</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={pet.nombre || ''}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="raza">Raza</label>
          <input
            type="text"
            id="raza"
            name="raza"
            value={pet.raza || ''}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="genero">Género</label>
          <select
            id="genero"
            name="genero"
            value={pet.genero || ''}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione género</option>
            <option value="Macho">Macho</option>
            <option value="Hembra">Hembra</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="fechaNacimiento">Fecha de Nacimiento</label>
          <input
            type="date"
            id="fechaNacimiento"
            name="fechaNacimiento"
            value={pet.fechaNacimiento || ''}
            onChange={handleChange}
            max={new Date().toISOString().split('T')[0]} // No permitir fechas futuras
            required
          />
          {pet.fechaNacimiento && (
            <div className="form-hint">
              Edad aproximada: {calcularEdad(pet.fechaNacimiento)} años
            </div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="peso">Peso (kg)</label>
          <input
            type="number"
            id="peso"
            name="peso"
            min="0"
            step="0.1"
            value={pet.peso || 0}
            onChange={handleChange}
            onKeyDown={(e) => {
              // Permitir teclas numéricas, punto decimal, backspace, delete, flechas, tab
              const allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', 'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
              if (!allowedKeys.includes(e.key)) {
                e.preventDefault();
              }
            }}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="userId">Propietario</label>
          <select
            id="userId"
            name="userId"
            value={pet.userId || ''}
            onChange={handleChange}
            required
            disabled={!!userId} // Deshabilitar si viene de un usuario específico
          >
            <option value="">Seleccione propietario</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.nombre} {user.apellido}
              </option>
            ))}
          </select>
        </div>
        
        <div className="button-group">
          <button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
          <button 
            type="button" 
            onClick={() => userId ? navigate(`/users/${userId}/pets`) : navigate('/pets')}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default PetForm;