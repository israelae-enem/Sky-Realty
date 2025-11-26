'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'
import Image from 'next/image'

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
  DialogTitle,
  DialogTrigger,
} from "@radix-ui/react-dialog"

interface PropertyFormProps {
  realtorId?: string
  companyId?: string
  plan?: string | null       // <-- ADDED
  propertyLimit?: number | 0 // <-- ADDED
  currentCount?: number       // <-- You might pass this too
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

export default function PropertyForm({
  realtorId,
  companyId,
  plan,
  propertyLimit = 0,
  currentCount = 0,
  mode = 'create',
  defaultValues,
  onSuccess
}: PropertyFormProps) {

  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<string[]>(defaultValues?.image_urls || [])

  const propertyTypeOptions = ['Apartment', 'House', 'Condo', 'Townhouse']

  const { register, handleSubmit, reset, setValue } = useForm<FormValues>({
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

  /* const reachedLimit =
    plan !== null &&
    propertyLimit !== null &&
    currentCount >= propertyLimit &&
    mode === 'create' */

  // -----------------------------------------------
  // IMAGE UPLOAD
  // -----------------------------------------------
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    setLoading(true)

    try {
      const folder = realtorId
        ? `realtors/${realtorId}`
        : `companies/${companyId}`

      const uploadedUrls: string[] = []

      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i]
        const safeFileName = file.name.replace(/\s+/g, "-")
        const filePath = `${folder}/${crypto.randomUUID()}-${safeFileName}`

        const { error: uploadError } = await supabase.storage
          .from("property-images")
          .upload(filePath, file, { upsert: true })

        if (uploadError) throw uploadError

        const { data } = supabase.storage
          .from("property-images")
          .getPublicUrl(filePath)

        if (!data?.publicUrl) throw new Error("Failed getting image URL")

        uploadedUrls.push(data.publicUrl)
      }

      // Add to preview
      const newImages = [...images, ...uploadedUrls]
      setImages(newImages)

      // Add to react-hook-form
      setValue("image_urls", newImages)

      toast.success("Images uploaded successfully!")
    } catch (err) {
      console.error(err)
      toast.error("Image upload failed")
    } finally {
      setLoading(false)
    }
  }

  // -----------------------------------------------
  // SUBMIT HANDLER
  // -----------------------------------------------
  const onSubmit = async (values: FormValues) => {
    /* if (reachedLimit) {
      toast.error(❌ Property limit reached (${currentCount}/${propertyLimit}). Upgrade plan to add more.)
      return
    } */

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
          .from('properties')
          .update(payload)
          .eq('id', defaultValues.id)

        if (error) throw error
        toast.success('Property updated!')
      } else {
        const { error } = await supabase
          .from('properties')
          .insert([
            {
              id: crypto.randomUUID(),
              ...payload,
              created_at: new Date().toISOString(),
            }
          ])

        if (error) throw error
        toast.success('Property added!')
      }

      reset()
      setImages([])
      onSuccess?.()
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
        <Button className="bg-[#302cfc] hover:bg-[#241fd9]">
          {mode === 'edit' ? 'Edit Property' : 'Add Property'}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg p-6 bg-white rounded-lg shadow-xl">
        <DialogTitle className="text-xl font-semibold mb-2">
          {mode === 'edit' ? 'Edit Property' : 'Add New Property'}
        </DialogTitle>

        {/* LIMIT WARNING */}
        {/*
        {reachedLimit && (
          <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm mb-3">
            You have reached your property limit ({currentCount}/{propertyLimit}).  
            Upgrade your plan to add more properties.
          </div>
        )}
        */}

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
          <Select
            onValueChange={(value) => setValue('status', value as any)}
            defaultValue={defaultValues?.status || 'Vacant'}
          >
            <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Occupied">Occupied</SelectItem>
              <SelectItem value="Vacant">Vacant</SelectItem>
            </SelectContent>
          </Select>

          <label className="text-gray-700">Price</label>
          <Input type="number" {...register('price', { valueAsNumber: true })} />

          <label className="text-gray-700">Property Type</label>
          <Select
            onValueChange={(value) => setValue('property_type', value)}
            defaultValue={defaultValues?.property_type || 'Apartment'}
          >
            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
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
              <Image key={idx} src={img} alt="Property Image" width={80} height={80} className="rounded-md object-cover" />
            ))}
            <input type="file" accept="image/*" multiple onChange={handleImageChange} disabled={loading}/>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="bg-[#302cfc] hover:bg-[#241fd9] mt-4"
          >
            {loading
              ? mode === 'edit'
                ? 'Updating...'
                : 'Adding...'
              : mode === 'edit'
                ? 'Update Property'
                : 'Add Property'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}