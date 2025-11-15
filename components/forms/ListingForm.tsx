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
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription} from "@radix-ui/react-dialog"

interface ListingFormProps {
  realtorId: string
  onSuccess?: () => void
}

interface FormValues {
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

export default function ListingForm({ realtorId, onSuccess }: ListingFormProps) {
  const [loading, setLoading] = useState(false)
  const [properties, setProperties] = useState<{ id: string; title: string }[]>([])

  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
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
        const { data, error } = await supabase
          .from('properties')
          .select('id, title')
          .eq('realtor_id', realtorId)

        if (error) throw error
        setProperties(data ?? [])
      } catch (err: any) {
        console.error(err)
        toast.error('Failed to load properties')
      }
    }

    fetchProperties()
  }, [realtorId])

  const onSubmit = async (values: FormValues) => {
    if (!values.property_id) {
      toast.error('Please select a property')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('listings')
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

      toast.success('Listing added!')
      reset()
      if (onSuccess) onSuccess()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to add listing')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-[#302cfc] hover:bg-[#241fd9]">Add Listing</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        
          <DialogTitle>Add New Listing</DialogTitle>
          <DialogDescription>
            Fill out the form to create a new property listing.
          </DialogDescription>
        

        <form className="grid gap-4 mt-4" onSubmit={handleSubmit(onSubmit)}>
          <label className="text-gray-700">Property</label>
          <Select {...register('property_id')}>
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

          <label className="text-gray-700">Listing Title</label>
          <Input {...register('title')} placeholder="Listing Title" />

          <label className="text-gray-700">Description</label>
          <Textarea {...register('description')} placeholder="Listing Description" />

          <label className="text-gray-700">Price</label>
          <Input type="number" {...register('price', { valueAsNumber: true })} />

          <label className="text-gray-700">Status</label>
          <Select {...register('status')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Available">Available</SelectItem>
              <SelectItem value="Under Contract">Under Contract</SelectItem>
              <SelectItem value="Sold">Sold</SelectItem>
            </SelectContent>
          </Select>

          <label className="text-gray-700">Bedrooms</label>
          <Input type="number" {...register('bedrooms', { valueAsNumber: true })} />

          <label className="text-gray-700">Bathrooms</label>
          <Input type="number" {...register('bathrooms', { valueAsNumber: true })} />

          <label className="text-gray-700">Size (sq ft)</label>
          <Input type="number" {...register('size', { valueAsNumber: true })} />

          <label className="text-gray-700">Image URLs (comma separated)</label>
          <Input
            {...register('image_urls', {
              setValueAs: (v) => v.split(',').map((url: string) => url.trim()),
            })}
            placeholder="https://image1.com, https://image2.com"
          />

          <Button type="submit" disabled={loading} className="bg-[#302cfc] hover:bg-[#241fd9] mt-4">
            {loading ? 'Adding...' : 'Add Listing'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}