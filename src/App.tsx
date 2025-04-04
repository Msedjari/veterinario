import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import './App.css'

// Importar componentes
import UserList from './components/users/UserList'
import UserForm from './components/users/UserForm'
import PetList from './components/pets/PetList'
import PetForm from './components/pets/PetForm'
import TreatmentList from './components/treatments/TreatmentList'
import TreatmentForm from './components/treatments/TreatmentForm'
import Dashboard from './components/Dashboard'

function App() {
  return (
    <Router>
      <div className="app-container">
        <header>
          <div className="app-logo"></div>
          <h1>Clínica Veterinaria</h1>
          <nav>
            <div className="tabs">
              <Link to="/" className="tab">Inicio</Link>
              <Link to="/users" className="tab">Usuarios</Link>
              <Link to="/pets" className="tab">Mascotas</Link>
              <Link to="/treatments" className="tab">Tratamientos</Link>
            </div>
          </nav>
        </header>

        <main>
          <Routes>
            {/* Dashboard */}
            <Route path="/" element={<Dashboard />} />
            
            {/* Rutas de Usuarios */}
            <Route path="/users" element={<UserList />} />
            <Route path="/users/new" element={<UserForm />} />
            <Route path="/users/edit/:id" element={<UserForm />} />
            
            {/* Rutas de Mascotas */}
            <Route path="/pets" element={<PetList />} />
            <Route path="/pets/new" element={<PetForm />} />
            <Route path="/pets/edit/:id" element={<PetForm />} />
            <Route path="/users/:userId/pets" element={<PetList />} />
            <Route path="/users/:userId/pets/new" element={<PetForm />} />
            
            {/* Rutas de Tratamientos */}
            <Route path="/treatments" element={<TreatmentList />} />
            <Route path="/treatments/new" element={<TreatmentForm />} />
            <Route path="/pets/:petId/treatments" element={<TreatmentList />} />
            <Route path="/pets/:petId/treatments/new" element={<TreatmentForm />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
