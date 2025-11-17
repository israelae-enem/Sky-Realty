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
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@radix-ui/react-dialog"

interface ListingFormProps {
  realtorId?: string
  companyId?: string
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

export default function ListingForm({ realtorId, companyId, mode = 'create', defaultValues, onSuccess }: ListingFormProps) {
  const [loading, setLoading] = useState(false)
  const [properties, setProperties] = useState<{ id: string; title: string }[]>([])
  const [images, setImages] = useState<string[]>(defaultValues?.image_urls || [])

  const { register, handleSubmit, reset } = useForm<FormValues>({
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

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        let query = supabase.from('properties').select('id, title')
        if (realtorId) query = query.eq('realtor_id', realtorId)
        if (companyId) query = query.eq('company_id', companyId)

        const { data, error } = await query
        if (error) throw error
        setProperties(data ?? [])
      } catch (err: any) {
        console.error(err)
        toast.error('Failed to load properties')
      }
    }

    fetchProperties()
  }, [realtorId, companyId])

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    if (!realtorId && !companyId) {
      toast.error('Realtor or Company ID required for image upload')
      return
    }

    setLoading(true)
    try {
      const file = e.target.files[0]
      const folder = `realtorId ? realtors/${realtorId} : companies/${companyId}`
      const filePath = `${folder}/${crypto.randomUUID()}-${file.name}`

      const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file, { upsert: true })
      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('documents').getPublicUrl(filePath)
      setImages([...images, data.publicUrl])
      toast.success('Image uploaded!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to upload image')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (values: FormValues) => {
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
        const { error } = await supabase.from('listings').update(payload).eq('id', defaultValues.id)
        if (error) throw error
        toast.success('Listing updated!')
      } else {
        const { error } = await supabase.from('listings').insert([{ id: crypto.randomUUID(), ...payload, created_at: new Date().toISOString() }])
        if (error) throw error
        toast.success('Listing added!')
      }

      reset()
      setImages([])
      if (onSuccess) onSuccess()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to save listing')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-[#302cfc] hover:bg-[#241fd9]">{mode === 'edit' ? 'Edit Listing' : 'Add Listing'}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogTitle>{mode === 'edit' ? 'Edit Listing' : 'Add New Listing'}</DialogTitle>
        <DialogDescription>
          Fill out the form to {mode === 'edit' ? 'update' : 'create'} a property listing.
        </DialogDescription>

        <form className="grid gap-4 mt-4 bg-gray-100 rounded-md border border-gray-400" onSubmit={handleSubmit(onSubmit)}>
          <label className="text-gray-800">Property</label>
          <Select {...register('property_id')}>
            <SelectTrigger>
              <SelectValue placeholder="Select a property" />
            </SelectTrigger>
            <SelectContent>
              {properties.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <label className="text-gray-800">Listing Title</label>
          <Input {...register('title')} placeholder="Listing Title" />

          <label className="text-gray-800">Description</label>
          <Textarea {...register('description')} placeholder="Listing Description" />

          <label className="text-gray-800">Price</label>
          <Input type="number" {...register('price', { valueAsNumber: true })} />

          <label className="text-gray-800">Status</label>
          <Select {...register('status')}>
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

          <label className="text-gray-800">Images</label>
          <div className="flex flex-wrap gap-2 items-center">
            {images.map((img, idx) => (
              <img key={idx} src={img} className="w-20 h-20 object-cover rounded-md" />
            ))}
            <input type="file" accept="image/*" onChange={handleImageChange} className="mt-2" />
          </div>

          <Button type="submit" disabled={loading} className="bg-[#302cfc] hover:bg-[#241fd9] mt-4">
            {loading ? (mode === 'edit' ? 'Updating...' : 'Adding...') : (mode === 'edit' ? 'Update Listing' : 'Add Listing')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}