'use client';

import { useEffect, useState, useRef } from 'react';
import { Bell, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';


interface Tenant {
  id: string;
  full_name: string | null;
  status: string;
}

interface Notification {
  id: string;
  message: string | null;
  read: boolean;
  created_at: string;
}

interface Conversation {
  id: string;
  participants: string[];
  last_updated: string;
}

interface MaintenanceRequest {
  id: string;
  description: string;
  priority: string;
  status: string;
  created_at: string;
}



const TenantDashboard = () => {
  const [open, setOpen] = useState<'notifications' | 'chat' | null>(null);
  const [tenant, setTenant] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<any[]>([]);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const fetchTenantData = async () => {
      const {
      data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Tenant profile
      const { data: tenantData } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', user.id)
        .single();

      setTenant(tenantData);

      // Notifications
      const { data: notifData } = await supabase
        .from('notification')
        .select('*')
        .eq('tenant_id', user.id)
        .order('created_at', { ascending: false });
      setNotifications(notifData || []);

      // Conversations
      const { data: convData } = await supabase
        .from('conversations')
        .select('*')
        .contains('participants', [user.id])
        .order('last_updated', { ascending: false });
      setConversations(convData || []);

      // Maintenance requests
      const { data: reqData } = await supabase
        .from('maintenance_requests')
        .select('*')
        .eq('tenant_id', user.id)
        .order('created_at', { ascending: false });
      setMaintenanceRequests(reqData || []);
    };

    fetchTenantData();
  }, []);

  if (!tenant) return <p className="p-8 text-center">Loading...</p>;

  const tenantStatus = tenant.status;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {tenantStatus === 'pending' ? (
        <div className="bg-yellow-600 text-black font-bold p-4 rounded-md text-center">
          Pending approval by your realtor. Please wait until your account is approved.
        </div>
      ) : (
        <>
          {/* Topbar */}
          <div className="flex justify-end gap-6 mb-6 relative font-bold">
            {/* Notifications */}
            <div className="relative">
              <button
                aria-haspopup="true"
                aria-expanded={open === 'notifications'}
                onClick={() => setOpen(open === 'notifications' ? null : 'notifications')}
                className="flex items-center gap-2 px-3 py-2 rounded-md border btn-primary border-gray-300 hover:text-black text-gray-200"
              >
                <Bell size={18} />
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-600 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
              {open === 'notifications' && (
                <div className="absolute top-12 right-0 bg-gray-800 rounded p-4 shadow w-72 z-40 max-h-80 overflow-auto">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <p
                        key={n.id}
                        className={`mb-2 text-sm ${n.read ? 'text-gray-400' : 'font-semibold'}`}
                      >
                        🔔 {n.message || 'Notification'}
                      </p>
                    ))
                  ) : (
                    <p className="text-sm">No notifications</p>
                  )}
                </div>
              )}
            </div>

            {/* Chat button */}
            <div className="relative">
              <button
                aria-haspopup="true"
                aria-expanded={open === 'chat'}
                onClick={() => setOpen(open === 'chat' ? null : 'chat')}
                className="flex items-center gap-2 px-3 py-2 rounded-md border btn-primary border-gray-300 hover:text-black text-gray-200"
              >
                <MessageCircle size={18} />
                <span>Chat</span>
              </button>
            </div>
          </div>

          {/* Welcome */}
          <h1 className="text-3xl font-bold mb-8">
            Welcome, {tenant.full_name || 'Tenant'}!
          </h1>

          {/* Maintenance Request Button */}
          <Link
            href="/maintenance-requests"
            className="btn-primary px-6 py-3 mb-8 inline-block"
          >
            Submit Maintenance Request (Full Form)
          </Link>

          {/* Maintenance Requests Table */}
          <section className="max-w-4xl">
            <h2 className="text-xl font-semibold mb-4">Your Maintenance Requests</h2>

            <table className="w-full table-auto border-collapse border border-gray-700">
              <thead>
                <tr className="bg-gray-800">
                  <th className="border border-gray-600 px-4 py-2 text-left">Description</th>
                  <th className="border border-gray-600 px-4 py-2 text-left">Priority</th>
                  <th className="border border-gray-600 px-4 py-2 text-left">Status</th>
                  <th className="border border-gray-600 px-4 py-2 text-left">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {maintenanceRequests.length > 0 ? (
                  maintenanceRequests.map((req) => (
                    <tr key={req.id} className="even:bg-gray-800 odd:bg-gray-700">
                      <td className="border border-gray-600 px-4 py-2">{req.description}</td>
                      <td className="border border-gray-600 px-4 py-2">{req.priority}</td>
                      <td className="border border-gray-600 px-4 py-2">{req.status}</td>
                      <td className="border border-gray-600 px-4 py-2">
                        {req.created_at ? new Date(req.created_at).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center p-4 text-gray-400">
                      No maintenance requests submitted yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        </>
      )}
    </div>
  );
};

export default TenantDashboard;