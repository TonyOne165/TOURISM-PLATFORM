import { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db, COLLECTIONS } from '../../services/firebase';
import { useAnalytics } from '../../hooks/useAnalytics';
import type { User } from '../../types';

export const AdminUsers = () => {
  const { getAllUsers } = useAnalytics();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllUsers();
        setUsers(data);
      } catch (err) {
        console.error('Error loading users:', err);
        setError('Error al cargar los usuarios. Verifica los permisos de Firestore.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleBlock = async (uid: string, blocked: boolean) => {
    try {
      await updateDoc(doc(db, COLLECTIONS.USERS, uid), { blocked: !blocked });
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, blocked: !blocked } : u));
    } catch (err) {
      console.error('Error toggling block status:', err);
      alert('Error al cambiar el estado del usuario');
    }
  };

  const changeRole = async (uid: string, role: 'user' | 'admin') => {
    try {
      await updateDoc(doc(db, COLLECTIONS.USERS, uid), { role });
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role } : u));
    } catch (err) {
      console.error('Error changing role:', err);
      alert('Error al cambiar el rol del usuario');
    }
  };

  const filtered = users.filter(u => {
    const matchSearch = !search ||
      u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  if (loading) {
    return <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg text-primary"></span></div>;
  }

  if (error) {
    return (
      <div className="py-12">
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
        <span className="badge badge-lg badge-primary">{users.length} usuarios</span>
      </div>

      {/* Filters */}
      <div className="card bg-base-100 shadow-sm mb-6">
        <div className="card-body p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              className="input input-bordered flex-1"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select
              className="select select-bordered w-full sm:w-48"
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
            >
              <option value="">Todos los roles</option>
              <option value="user">Usuario</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card bg-base-100 shadow-md">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.uid}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar placeholder">
                          <div className="bg-neutral text-neutral-content rounded-full w-10">
                            {u.photoURL ? (
                              <img src={u.photoURL} alt={u.displayName || ''} />
                            ) : (
                              <span>{(u.displayName || u.email || '?')[0].toUpperCase()}</span>
                            )}
                          </div>
                        </div>
                        <span className="font-medium">{u.displayName || 'Sin nombre'}</span>
                      </div>
                    </td>
                    <td className="text-sm">{u.email}</td>
                    <td>
                      <select
                        className="select select-bordered select-sm"
                        value={u.role}
                        onChange={e => changeRole(u.uid, e.target.value as 'user' | 'admin')}
                      >
                        <option value="user">Usuario</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>
                      <span className={`badge ${u.blocked ? 'badge-error' : 'badge-success'}`}>
                        {u.blocked ? 'Bloqueado' : 'Activo'}
                      </span>
                    </td>
                    <td className="text-sm">
                      {u.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                    </td>
                    <td>
                      <button
                        className={`btn btn-sm ${u.blocked ? 'btn-success' : 'btn-warning'}`}
                        onClick={() => toggleBlock(u.uid, !!u.blocked)}
                      >
                        {u.blocked ? 'Desbloquear' : 'Bloquear'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <p className="text-center py-8 text-base-content/60">No se encontraron usuarios</p>
          )}
        </div>
      </div>
    </div>
  );
};
