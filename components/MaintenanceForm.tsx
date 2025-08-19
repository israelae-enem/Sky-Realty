'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { toast } from 'sonner'

import { getAuth } from 'firebase/auth'
import { getFirestore, doc, getDoc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'

// Your firebase app should be initialized somewhere before using this, e.g. in /lib/firebase.ts

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
      const auth = getAuth()
      const user = auth.currentUser

      if (!user) {
        toast.error('You must be logged in as a tenant.')
        setLoading(false)
        return
      }

      const db = getFirestore()
      const storage = getStorage()

      // Fetch tenant record from Firestore
      const tenantRef = doc(db, 'tenants', user.uid)
      const tenantSnap = await getDoc(tenantRef)

      if (!tenantSnap.exists()) {
        toast.error('Tenant information not found')
        setLoading(false)
        return
      }

      const tenant = tenantSnap.data()
      const tenantId = user.uid
      const realtorId = tenant.realtor_id
      const propertyId = tenant.property_id

      // Upload file to Firebase Storage if selected
      let fileUrl: string | null = null
      if (file) {
        const ext = file.name.split('.').pop()
        const filePath =  `maintenance_files/${tenantId}/${Date.now()}.${ext}`
        const storageRef = ref(storage, filePath)

        await uploadBytes(storageRef, file)

        fileUrl = await getDownloadURL(storageRef)
      }

      // Insert maintenance request into Firestore
      const maintenanceRef = collection(db, 'maintenance_request')
      await addDoc(maintenanceRef, {
        tenant_id: tenantId,
        property_id: propertyId,
        title: data.title,
        description: data.description,
        status: 'pending',
        media_url: fileUrl,
        created_at: serverTimestamp(),
      })

      // Send notification to realtor
      const notifRef = collection(db, 'notification')
      await addDoc(notifRef, {
        type: 'maintenance',
        message: `New maintenance request: ${data.title}`,
        realtor_id: realtorId,
        read: false,
        created_at: serverTimestamp(),
      })

      toast.success('Maintenance request submitted!')
      closeModal()
    } catch (error) {
      console.error(error)
      toast.error('Failed to submit maintenance request')
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
        <label className="block text-sm mb-10 text-gray-200 m-2">Upload Image or Video</label>
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