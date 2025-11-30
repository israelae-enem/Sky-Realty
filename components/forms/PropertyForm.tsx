// components/forms/PropertyForm.tsx
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
  plan?: string | null
  propertyLimit?: number | 0
  currentCount?: number
  mode?: 'create' | 'edit'
  defaultValues?: FormValues | null
  onSuccess?: () => void
}

export type ListingCategory = 'buy' | 'rent' | 'offplan'

export interface FormValues {
  id?: string
  title: string
  address: string
  neighborhood?: string
  community_id?: string | null
  subcommunity?: string | null
  description?: string
  country?: string
  status?: 'Occupied' | 'Vacant'
  price?: number
  price_frequency?: 'monthly' | 'yearly' | 'one-time'  // rent vs sale
  type?: string    // DB column 'type'
  listing_category?: ListingCategory
  bedrooms?: number
  bathrooms?: number
  size?: number
  image_urls?: string[]
  amenities?: string[]        // array of amenity slugs/names
  is_furnished?: boolean
  video_360_url?: string
  payment_plan?: {
    has_plan: boolean
    plan_name?: string
    installments?: number | null
    down_payment?: number | null
    notes?: string | null
  } | null
  completion_date?: string | null
  distance_to_metro_km?: number | null
  latitude?: number | null
  longitude?: number | null
  created_at?: string | null
  updated_at?: string | null
}

