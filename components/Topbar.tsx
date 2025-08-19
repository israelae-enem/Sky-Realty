'use client'

import { useEffect, useState, useRef } from 'react'
import { Bell, MailPlus, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'
import { auth, db } from '@/lib/firebase'
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  updateDoc,
  doc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore'
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
  const unreadCount = notifications.filter((n) => !n.read).length
  const chatInputRef = useRef<HTMLInputElement>(null)

  // Get current user and fetch initial data
  useEffect(() => {
    const user = auth.currentUser
    if (!user) return

    // Fetch realtor name from 'realtors' collection
    const fetchProfile = async () => {
      const q = query(collection(db, 'realtors'), where('uid', '==', user.uid))
      const snapshot = await getDocs(q)
      if (!snapshot.empty) {
        const profileData = snapshot.docs[0].data()
        setCurrentUserName(profileData.full_name || '')
      }
    }

    // Fetch properties for invite dropdown
    const fetchProperties = async () => {
      const q = query(collection(db, 'properties'), where('realtor_id', '==', user.uid))
      const snapshot = await getDocs(q)
      const props = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setProperties(props)
    }

    fetchProfile()
    fetchProperties()
  }, [])

  // Real-time notifications listener
  useEffect(() => {
    const user = auth.currentUser
    if (!user) return

    const qNotif = query(
      collection(db, 'notifications'),
      where('realtor_id', '==', user.uid),
      orderBy('created_at', 'desc'),
      limit(10)
    )
    const unsub = onSnapshot(qNotif, (snapshot) => {
      const notifs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setNotifications(notifs)
    })

    return () => unsub()
  }, [])

  // Real-time chat messages listener from 'conversations' collection
  useEffect(() => {
    const user = auth.currentUser
    if (!user) return

    // Listen for latest 20 messages involving this realtor (assuming conversations have realtorId and messages array)
    const qChat = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid),
      orderBy('lastUpdated', 'desc'),
      limit(20)
    )
    const unsub = onSnapshot(qChat, (snapshot) => {
      const chats = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setActiveChatMessages(chats)
    })

    return () => unsub()
  }, [])

  // Mark notification as read
  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true })
    } catch (error: any) {
      toast.error(error.message || 'Failed to mark notification as read')
    }
  }

  // Handle tenant invite send
  const handleInvite = async () => {
    if (!inviteEmail || !selectedProperty) {
      toast.error('Please provide tenant email and select a property')
      return
    }

    try {
      await addDoc(collection(db, 'invites'), {
        email: inviteEmail,
        property_id: selectedProperty,
        status: 'pending',
        sent_by: auth.currentUser?.uid,
        created_at: serverTimestamp(),
      })
      toast.success('Invite recorded! (Send email separately)')
      setInviteEmail('')
      setSelectedProperty('')
      setOpen(null)
    } catch (error: any) {
      toast.error(error.message || 'Failed to send invite')
    }
  }

  // Handle chat message send
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    try {
      // For demo, we'll add a new message to the first active conversation
      // You can adjust this to open a full chat UI per conversation later

      if (activeChatMessages.length === 0) {
        toast.error('No active conversations to send message')
        return
      }

      const conversation = activeChatMessages[0] // Sending to first chat for simplicity

      // Assuming messages is an array field in conversation doc
      const conversationRef = doc(db, 'conversations', conversation.id)
      await updateDoc(conversationRef, {
        messages: [...(conversation.messages || []), {
          senderId: auth.currentUser?.uid,
          senderName: currentUserName,
          text: newMessage.trim(),
          createdAt: serverTimestamp(),
        }],
        lastUpdated: serverTimestamp(),
      })

      setNewMessage('')
      if (chatInputRef.current) chatInputRef.current.focus()
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message')
    }
  }

  return (
    <div className="bg-black p-4 flex justify-end font-bold items-center gap-6 mt-2 mb-10 relative">
      {/* 🔔 Notifications */}
      <div className="relative">
        <button
          aria-haspopup="true"
          aria-expanded={open === 'notifications'}
          aria-controls="notifications-dropdown"
          onClick={() => setOpen(open === 'notifications' ? null : 'notifications')}
          className="flex items-center gap-2 px-3 py-2 rounded-md border btn-primary border-gray-300 text-gray-200 hover:text-black relative"
          type="button"
        >
          <Bell size={18} />
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span
              className="absolute -top-1 -right-2 bg-red-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full"
              aria-label={`${unreadCount} unread notifications`}
            >
              {unreadCount}
            </span>
          )}
        </button>
        {open === 'notifications' && (
          <div
            id="notifications-dropdown"
            role="region"
            aria-live="polite"
            className="absolute top-12 right-0 bg-gray-800 p-4 rounded text-white w-72 max-h-96 overflow-auto z-20 shadow-md"
          >
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div key={n.id} className="flex justify-between items-center mb-2">
                  <p className={n.read ? 'text-gray-400 text-sm' : 'font-semibold text-sm'}>
                    🔔 {n.message}
                  </p>
                  {!n.read && (
                    <button
                      onClick={() => markAsRead(n.id)}
                      className="text-blue-400 text-xs ml-2"
                      type="button"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm">No new notifications</p>
            )}
          </div>
        )}
      </div>

      <div>
        <TenantRequest />
      </div>

      {/* ✉ Invite Tenant */}
      <div className="relative">
        <button
          aria-haspopup="true"
          aria-expanded={open === 'invite'}
          aria-controls="invite-dropdown"
          onClick={() => setOpen(open === 'invite' ? null : 'invite')}
          className="flex items-center gap-2 px-3 py-2 rounded-md border btn-primary border-gray-300 text-gray-200 hover:text-black"
          type="button"
        >
          <MailPlus size={18} />
          <span>Invite Tenant</span>
        </button>
        {open === 'invite' && (
          <div
            id="invite-dropdown"
            role="region"
            aria-live="polite"
            className="absolute top-12 right-0 p-4 bg-gray-800 text-white rounded shadow w-80 max-h-96 overflow-auto z-30"
          >
            <p className="mb-2 font-medium">Invite Tenant</p>

            <select
              className="w-full px-2 py-1 text-black rounded mb-2"
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              aria-label="Select property for tenant invite"
            >
              <option value="">Select Property</option>
          {properties.map((p) => (
         <option key={p.id} value={p.id}>
         {p.address || p.name || `Property ${p.id}`}
        </option>
       ))}
        </select>

       <input
       type="email"
       placeholder="Tenant email"
       className="w-full px-2 py-1 rounded text-black mb-3"
       value={inviteEmail}
       onChange={(e) => setInviteEmail(e.target.value)}
       aria-label="Tenant email address"
        />

       <button
        onClick={handleInvite}
       className="btn btn-primary w-full"
        type="button"
       >
        Send Invite
      </button>
     </div>
      )}
     </div>

