import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userService } from '../../services/api';
import { User } from '../../types';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para el diálogo de confirmación
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    userId: ''
  });

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await userService.getAll();
        console.log('Respuesta completa de usuarios:', response);
        
        let usersData: User[] = [];
        
        // Extraer datos según el formato de respuesta
        if (response.success && response.data) {
          usersData = response.data;
        } else if (Array.isArray(response)) {
          usersData = response;
        } else if (response && typeof response === 'object') {
          // Intentar extraer los datos de alguna propiedad del objeto
          const possibleDataFields = ['usuarios', 'users', 'items', 'results', 'data'];
          for (const field of possibleDataFields) {
            if (Array.isArray(response[field])) {
              usersData = response[field];
              break;
            }
          }
        }
        
        console.log('Datos de usuarios procesados:', usersData);
        setUsers(usersData);
        
        if (usersData.length > 0) {
          setError(null);
        } else {
          setError('No se encontraron usuarios');
        }
      } catch (err) {
        console.error('Error en fetchUsers:', err);
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Función para mostrar el diálogo de confirmación
  const openConfirmDialog = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Confirmar eliminación',
      message: '¿Está seguro de que desea eliminar este usuario? Esta acción no se puede deshacer y eliminará todas sus mascotas asociadas.',
      userId: id
    });
  };

  // Función para manejar la eliminación después de la confirmación
  const handleDelete = async () => {
    const id = confirmDialog.userId;
    if (!id) return;
    
    try {
      const response = await userService.delete(id);
      if (response.success) {
        setUsers(users.filter(user => user.id !== id));
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      } else {
        setError(response.message || 'Error al eliminar el usuario');
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      }
    } catch (err) {
      console.error('Error al eliminar:', err);
      setError('Error al eliminar el usuario');
      setConfirmDialog({ ...confirmDialog, isOpen: false });
    }
  };

  if (loading) return <div>Cargando usuarios...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="section">
      <h2>Usuarios</h2>
      
      <div className="button-group">
        <Link to="/users/new">
          <button>Nuevo Usuario</button>
        </Link>
      </div>

      {users.length === 0 ? (
        <p>No hay usuarios registrados.</p>
      ) : (
        <div className="card-container">
          {users.map((user, index) => (
            <div key={user.id || index} className="card">
              <div className="card-actions">
                <Link to={`/users/edit/${user.id}`}>
                  <button>Editar</button>
                </Link>
                <button onClick={() => user.id && openConfirmDialog(user.id)}>Eliminar</button>
              </div>
              <h3>{user.nombre} {user.apellido}</h3>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Número de Cuenta:</strong> {user.numeroCuenta}</p>
              <p>
                <strong>Mascotas:</strong> {user.mascotas ? user.mascotas.length : 0}
              </p>
              {user.id && (
                <Link to={`/users/${user.id}/pets`}>
                  <button>Ver Mascotas</button>
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
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
      />
    </div>
  );
};

export default UserList; 