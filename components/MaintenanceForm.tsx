'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabaseClient'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(5, 'Please describe the issue'),
  priority: z.enum(['low', 'medium', 'high']),
})

type MaintenanceFormData = z.infer<typeof schema>

export const MaintenanceForm = () => {
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const { user } = useUser()
  const router = useRouter()

  // Fetch tenant info
  const [tenantInfo, setTenantInfo] = useState<{
    id: string
    property_id: string
    realtor_id: string
  } | null>(null)

  useEffect(() => {
    if (!user?.id) return

    const fetchTenant = async () => {
      const { data, error } = await supabase
        .from('tenants')
        .select('id, property_id, realtor_id')
        .eq('id', user.id)
        .single()

      if (error || !data) {
        console.error('Tenant fetch error:', error)
        toast.error('Tenant record not found.')
        return
      }

      setTenantInfo(data)
    }

    fetchTenant()
  }, [user?.id])

  const { register, handleSubmit, formState: { errors } } = useForm<MaintenanceFormData>({
    resolver: zodResolver(schema),
    defaultValues: { priority: 'medium' },
  })

  // Preview file
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const onSubmit = async (data: MaintenanceFormData) => {
    if (!user || !tenantInfo) {
      toast.error('Tenant information not found.')
      return
    }

    setLoading(true)

    try {
      let fileUrl: string | null = null

      if (file) {
        const filePath = `maintenance/${user.id}-${Date.now()}-${file.name}`
        const { data: uploadedFile, error: fileError } = await supabase.storage
          .from('documents')
          .upload(filePath, file)

        if (fileError || !uploadedFile?.path) {
          console.error('File upload error:', fileError)
          toast.error('Failed to upload file')
          setLoading(false)
          return
        }

        const { data: publicUrlData } = supabase.storage
          .from('documents')
          .getPublicUrl(uploadedFile.path)
        fileUrl = publicUrlData.publicUrl
      }

      // Insert maintenance request
      const { data: inserted, error: maintenanceError } = await supabase
        .from('maintenance_request')
        .insert({
          id: crypto.randomUUID(),
          tenant_id: tenantInfo.id,
          property_id: tenantInfo.property_id,
          realtor_id: tenantInfo.realtor_id,
          title: data.title,
          description: data.description,
          status: 'pending',
          priority: data.priority,
          media_url: fileUrl,
        })
        .select()

      console.log('Maintenance insert result:', { inserted, maintenanceError })

      if (maintenanceError) {
        toast.error('Failed to submit request')
        setLoading(false)
        return
      }

      console.log ('insert success:', inserted)

      // Insert notification for realtor
      const { error: notifError } = await supabase.from('notification').insert({
        type: 'maintenance',
        message: `New maintenance request: ${data.title}`,
        realtor_id: tenantInfo.realtor_id,
        read: false,
      })

      if (notifError) console.error('Notification error:', notifError)

      toast.success('Maintenance request submitted!')
      router.push(`/tenant/${user.id}/dashboard?success=maintenance`)
    } catch (err) {
      console.error('Maintenance submit error:', err)
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 max-w-md w-full bg-gray-100 text-gray-800 rounded-md border-gray-300 mt-5 ml-5"
    >
      <input
        type="text"
        placeholder="Issue title"
        {...register('title')}
        className="w-full border px-4 py-2 rounded-md border-gray-300 text-gray-800"
      />
      {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}

      <textarea
        placeholder="Describe the issue..."
        {...register('description')}
        className="w-full border px-4 py-2 rounded-md border-gray-300 text-white"
      />
      {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}

      <div>
        <label className="block mb-1 text-gray-300">Priority</label>
        <select
          {...register('priority')}
          className="w-full p-2 rounded bg-gtay-500 border border-gray-300 text-white"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div className="w-full border rounded-md border-gray-300">
        <label className="block text-sm mb-2 text-gray-200 m-2">Upload Image or Video (optional)</label>
        <input
          type="file"
          accept="image/*,video/mp4,video/quicktime"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="text-sm m-2 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500"
        />
      </div>

      {previewUrl && (
        <div className="mt-2">
          {file?.type.startsWith('image/') ? (
            <img src={previewUrl} alt="Preview" className="max-h-40 rounded-md" />
          ) : (
            <video src={previewUrl} controls className="max-h-40 rounded-md" />
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 mt-4 hover:bg-blue-500 w-full text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit Request'}
      </button>
    </form>
  )
}

export default MaintenanceForm