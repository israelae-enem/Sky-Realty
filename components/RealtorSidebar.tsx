'use client'

import { useState } from 'react'
import {
  List,
  FilePlus,
  Users,
  Calendar,
  CreditCard,
  FileText,
  MessageSquare,
  UsersRound,
  Bell,
  Home,
} from 'lucide-react'
import ProfileSidebar from './Profile'

interface Props {
  activeTab: string
  setActiveTab: (tab: string) => void

  // 🔥 Added
  isMobile?: boolean
  onClose?: () => void
}

export default function RealtorSidebar({
  activeTab,
  setActiveTab,
  isMobile = false,
  onClose = () => {},
}: Props) {
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const menu = [
    { label: 'Home', key: 'home', icon: <Home size={16} className="mr-2" />, submenu: [] },
    {
      label: 'Properties',
      key: 'properties',
      icon: <List size={16} className="mr-2" />,
      submenu: [
        { label: 'All Properties', key: 'properties' },
        { label: 'Add Property', key: 'addProperty' },
      ],
    },
    {
      label: 'Listings',
      key: 'listings',
      icon: <FilePlus size={16} className="mr-2" />,
      submenu: [
        { label: 'All Listings', key: '/properties', external: true },
        { label: 'Add Listing', key: 'addListing' },
        { label: 'View Listing', key: '/properties/[id]', external: true },
      ],
    },
    {
      label: 'Tenants',
      key: 'tenants',
      icon: <Users size={16} className="mr-2" />,
      submenu: [
        { label: 'All Tenants', key: 'tenants' },
        { label: 'Add Tenant', key: 'addTenant' },
      ],
    },
    {
      label: 'Appointments',
      key: 'appointments',
      icon: <Calendar size={16} className="mr-2" />,
      submenu: [
        { label: 'Viewing', key: 'appointmentsViewing' },
        { label: 'Meeting', key: 'appointmentsMeeting' },
        { label: 'Maintenance', key: 'appointmentsMaintenance' },
      ],
    },
    {
      label: 'Payments',
      key: 'payments',
      icon: <CreditCard size={16} className="mr-2" />,
      submenu: [
        { label: 'All Payments', key: 'rentPayments' },
      ],
    },
    {
      label: 'Legal Docs',
      key: 'legalDocs',
      icon: <FileText size={16} className="mr-2" />,
      submenu: [
        { label: 'All Documents', key: 'legalDocuments' },
      ],
    },
    { label: 'Maintenance', key: 'maintenance', icon: <FileText size={16} className="mr-2" />, submenu: [] },
    { label: 'Notifications', key: 'notifications', icon: <Bell size={16} className="mr-2" />, submenu: [] },
    { label: 'Chats', key: 'chats', icon: <MessageSquare size={16} className="mr-2" />, submenu: [] },
    { label: 'Leads', key: 'leads', icon: <Bell size={16} className="mr-2" />, submenu: [] },
    { label: 'Manage Account', key: 'manageAccount', icon: <UsersRound size={16} className="mr-2" />, submenu: [] },
  ]

  const toggleMenu = (key: string) => {
    setOpenMenu(openMenu === key ? null : key)
  }

  return (
    <aside className="w-64 bg-[#1836b2] text-white shadow flex flex-col">
      <nav className="flex-1 overflow-y-auto mt-10 p-2 space-y-1">

        <ProfileSidebar />

        {menu.map(item => (
          <div key={item.key}>
            {/* Main item button */}
            <button
              onClick={() => {
                if (item.submenu.length === 0) {
                  setActiveTab(item.key)
                  if (isMobile) onClose()     // 🔥 close mobile sidebar
                } else {
                  toggleMenu(item.key)
                }
              }}
              className={`w-full text-left mt-5 px-4 py-2 rounded flex items-center font-semibold hover:bg-[#132a8e] transition
                ${activeTab === item.key ? 'bg-white text-[#1836b2]' : ''}
              `}
            >
              {item.icon}
              {item.label}
            </button>

            {/* Submenu only for items that have it */}
            {item.submenu.length > 0 && openMenu === item.key && (
              <div className="ml-6 mt-1 space-y-1">
                {item.submenu.map(sub => (
                  <button
                    key={sub.key}
                    onClick={() => {
                      if (sub.external) {
                        window.location.href = sub.key
                        if (isMobile) onClose()  // 🔥 close mobile sidebar
                      } else {
                        setActiveTab(sub.key)
                        if (isMobile) onClose()  // 🔥 close mobile sidebar
                      }
                    }}
                    className={`w-full text-left px-3 py-1 rounded text-sm hover:bg-white hover:text-[#1836b2]
                      ${activeTab === sub.key ? 'bg-white text-[#1836b2] font-bold' : ''}
                    `}
                  >
                    • {sub.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

      </nav>
    </aside>
  )
}