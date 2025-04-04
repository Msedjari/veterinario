import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { treatmentService, petService } from '../../services/api';
import { Treatment, Pet } from '../../types';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const TreatmentList = () => {
  const { petId } = useParams<{ petId?: string }>();
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [pet, setPet] = useState<Pet | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para el diálogo de confirmación
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    treatmentId: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let treatmentsData: Treatment[] = [];
        
        // Obtener todas las mascotas para mostrar sus nombres
        const allPetsResponse = await petService.getAll();
        if (allPetsResponse.success && allPetsResponse.data) {
          setPets(allPetsResponse.data);
        } else if (Array.isArray(allPetsResponse)) {
          setPets(allPetsResponse);
        }
        
        if (petId) {
          // Obtener tratamientos de una mascota específica
          const petResponse = await petService.getById(petId);
          if (petResponse.success && petResponse.data && petResponse.data.userId) {
            const treatmentsResponse = await treatmentService.getByPetId(petId, petResponse.data.userId);
            console.log('Respuesta completa de tratamientos por mascota:', treatmentsResponse);
            
            // Extraer datos según el formato de respuesta
            if (treatmentsResponse.success && treatmentsResponse.data) {
              treatmentsData = treatmentsResponse.data.map(t => ({
                ...t,
                petId: petId // Asegurar que cada tratamiento tenga el petId
              }));
            } else if (Array.isArray(treatmentsResponse)) {
              treatmentsData = treatmentsResponse.map(t => ({
                ...t,
                petId: petId
              }));
            }
            
            // Establecer la información de la mascota
            setPet(petResponse.data);
          }
        } else {
          // Obtener todos los tratamientos
          const treatmentsResponse = await treatmentService.getAll();
          console.log('Respuesta completa de todos los tratamientos:', treatmentsResponse);
          
          // Extraer datos según el formato de respuesta
          if (treatmentsResponse.success && treatmentsResponse.data) {
            treatmentsData = treatmentsResponse.data;
          } else if (Array.isArray(treatmentsResponse)) {
            treatmentsData = treatmentsResponse;
          } else if (treatmentsResponse && typeof treatmentsResponse === 'object') {
            // Intentar extraer los datos de alguna propiedad del objeto
            const possibleDataFields = ['tratamientos', 'treatments', 'items', 'results', 'data'];
            for (const field of possibleDataFields) {
              if (Array.isArray(treatmentsResponse[field])) {
                treatmentsData = treatmentsResponse[field];
                break;
              }
            }
          }
        }
        
        console.log('Datos de tratamientos procesados:', treatmentsData);
        setTreatments(treatmentsData);
        
        if (treatmentsData.length > 0) {
          setError(null);
        } else {
          setError('No se encontraron tratamientos');
        }
      } catch (err) {
        console.error('Error en fetchData:', err);
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [petId]);

  // Función para mostrar el diálogo de confirmación
  const openConfirmDialog = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Confirmar eliminación',
      message: '¿Está seguro de que desea eliminar este tratamiento? Esta acción no se puede deshacer.',
      treatmentId: id
    });
  };

  // Función para manejar la eliminación después de la confirmación
  const handleDelete = async () => {
    const id = confirmDialog.treatmentId;
    if (!id) return;
    
    try {
      const response = await treatmentService.delete(id);
      if (response.success) {
        setTreatments(treatments.filter(treatment => treatment.id !== id));
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      } else {
        setError(response.message || 'Error al eliminar el tratamiento');
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      }
    } catch (err) {
      console.error('Error al eliminar:', err);
      setError('Error al eliminar el tratamiento');
      setConfirmDialog({ ...confirmDialog, isOpen: false });
    }
  };

  // Función para obtener el nombre de la mascota
  const getPetName = (mascotaId: string): string => {
    const matchingPet = pets.find(p => p.id === mascotaId);
    return matchingPet ? matchingPet.nombre : 'Mascota desconocida';
  };

  if (loading) return <div>Cargando tratamientos...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="section">
      <h2>
        {petId && pet 
          ? `Tratamientos de ${pet.nombre}` 
          : 'Todos los Tratamientos'}
      </h2>
      
      <div className="button-group">
        <Link to={petId ? `/pets/${petId}/treatments/new` : '/treatments/new'}>
          <button>Nuevo Tratamiento</button>
        </Link>
        {petId && (
          <Link to={pet?.userId ? `/users/${pet.userId}/pets` : '/pets'}>
            <button>Volver a Mascotas</button>
          </Link>
        )}
      </div>

      {treatments.length === 0 ? (
        <p>No hay tratamientos registrados.</p>
      ) : (
        <div className="card-container">
          {treatments.map((treatment, index) => (
            <div key={treatment.id || index} className="card">
              <div className="card-actions">
                <button onClick={() => treatment.id && openConfirmDialog(treatment.id)}>
                  Eliminar
                </button>
              </div>
              <h3>{treatment.medicamento}</h3>
              <p><strong>Dosis:</strong> {treatment.dosis}</p>
              <p><strong>Duración:</strong> {treatment.duracion}</p>
              {!petId && treatment.petId && (
                <p><strong>Mascota:</strong> {getPetName(treatment.petId)}</p>
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
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
      />
    </div>
  );
};

export default TreatmentList;