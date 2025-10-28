'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'

interface Message {
  id: string
  sender_id: string
  tenant_id: string
  realtor_id: string
  content: string
  file_url?: string
  read: boolean
  created_at: string
}

interface TenantChatProps {
  tenantId: string
  userId: string
}

export default function TenantChat({ tenantId, userId }: TenantChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })

  // ---------------- Fetch messages ----------------
  useEffect(() => {
    if (!tenantId || !userId) return

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('message')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('realtor_id', userId)
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

    // ---------------- Realtime subscription ----------------
    const subscription = supabase
      .channel(`conversation-${tenantId}-${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'message' },
        (payload) => {
          const m = payload.new as Message
          if (m.tenant_id === tenantId && m.realtor_id === userId) {
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
  }, [tenantId, userId])

  useEffect(() => scrollToBottom(), [messages])

  // ---------------- Send message ----------------
  const handleSendMessage = async () => {
    if (!newMessage.trim() && !file) return toast.error('Enter a message or upload a file.')

    let file_url: string | undefined

    if (file) {
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(`messages/${crypto.randomUUID()}-${file.name}`, file, { cacheControl: '3600', upsert: true })

      if (error) {
        console.error('File upload error:', error)
        toast.error('Failed to upload file')
        return
      }
      file_url = data?.path
    }

    try {
      const { data, error } = await supabase
        .from('message')
        .insert([
          {
            sender_id: userId,
            tenant_id: tenantId,
            realtor_id: userId,
            content: newMessage.trim() || '',
            file_url,
            read: false,
          },
        ])
        .select()
        .single()

      if (error) throw error

      if (data) {
        setMessages((prev) => [...prev, data])
        setNewMessage('')
        setFile(null)
        scrollToBottom()
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to send message')
    }
  }

  return (
    <div className="flex flex-col h-full space-y-2">
      <div className="flex-1 overflow-y-auto p-2 space-y-2 border border-gray-700 rounded-md">
        {messages.length > 0 ? (
          messages.map((m) => (
            <div
              key={m.id}
              className={`p-2 rounded-md text-sm max-w-[80%] ${
                m.sender_id === userId ? 'bg-[#302cfc] text-white self-end' : 'bg-gray-700 text-gray-100 self-start'
              }`}
            >
              {m.file_url && (
                <a
                  href={supabase.storage.from('documents').getPublicUrl(m.file_url).data.publicUrl}
                  target="_blank"
                  className="underline"
                >
                  {m.file_url.split('/').pop()}
                </a>
              )}
              <p>{m.content}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-sm">No messages yet</p>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2 mt-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none"
        />
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="bg-gray-700 text-white px-2 py-1 rounded-md"
        />
        <button
          onClick={handleSendMessage}
          className="px-4 py-2 bg-[#302cfc] hover:bg-[#241fd9] rounded-md text-white font-semibold"
        >
          Send
        </button>
      </div>
    </div>
  )
}