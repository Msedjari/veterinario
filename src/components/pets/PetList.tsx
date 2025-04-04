import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { petService, userService } from '../../services/api';
import { Pet, User } from '../../types';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const PetList = () => {
  const { userId } = useParams<{ userId?: string }>();
  const [pets, setPets] = useState<Pet[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para el diálogo de confirmación
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    petId: ''
  });

  // Función para formatear la fecha de nacimiento
  const formatearFecha = (fechaStr?: string): string => {
    if (!fechaStr) return 'No disponible';
    
    // Si ya está en formato DD/MM/YYYY, devolverlo
    if (fechaStr.includes('/')) return fechaStr;
    
    try {
      const fecha = new Date(fechaStr);
      return fecha.toLocaleDateString();
    } catch (e) {
      return fechaStr; // Si hay error, devolver la cadena original
    }
  };

  // Función para calcular la edad a partir de la fecha de nacimiento
  const calcularEdad = (fechaNacimiento?: string, edadDirecta?: number): string => {
    // Si ya tenemos la edad directamente, la usamos
    if (edadDirecta !== undefined) return `${edadDirecta} años`;
    
    // Si tenemos fecha de nacimiento, calculamos la edad
    if (fechaNacimiento) {
      try {
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
        
        return `${edad} años`;
      } catch (e) {
        console.error('Error al calcular edad:', e);
        return 'Edad desconocida';
      }
    }
    
    return 'Edad desconocida';
  };

  // Función para obtener el nombre del dueño
  const getNombreDueno = (petUserId?: string): string => {
    if (!petUserId) return 'Dueño desconocido';
    
    const dueno = allUsers.find(u => u.id === petUserId);
    if (dueno) {
      return `${dueno.nombre} ${dueno.apellido}`;
    }
    
    return 'Dueño desconocido';
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Obtener todos los usuarios para poder mostrar los dueños
        const usersResponse = await userService.getAll();
        if (usersResponse.success && usersResponse.data) {
          setAllUsers(usersResponse.data);
        } else if (Array.isArray(usersResponse)) {
          setAllUsers(usersResponse);
        }
        
        let petsData: Pet[] = [];
        
        if (userId) {
          // Obtener mascotas de un usuario específico
          const petsResponse = await petService.getByUserId(userId);
          console.log('Respuesta completa de mascotas por usuario:', petsResponse);
          
          // Extraer datos según el formato de respuesta
          if (petsResponse.success && petsResponse.data) {
            petsData = petsResponse.data;
          } else if (Array.isArray(petsResponse)) {
            petsData = petsResponse;
          }
          
          // Obtener información del usuario
          const userResponse = await userService.getById(userId);
          console.log('Respuesta completa de usuario:', userResponse);
          
          if (userResponse.success && userResponse.data) {
            setUser(userResponse.data);
          } else if (userResponse && !Array.isArray(userResponse)) {
            // Cast to unknown first to avoid type error
            setUser((userResponse as unknown) as User);
          }
        } else {
          // Obtener todas las mascotas
          const petsResponse = await petService.getAll();
          console.log('Respuesta completa de todas las mascotas:', petsResponse);
          
          // Extraer datos según el formato de respuesta
          if (petsResponse.success && petsResponse.data) {
            petsData = petsResponse.data;
          } else if (Array.isArray(petsResponse)) {
            petsData = petsResponse;
          } else if (petsResponse && typeof petsResponse === 'object') {
            // Intentar extraer los datos de alguna propiedad del objeto
            const possibleDataFields = ['mascotas', 'pets', 'items', 'results', 'data'];
            for (const field of possibleDataFields) {
              if (Array.isArray(petsResponse[field])) {
                petsData = petsResponse[field];
                break;
              }
            }
          }
        }
        
        console.log('Datos de mascotas procesados:', petsData);
        setPets(petsData);
        
        if (petsData.length > 0) {
          setError(null);
        } else {
          setError('No se encontraron mascotas');
        }
      } catch (err) {
        console.error('Error en fetchData:', err);
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  // Función para mostrar el diálogo de confirmación
  const openConfirmDialog = (id: string) => {
    console.log("Abriendo diálogo de confirmación para:", id);
    setConfirmDialog({
      isOpen: true,
      title: 'Confirmar eliminación',
      message: '¿Está seguro de que desea eliminar esta mascota? Esta acción no se puede deshacer.',
      petId: id
    });
  };

  // Función para manejar la eliminación después de la confirmación
  const handleDelete = async () => {
    const id = confirmDialog.petId;
    console.log("Ejecutando eliminación para:", id);
    if (!id) return;
    
    try {
      const response = await petService.delete(id);
      if (response.success) {
        setPets(pets.filter(pet => pet.id !== id));
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      } else {
        setError(response.message || 'Error al eliminar la mascota');
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      }
    } catch (err) {
      console.error('Error al eliminar:', err);
      setError('Error al eliminar la mascota');
      setConfirmDialog({ ...confirmDialog, isOpen: false });
    }
  };

  if (loading) return <div>Cargando mascotas...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="section">
      <h2>
        {userId && user 
          ? `Mascotas de ${user.nombre} ${user.apellido}` 
          : 'Todas las Mascotas'}
      </h2>
      
      <div className="button-group">
        <Link to={userId ? `/users/${userId}/pets/new` : '/pets/new'}>
          <button>Nueva Mascota</button>
        </Link>
        {userId && (
          <Link to="/users">
            <button>Volver a Usuarios</button>
          </Link>
        )}
      </div>

      {pets.length === 0 ? (
        <p>No hay mascotas registradas.</p>
      ) : (
        <div className="card-container">
          {pets.map((pet, index) => (
            <div key={pet.id || index} className="card">
              <div className="card-actions">
                <Link to={`/pets/edit/${pet.id}`}>
                  <button>Editar</button>
                </Link>
                <button 
                  onClick={() => {
                    console.log("Botón eliminar clickeado para:", pet.id);
                    if (pet.id) openConfirmDialog(pet.id);
                  }}
                >
                  Eliminar
                </button>
              </div>
              <h3>{pet.nombre}</h3>
              <p><strong>Raza:</strong> {pet.raza}</p>
              <p><strong>Género:</strong> {pet.genero}</p>
              <p><strong>Edad:</strong> {calcularEdad(pet.fechaNacimiento, pet.edad)}</p>
              {pet.fechaNacimiento && (
                <p><strong>Fecha de nacimiento:</strong> {formatearFecha(pet.fechaNacimiento)}</p>
              )}
              <p><strong>Peso:</strong> {pet.peso} kg</p>
              {!userId && (
                <p><strong>Dueño:</strong> {getNombreDueno(pet.userId)}</p>
              )}
              {pet.id && (
                <Link to={`/pets/${pet.id}/treatments`}>
                  <button>Ver Tratamientos</button>
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Diálogo de confirmación */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={handleDelete}
        onCancel={() => {
          console.log("Cancelando diálogo");
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }}
      />
    </div>
  );
};

export default PetList; 