export default function PropertyForm({
  realtorId,
  companyId,
  plan,
  propertyLimit = 0,
  currentCount = 0,
  mode = 'create',
  defaultValues = null,
  onSuccess
}: PropertyFormProps) {
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<string[]>(defaultValues?.image_urls || [])
  const [communities, setCommunities] = useState<{ id: string; name: string }[]>([])
  const [amenitiesList, setAmenitiesList] = useState<string[]>([
    'Parking', 'Pool', 'Gym', 'Balcony', 'Pet Friendly', 'Maids Room', 'Concierge', 'Security'
  ]) // default; you may load from DB
  const [showPaymentFields, setShowPaymentFields] = useState<boolean>(!!defaultValues?.payment_plan?.has_plan)

  const propertyTypeOptions = ['Apartment', 'Villa', 'Townhouse', 'Office', 'Studio']

  const { register, handleSubmit, reset, setValue, watch } = useForm<FormValues>({
    defaultValues: defaultValues || {
      title: '',
      address: '',
      neighborhood: '',
      community_id: null,
      subcommunity: '',
      description: '',
      country: '',
      status: 'Vacant',
      price: 0,
      price_frequency: 'one-time',
      type: 'Apartment',
      listing_category: 'buy',
      bedrooms: 1,
      bathrooms: 1,
      size: 0,
      image_urls: [],
      amenities: [],
      is_furnished: false,
      video_360_url: '',
      payment_plan: {
        has_plan: false,
      },
      completion_date: null,
      distance_to_metro_km: null,
      latitude: null,
      longitude: null,
    },
  })

  // Optional: enforce property limit (uncomment to use)
  /* const reachedLimit =
    plan !== null &&
    propertyLimit !== null &&
    currentCount >= propertyLimit &&
    mode === 'create' */

  // load communities from supabase (if table exists)
  useEffect(() => {
    let mounted = true
    const loadCommunities = async () => {
      try {
        const { data } = await supabase.from('communities').select('id, name').order('name')
        if (!mounted) return
        setCommunities(data ?? [])
      } catch (err) {
        console.warn('Could not load communities', err)
      }
    }
    loadCommunities()
    return () => { mounted = false }
  }, [])

  // keep local images in sync with form
  useEffect(() => {
    setValue('image_urls', images)
  }, [images, setValue])

  // handle image upload to supabase storage (property-images bucket)
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    setLoading(true)
    try {
      const folder = realtorId ? `realtors/${realtorId}` : `companies/${companyId}`
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

      const newImages = [...images, ...uploadedUrls]
      setImages(newImages)
      setValue('image_urls', newImages)
      toast.success("Images uploaded successfully!")
    } catch (err) {
      console.error(err)
      toast.error("Image upload failed")
    } finally {
      setLoading(false)
    }
  }

  // remove image preview
  const removeImage = (idx: number) => {
    const next = images.filter((_, i) => i !== idx)
    setImages(next)
    setValue('image_urls', next)
  }

  // handle submit
  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    try {
      // optional limit check (uncomment if you want)
      /* if (reachedLimit) {
        toast.error(❌ Property limit reached (${currentCount}/${propertyLimit}). Upgrade plan to add more.)
        setLoading(false)
        return
      } */

      // sanitize / ensure types
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
        toast.success('✅ Property updated!')
      } else {
        // create id as text (you use text ids)
        const id = crypto.randomUUID()
        const { error } = await supabase
          .from('properties')
          .insert([
            {
              id,
              ...payload,
              created_at: new Date().toISOString(),
            }
          ])
        if (error) throw error
        toast.success('✅ Property added!')
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

  const toggleAmenity = (amen: string) => {
    const current = (watch('amenities') || []) as string[]
    if (current.includes(amen)) {
      setValue('amenities', current.filter((a) => a !== amen))
    } else {
      setValue('amenities', [...current, amen])
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-[#302cfc] hover:bg-[#241fd9]">
          {mode === 'edit' ? 'Edit Property' : 'Add Property'}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl p-6 bg-white rounded-lg shadow-xl">
        <DialogTitle className="text-xl font-semibold mb-2">
          {mode === 'edit' ? 'Edit Property' : 'Add New Property'}
        </DialogTitle>

        <form className="grid gap-4 mt-4" onSubmit={handleSubmit(onSubmit)}>
          {/* Title / Type / Category */}
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="text-gray-700">Title</label>
              <Input {...register('title', { required: true })} placeholder="e.g. 2BR Apartment in Jumeirah" />
            </div>

            <div>
              <label className="text-gray-700">Type</label>
              <Select
                onValueChange={(v) => setValue('type', v)}
                defaultValue={defaultValues?.type || 'Apartment'}
              >
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {propertyTypeOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-gray-700">Listing Category</label>
              <Select
                onValueChange={(v) => setValue('listing_category', v as any)}
                defaultValue={defaultValues?.listing_category || 'buy'}
              >
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="buy">Buy</SelectItem>
                  <SelectItem value="rent">Rent</SelectItem>
                  <SelectItem value="offplan">Offplan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Address / Community / Neighborhood */}
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="text-gray-700">Address</label>
              <Input {...register('address')} placeholder="Full address" />
            </div>

            <div>
              <label className="text-gray-700">Community</label>
               <Select
  onValueChange={(v) => setValue('community_id', v === 'none' ? null : v)}
  defaultValue={defaultValues?.community_id || "none"}
>
  <SelectTrigger><SelectValue placeholder="Select community" /></SelectTrigger>
  <SelectContent>
    <SelectItem value="none">— None —</SelectItem>
    {communities.map(c => (
      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
    ))}
  </SelectContent>
</Select>
            </div>

            <div>
              <label className="text-gray-700">Neighborhood / Subcommunity</label>
              <Input {...register('subcommunity')} placeholder="e.g. Jumeirah 1" />
            </div>
          </div>

          {/* Neighborhood / Country */}
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="text-gray-700">Neighborhood (friendly label)</label>
              <Input {...register('neighborhood')} placeholder="e.g. Downtown Dubai" />
            </div>

            <div>
              <label className="text-gray-700">Country</label>
              <Input {...register('country')} placeholder="United Arab Emirates" />
            </div>

            <div>
              <label className="text-gray-700">Distance to nearest metro (km)</label>
              <Input type="number" step="0.1" {...register('distance_to_metro_km', { valueAsNumber: true })} placeholder="e.g. 1.5" />
            </div>
          </div>

          {/* Price / Frequency / Payment plan */}
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="text-gray-700">Price (AED)</label>
              <Input type="number" {...register('price', { valueAsNumber: true })} placeholder="e.g. 120000" />
            </div>

            <div>
              <label className="text-gray-700">Price Frequency</label>
              <Select
                onValueChange={(v) => setValue('price_frequency', v as any)}
                defaultValue={defaultValues?.price_frequency || 'one-time'}
              >
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="one-time">One-time (sale)</SelectItem>
                  <SelectItem value="monthly">Monthly (rent)</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-gray-700">Has Payment Plan?</label>
              <div className="flex items-center gap-3 mt-1">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showPaymentFields}
                    onChange={(e) => {
                      setShowPaymentFields(e.target.checked)
                      setValue('payment_plan', { has_plan: e.target.checked })
                    }}
                  />
                  <span className="text-sm">Yes</span>
                </label>
              </div>
            </div>
          </div>

          {showPaymentFields && (
            <div className="border p-3 rounded-md bg-gray-50">
              <div className="grid md:grid-cols-3 gap-3">
                <div>
                  <label className="text-gray-700">Plan Name</label>
                  <Input {...register('payment_plan.plan_name')} placeholder="e.g. 4-year installment" />
                </div>

                <div>
                  <label className="text-gray-700">Installments</label>
                  <Input type="number" {...register('payment_plan.installments', { valueAsNumber: true })} />
                </div>

                <div>
                  <label className="text-gray-700">Down Payment (AED)</label>
                  <Input type="number" {...register('payment_plan.down_payment', { valueAsNumber: true })} />
                </div>
              </div>

              <div>
                <label className="text-gray-700 mt-2">Notes</label>
                <Textarea {...register('payment_plan.notes')} placeholder="Any specifics about the payment plan" />
              </div>
            </div>
          )}

          {/* Basic numeric fields */}
          <div className="grid md:grid-cols-4 gap-3">
            <div>
              <label className="text-gray-700">Bedrooms</label>
              <Input type="number" {...register('bedrooms', { valueAsNumber: true })} />
            </div>
            <div>
              <label className="text-gray-700">Bathrooms</label>
              <Input type="number" {...register('bathrooms', { valueAsNumber: true })} />
            </div>
            <div>
              <label className="text-gray-700">Size (sq ft)</label>
              <Input type="number" {...register('size', { valueAsNumber: true })} />
            </div>
            <div>
              <label className="text-gray-700">Status</label>
              <Select onValueChange={(v) => setValue('status', v as any)} defaultValue={defaultValues?.status || 'Vacant'}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Occupied">Occupied</SelectItem>
                  <SelectItem value="Vacant">Vacant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Amenities / Furnished / Video 360 */}
          <div>
            <label className="text-gray-700">Amenities</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {amenitiesList.map((amen) => {
                const selected = (watch('amenities') || []).includes(amen)
                return (
                  <button
                    key={amen}
                    type="button"
                    onClick={() => toggleAmenity(amen)}
                    className={selected ? 'px-3 py-1 rounded-full bg-[#1836b2] text-white' : 'px-3 py-1 rounded-full border text-gray-700'}
                  >
                    {amen}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-gray-700">Furnished?</label>
              <div className="mt-1">
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" {...register('is_furnished')} />
                  <span className="text-sm">Furnished</span>
                </label>
              </div>
            </div>

            <div>
              <label className="text-gray-700">360° Video / Virtual Tour URL</label>
              <Input {...register('video_360_url')} placeholder="https://youtube.com/..." />
            </div>
          </div>

          {/* Completion / Handover date */}
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-gray-700">Completion / Handover Date</label>
              <Input type="date" {...register('completion_date')} />
            </div>

            <div>
              <label className="text-gray-700">Latitude / Longitude (optional)</label>
              <div className="flex gap-2">
                <Input {...register('latitude', { valueAsNumber: true })} placeholder="lat" />
                <Input {...register('longitude', { valueAsNumber: true })} placeholder="lng" />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-gray-700">Description</label>
            <Textarea {...register('description')} placeholder="Full property description, highlights, nearby amenities..." />
          </div>

          {/* Images upload + preview */}
          <div>
            <label className="text-gray-700">Images</label>
            <div className="flex flex-wrap gap-2 items-center mt-2">
              {images.map((img, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-md overflow-hidden">
                  <Image src={img} alt={`img-${idx}`} fill style={{ objectFit: 'cover' }} />
                  <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-white/80 rounded-full px-1 text-xs">x</button>
                </div>
              ))}
              <input type="file" accept="image/*" multiple onChange={handleImageChange} disabled={loading} />
            </div>
          </div>

          {/* submit */}
          <Button type="submit" disabled={loading} className="bg-[#302cfc] hover:bg-[#241fd9] mt-4">
            {loading ? (mode === 'edit' ? 'Updating...' : 'Adding...') : (mode === 'edit' ? 'Update Property' : 'Add Property')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}