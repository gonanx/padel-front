import { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import '../styles/Admin.css';


const AdminPage = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        // Asumiendo que crearás apiService.getUsuarios()
        apiService.fetchConfig('/admin/usuarios')
            .then(data => {
                setUsuarios(data);
                setLoading(false);
            })
            .catch(err => console.error("Error cargando usuarios:", err));
    }, []);


    const usuariosFiltrados = usuarios.filter(u =>
        u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.email.toLowerCase().includes(busqueda.toLowerCase())
    );


    if (loading) return <div className="loading">Accediendo al panel de control...</div>;


    return (
        <div className="admin-container">
            <div className="admin-sidebar">
                <h2>Panel Admin</h2>
                <ul>
                    <li className="active">👥 Usuarios</li>
                    <li onClick={() => window.location.href = '/dashboard'}>⬅️ Volver</li>
                </ul>
            </div>


            <main className="admin-content">
                <header className="admin-main-header">
                    <h1>Gestión de Usuarios</h1>
                    <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="admin-search"
                    />
                </header>


                <div className="table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Email</th>
                                <th>DNI</th>
                                <th>Rol</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuariosFiltrados.map(user => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td><strong>{user.nombre}</strong></td>
                                    <td>{user.email}</td>
                                    <td>{user.dni}</td>
                                    <td>
                                        <span className={`badge ${user.rol_id === 2 ? 'admin' : 'user'}`}>
                                            {user.rol_id === 2 ? 'Admin' : 'Cliente'}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn-edit">Editar</button>
                                        <button className="btn-delete">Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};


export default AdminPage;