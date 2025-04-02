import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userService } from '../../services/api';
import { User } from '../../types';

const UserForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User>({
    nombre: '',
    apellido: '',
    email: '',
    numeroCuenta: ''
  });

  useEffect(() => {
    const fetchUser = async () => {
      if (id) {
        setLoading(true);
        try {
          console.log(`Intentando obtener usuario con ID: ${id}`);
          const response = await userService.getById(id);
          console.log('Respuesta completa de usuario en UserForm:', response);
          
          // Verificar diferentes formatos de respuesta
          if (response.success && response.data) {
            console.log('Formato success/data encontrado:', response.data);
            setUser(response.data);
            setError(null);
          } else if (response && typeof response === 'object' && !Array.isArray(response)) {
            // Si la respuesta es un objeto pero no tiene el formato ApiResponse
            console.log('Formato objeto directo encontrado:', response);
            
            // Verificar si el objeto tiene las propiedades esperadas de un usuario
            if (response.nombre || response.id) {
              setUser(response as User);
              setError(null);
            } else {
              // Buscar si hay un objeto anidado que podría contener los datos del usuario
              const possibleUserFields = ['usuario', 'user', 'data', 'item', 'result'];
              let foundUserData = false;
              
              for (const field of possibleUserFields) {
                if (response[field] && typeof response[field] === 'object') {
                  console.log(`Datos de usuario encontrados en campo ${field}:`, response[field]);
                  setUser(response[field]);
                  setError(null);
                  foundUserData = true;
                  break;
                }
              }
              
              if (!foundUserData) {
                console.error('No se pudo extraer datos de usuario de la respuesta:', response);
                setError('Error al cargar el usuario: formato de respuesta no reconocido');
              }
            }
          } else {
            console.error('Formato de respuesta no reconocido:', response);
            setError(response.message || 'Error al cargar el usuario');
          }
        } catch (err) {
          console.error('Error en fetchUser:', err);
          setError('Error al cargar los datos del usuario');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUser();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let response;
      console.log('Enviando datos de usuario:', user);
      
      if (id) {
        response = await userService.update(id, user);
      } else {
        response = await userService.create(user);
      }
      
      console.log('Respuesta después de guardar usuario:', response);
      
      // Verificar diferentes formatos de respuesta exitosa
      if (response.success || 
          (response && !response.success && !response.message) || 
          (response && response.id)) {
        navigate('/users');
      } else {
        setError(response.message || 'Error al guardar el usuario');
      }
    } catch (err) {
      console.error('Error en handleSubmit:', err);
      setError('Error en la operación');
    } finally {
      setLoading(false);
    }
  };

  if (loading && id) return <div>Cargando usuario...</div>;

  return (
    <div className="section">
      <h2>{id ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-group">
          <label htmlFor="nombre">Nombre</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={user.nombre || ''}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="apellido">Apellido</label>
          <input
            type="text"
            id="apellido"
            name="apellido"
            value={user.apellido || ''}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={user.email || ''}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="numeroCuenta">Número de Cuenta</label>
          <input
            type="text"
            id="numeroCuenta"
            name="numeroCuenta"
            value={user.numeroCuenta || ''}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="button-group">
          <button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
          <button type="button" onClick={() => navigate('/users')}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm; 