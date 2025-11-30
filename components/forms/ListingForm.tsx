'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription
} from "@radix-ui/react-dialog"

interface ListingFormProps {
  realtorId?: string
  companyId?: string
  plan?: string | null
  propertyLimit?: number
  currentTotal?: number
  mode?: 'create' | 'edit'
  defaultValues?: FormValues
  onSuccess?: () => void
}

interface FormValues {
  id?: string
  property_id: string
  title: string
  description: string
  price: number
  status: 'Available' | 'Under Contract' | 'Sold'
  bedrooms: number
  bathrooms: number
  size: number
  image_urls: string[]
}

export default function ListingForm({
  realtorId,
  companyId,
  plan,
  propertyLimit = 0,
  currentTotal = 0,
  mode = 'create',
  defaultValues,
  onSuccess,
}: ListingFormProps) {

  const [loading, setLoading] = useState(false)
  const [properties, setProperties] = useState<{ id: string; title: string }[]>([])
  const [images, setImages] = useState<string[]>(Array.isArray(defaultValues?.image_urls) ? defaultValues.image_urls : [])

  const reachedLimit =
    plan !== null &&
    propertyLimit !== null &&
    currentTotal >= propertyLimit &&
    mode === 'create'

  const { register, handleSubmit, reset, setValue } = useForm<FormValues>({
    defaultValues: defaultValues || {
      property_id: '',
      title: '',
      description: '',
      price: 0,
      status: 'Available',
      bedrooms: 1,
      bathrooms: 1,
      size: 0,
      image_urls: [],
    },
  })

  // Fetch properties for dropdown
  useEffect(() => {
    const load = async () => {
      try {
        let q = supabase.from('properties').select('id, title')
        if (realtorId) q = q.eq('realtor_id', realtorId)
        if (companyId) q = q.eq('company_id', companyId)
        const { data, error } = await q
        if (error) throw error
        setProperties(data || [])
      } catch (err) {
        console.error(err)
        toast.error('Failed loading properties')
      }
    }
    load()
  }, [realtorId, companyId])

  // Image upload handler
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return
    const files = Array.from(e.target.files)
    setLoading(true)

    try {
      const folder = `realtorId ? realtors/${realtorId} : companies/${companyId}`
      const uploadedUrls: string[] = []

      for (const file of files) {
        const filePath = `${folder}/${crypto.randomUUID()}-${file.name}`
        const { error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(filePath, file, { upsert: true })
        if (uploadError) throw uploadError

        const { data } = supabase.storage.from('property-images').getPublicUrl(filePath)
        if (data?.publicUrl) uploadedUrls.push(data.publicUrl)
      }

      if (uploadedUrls.length) {
        setImages(prev => [...prev, ...uploadedUrls])
        toast.success('Image(s) uploaded!')
      }
    } catch (err) {
      console.error(err)
      toast.error('Image upload failed')
    } finally {
      setLoading(false)
    }
  }

  // Submit handler
  const onSubmit = async (values: FormValues) => {
    if (reachedLimit) {
      toast.error(`You reached your plan limit. (${currentTotal}/${propertyLimit})`)
      return
    }
    if (!values.property_id) {
      toast.error('Please select a property')
      return
    }

    setLoading(true)
    try {
      const payload = {
        ...values,
        image_urls: images,
        realtor_id: realtorId || null,
        company_id: companyId || null,
        updated_at: new Date().toISOString(),
      }

      if (mode === 'edit' && defaultValues?.id) {
        const { error } = await supabase
          .from('listing')
          .update(payload)
          .eq('id', defaultValues.id)
        if (error) throw error
        toast.success('Listing updated!')
      } else {
        const { error } = await supabase
          .from('listing')
          .insert([
            {
              id: crypto.randomUUID(),
              ...payload,
              created_at: new Date().toISOString(),
            },
          ])
        if (error) throw error
        toast.success('Listing added!')
      }

      reset()
      setImages([])
      onSuccess?.()
    } catch (err) {
      console.error(err)
      toast.error('Failed to save listing')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-[#302cfc] hover:bg-[#241fd9]">
          {mode === 'edit' ? 'Edit Listing' : 'Add Listing'}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg bg-white p-6 rounded-lg shadow-xl">
        <DialogTitle>{mode === 'edit' ? 'Edit Listing' : 'Add Listing'}</DialogTitle>
        <DialogDescription>
          Fill the form to {mode === 'edit' ? 'update' : 'create'} a listing.
        </DialogDescription>

        {reachedLimit && (
          <div className="bg-red-100 text-red-700 p-3 rounded-md mt-3 text-sm">
            You reached your plan limit ({currentTotal}/{propertyLimit}). Upgrade your plan to add more.
          </div>
        )}

        <form className="grid gap-4 mt-4" onSubmit={handleSubmit(onSubmit)}>
          <label className="text-gray-800">Property</label>
          <Select
            onValueChange={(v) => setValue('property_id', v)}
            defaultValue={defaultValues?.property_id}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a property" />
            </SelectTrigger>
            <SelectContent>
              {properties.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <label className="text-gray-800">Listing Title</label>
          <Input {...register('title')} />

          <label className="text-gray-800">Description</label>
          <Textarea {...register('description')} />

          <label className="text-gray-800">Price</label>
          <Input type="number" {...register('price', { valueAsNumber: true })} />

          <label className="text-gray-800">Status</label>
          <Select
            onValueChange={(v) => setValue('status', v as any)}
            defaultValue={defaultValues?.status}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Available">Available</SelectItem>
              <SelectItem value="Under Contract">Under Contract</SelectItem>
              <SelectItem value="Sold">Sold</SelectItem>
            </SelectContent>
          </Select>

          <label className="text-gray-800">Bedrooms</label>
          <Input type="number" {...register('bedrooms', { valueAsNumber: true })} />

          <label className="text-gray-800">Bathrooms</label>
          <Input type="number" {...register('bathrooms', { valueAsNumber: true })} />

          <label className="text-gray-800">Size (sq ft)</label>
          <Input type="number" {...register('size', { valueAsNumber: true })} />

          <label className="text-gray-700">Images</label>
          <div className="flex flex-wrap gap-2 items-center">
            {Array.isArray(images) &&
              images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Listing image ${idx + 1}`}
                  className="w-20 h-20 object-cover rounded-md border"
                />
              ))}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              disabled={loading}
              className="mt-2"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="bg-[#302cfc] hover:bg-[#241fd9] mt-4"
          >
            {loading
              ? mode === 'edit' ? 'Updating...' : 'Adding...'
              : mode === 'edit' ? 'Update Listing' : 'Add Listing'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}