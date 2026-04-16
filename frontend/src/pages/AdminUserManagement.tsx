import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AdminLayoutContextType } from '../components/AdminLayout';
import { Menu, Users, Search, Filter, MoreVertical, Shield, UserX, UserCheck, Mail, Loader2 } from 'lucide-react';
import { getUsers, updateUser } from '../api';

export default function AdminUserManagement() {
  const { toggleSidebar } = useOutletContext<AdminLayoutContextType>();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {} finally { setLoading(false); }
  };

  const filtered = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      admin: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
      doctor: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
      patient: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    };
    return styles[role.toLowerCase()] || styles.patient;
  };

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark relative">
      <header className="h-16 px-6 md:px-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-4">
          <button className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" onClick={toggleSidebar}><Menu className="w-6 h-6" /></button>
          <div><h2 className="text-xl font-bold text-slate-900 dark:text-white">User Management</h2><p className="text-xs text-slate-500 hidden sm:block">Manage roles, permissions, and user accounts.</p></div>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input type="text" placeholder="Search users by name or email..." value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white outline-none text-sm shadow-sm" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            {loading ? (
              <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Login</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {filtered.map(user => (
                      <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold">
                              {(user.name || user.email || '?').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900 dark:text-white">{user.name || user.email}</p>
                              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><Mail className="w-3 h-3" /> {user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getRoleBadge(user.role)}`}>
                            {user.role === 'admin' && <Shield className="w-3 h-3" />}
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                            user.status === 'active' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400' :
                            'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400'}`}>
                            {user.status === 'active' ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">{user.lastLogin}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}