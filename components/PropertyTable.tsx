'use client'

import { useEffect, useState } from 'react'
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '@/lib/firebase'

// Define limits for each plan
const PLAN_LIMITS: Record<string, number | 'unlimited'> = {
  basic: 5,
  pro: 10,
  premium: 'unlimited',
}

export default function PropertyTable({ realtorId }: { realtorId: string | null }) {
    const [properties, setProperties] = useState<any[]>([])
    const [subscription, setSubscription] = useState<any>(null)
     const [newProperty, setNewProperty] = useState({
     title: '',
     address: '',
     status: 'Vacant',
     lease_start: '',
     lease_end: '',
   })
    const [editingId, setEditingId] = useState<string | null>(null)
    const [uploading, setUploading] = useState<string | null>(null)
    const [dragOverId, setDragOverId] = useState<string | null>(null)

  // Fetch properties
    useEffect(() => {
    if (!realtorId) return
    const q = query(collection(db, 'properties'), where('realtor_id', '==', realtorId))
    const unsub = onSnapshot(q, (snapshot) => {
      setProperties(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    })
    return () => unsub()
    }, [realtorId])

  // Fetch subscription details from Firestore
    useEffect(() => {
    if (!realtorId) return
    const subRef = doc(db, 'subscriptions', realtorId) // Webhook stores here
    getDoc(subRef).then((snap) => {
      if (snap.exists()) {
        setSubscription(snap.data())
      }
    })
    }, [realtorId])

  // Add property with limit check
    const addProperty = async () => {
    if (!realtorId || !newProperty.title.trim()) return

    // Check subscription limit
    if (subscription) {
      const limit = PLAN_LIMITS[subscription.plan] || 0
      if (limit !== 'unlimited' && properties.length >= limit) {
        alert(`You have reached your ${subscription.plan} plan limit of ${limit} properties.`)
        return
      }
    } else {
      alert('No subscription found. Please subscribe to add properties.')
      return
    }

    await addDoc(collection(db, 'properties'), {
      ...newProperty,
      realtor_id: realtorId,
      created_at: serverTimestamp(),
      lease_file: null,
    })
    setNewProperty({ title: '', address: '', status: 'Vacant', lease_start: '', lease_end: '' })
  }

  const saveEdit = async (id: string, field: string, value: string) => {
    const refDoc = doc(db, 'properties', id)
    await updateDoc(refDoc, { [field]: value })
  }

  const deleteProperty = async (id: string) => {
    await deleteDoc(doc(db, 'properties', id))
  }

  const uploadLease = async (propertyId: string, file: File) => {
    try {
      setUploading(propertyId)
      const fileRef = ref(storage, `leases/${propertyId}/${file.name}`)
      await uploadBytes(fileRef, file)
      const downloadURL = await getDownloadURL(fileRef)
      await updateDoc(doc(db, 'properties', propertyId), { lease_file: downloadURL })
    } catch (error) {
      console.error('Error uploading lease:', error)
    } finally {
      setUploading(null)
      setDragOverId(null)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>, propertyId: string) => {
    e.preventDefault()
    setDragOverId(propertyId)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLTableRowElement>, propertyId: string) => {
    e.preventDefault()
    if (dragOverId === propertyId) setDragOverId(null)
  }

  const handleDrop = (e: React.DragEvent<HTMLTableRowElement>, propertyId: string) => {
    e.preventDefault()
    setDragOverId(null)
    const file = e.dataTransfer.files[0]
    if (!file) return
    uploadLease(propertyId, file)

  }

   return (
    <div className="bg-black p-4 border-gray-300 border rounded-lg mt-8">
      <h2 className="text-xl font-semibold mb-4">Properties</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-300 border rounded-md">
            <th className="p-2 text-left">Title</th>
            <th className="p-2 text-left">Address</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Lease Start</th>
            <th className="p-2 text-left">Lease End</th>
            <th className="p-2 text-left">Lease File</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {properties.map((prop) => (
            <tr
              key={prop.id}
              className={`border-b rounded-md border border-gray-300 hover:bg-gray-700/50 ${
                dragOverId === prop.id ? 'bg-[#302cfc]/30' : ''
              }`}
              onDragOver={(e) => handleDragOver(e, prop.id)}
              onDragLeave={(e) => handleDragLeave(e, prop.id)}
              onDrop={(e) => handleDrop(e, prop.id)}
            >
              {['title', 'address', 'status', 'lease_start', 'lease_end'].map((field) => (
                <td key={field} className="p-2">
                  {editingId === prop.id ? (
                    field === 'status' ? (
                      <select
                        value={prop[field] || 'Vacant'}
                        onChange={(e) => saveEdit(prop.id, field, e.target.value)}
                        className="bg-black border-gray-300 p-1 rounded-md border w-full"
                      >
                        <option value="Vacant">Vacant</option>
                        <option value="Occupied">Occupied</option>
                        <option value="Pending">Pending</option>
                      </select>
                    ) : (
                      <input
                        type={field.includes('lease') ? 'date' : 'text'}
                        value={prop[field] || ''}
                        onChange={(e) => saveEdit(prop.id, field, e.target.value)}
                        className="bg-black p-1 rounded-md border border-gray-300 w-full"
                      />
                    )
                  ) : (
                    prop[field] || '-'
                  )}
                </td>
              ))}
              {/* Lease File Upload */}
              <td className="p-2 border rounded-md border-gray-300">
                {prop.lease_file ? (
                  <a
                    href={prop.lease_file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 underline"
                  >
                    View Lease
                  </a>
                ) : (
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          uploadLease(prop.id, e.target.files[0])
                        }
                      }}
                    />
                    <span className="bg-[#302cfc] px-2 py-1 rounded text-white">
                      {uploading === prop.id ? 'Uploading...' : 'Upload Lease'}
                    </span>
                  </label>
                )}
              </td>
              {/* Actions */}
              <td className="p-2 flex gap-2 justify-center">
                {editingId === prop.id ? (
                  <button
                    onClick={() => setEditingId(null)}
                    className="bg-green-500 px-2 py-1 rounded text-white"
                  >
                    Done
                  </button>
                ) : (
                  <button
                    onClick={() => setEditingId(prop.id)}
                    className="bg-blue-500 px-2 py-1 rounded text-white"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => deleteProperty(prop.id)}
                  className="bg-red-500 px-2 py-1 rounded text-white"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {/* Add New Property Row */}
          <tr>
            <td className="p-2">
              <input
                type="text"
                placeholder="Title"
                value={newProperty.title}
                onChange={(e) => setNewProperty({ ...newProperty, title: e.target.value })}
                className="bg-black border border-gray-300 rounded-md p-1 w-full"
              />
            </td>
            <td className="p-2">
              <input
                type="text"
                placeholder="Address"
                value={newProperty.address}
                onChange={(e) => setNewProperty({ ...newProperty, address: e.target.value })}
                className="bg-black border-gray-300 p-1 rounded-md border w-full"
              />
            </td>
            <td className="p-2">
              <select
                value={newProperty.status}
                onChange={(e) => setNewProperty({ ...newProperty, status: e.target.value })}
                className="bg-black p-1 rounded-md border-gray-300 border w-full"
              >
                <option value="Vacant">Vacant</option>
                <option value="Occupied">Occupied</option>
                <option value="Pending">Pending</option>
              </select>
            </td>
            <td className="p-2">
              <input
                type="date"
                value={newProperty.lease_start}
                onChange={(e) => setNewProperty({ ...newProperty, lease_start: e.target.value })}
                className="bg-black p-1 rounded-md border-gray-300 border w-full"
              />
            </td>
            <td className="p-2">
              <input
                type="date"
                value={newProperty.lease_end}
                onChange={(e) => setNewProperty({ ...newProperty, lease_end: e.target.value })}
                className="bg-black p-1 rounded-md border-gray-300 border w-full"
              />
            </td>
            <td 
            
            className="p-2 text-white bg-cta rounded-md border-gray-300">Upload</td>


            <td className="p-2">
              <button
                onClick={addProperty}
                className="bg-[#302cfc] px-2 py-1 rounded text-white"
              >
                Add
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <p className="mt-2 text-gray-400 text-sm italic">
        Tip: You can drag & drop lease files directly onto a property row to upload.
      </p>
    </div>
  )
}