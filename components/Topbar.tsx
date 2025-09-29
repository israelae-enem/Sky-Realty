'use client'

import { useEffect, useState, useRef } from 'react'
import { useUser } from '@clerk/nextjs' // Clerk hook
import { Bell, MailPlus, MessageCircle, Menu, X } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabaseClient'
import Profile from './Profile'

type Notification = {
  id: string
  message: string
  read: boolean
  created_at: string
  realtor_id: string
}

type Property = {
  id: string
  address?: string
  realtor_id: string
}

type ChatMessage = {
  id: string
  conversation_id: string
  sender_id: string
  sender_name: string
  text: string
  created_at: string
}

type Conversation = {
  id: string
  title?: string
  participants: string[]
  messages?: ChatMessage[]
}

const Topbar = () => {
  const { user, isLoaded } = useUser()
  const [openSection, setOpenSection] = useState<'notification' | 'invite' | 'chat' | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [selectedProperty, setSelectedProperty] = useState('')
  const [activeChatMessages, setActiveChatMessages] = useState<Conversation[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [currentUserName, setCurrentUserName] = useState('')
  const chatInputRef = useRef<HTMLInputElement>(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  // Fetch profile, properties, notifications
  useEffect(() => {
    if (!isLoaded || !user?.id) return

    const fetchData = async () => {
      // Profile
      const { data: profile } = await supabase
        .from('realtors')
        .select('*')
        .eq('id', user.id)
        .single()
      setCurrentUserName(profile?.full_name || '')

      // Properties
      const { data: props } = await supabase
        .from('properties')
        .select('*')
        .eq('realtor_id', user.id)
      setProperties(props || [])

      // Notifications
      const { data: notes } = await supabase
        .from('notification')
        .select('*')
        .eq('realtor_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)
      setNotifications(notes || [])
    }

    fetchData()
  }, [isLoaded, user?.id])

  // Realtime notifications
  useEffect(() => {
    if (!isLoaded || !user?.id) return

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
        (payload: any) => setNotifications((prev) => [payload.new as Notification, ...prev])
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [isLoaded, user?.id])

  // Realtime chat
  useEffect(() => {
    if (!isLoaded || !user?.id) return

    const channel = supabase
      .channel('realtor_chats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversation',
          filter: `participants=cs.{${user.id}}`,
        },
        (payload: any) => setActiveChatMessages((prev) => [payload.new as Conversation, ...prev])
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [isLoaded, user?.id])

  const markAsRead = async (id: string) => {
    const { error } = await supabase.from('notification').update({ read: true }).eq('id', id)
    if (error) toast.error(error.message)
  }

  

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return
    if (!newMessage.trim() || activeChatMessages.length === 0) return toast.error('No active conversations')

    const conversation = activeChatMessages[0]

    const { error } = await supabase.from('message').insert({
      id: crypto.randomUUID(),
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
    <div className="bg-black p-4 flex flex-wrap justify-end items-center gap-4 md:gap-6 relative text-white">
      {/* Mobile */}
      <div className="md:hidden relative w-full">
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 border bg-[#302cfc] text-white border-gray-300 rounded">
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {mobileMenuOpen && (
          <div className="absolute top-12 right-0 bg-black p-4 rounded shadow z-50 flex flex-col gap-3 max-h-[80vh] overflow-auto">
            {/* Notifications */}
            <div>
              <button
                onClick={() => setOpenSection(openSection === 'notification' ? null : 'notification')}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-md border border-gray-300 text-white text-left bg-[#302cfc]"
              >
                <Bell size={18} /> Notifications {unreadCount > 0 && `(${unreadCount})`}
              </button>
              {openSection === 'notification' && (
                <div className="mt-2 max-h-40 overflow-auto space-y-2 p-2 border-t border-gray-300">
                  {notifications.length > 0
                    ? notifications.map((n) => (
                        <div key={n.id} className="flex justify-between items-center">
                          <p className={n.read ? 'text-white text-sm' : 'font-semibold text-sm'}>
                            🔔 {n.message}
                          </p>
                          {!n.read && (
                            <button onClick={() => markAsRead(n.id)} className="text-[#302cfc] text-xs ml-2">
                              Mark as read
                            </button>
                          )}
                        </div>
                      ))
                    : <p className="text-white text-sm">No notifications</p>}
                </div>
              )}
            </div>

            
            {/* Chat */}
            <div>
              <button
                onClick={() => setOpenSection(openSection === 'chat' ? null : 'chat')}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-md border border-gray-300 text-gray-200 text-left bg-[#302cfc]"
              >
                <MessageCircle size={18} /> Chat
              </button>
              {openSection === 'chat' && (
                <div className="mt-2 flex flex-col gap-2 p-2 border-t border-gray-700 max-h-60 overflow-auto">
                  {activeChatMessages.length > 0 ? (
                    activeChatMessages.map((chat) => (
                      <div key={chat.id} className="border-b border-gray-700 pb-1">
                        <p className="font-semibold text-sm">{chat.title || 'Chat'}</p>
                        {chat.messages?.slice(-3).map((msg, i) => (
                          <p
                            key={i}
                            className={`text-sm ${msg.sender_id === user?.id ? 'text-blue-400' : 'text-white'}`}
                          >
                            <strong>{msg.sender_name || 'User'}:</strong> {msg.text}
                          </p>
                        ))}
                      </div>
                    ))
                  ) : (
                    <p className="text-white text-sm">No active conversations</p>
                  )}
                  <form onSubmit={handleSendMessage} className="flex gap-2 mt-2">
                    <input
                      ref={chatInputRef}
                      type="text"
                      placeholder="Type your message..."
                      className="flex-grow px-2 py-1 rounded text-white"
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

            {/* Profile */}
            <div className="mt-2 border-t border-gray-700 pt-2">
              <Profile />
            </div>
          </div>
        )}
      </div>

      {/* Desktop */}
      <div className="hidden md:flex flex-wrap gap-4 items-center">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setOpenSection(openSection === 'notification' ? null : 'notification')}
            className="flex items-center gap-2 px-3 py-2 bg-[#302cfc] font-bold rounded-md border border-gray-300 text-white hover:text-blue-600"
          >
            <Bell size={18} /> Notifications
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-600 text-white w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold">
                {unreadCount}
              </span>
            )}
          </button>
          {openSection === 'notification' && (
            <div className="absolute top-12 right-0 bg-[#302cfc] p-4 rounded shadow w-72 max-h-96 overflow-auto z-20">
              {notifications.length > 0
                ? notifications.map((n) => (
                    <div key={n.id} className="flex justify-between items-center mb-2">
                      <p className={n.read ? 'text-white text-sm' : 'font-semibold text-sm'}>
                        🔔 {n.message}
                      </p>
                      {!n.read && (
                        <button onClick={() => markAsRead(n.id)} className="text-blue-400 text-xs ml-2">
                          Mark as read
                        </button>
                      )}
                    </div>
                  ))
                : <p className="text-white text-sm">No notifications</p>}
            </div>
          )}
        </div>

        
        {/* Chat */}
        <div className="relative">
          <button
            onClick={() => setOpenSection(openSection === 'chat' ? null : 'chat')}
            className="flex items-center gap-2 px-3 py-2 bg-[#302cfc] font-bold rounded-md border border-gray-300 text-white hover:text-blue-600"
          >
            <MessageCircle size={18} /> Chat
          </button>
          {openSection === 'chat' && (
            <div className="absolute top-12 right-0 p-4 bg-gray-900 text-white rounded shadow w-96 max-h-[400px] overflow-auto z-40 flex flex-col">
              {activeChatMessages.length > 0 ? (
                <div className="flex-grow overflow-auto mb-3 space-y-2">
                  {activeChatMessages.map((chat) => (
                    <div key={chat.id} className="border-b border-gray-700 pb-2">
                      <p className="font-semibold">{chat.title || 'Chat'}</p>
                      {chat.messages?.slice(-3).map((msg, i) => (
                        <p key={i} className={`text-sm ${msg.sender_id === user?.id ? 'text-gray-300' : 'text-white'}`}>
                          <strong>{msg.sender_name || 'User'}:</strong> {msg.text}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-white">No active conversations</p>
              )}
              <form onSubmit={handleSendMessage} className="flex gap-2 mt-auto">
                <input
                  ref={chatInputRef}
                  type="text"
                  placeholder="Type your message..."
                  className="flex-grow px-2 py-1 rounded text-white"
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

        {/* Profile */}
        <Profile />
      </div>
    </div>
  )
}

export default Topbar