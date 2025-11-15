'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
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
  realtorId: string
  onSuccess?: () => void
}

interface FormValues {
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

export default function PropertyForm({ realtorId, onSuccess }: PropertyFormProps) {
  const [loading, setLoading] = useState(false)
  const [propertyTypeOptions] = useState(['Apartment', 'House', 'Condo', 'Townhouse'])

  const { register, handleSubmit, control, reset } = useForm<FormValues>({
    defaultValues: {
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

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('properties')
        .insert([
          {
            id: crypto.randomUUID(),
            realtor_id: realtorId,
            ...values,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single()

      if (error) throw error

      toast.success('Property added!')
      reset()
      if (onSuccess) onSuccess()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to add property')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-[#302cfc] hover:bg-[#241fd9]">Add Property</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        
          <DialogTitle>Add New Property</DialogTitle>
          <DialogDescription>
            Fill out the form to add a new property.
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
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Occupied">Occupied</SelectItem>
              <SelectItem value="Vacant">Vacant</SelectItem>
            </SelectContent>
          </Select>

          <label className="text-gray-700">Price</label>
          <Input type="number" {...register('price', { valueAsNumber: true })} placeholder="Property Price" />

          <label className="text-gray-700">Property Type</label>
          <Select {...register('property_type')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
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

          <label className="text-gray-700">Image URLs (comma separated)</label>
          <Input {...register('image_urls', { setValueAs: v => v.split(',').map((url: string) => url.trim()) })} placeholder="https://image1.com, https://image2.com" />

          <Button type="submit" disabled={loading} className="bg-[#302cfc] hover:bg-[#241fd9] mt-4">
            {loading ? 'Adding...' : 'Add Property'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}