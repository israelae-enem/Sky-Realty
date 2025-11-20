'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import TenantChat from '@/components/TenantChat';
import Profile from '@/components/Profile';
import Link from 'next/link';

interface Tenant {
  id: string;
  full_name: string | null;
  realtor_id?: string;
}

interface Notification {
  id: string;
  message: string | null;
  read: boolean;
  created_at: string;
}

interface MaintenanceRequest {
  id: string;
  description: string;
  priority: string;
  status: string;
  created_at: string;
}

interface Document {
  id: string;
  file_name: string;
  file_url: string;
  created_at: string;
}

interface Stats {
  total: number;
  completed: number;
  pending: number;
}

const navItems = [
  { key: 'Profile', label: 'Manage Profile' },
  { key: 'SubmitRequest', label: 'Submit Maintenance Request' },
  { key: 'MaintenanceRequests', label: 'Maintenance Requests' },
  { key: 'Documents', label: 'Documents' },
  { key: 'Chat', label: 'Chat' },
];

const TenantDashboard = () => {
  const { user, isLoaded } = useUser();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, completed: 0, pending: 0 });
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Completed'>('All');
  const [activeNav, setActiveNav] = useState<string>('Profile');
  const [openNotifications, setOpenNotifications] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Fetch tenant data
  useEffect(() => {
    if (!isLoaded || !user) return;

    const fetchData = async () => {
      try {
        // Tenant profile
        const { data: tenantData, error: tenantError } = await supabase
          .from('tenants')
          .select('*')
          .eq('id', user.id)
          .single();
        if (tenantError) console.error(tenantError);
        else setTenant(tenantData);

        // Notifications
        const { data: notifData, error: notifError } = await supabase
          .from('notification')
          .select('*')
          .eq('tenant_id', user.id)
          .order('created_at', { ascending: false });
        if (notifError) console.error(notifError);
        else setNotifications(notifData || []);

        // Maintenance Requests
        const { data: reqData, error: reqError } = await supabase
          .from('maintenance_request')
          .select('*')
          .eq('tenant_id', user.id)
          .order('created_at', { ascending: false });
        if (reqError) console.error(reqError);
        else {
          setMaintenanceRequests(reqData || []);
          const total = reqData?.length || 0;
          const completed = reqData?.filter((r) => r.status === 'Completed').length || 0;
          const pending = reqData?.filter((r) => r.status === 'Pending').length || 0;
          setStats({ total, completed, pending });
        }

        // Documents
        const { data: docData, error: docError } = await supabase
          .from('documents')
          .select('*')
          .eq('tenant_id', user.id)
          .order('created_at', { ascending: false });
        if (!docError) setDocuments(docData || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load tenant dashboard data');
      }
    };

    fetchData();
  }, [isLoaded, user]);

  const filteredRequests =
    filter === 'All'
      ? maintenanceRequests
      : maintenanceRequests.filter((r) => r.status === filter);

  if (!tenant) return <p className="p-8 text-center text-gray-800">Loading...</p>;

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1836b2] text-white flex flex-col">
        <div className="p-6 text-2xl font-bold">Tenant Dashboard</div>
        <nav className="flex-1">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveNav(item.key)}
              className={`w-full text-left px-6 py-3 hover:bg-[#0f248e] ${
                activeNav === item.key ? 'bg-[#0f248e]' : ''
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Top bar */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Welcome, {user?.firstName || user?.fullName || 'Tenant'}!
            </h1>
          </div>

          {/* Notifications & Profile */}
          <div className="flex items-center gap-4 relative">
            <button
              onClick={() => setOpenNotifications(!openNotifications)}
              className="relative px-3 py-2 rounded-md bg-white text-gray-800 hover:bg-gray-100 flex items-center gap-2"
            >
              Notifications
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#302cfc] text-xs w-5 h-5 flex items-center justify-center rounded-full text-white">
                  {unreadCount}
                </span>
              )}
            </button>
            {openNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="absolute top-12 right-0 bg-white rounded p-4 shadow w-80 z-40 max-h-96 overflow-auto space-y-2"
              >
                {notifications.length > 0
                  ? notifications.map((n) => (
                      <p
                        key={n.id}
                        className={`*:text-sm ${n.read ? 'text-gray-500' : 'font-semibold text-gray-800'}`}
                      >
                        🔔 {n.message || 'Notification'}
                      </p>
                    ))
                  : <p className="text-sm text-gray-500">No notifications</p>}
              </motion.div>
            )}
            <Profile />
          </div>
        </div>

        {/* Conditional rendering for nav */}
        <motion.div
          key={activeNav}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          {activeNav === 'Profile' && <Profile />}
          {activeNav === 'SubmitRequest' && (
            <Link
              href="/maintenance"
              className="inline-block bg-[#302cfc] hover:bg-[#241fd9] px-6 py-3 rounded-md font-semibold text-white"
            >
              Submit Maintenance Request
            </Link>
          )}

          {activeNav === 'MaintenanceRequests' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-[#1836b2]">Maintenance Requests</h2>
              <div className="flex gap-3 mb-2">
                {(['All', 'Pending', 'Completed'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-md font-semibold ${
                      filter === f
                        ? 'bg-[#302cfc] text-white'
                        : 'bg-white text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              {filteredRequests.length > 0 ? (
                filteredRequests.map((req) => (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -3, boxShadow: '0px 10px 20px rgba(0,0,0,0.12)' }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-md p-4 border border-gray-200 shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-2"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold text-[#302cfc]">{req.description}</p>
                      <p className="text-sm text-gray-600"><strong>Priority:</strong> {req.priority}</p>
                      <p className="text-sm text-gray-600"><strong>Status:</strong> {req.status}</p>
                      <p className="text-sm text-gray-600">
                        <strong>Submitted:</strong>{' '}
                        {req.created_at ? new Date(req.created_at).toLocaleDateString() : '-'}
                      </p>
                    </div>
                    <div className="flex gap-2 mt-2 md:mt-0">
                      {req.status === 'Pending' && (
                        <button
                          onClick={async () => {
                            try {
                              const { error } = await supabase
                                .from('maintenance_request')
                                .update({ status: 'Completed' })
                                .eq('id', req.id);
                              if (error) throw error;
                              setMaintenanceRequests((prev) =>
                                prev.map((r) => (r.id === req.id ? { ...r, status: 'Completed' } : r))
                              );
                              toast.success('Marked as completed');
                            } catch (err) {
                              console.error(err);
                              toast.error('Failed to update request');
                            }
                          }}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          Mark Completed
                        </button>
                      )}
                      <button
                        onClick={async () => {
                          try {
                            const { error } = await supabase
                              .from('maintenance_request')
                              .delete()
                              .eq('id', req.id);
                            if (error) throw error;
                            setMaintenanceRequests((prev) => prev.filter((r) => r.id !== req.id));
                            toast.success('Deleted request');
                          } catch (err) {
                            console.error(err);
                            toast.error('Failed to delete request');
                          }
                        }}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-500">No maintenance requests.</p>
              )}
            </div>
          )}

          {activeNav === 'Documents' && (
            <section className="space-y-4">
              <h2 className="font-tech text-2xl text-[#1836b2]">Your Documents</h2>
              <div className="bg-white p-4 rounded-md shadow border border-gray-200">
                {documents.length > 0 ? (
                  <table className="min-w-full text-sm text-left">
                    <thead>
                      <tr className="border-b text-gray-600">
                        <th className="py-2">File Name</th>
                        <th className="py-2">Uploaded On</th>
                        <th className="py-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.map((doc) => (
                        <tr key={doc.id} className="border-b hover:bg-gray-50">
                          <td className="py-2">{doc.file_name}</td>
                          <td className="py-2">{new Date(doc.created_at).toLocaleDateString()}</td>
                          <td className="py-2">
                            <a
                              href={doc.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#302cfc] hover:underline font-semibold"
                            >
                              View
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-500">No documents yet.</p>
                )}
              </div>
            </section>
          )}

          {activeNav === 'Chat' && (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-[#1836b2]">Chat with Realtor</h2>
              {user?.id && <TenantChat tenantId={user.id} userId={user.id} />}
            </section>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default TenantDashboard;