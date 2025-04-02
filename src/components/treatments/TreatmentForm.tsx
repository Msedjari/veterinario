import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { treatmentService, petService } from '../../services/api';
import { Treatment, Pet } from '../../types';

const TreatmentForm = () => {
  const { id, petId } = useParams<{ id?: string; petId?: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [treatment, setTreatment] = useState<Treatment>({
    medicamento: '',
    dosis: '',
    duracion: '',
    petId: petId || ''
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Obtener mascotas para el selector
        const petsResponse = await petService.getAll();
        console.log('Respuesta de mascotas en TreatmentForm:', petsResponse);
        
        if (petsResponse.success && petsResponse.data) {
          setPets(petsResponse.data);
        } else if (Array.isArray(petsResponse)) {
          setPets(petsResponse);
        } else if (petsResponse && typeof petsResponse === 'object') {
          // Intentar extraer los datos de alguna propiedad del objeto
          const possibleDataFields = ['mascotas', 'pets', 'items', 'results', 'data'];
          for (const field of possibleDataFields) {
            if (Array.isArray(petsResponse[field])) {
              setPets(petsResponse[field]);
              break;
            }
          }
        }
        
        // Si estamos editando, obtener datos del tratamiento
        if (id) {
          console.log(`Intentando obtener tratamiento con ID: ${id}`);
          const treatmentResponse = await treatmentService.getById(id);
          console.log('Respuesta de tratamiento en TreatmentForm:', treatmentResponse);
          
          if (treatmentResponse.success && treatmentResponse.data) {
            setTreatment(treatmentResponse.data);
          } else if (treatmentResponse && typeof treatmentResponse === 'object' && !Array.isArray(treatmentResponse)) {
            // Si la respuesta es un objeto pero no tiene el formato ApiResponse
            if (treatmentResponse.medicamento || treatmentResponse.id) {
              setTreatment(treatmentResponse as Treatment);
            } else {
              // Buscar si hay un objeto anidado que podría contener los datos
              const possibleTreatmentFields = ['tratamiento', 'treatment', 'data', 'item', 'result'];
              let foundTreatmentData = false;
              
              for (const field of possibleTreatmentFields) {
                if (treatmentResponse[field] && typeof treatmentResponse[field] === 'object') {
                  setTreatment(treatmentResponse[field]);
                  foundTreatmentData = true;
                  break;
                }
              }
              
              if (!foundTreatmentData) {
                setError('Error al cargar el tratamiento: formato de respuesta no reconocido');
              }
            }
          } else {
            setError(treatmentResponse.message || 'Error al cargar el tratamiento');
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
  }, [id, petId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTreatment(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('Enviando datos de tratamiento:', treatment);
      let response;
      
      if (id) {
        response = await treatmentService.update(id, treatment);
      } else {
        response = await treatmentService.create(treatment);
      }
      
      console.log('Respuesta después de guardar tratamiento:', response);
      
      if (response.success || 
          (response && !response.success && !response.message) || 
          (response && response.id)) {
        if (petId) {
          navigate(`/pets/${petId}/treatments`);
        } else {
          navigate('/treatments');
        }
      } else {
        setError(response.message || 'Error al guardar el tratamiento');
      }
    } catch (err) {
      console.error('Error en handleSubmit:', err);
      setError('Error en la operación');
    } finally {
      setLoading(false);
    }
  };

  if (loading && id) return <div>Cargando tratamiento...</div>;

  return (
    <div className="section">
      <h2>{id ? 'Editar Tratamiento' : 'Nuevo Tratamiento'}</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-group">
          <label htmlFor="medicamento">Medicamento</label>
          <input
            type="text"
            id="medicamento"
            name="medicamento"
            value={treatment.medicamento || ''}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="dosis">Dosis</label>
          <input
            type="text"
            id="dosis"
            name="dosis"
            value={treatment.dosis || ''}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="duracion">Duración</label>
          <input
            type="text"
            id="duracion"
            name="duracion"
            value={treatment.duracion || ''}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="petId">Mascota</label>
          <select
            id="petId"
            name="petId"
            value={treatment.petId || ''}
            onChange={handleChange}
            required
            disabled={!!petId} // Deshabilitar si viene de una mascota específica
          >
            <option value="">Seleccione mascota</option>
            {pets.map(pet => (
              <option key={pet.id} value={pet.id}>
                {pet.nombre} ({pet.raza})
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
            onClick={() => petId ? navigate(`/pets/${petId}/treatments`) : navigate('/treatments')}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default TreatmentForm; 