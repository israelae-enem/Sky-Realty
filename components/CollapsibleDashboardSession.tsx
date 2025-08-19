import { useState, useEffect } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase' // your Firebase config file
import { ChevronDown, ChevronUp } from 'lucide-react'

interface MaintenanceRequest {
  id: string
  propertyId: string
  tenantName: string
  priority: string
  status: string
  description?: string
}

interface RentTracking {
  id: string
  tenantName: string
  propertyId: string
  amountDue: number
  dueDate: string
  paymentStatus: string
}

type Props = {
  realtorId: string
}

const CollapsibleDashboardSections = ({ realtorId }: Props) => {
  const [showMaintenance, setShowMaintenance] = useState(false)
  const [showRentTracking, setShowRentTracking] = useState(false)
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([])
  const [rentTrackingList, setRentTrackingList] = useState<RentTracking[]>([])
  const [loadingMaintenance, setLoadingMaintenance] = useState(false)
  const [loadingRentTracking, setLoadingRentTracking] = useState(false)

  useEffect(() => {
    if (!realtorId || !showMaintenance) return

    setLoadingMaintenance(true)
    const fetchMaintenance = async () => {
      try {
        const q = query(collection(db, 'maintenanceRequests'), where('realtorId', '==', realtorId))
        const snapshot = await getDocs(q)
        const requests: MaintenanceRequest[] = []
        snapshot.forEach(doc => {
          requests.push({ id: doc.id, ...doc.data() } as MaintenanceRequest)
        })
        setMaintenanceRequests(requests)
      } catch (error) {
        console.error('Error fetching maintenance requests:', error)
      } finally {
        setLoadingMaintenance(false)
      }
    }
    fetchMaintenance()
  }, [realtorId, showMaintenance])

  useEffect(() => {
    if (!realtorId || !showRentTracking) return

    setLoadingRentTracking(true)
    const fetchRentTracking = async () => {
      try {
        const q = query(collection(db, 'rentTracking'), where('realtorId', '==', realtorId))
        const snapshot = await getDocs(q)
        const rentRecords: RentTracking[] = []
        snapshot.forEach(doc => {
          rentRecords.push({ id: doc.id, ...doc.data() } as RentTracking)
        })
        setRentTrackingList(rentRecords)
      } catch (error) {
        console.error('Error fetching rent tracking:', error)
      } finally {
        setLoadingRentTracking(false)
      }
    }
    fetchRentTracking()
  }, [realtorId, showRentTracking])

  return (
    <div className="space-y-6 mt-8">
      {/* Maintenance Requests */}
      <section className="border rounded bg-black border-gray-300">
        <button
          onClick={() => setShowMaintenance(v => !v)}
          className="w-full px-4 py-3 flex justify-between items-center text-lg font-semibold text-[#302cfc]"
        >
          Maintenance Requests {showMaintenance ? <ChevronUp /> : <ChevronDown />}
        </button>
        {showMaintenance && (
          <div className="overflow-x-auto p-4 text-white">
            {loadingMaintenance ? (
              <p>Loading...</p>
            ) : maintenanceRequests.length === 0 ? (
              <p>No maintenance requests found.</p>
            ) : (
              <table className="min-w-full text-left">
                <thead>
                  <tr>
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">Property</th>
                    <th className="px-3 py-2">Tenant</th>
                    <th className="px-3 py-2">Priority</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {maintenanceRequests.map(req => (
                    <tr key={req.id} className="border-t border-gray-300">
                      <td className="px-3 py-2">{req.id}</td>
                      <td className="px-3 py-2">{req.propertyId}</td>
                      <td className="px-3 py-2">{req.tenantName}</td>
                      <td className="px-3 py-2">{req.priority}</td>
                      <td className="px-3 py-2">{req.status}</td>
                      <td className="px-3 py-2">
                        {/* Add your action buttons here */}
                        <button className="text-sm text-green-400 hover:underline">Mark Done</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </section>

      {/* Rent Tracking */}
      <section className="border rounded bg-black border-gray-300">
        <button
          onClick={() => setShowRentTracking(v => !v)}
          className="w-full px-4 py-3 flex justify-between items-center text-lg font-semibold text-[#302cfc]"
        >
          Rent Tracking {showRentTracking ? <ChevronUp /> : <ChevronDown />}
        </button>
        {showRentTracking && (
          <div className="overflow-x-auto p-4 text-white">
            {loadingRentTracking ? (
              <p>Loading...</p>
            ) : rentTrackingList.length === 0 ? (
              <p>No rent tracking records found.</p>
            ) : (
              <table className="min-w-full text-left">
                <thead>
                  <tr>
                    <th className="px-3 py-2">Tenant</th>
                    <th className="px-3 py-2">Property</th>
                    <th className="px-3 py-2">Amount Due</th>
                    <th className="px-3 py-2">Due Date</th>
                    <th className="px-3 py-2">Payment Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rentTrackingList.map(r => (
                    <tr key={r.id} className="border-t border-gray-300">
                      <td className="px-3 py-2">{r.tenantName}</td>
                      <td className="px-3 py-2">{r.propertyId}</td>
                      <td className="px-3 py-2">${r.amountDue.toFixed(2)}</td>
                      <td className="px-3 py-2">{new Date(r.dueDate).toLocaleDateString()}</td>
                      <td className="px-3 py-2">{r.paymentStatus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </section>
    </div>
  )
}

export default CollapsibleDashboardSections