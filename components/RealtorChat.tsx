'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'
import { MessageCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Tenant {
  id: string
  full_name: string | null
  email: string
  phone: string
  property_id: string
  realtor_id: string
}

interface Message {
  id: string
  sender_id: string
  tenant_id: string
  realtor_id: string
  content: string
  message: string
  file_url?: string
  read: boolean
  created_at: string
}

interface RealtorChatProps {
  tenants: Tenant[]
  user: { id: string }
}

export default function RealtorChat({ tenants, user }: RealtorChatProps) {
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [tenantPic, setTenantPic] = useState<string | null>(null)
  const [realtorPic, setRealtorPic] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })

  // Fetch messages
  useEffect(() => {
    if (!selectedTenant || !user?.id) return

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('message')
        .select('*')
        .eq('tenant_id', selectedTenant.id)
        .eq('realtor_id', user.id)
        .order('created_at', { ascending: true })

      if (!error && data) {
        const enriched = data.map((m) => ({
          ...m,
          message: m.content || (m.file_url ? `[File] ${m.file_url.split('/').pop()}` : ''),
        }))
        setMessages(enriched)
      }
    }

    fetchMessages()

    const subscription = supabase
      .channel(`conversation-${selectedTenant.id}-${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'message' },
        (payload) => {
          const m = payload.new as Message
          if (m.tenant_id === selectedTenant.id && m.realtor_id === user.id) {
            setMessages((prev) => [
              ...prev,
              {
                ...m,
                message: m.content || (m.file_url ? `[File] ${m.file_url.split('/').pop()}` : ''),
              },
            ])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [selectedTenant, user?.id])

  useEffect(() => scrollToBottom(), [messages])

  // Fetch profile pictures
  useEffect(() => {
    const fetchPics = async () => {
      if (selectedTenant) {
        const { data: tenant } = await supabase
          .from('tenants')
          .select('profile_pic')
          .eq('id', selectedTenant.id)
          .single()
        if (tenant?.profile_pic) setTenantPic(tenant.profile_pic)
      }

      if (user?.id) {
        const { data: realtor } = await supabase
          .from('realtors')
          .select('profile_pic')
          .eq('id', user.id)
          .single()
        if (realtor?.profile_pic) setRealtorPic(realtor.profile_pic)
      }
    }

    fetchPics()
  }, [selectedTenant, user])

  // Send message
  const handleSend = async () => {
    if (!newMessage.trim() && !file) return toast.error('Enter a message or select a file')
    if (!selectedTenant) return

    setLoading(true)
    let fileUrl: string | undefined

    try {
      if (file) {
        const fileName = `${Date.now()}_${file.name}`
        const { error: uploadError } = await supabase.storage
          .from('chat_files')
          .upload(fileName, file)

        if (uploadError) throw uploadError
        fileUrl = supabase.storage.from('chat_files').getPublicUrl(fileName).data.publicUrl
      }

      const payload = {
        sender_id: user.id,
        tenant_id: selectedTenant.id,
        realtor_id: user.id,
        content: newMessage.trim() || `[File] ${file?.name}`,
        message: newMessage.trim() || `[File] ${file?.name}`,
        file_url: fileUrl,
        read: false,
      }

      const { data, error } = await supabase.from('message').insert([payload]).select().single()
      if (error) throw error
      setMessages((prev) => [...prev, data])
      setNewMessage('')
      setFile(null)
      scrollToBottom()
    } catch (err) {
      console.error(err)
      toast.error('Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  const renderFile = (url?: string) => {
    if (!url) return null
    const ext = url.split('.').pop()?.toLowerCase()
    if (!ext) return null
    if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) {
      return <img src={url} alt="file" className="max-w-xs max-h-40 rounded-md mt-1" />
    }
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="underline text-blue-500 text-sm mt-1 block">
        📎 View File
      </a>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-800 flex font-tech items-center gap-2 mb-4">
        <MessageCircle className="text-[#302cfc]" /> Chat
      </h2>

      {/* Tenant Selector */}
      <select
        value={selectedTenant?.id || ''}
        onChange={(e) => {
          const tenant = tenants.find((t) => t.id === e.target.value) ?? null
          setSelectedTenant(tenant)
          setMessages([])
        }}
        className="w-full p-2 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#302cfc] mb-4"
      >
        <option value="">Select Tenant</option>
        {tenants.map((t) => (
          <option key={t.id} value={t.id}>
            {t.full_name || t.id}
          </option>
        ))}
      </select>

      {/* Chat Messages */}
      <div className="flex flex-col h-80 overflow-y-auto p-3 bg-gray-50 rounded-md space-y-3">
        {selectedTenant ? (
          messages.length > 0 ? (
            <AnimatePresence initial={false}>
              {messages.map((m) => {
                const isRealtor = m.sender_id === user.id
                const avatar = isRealtor ? realtorPic : tenantPic
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-end gap-2 ${isRealtor ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isRealtor && (
                      <img
                        src={avatar || '/assets/default-avatar.png'}
                        alt="Tenant"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    )}
                    <div
                      className={`p-2 rounded-lg max-w-[70%] text-sm shadow-sm ${
                        isRealtor ? 'bg-[#302cfc] text-white' : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      <p>{m.message}</p>
                      {renderFile(m.file_url)}
                    </div>
                    {isRealtor && (
                      <img
                        src={avatar || '/assets/default-avatar.png'}
                        alt="Realtor"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    )}
                  </motion.div>
                )
              })}
            </AnimatePresence>
          ) : (
            <p className="text-gray-500 text-center mt-4">No messages yet</p>
          )
        ) : (
          <p className="text-gray-500 text-center mt-4">Select a tenant to start chatting</p>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {selectedTenant && (
        <div className="flex flex-col sm:flex-row gap-2 mt-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#302cfc]"
          />
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="flex-1 sm:flex-none text-sm"
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="px-4 py-2 bg-[#302cfc] hover:bg-[#241fd9] text-white rounded-md font-medium transition-all"
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
      )}
    </div>
  )
}