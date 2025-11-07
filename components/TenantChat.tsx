'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

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
  userAvatarUrl?: string
}

export default function TenantChat({ tenantId, userId, userAvatarUrl }: TenantChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })

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

      if (!error && data) setMessages(data)
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
            setMessages((prev) => [...prev, m])
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'message' },
        (payload) => {
          const m = payload.new as Message
          if (m.tenant_id === tenantId && m.realtor_id === userId) {
            // Could handle typing indicator updates here
          }
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(subscription)
    }
  }, [tenantId, userId])

  useEffect(() => scrollToBottom(), [messages])

  // ---------------- Typing Indicator ----------------
  const handleTyping = () => {
    setIsTyping(true)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 1000)
  }

  // ---------------- Send message ----------------
  const handleSendMessage = async () => {
    if (!newMessage.trim() && !file)
      return toast.error('Enter a message or upload a file.')

    let file_url: string | undefined

    if (file) {
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(`messages/${crypto.randomUUID()}-${file.name}`, file, {
          cacheControl: '3600',
          upsert: true,
        })

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
    <div className="flex flex-col h-full space-y-3 p-2 bg-gray-50 rounded-md shadow-md">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 flex flex-col">
        <AnimatePresence initial={false}>
          {messages.map((m) => {
            const isUser = m.sender_id === userId
            return (
              <motion.div
                key={m.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.25 }}
                className={`flex items-start gap-2 ${
                  isUser ? 'justify-end' : 'justify-start'
                }`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    {userAvatarUrl ? (
                      <Image
                        src={userAvatarUrl}
                        width={32}
                        height={32}
                        alt="User Avatar"
                      />
                    ) : (
                      <div className="bg-gray-300 w-full h-full rounded-full" />
                    )}
                  </div>
                )}
                <div
                  className={`p-2 rounded-xl max-w-[75%] break-words text-sm ${
                    isUser ? 'bg-[#302cfc] text-white' : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {m.file_url && (
                    <a
                      href={supabase.storage
                        .from('documents')
                        .getPublicUrl(m.file_url).data.publicUrl}
                      target="_blank"
                      className="underline block mb-1 text-xs text-blue-600"
                    >
                      {m.file_url.split('/').pop()}
                    </a>
                  )}
                  <p>{m.content}</p>
                </div>
              </motion.div>
            )
          })}

          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              key="typing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 justify-start"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-300" />
              <div className="flex space-x-1">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.2 }}
                    className="w-2 h-2 bg-gray-500 rounded-full inline-block"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 mt-2 items-center">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value)
            handleTyping()
          }}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 rounded-xl bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#302cfc]"
        />
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="px-2 py-1 rounded-xl bg-gray-100 border border-gray-300 text-sm"
        />
        <motion.button
          onClick={handleSendMessage}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-[#302cfc] hover:bg-[#241fd9] text-white rounded-xl font-semibold"
        >
          Send
        </motion.button>
      </div>
    </div>
  )
}