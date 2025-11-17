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

interface PropertyFormProps {
  realtorId?: string
  companyId?: string
  mode?: 'create' | 'edit'
  defaultValues?: FormValues
  onSuccess?: () => void
}

interface FormValues {
  id?: string
  title: string
  address: string
  description: string
  country: string
  status: 'Occupied' | 'Vacant'
  price: number
  property_type: string
  bedrooms: number
  bathrooms: number
  size: number
  image_urls: string[]
}

export default function PropertyForm({ realtorId, companyId, mode = 'create', defaultValues, onSuccess }: PropertyFormProps) {
  const [loading, setLoading] = useState(false)
  const [propertyTypeOptions] = useState(['Apartment', 'House', 'Condo', 'Townhouse'])
  const [images, setImages] = useState<string[]>(defaultValues?.image_urls || [])

  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: defaultValues || {
      title: '',
      address: '',
      description: '',
      country: '',
      status: 'Vacant',
      price: 0,
      property_type: 'Apartment',
      bedrooms: 1,
      bathrooms: 1,
      size: 0,
      image_urls: [],
    },
  })

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
        const { error } = await supabase.from('properties').update(payload).eq('id', defaultValues.id)
        if (error) throw error
        toast.success('Property updated!')
      } else {
        const { error } = await supabase.from('properties').insert([{ id: crypto.randomUUID(), ...payload, created_at: new Date().toISOString() }])
        if (error) throw error
        toast.success('Property added!')
      }

      reset()
      setImages([])
      if (onSuccess) onSuccess()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to save property')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-[#302cfc] hover:bg-[#241fd9]">{mode === 'edit' ? 'Edit Property' : 'Add Property'}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogTitle>{mode === 'edit' ? 'Edit Property' : 'Add New Property'}</DialogTitle>
        <DialogDescription>
          Fill out the form to {mode === 'edit' ? 'update' : 'create'} a property.
        </DialogDescription>

        <form className="grid gap-4 mt-4" onSubmit={handleSubmit(onSubmit)}>
          <label className="text-gray-700">Title</label>
          <Input {...register('title')} placeholder="Property Title" />

          <label className="text-gray-700">Address</label>
          <Input {...register('address')} placeholder="Property Address" />

          <label className="text-gray-700">Description</label>
          <Textarea {...register('description')} placeholder="Property Description" />

          <label className="text-gray-700">Country</label>
          <Input {...register('country')} placeholder="Country" />

          <label className="text-gray-700">Status</label>
          <Select {...register('status')}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Occupied">Occupied</SelectItem>
              <SelectItem value="Vacant">Vacant</SelectItem>
            </SelectContent>
          </Select>

          <label className="text-gray-700">Price</label>
          <Input type="number" {...register('price', { valueAsNumber: true })} placeholder="Property Price" />

          <label className="text-gray-700">Property Type</label>
          <Select {...register('property_type')}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {propertyTypeOptions.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <label className="text-gray-700">Bedrooms</label>
          <Input type="number" {...register('bedrooms', { valueAsNumber: true })} />

          <label className="text-gray-700">Bathrooms</label>
          <Input type="number" {...register('bathrooms', { valueAsNumber: true })} />

          <label className="text-gray-700">Size (sq ft)</label>
          <Input type="number" {...register('size', { valueAsNumber: true })} />

          <label className="text-gray-700">Images</label>
          <div className="flex flex-wrap gap-2 items-center">
            {images.map((img, idx) => (
              <img key={idx} src={img} className="w-20 h-20 object-cover rounded-md" />
            ))}
            <input type="file" accept="image/*" onChange={handleImageChange} className="mt-2" />
          </div>

          <Button type="submit" disabled={loading} className="bg-[#302cfc] hover:bg-[#241fd9] mt-4">
            {loading ? (mode === 'edit' ? 'Updating...' : 'Adding...') : (mode === 'edit' ? 'Update Property' : 'Add Property')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}