'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Bell, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import Profile from '@/components/Profile';

interface Tenant {
  id: string;
  full_name: string | null;
  realtor_id?: string;
  company_id?: string;
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
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, completed: 0, pending: 0 });
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Completed'>('All');
  const [activeNav, setActiveNav] = useState<string>('Profile');
  const [open, setOpen] = useState<'notifications' | 'chat' | null>(null);

  // ---------------- CHAT ----------------
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // ---------------- FETCH DATA ----------------
  useEffect(() => {
    if (!isLoaded || !user) return;

    const fetchData = async () => {
      try {
        // Tenant
        const { data: tenantData, error: tenantError } = await supabase
          .from('tenants')
          .select('*')
          .eq('id', user.id)
          .single();
        if (tenantError) console.error(tenantError);
        else setTenant(tenantData);

        const tenantCompanyId = tenantData?.company_id;

        // Notifications
        const { data: notifData, error: notifError } = await supabase
          .from('notification')
          .select('*')
          .or(
            `tenant_id.eq.${user.id},company_id.eq.${tenantCompanyId || ''}`
          )
          .order('created_at', { ascending: false });
        if (!notifError) setNotifications(notifData || []);

        // Maintenance Requests
        const { data: reqData, error: reqError } = await supabase
          .from('maintenance_request')
          .select('*')
          .or(`tenant_id.eq.${user.id},company_id.eq.${tenantCompanyId || ''}`)
          .order('created_at', { ascending: false });
        if (!reqError && reqData) {
          setMaintenanceRequests(reqData);
          const total = reqData.length;
          const completed = reqData.filter((r) => r.status === 'Completed').length;
          const pending = reqData.filter((r) => r.status === 'Pending').length;
          setStats({ total, completed, pending });
        }

        // Documents
        const { data: docData, error: docError } = await supabase
          .from('documents')
          .select('*')
          .or(`tenant_id.eq.${user.id},company_id.eq.${tenantCompanyId || ''}`)
          .order('created_at', { ascending: false });
        if (!docError) setDocuments(docData || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load dashboard data');
      }
    };

    fetchData();
  }, [isLoaded, user]);

  // ---------------- CHAT LOGIC ----------------
  const conversation_id =
    tenant && tenant.realtor_id
      ? `${tenant.id}_${tenant.realtor_id}`
      : null;

  // Typing indicator
  const handleTyping = () => {
    setIsTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 1000);
  };

  // Fetch messages + subscribe
  useEffect(() => {
    if (!conversation_id || !user?.id) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('message')
        .select('*')
        .eq('conversation_id', conversation_id)
        .order('created_at', { ascending: true });

      if (!error && data) setMessages(data);
      scrollToBottom();
    };

    fetchMessages();

    const channel = supabase
      .channel(`conversation-${conversation_id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'message' },
        async (payload) => {
          if (payload.new.conversation_id === conversation_id) {
            setMessages((prev) => [...prev, payload.new]);
            scrollToBottom();

            if (user?.id !== payload.new.sender_id) {
              const isTenant = user?.id === payload.new.tenant_id;
              const isRealtor = user?.id === payload.new.realtor_id;

              if (isTenant || isRealtor) {
                const { error } = await supabase.from('notification').insert([
                  {
                    id: crypto.randomUUID(),
                    type: 'message',
                    message: isTenant
                      ? `New message from your realtor`
                      : `New message from your tenant`,
                    tenant_id: payload.new.tenant_id,
                    realtor_id: payload.new.realtor_id,
                    company_id: tenant?.company_id,
                    read: false,
                  },
                ]);
                if (error) console.error('Failed to insert notification:', error);
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation_id, user?.id, tenant?.company_id]);

  // Send message
  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !tenant?.realtor_id || !conversation_id) return;

    // Ensure conversation exists
    const { data: convData } = await supabase
      .from('conversation')
      .select('id')
      .eq('id', conversation_id)
      .single();

    if (!convData) {
      const { error: insertConvError } = await supabase
        .from('conversation')
        .insert([
          {
            id: conversation_id,
            tenant_id: tenant.id,
            realtor_id: tenant.realtor_id,
            company_id: tenant.company_id,
          },
        ]);
      if (insertConvError) {
        console.error('Failed to create conversation:', insertConvError);
        toast.error('Failed to start conversation');
        return;
      }
    }

    const { data, error } = await supabase
      .from('message')
      .insert([
        {
          id: crypto.randomUUID(),
          tenant_id: tenant.id,
          realtor_id: tenant.realtor_id,
          sender_id: user?.id,
          conversation_id: conversation_id,
          content: newMessage.trim(),
          company_id: tenant.company_id,
        },
      ])
      .select();

    if (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } else {
      setNewMessage('');
      setMessages((prev) => [...prev, ...data]);
      scrollToBottom();
    }
  }, [newMessage, tenant, user?.id, conversation_id]);

  const filteredRequests =
    filter === 'All'
      ? maintenanceRequests
      : maintenanceRequests.filter((r) => r.status === filter);

  if (!tenant) return <p className="p-8 text-center text-white">Loading...</p>;

  return (
    <div className="min-h-screen flex">
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

      {/* Main */}
      <main className="flex-1 bg-gray-100 p-6 overflow-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome, {user?.firstName || user?.fullName || 'Tenant'}!
        </h1>

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
          <section className="space-y-4">
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
                <div
                  key={req.id}
                  className="bg-white rounded-md p-4 border border-gray-200 shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-2"
                >
                  <div className="space-y-1">
                    <p className="font-semibold text-[#302cfc]">{req.description}</p>
                    <p className="text-sm text-gray-600"><strong>Priority:</strong> {req.priority}</p>
                    <p className="text-sm text-gray-600"><strong>Status:</strong> {req.status}</p>
                    <p className="text-sm text-gray-600">
                      <strong>Submitted:</strong> {new Date(req.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No maintenance requests.</p>
            )}
          </section>
        )}

        {activeNav === 'Documents' && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#1836b2]">Documents</h2>
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

        {activeNav === 'Chat' && tenant?.realtor_id && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#1836b2]">Chat</h2>

            {/* Chat Box */}
            <div className="bg-gray-300 p-4 rounded-md shadow flex flex-col space-y-3 max-h-[500px]">
              <div className="flex-1 overflow-y-auto space-y-2">
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
                      {m.content}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">No messages yet</p>
                )}
                {isTyping && (
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-400"></span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 rounded-md bg-gray-300 text-gray-800 border border-gray-700 focus:outline-none"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-4 py-2 bg-[#302cfc] hover:bg-[#241fd9] rounded-md text-white font-semibold"
                >
                  Send
                </button>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default TenantDashboard;