{/* 💬 Chat */}
      <div className="relative">
        <button
       aria-haspopup="true"
       aria-expanded={open === 'chat'}
       aria-controls="chat-dropdown"
        onClick={() => setOpen(open === 'chat' ? null : 'chat')}
        className="flex items-center gap-2 px-3 py-2 rounded-md border btn-primary border-gray-300 text-gray-200 hover:text-black"
       type="button"
       >
    <MessageCircle size={18} />
    <span>Chat</span>
   </button>
       {open === 'chat' && (
      <div
      id="chat-dropdown"
      role="region"
      aria-live="polite"
      className="absolute top-12 right-0 p-4 bg-gray-800 text-white rounded shadow w-96 max-h-[400px] overflow-auto z-40 flex flex-col"
    >
      {activeChatMessages.length > 0 ? (
        <div className="flex-grow overflow-auto mb-3 space-y-2">
          {activeChatMessages.map((chat) => (
            <div key={chat.id} className="border-b border-gray-700 pb-2">
              <p className="font-semibold">{chat.title || 'Chat'}</p>
              {chat.messages?.slice(-3).map((msg: any, i: number) => (
                <p
                  key={i}
                  className={`text-sm ${
                    msg.senderId === auth.currentUser?.uid ? 'text-blue-400' : 'text-gray-300'
                  }`}
                >
                  <strong>{msg.senderName || 'User'}:</strong> {msg.text}
                </p>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm">No active conversations</p>
      )}

      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          ref={chatInputRef}
          type="text"
          placeholder="Type your message..."
          className="flex-grow px-2 py-1 rounded text-black"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          aria-label="Type a chat message"
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