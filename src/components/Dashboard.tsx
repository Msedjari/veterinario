import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userService, petService, treatmentService } from '../services/api';
import { User, Pet } from '../types';

const Dashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    pets: 0,
    treatments: 0
  });
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [recentPets, setRecentPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Obtener usuarios
        const usersResponse = await userService.getAll();
        console.log('Respuesta de usuarios en Dashboard:', usersResponse); // Depuración
        
        if (usersResponse.success && usersResponse.data) {
          setStats(prev => ({ ...prev, users: usersResponse.data?.length || 0 }));
          
          // Ordenar usuarios por ID (asumiendo que IDs más altos son más recientes)
          // Si hay un campo de fecha de creación, sería mejor usarlo
          const sortedUsers = [...usersResponse.data].sort((a, b) => {
            // Si hay IDs, ordenar por ID de forma descendente
            if (a.id && b.id) {
              return b.id.localeCompare(a.id);
            }
            return 0;
          });
          
          // Mostrar los 3 usuarios más recientes
          setRecentUsers(sortedUsers.slice(0, 3));
        }
        
        // Obtener mascotas
        const petsResponse = await petService.getAll();
        if (petsResponse.success && petsResponse.data) {
          setStats(prev => ({ ...prev, pets: petsResponse.data?.length || 0 }));
          
          // Ordenar mascotas por ID (asumiendo que IDs más altos son más recientes)
          // Si hay un campo de fecha de creación, sería mejor usarlo
          const sortedPets = [...petsResponse.data].sort((a, b) => {
            // Si hay IDs, ordenar por ID de forma descendente
            if (a.id && b.id) {
              return b.id.localeCompare(a.id);
            }
            return 0;
          });
          
          // Mostrar las 3 mascotas más recientes
          setRecentPets(sortedPets.slice(0, 3));
        }
        
        // Obtener tratamientos
        const treatmentsResponse = await treatmentService.getAll();
        if (treatmentsResponse.success && treatmentsResponse.data) {
          setStats(prev => ({ ...prev, treatments: treatmentsResponse.data?.length || 0 }));
        }
        
        setError(null);
      } catch (err) {
        setError('Error al cargar los datos del dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Cargando dashboard...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      
      <div className="section">
        <h2>Acciones Rápidas</h2>
        <div className="quick-actions">
          <Link to="/users/new" className="quick-action-card">
            <div className="quick-action-icon">👤</div>
            <h3>Nuevo Usuario</h3>
            <p>Registrar un nuevo propietario</p>
          </Link>
          
          <Link to="/pets/new" className="quick-action-card">
            <div className="quick-action-icon">🐶</div>
            <h3>Nueva Mascota</h3>
            <p>Registrar una nueva mascota</p>
          </Link>
          
          <Link to="/treatments/new" className="quick-action-card">
            <div className="quick-action-icon">💊</div>
            <h3>Nuevo Tratamiento</h3>
            <p>Registrar un nuevo tratamiento</p>
          </Link>
        </div>
      </div>
      
      <div className="card-container">
        <div className="card">
          <h3>Usuarios</h3>
          <p className="stat">{stats.users}</p>
          <Link to="/users">
            <button>Ver todos</button>
          </Link>
        </div>
        
        <div className="card">
          <h3>Mascotas</h3>
          <p className="stat">{stats.pets}</p>
          <Link to="/pets">
            <button>Ver todas</button>
          </Link>
        </div>
        
        <div className="card">
          <h3>Tratamientos</h3>
          <p className="stat">{stats.treatments}</p>
          <Link to="/treatments">
            <button>Ver todos</button>
          </Link>
        </div>
      </div>
      
      <div className="section">
        <h3>Usuarios recientes</h3>
        {recentUsers.length === 0 ? (
          <p>No hay usuarios registrados.</p>
        ) : (
          <div className="card-container">
            {recentUsers.map(user => (
              <div key={user.id} className="card">
                <h4>{user.nombre} {user.apellido}</h4>
                <p><strong>Email:</strong> {user.email}</p>
                {user.id && (
                  <Link to={`/users/edit/${user.id}`}>
                    <button>Ver detalles</button>
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="section">
        <h3>Mascotas recientes</h3>
        {recentPets.length === 0 ? (
          <p>No hay mascotas registradas.</p>
        ) : (
          <div className="card-container">
            {recentPets.map(pet => (
              <div key={pet.id} className="card">
                <h4>{pet.nombre}</h4>
                <p><strong>Raza:</strong> {pet.raza}</p>
                <p><strong>Edad:</strong> {pet.edad} años</p>
                <Link to={`/pets/edit/${pet.id}`}>
                  <button>Ver detalles</button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 