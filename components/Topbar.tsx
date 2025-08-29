'use client'

import { useEffect, useState, useRef } from 'react'
import { Bell, MailPlus, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabaseClient'
import TenantRequest from './TeanatRequest'

const Topbar = () => {
  const [open, setOpen] = useState<'notifications' | 'invite' | 'chat' | null>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [properties, setProperties] = useState<any[]>([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [selectedProperty, setSelectedProperty] = useState('')
  const [activeChatMessages, setActiveChatMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [currentUserName, setCurrentUserName] = useState('')
  const chatInputRef = useRef<HTMLInputElement>(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  // Get current user and fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Fetch realtor profile
      const { data: profile } = await supabase
        .from('realtors')
        .select('*')
        .eq('id', user.id)
        .single()
      setCurrentUserName(profile?.full_name || '')

      // Fetch properties for invite dropdown
      const { data: props } = await supabase
        .from('properties')
        .select('*')
        .eq('realtor_id', user.id)
      setProperties(props || [])
    }

    fetchData()
  }, [])

  // Real-time notifications
  useEffect(() => {
    const setupNotifications = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const channel = supabase
        .channel('realtor_notification')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notification',
            filter: `realtor_id=eq.${user.id}`,
          },
          (payload: any) => {
            setNotifications((prev) => [payload.new, ...prev])
          }
        )
        .subscribe()

      // Initial fetch
      const { data } = await supabase
        .from('notification')
        .select('*')
        .eq('realtor_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)
      setNotifications(data || [])

      return () => supabase.removeChannel(channel)
    }

    setupNotifications()
  }, [])

  // Real-time chat messages
  useEffect(() => {
    const setupChat = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const channel = supabase
        .channel('realtor_chats')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'conversations',
            filter: `participants=cs.{${user.id}}`,
          },
          (payload: any) => {
            setActiveChatMessages((prev) => [payload.new, ...prev])
          }
        )
        .subscribe()

      // Initial fetch
      const { data } = await supabase
        .from('conversations')
        .select('*')
        .contains('participants', [user.id])
        .order('last_updated', { ascending: false })
        .limit(20)
      setActiveChatMessages(data || [])

      return () => supabase.removeChannel(channel)
    }

    setupChat()
  }, [])

  // Mark notification as read
  const markAsRead = async (id: string) => {
    const { error } = await supabase.from('notification').update({ read: true }).eq('id', id)
    if (error) toast.error(error.message)
  }

  // Handle tenant invite send
  const handleInvite = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    if (!inviteEmail || !selectedProperty) {
      toast.error('Please provide tenant email and select a property')
      return
    }

    const { error } = await supabase.from('invites').insert({
      email: inviteEmail,
      property_id: selectedProperty,
      status: 'pending',
      sent_by: user.id,
      created_at: new Date().toISOString(),
    })

    if (error) toast.error(error.message)
    else {
      toast.success('Invite recorded! (Send email separately)')
      setInviteEmail('')
      setSelectedProperty('')
      setOpen(null)
    }
  }

  // Handle chat message send
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    if (!newMessage.trim() || activeChatMessages.length === 0) return toast.error('No active conversations')

    const conversation = activeChatMessages[0]

    const { data, error } = await supabase.from('messages').insert({
      conversation_id: conversation.id,
      sender_id: user.id,
      sender_name: currentUserName,
      text: newMessage.trim(),
      created_at: new Date().toISOString(),
    })

    if (error) toast.error(error.message)
    else setNewMessage('')
  }

  return (
    <div className="bg-black p-4 flex justify-end font-bold items-center gap-6 mt-2 mb-10 relative text-white">
      {/* 🔔 Notifications */}
      <div className="relative">
        <button
          onClick={() => setOpen(open === 'notifications' ? null : 'notifications')}
          className="flex items-center gap-2 px-3 py-2 rounded-md border btn-primary border-gray-300 text-gray-200 hover:text-black"
        >
          <Bell size={18} />
          Notifications
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-red-600 text-white w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold">
              {unreadCount}
            </span>
          )}
        </button>
        {open === 'notifications' && (
          <div className="absolute top-12 right-0 bg-gray-800 p-4 rounded shadow w-72 max-h-96 overflow-auto z-20">
            {notifications.length > 0
              ? notifications.map((n) => (
                  <div key={n.id} className="flex justify-between items-center mb-2">
                    <p className={n.read ? 'text-gray-400 text-sm' : 'font-semibold text-sm'}>
                      🔔 {n.message}
                    </p>
                    {!n.read && (
                      <button
                        onClick={() => markAsRead(n.id)}
                        className="text-blue-400 text-xs ml-2"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                ))
              : 'No new notifications'}
          </div>
        )}
      </div>

      <TenantRequest />

      {/* ✉ Invite Tenant */}
      <div className="relative">
        <button
          onClick={() => setOpen(open === 'invite' ? null : 'invite')}
          className="flex items-center gap-2 px-3 py-2 rounded-md border btn-primary border-gray-300 text-gray-200 hover:text-black"
        >
          <MailPlus size={18} /> Invite Tenant
        </button>
        {open === 'invite' && (
          <div className="absolute top-12 right-0 p-4 bg-gray-800 text-white rounded shadow w-80 max-h-96 overflow-auto z-30">
            <p className="mb-2 font-medium">Invite Tenant</p>
            <select
              className="w-full px-2 py-1 text-black rounded mb-2"
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
            >
              <option value="">Select Property</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.address || `Property ${p.id}`}
                </option>
              ))}
            </select>
            <input
              type="email"
              placeholder="Tenant email"
              className="w-full px-2 py-1 rounded text-black mb-3"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
            <button onClick={handleInvite} className="btn btn-primary w-full">
              Send Invite
            </button>
          </div>
        )}
      </div>

      {/* 💬 Chat */}
      <div className="relative">
        <button
          onClick={() => setOpen(open === 'chat' ? null : 'chat')}
                    className="flex items-center gap-2 px-3 py-2 rounded-md border btn-primary border-gray-300 text-gray-200 hover:text-black"
        >
          <MessageCircle size={18} /> Chat
        </button>
        {open === 'chat' && (
          <div className="absolute top-12 right-0 p-4 bg-gray-800 text-white rounded shadow w-96 max-h-[400px] overflow-auto z-40 flex flex-col">
            {activeChatMessages.length > 0 ? (
              <div className="flex-grow overflow-auto mb-3 space-y-2">
                {activeChatMessages.map((chat) => (
                  <div key={chat.id} className="border-b border-gray-700 pb-2">
                    <p className="font-semibold">{chat.title || 'Chat'}</p>
                    {chat.messages?.slice(-3).map((msg: any, i: number) => (
                      <p
                        key={i}
                        className={`text-sm ${
                          msg.sender_id === supabase.auth.getUser().then(u => u.data.user?.id)
                            ? 'text-blue-400'
                            : 'text-gray-300'
                        }`}
                      >
                        <strong>{msg.sender_name || 'User'}:</strong> {msg.text}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm">No active conversations</p>
            )}
            <form onSubmit={handleSendMessage} className="flex gap-2 mt-auto">
              <input
                ref={chatInputRef}
                type="text"
                placeholder="Type your message..."
                className="flex-grow px-2 py-1 rounded text-black"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button className="btn btn-primary" type="submit" disabled={!newMessage.trim()}>
                Send
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default Topbar