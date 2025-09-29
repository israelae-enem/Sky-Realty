'use client';

import { useEffect, useState } from 'react';
import { Bell, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabaseClient';

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

interface Stats {
  total: number;
  completed: number;
  pending: number;
}

const TenantDashboard = () => {
  const { user, isLoaded } = useUser();
  const [open, setOpen] = useState<'notifications' | 'chat' | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, completed: 0, pending: 0 });
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Completed'>('All');

  const unreadCount = notifications.filter((n) => !n.read).length;

  // ---------------- CHAT ----------------
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (!isLoaded || !user) return;

    const fetchTenantData = async () => {
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
    };

    fetchTenantData();
  }, [isLoaded, user]);

  // Fetch + subscribe to chat messages
  useEffect(() => {
    if (!tenant || !user?.id) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('message')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data);
      }
    };

    fetchMessages();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`message-${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'message' },
        (payload) => {
          if (
            payload.new.sender_id === user.id ||
            payload.new.receiver_id === user.id
          ) {
            setMessages((prev) => [...prev, payload.new]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenant, user?.id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !tenant || !tenant.realtor_id) return;

    const { error } = await supabase.from('message').insert([
      {
        sender_id: user?.id,
        receiver_id: tenant.realtor_id,
        message: newMessage.trim(),
      },
    ]);

    if (error) {
      console.error('Error sending message:', error);
    } else {
      setNewMessage('');
    }
  };

  const filteredRequests =
    filter === 'All'
      ? maintenanceRequests
      : maintenanceRequests.filter((r) => r.status === filter);

  if (!tenant) return <p className="p-8 text-center text-white">Loading...</p>;

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-10">
      {/* Topbar */}
      <div className="flex flex-col md:flex-row justify-end gap-6 relative font-bold">
        {/* Notifications */}
        <div className="relative">
          <button
            aria-haspopup="true"
            aria-expanded={open === 'notifications'}
            onClick={() => setOpen(open === 'notifications' ? null : 'notifications')}
            className="flex items-center gap-2 px-4 py-2 rounded-md border border-gray-700 bg-gray-900 hover:bg-gray-800 text-white"
          >
            <Bell size={18} />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#302cfc] text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
          {open === 'notifications' && (
            <div className="absolute top-12 right-0 bg-gray-900 rounded p-4 shadow w-80 z-40 max-h-96 overflow-auto space-y-2">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <p
                    key={n.id}
                    className={`text-sm ${n.read ? 'text-gray-500' : 'font-semibold text-white'}`}
                  >
                    🔔 {n.message || 'Notification'}
                  </p>
                ))
              ) : (
                <p className="text-sm text-gray-500">No notifications</p>
              )}
            </div>
          )}
        </div>

        {/* Chat */}
        <div className="relative">
          <button
            aria-haspopup="true"
            aria-expanded={open === 'chat'}
            onClick={() => setOpen(open === 'chat' ? null : 'chat')}
            className="flex items-center gap-2 px-4 py-2 rounded-md border border-gray-700 bg-gray-900 hover:bg-gray-800 text-white"
          >
            <MessageCircle size={18} />
            <span>Chat</span>
          </button>
          {open === 'chat' && (
            <div className="absolute top-12 right-0 bg-gray-900 rounded p-4 shadow w-96 z-40 flex flex-col space-y-3">
              <div className="flex-1 overflow-y-auto max-h-64 space-y-2">
                {messages.length > 0 ? (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={`p-2 rounded-md text-sm ${
                        m.sender_id === user?.id
                          ? 'bg-[#302cfc] text-white self-end'
                          : 'bg-gray-700 text-gray-200'
                      }`}
                    >
                      {m.message}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">No messages yet</p>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-4 py-2 bg-[#302cfc] hover:bg-[#241fd9] rounded-md text-white font-semibold"
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Welcome */}
      <h1 className="text-3xl font-bold">Welcome, {user?.firstName || user?.fullName || 'Tenant'}!</h1>

      {/* Stats Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div className="bg-gray-900 p-6 rounded-md shadow flex flex-col items-center">
          <span className="text-sm text-gray-400">Total Requests</span>
          <span className="text-3xl font-bold text-[#302cfc]">{stats.total}</span>
        </div>
        <div className="bg-gray-900 p-6 rounded-md shadow flex flex-col items-center">
          <span className="text-sm text-gray-400">Completed Requests</span>
          <span className="text-3xl font-bold text-[#302cfc]">{stats.completed}</span>
        </div>
        <div className="bg-gray-900 p-6 rounded-md shadow flex flex-col items-center">
          <span className="text-sm text-gray-400">Pending Requests</span>
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
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Maintenance Requests Accordion */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Your Maintenance Requests</h2>
        <div className="space-y-3">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((req) => (
              <details
                key={req.id}
                className="bg-gray-900 rounded-md p-4 border border-gray-700"
              >
                <summary className="cursor-pointer font-semibold text-[#302cfc]">
                  {req.description}
                </summary>
                <div className="mt-3 space-y-2 text-sm text-gray-300">
                  <p><strong>Priority:</strong> {req.priority}</p>
                  <p><strong>Status:</strong> {req.status}</p>
                  <p>
                    <strong>Submitted:</strong>{' '}
                    {req.created_at ? new Date(req.created_at).toLocaleDateString() : '-'}
                  </p>
                </div>
              </details>
            ))
          ) : (
            <p className="text-gray-400">No maintenance requests for this filter.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default TenantDashboard;