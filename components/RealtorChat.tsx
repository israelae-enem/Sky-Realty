'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'
import { AccordionItem, AccordionTrigger, AccordionContent } from './ui/accordion'
import { MessageCircle } from 'lucide-react'

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
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })

  // ---------------- Fetch messages ----------------
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
          message: m.content,
        }))
        setMessages(enriched)
      }
    }

    fetchMessages()

    // ---------------- Realtime subscription ----------------
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
                message: m.content,
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

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // ---------------- Send message ----------------
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTenant) return

    const messagePayload = {
      sender_id: user.id,
      tenant_id: selectedTenant.id,
      realtor_id: user.id,
      content: newMessage.trim(),
      message: newMessage.trim(),
      read: false,
    }

    try {
      const { data, error } = await supabase
        .from('message')
        .insert([messagePayload])
        .select()
        .single()

      if (error) throw error

      if (data) {
        setMessages((prev) => [...prev, data])
        setNewMessage('')
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }
    } catch (err) {
      console.error('Send message error:', err)
      toast.error('Failed to send message')
    }
  }

  return (
    <AccordionItem value="chat">
      <AccordionTrigger className="text-lg font-semibold text-blue-600 flex items-center gap-2">
        <MessageCircle size={18} /> Chat
      </AccordionTrigger>
      <AccordionContent className="space-y-4">
        {/* Tenant selector */}
        <select
          value={selectedTenant?.id || ''}
          onChange={(e) => {
            const tenant = tenants.find((t) => t.id === e.target.value) ?? null
            setSelectedTenant(tenant)
            setMessages([])
          }}
          className="w-full sm:w-1/2 bg-gray-800 text-white p-2 rounded-md border border-gray-700 focus:outline-none"
        >
          <option value="">Select Tenant</option>
          {tenants.map((t) => (
            <option key={t.id} value={t.id}>
              {t.full_name || t.id}
            </option>
          ))}
        </select>

        {/* Messages */}
        <div className="flex flex-col h-64 sm:h-80 overflow-y-auto p-2 space-y-2 border border-gray-700 rounded-md">
          {selectedTenant ? (
            messages.length > 0 ? (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`p-2 rounded-md text-sm max-w-[80%] ${
                    m.sender_id === user.id
                      ? 'bg-[#302cfc] text-white self-end'
                      : 'bg-gray-700 text-gray-200 self-start'
                  }`}
                >
                  {m.message}
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">No messages yet</p>
            )
          ) : (
            <p className="text-gray-400 text-sm">Select a tenant to start chatting</p>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Send input */}
        {selectedTenant && (
          <div className="flex flex-col sm:flex-row gap-2 mt-2">
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
        )}
      </AccordionContent>
    </AccordionItem>
  )
}