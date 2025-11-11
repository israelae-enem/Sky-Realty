'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import TenantChat from '@/components/TenantChat';
import Profile from '@/components/Profile'; // <-- added Profile import

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

const TenantDashboard = () => {
  const { user, isLoaded } = useUser();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, completed: 0, pending: 0 });
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Completed'>('All');
  const [openNotifications, setOpenNotifications] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!isLoaded || !user) return;

    const fetchTenantData = async () => {
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

        // Maintenance requests
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
      } catch (err) {
        console.error('Error fetching tenant data:', err);
        toast.error('Failed to load tenant data');
      }
    };

    fetchTenantData();
  }, [isLoaded, user]);

  useEffect(() => {
  if (!user) return;
  const fetchDocs = async () => {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("tenant_id", user.id)
      .order("created_at", { ascending: false });
    if (!error) setDocuments(data || []);
  };
  fetchDocs();
}, [user]);

  const filteredRequests =
    filter === 'All'
      ? maintenanceRequests
      : maintenanceRequests.filter((r) => r.status === filter);

  if (!tenant) return <p className="p-8 text-center text-gray-800">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-6 space-y-10">
      {/* Topbar */}
      <div className="flex flex-col md:flex-row justify-end items-center gap-6 relative font-bold">
        {/* Notifications */}
        <div className="relative">
          <button
            aria-haspopup="true"
            aria-expanded={openNotifications}
            onClick={() => setOpenNotifications(!openNotifications)}
            className="flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-100 text-gray-800"
          >
            <Bell size={18} />
            <span className="hidden sm:inline">Notifications</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#302cfc] text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full text-white">
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
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <p
                    key={n.id}
                    className={`text-sm ${n.read ? 'text-gray-500' : 'font-semibold text-gray-800'}`}
                  >
                    🔔 {n.message || 'Notification'}
                  </p>
                ))
              ) : (
                <p className="text-sm text-gray-500">No notifications</p>
              )}
            </motion.div>
          )}
        </div>

        {/* Profile placed top-right */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center"
        >
          {/* This uses your existing Profile component */}
          <Profile />
        </motion.div>
      </div>

      {/* Welcome */}
      <h1 className="text-xl font-tech font-bold">Welcome, {user?.firstName || user?.fullName || 'Tenant'}!</h1>

      {/* Stats Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-md shadow flex flex-col items-center">
          <span className="text-sm text-gray-500">Total Requests</span>
          <span className="text-3xl font-bold text-[#302cfc]">{stats.total}</span>
        </div>
        <div className="bg-white p-6 rounded-md shadow flex flex-col items-center">
          <span className="text-sm text-gray-500">Completed Requests</span>
          <span className="text-3xl font-bold text-[#302cfc]">{stats.completed}</span>
        </div>
        <div className="bg-white p-6 rounded-md shadow flex flex-col items-center">
          <span className="text-sm text-gray-500">Pending Requests</span>
          <span className="text-3xl font-bold text-[#302cfc]">{stats.pending}</span>
        </div>
      </div>

      {/* Maintenance Request Button */}
      <Link
        href="/maintenance"
        className="inline-block bg-[#302cfc] hover:bg-[#241fd9] px-6 py-3 rounded-md font-semibold text-white"
      >
        Submit Maintenance Request
      </Link>

      {/* Filter */}
      <div className="flex gap-3">
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

      {/* Maintenance Requests */}
      <section className="space-y-4">
        <h2 className="text-xl font-tech font-semibold">Your Maintenance Requests</h2>
        <div className="space-y-3">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((req) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -3, boxShadow: '0px 10px 20px rgba(0,0,0,0.12)' }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-md p-4 border border-gray-200 shadow"
              >
                <p className="font-semibold text-[#302cfc]">{req.description}</p>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <p><strong>Priority:</strong> {req.priority}</p>
                  <p><strong>Status:</strong> {req.status}</p>
                  <p>
                    <strong>Submitted:</strong>{' '}
                    {req.created_at ? new Date(req.created_at).toLocaleDateString() : '-'}
                  </p>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-gray-500">No maintenance requests for this filter.</p>
          )}
        </div>
      </section>

      {/* Tenant Documents */}
<section className="space-y-4">
  <h2 className="font-tech text-2xl text-[#302cfc]">Your Documents</h2>
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

      {/* Chat with Realtor */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Chat with Realtor</h2>
        {user?.id && <TenantChat tenantId={user.id} userId={user.id} />}
      </section>
    </div>
  );
};

export default TenantDashboard;