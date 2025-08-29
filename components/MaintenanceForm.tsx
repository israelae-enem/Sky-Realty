'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabaseClient'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(5, 'Please describe the issue'),
})

type MaintenanceFormData = z.infer<typeof schema>

export const MaintenanceForm = ({ closeModal }: { closeModal: () => void }) => {
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MaintenanceFormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: MaintenanceFormData) => {
    setLoading(true)

    try {
      // ✅ Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        toast.error('You must be logged in as a tenant.')
        setLoading(false)
        return
      }

      // ✅ Fetch tenant info (property_id + realtor_id)
      const { data: tenant, error: tenantError } = await supabase
        .from('tenant')
        .select('id, property_id, realtor_id')
        .eq('id', user.id)
        .single()

      if (tenantError || !tenant) {
        toast.error('Tenant record not found.')
        setLoading(false)
        return
      }

      // ✅ Upload file (optional)
      let fileUrl: string | null = null
      if (file) {
        const { data: uploadedFile, error: fileError } = await supabase.storage
          .from('documents')
          .upload(`maintenance/${user.id}-${Date.now()}-${file.name}`, file)

        if (fileError) {
          console.error(fileError)
          toast.error('Failed to upload file')
          setLoading(false)
          return
        }

        // ✅ Public URL
        const { data: publicUrl } = supabase.storage
          .from('documents')
          .getPublicUrl(uploadedFile.path)

        fileUrl = publicUrl.publicUrl
      }

      // ✅ Create maintenance request
      const { error: maintenanceError } = await supabase.from('maintenance_request').insert({
        tenant_id: user.id,
        property_id: tenant.property_id,
        realtor_id: tenant.realtor_id,
        title: data.title,
        description: data.description,
        status: 'pending',
        media_url: fileUrl,
      })

      if (maintenanceError) {
        console.error(maintenanceError)
        toast.error('Failed to submit request')
        setLoading(false)
        return
      }

      // ✅ Create notification for realtor
      await supabase.from('notification').insert({
        type: 'maintenance',
        message: `New maintenance request: ${data.title}`,
        realtor_id: tenant.realtor_id,
        read: false,
      })

      toast.success('Maintenance request submitted!')
      closeModal()
    } catch (error: unknown) {
      console.error(error)
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8 max-w-md w-full max-h-screen text-white rounded-md border-gray-300 mt-15 ml-5"
    >
      <input
        type="text"
        placeholder="Issue title"
        {...register('title')}
        className="w-full border px-4 py-2 rounded-md border-gray-300 text-white"
      />
      {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}

      <textarea
        placeholder="Describe the issue..."
        {...register('description')}
        className="w-full border px-4 py-2 rounded-md border-gray-300 text-white"
      />
      {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}

      <div className="w-full border rounded-md border-gray-300">
        <label className="block text-sm mb-2 text-gray-200 m-2">Upload Image or Video</label>
        <input
          type="file"
          accept="image/*,video/mp4,video/quicktime"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="text-sm m-2 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 mt-10 mb-5 hover:bg-blue-500 w-full text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit Request'}
      </button>
    </form>
  )
}

export default MaintenanceForm